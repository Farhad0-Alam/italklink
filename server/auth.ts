import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import session from 'express-session';
import connectPg from 'connect-pg-simple';
import type { Express, RequestHandler } from 'express';
import { db } from './db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { setupOAuthStrategies } from './oauth-strategies';
import { 
  generateCSRFToken, 
  verifyCSRFToken, 
  enhancedCORS, 
  getSecureSessionConfig 
} from './middleware/csrf-protection';

const pgStore = connectPg(session);

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error('Missing required Google OAuth environment variables: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET');
}

if (!process.env.SESSION_SECRET) {
  throw new Error('Missing required SESSION_SECRET environment variable');
}

// Session configuration
export function getSessionMiddleware() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });

  const secureConfig = getSecureSessionConfig();
  
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    name: secureConfig.name,
    cookie: {
      ...secureConfig.cookie,
      maxAge: sessionTtl,
    },
  });
}

// Passport configuration
export function setupAuth(app: Express) {
  // Trust proxy for secure cookies behind reverse proxy
  app.set('trust proxy', 1);
  
  // Session middleware
  app.use(getSessionMiddleware());
  
  // Passport middleware
  app.use(passport.initialize());
  app.use(passport.session());

  // Google OAuth strategy
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: "/api/auth/google/callback"
  },
  async (accessToken: string, refreshToken: string, profile: any, done: any) => {
    try {
      const email = profile.emails?.[0]?.value;
      const firstName = profile.name?.givenName || null;
      const lastName = profile.name?.familyName || null;
      const profileImageUrl = profile.photos?.[0]?.value || null;

      if (!email) {
        return done(new Error('No email found in Google profile'));
      }

      // Check if user already exists
      let [user] = await db.select().from(users).where(eq(users.email, email));

      if (!user) {
        // Create new user
        [user] = await db.insert(users).values({
          email,
          firstName,
          lastName,
          profileImageUrl,
          planType: 'free',
          businessCardsLimit: 1,
          businessCardsCount: 0,
        }).returning();
      } else {
        // Update existing user's profile info
        [user] = await db.update(users)
          .set({
            firstName: firstName || user.firstName,
            lastName: lastName || user.lastName,
            profileImageUrl: profileImageUrl || user.profileImageUrl,
            updatedAt: new Date(),
          })
          .where(eq(users.id, user.id))
          .returning();
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }));

  // Serialize/deserialize user for session
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done: any) => {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      done(null, user || null);
    } catch (error) {
      done(error, null);
    }
  });

  // Setup OAuth strategies for calendar and video integrations
  setupOAuthStrategies();
}

// Authentication middleware
export const requireAuth: RequestHandler = async (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  // Check for active impersonation
  if (req.session.impersonation) {
    try {
      const { storage } = await import('./storage');
      const impersonatedUser = await storage.getUserById(req.session.impersonation.impersonatedUserId);
      if (!impersonatedUser) {
        // If impersonated user no longer exists, clear impersonation
        delete req.session.impersonation;
        req.session.save();
      } else {
        // Use the impersonated user for all operations
        req.user = impersonatedUser as any;
        // Add flag to indicate this is an impersonation
        (req.user as any).isImpersonated = true;
        (req.user as any).originalUserId = req.session.impersonation.originalUserId;
      }
    } catch (error) {
      console.error('Error fetching impersonated user:', error);
    }
  }
  
  next();
};

// Optional authentication middleware (doesn't block)
export const optionalAuth: RequestHandler = (req, res, next) => {
  // Just passes through, user info available via req.user if authenticated
  next();
};

// Admin middleware
export const requireAdmin: RequestHandler = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  const user = req.user as any;
  if (user.role !== 'admin' && user.role !== 'owner') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  
  next();
};

// Owner middleware (for admin dashboard access)
export const requireOwner: RequestHandler = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  const user = req.user as any;
  if (user.role !== 'owner' && user.role !== 'admin') {
    return res.status(403).json({ message: 'Owner access required' });
  }
  
  next();
};

// Team membership verification middleware - CRITICAL for multi-tenant security
export const requireTeamRole = (...allowedRoles: string[]): RequestHandler => {
  return async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const teamId = req.params.teamId;
    if (!teamId) {
      return res.status(400).json({ message: 'Team ID required' });
    }

    try {
      const { storage } = await import('./storage');
      const userId = (req.user as any).id;
      
      // Get user's membership in the team
      const teamMembership = await storage.getTeamMemberByUserAndTeam(userId, teamId);
      
      if (!teamMembership) {
        return res.status(403).json({ message: 'Access denied: Not a team member' });
      }

      // Check if user's role is allowed
      if (!allowedRoles.includes(teamMembership.role)) {
        return res.status(403).json({ 
          message: `Access denied: Insufficient permissions. Required: ${allowedRoles.join(', ')}, Current: ${teamMembership.role}` 
        });
      }

      // Add team membership info to request for use in handlers
      (req as any).teamMembership = teamMembership;
      next();
    } catch (error) {
      console.error('Error verifying team membership:', error);
      res.status(500).json({ message: 'Internal server error verifying team access' });
    }
  };
};

// Helper to check if user has access to a specific team member resource
export const requireMemberAccess: RequestHandler = async (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const memberId = req.params.memberId;
  if (!memberId) {
    return res.status(400).json({ message: 'Member ID required' });
  }

  try {
    const { storage } = await import('./storage');
    const userId = (req.user as any).id;
    
    // Get the team member and verify access
    const teamMember = await storage.getTeamMember(memberId);
    if (!teamMember) {
      return res.status(404).json({ message: 'Team member not found' });
    }

    // Check if user is accessing their own member record OR has team permissions
    if (teamMember.userId === userId) {
      // User accessing their own member record
      (req as any).teamMember = teamMember;
      return next();
    }

    // Check team-level permissions
    const userMembership = await storage.getTeamMemberByUserAndTeam(userId, teamMember.teamId);
    if (!userMembership) {
      return res.status(403).json({ message: 'Access denied: Not a team member' });
    }

    if (!['owner', 'admin'].includes(userMembership.role)) {
      return res.status(403).json({ message: 'Access denied: Insufficient permissions to access other members' });
    }

    (req as any).teamMember = teamMember;
    (req as any).teamMembership = userMembership;
    next();
  } catch (error) {
    console.error('Error verifying member access:', error);
    res.status(500).json({ message: 'Internal server error verifying member access' });
  }
};

// Extend Express Request interface
declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      firstName?: string;
      lastName?: string;
      profileImageUrl?: string;
      role: 'user' | 'admin' | 'owner';
      planType: 'free' | 'pro' | 'enterprise';
      businessCardsCount: number;
      businessCardsLimit: number;
      createdAt: Date;
      updatedAt: Date;
    }
  }
}