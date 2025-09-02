import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import session from 'express-session';
import connectPg from 'connect-pg-simple';
import type { Express, RequestHandler } from 'express';
import { db } from './db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

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

  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
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
}

// Authentication middleware
export const requireAuth: RequestHandler = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Authentication required' });
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
  if (user.role !== 'admin') {
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