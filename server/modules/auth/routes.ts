import { Router } from 'express';
import passport from 'passport';
import { authService } from './service';
import { verifyAccess, getRefreshCookieOptions } from './tokens';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const router = Router();

// Input validation schemas
const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
  rememberEmail: z.boolean().optional(),
});

const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
});

// JWT middleware to verify access tokens
export const jwtAuth: RequestHandler = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const payload = verifyAccess(token);
    
    if (!payload) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    // Get full user data
    const user = await authService.getUserById(payload.sub);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('JWT auth error:', error);
    res.status(401).json({ message: 'Authentication failed' });
  }
};

// Optional JWT auth (doesn't fail if no token)
export const jwtAuthOptional: RequestHandler = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // No token, continue without authentication
    }

    const token = authHeader.substring(7);
    const payload = verifyAccess(token);
    
    if (payload) {
      const user = await authService.getUserById(payload.sub);
      if (user) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Silently continue on auth errors for optional auth
    next();
  }
};

// Email/password login
router.post('/login', async (req, res) => {
  try {
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        message: 'Invalid input',
        errors: validation.error.errors,
      });
    }

    const { email, password } = validation.data;
    const result = await authService.loginWithEmail(email, password);

    if (!result) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Set refresh token as HttpOnly cookie
    res.cookie('refreshToken', result.refreshToken, getRefreshCookieOptions());

    // Return access token and user data
    res.json({
      accessToken: result.accessToken,
      user: result.user,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

// Email/password registration
router.post('/register', async (req, res) => {
  try {
    const validation = registerSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        message: 'Invalid input',
        errors: validation.error.errors,
      });
    }

    const { email, password, firstName, lastName } = validation.data;
    const result = await authService.registerWithEmail(email, password, firstName, lastName);

    if (!result) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Set refresh token as HttpOnly cookie
    res.cookie('refreshToken', result.refreshToken, getRefreshCookieOptions());

    // Return access token and user data
    res.status(201).json({
      accessToken: result.accessToken,
      user: result.user,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
});

// Refresh access token
router.post('/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({ message: 'No refresh token provided' });
    }

    const result = await authService.refreshTokens(refreshToken);

    if (!result) {
      // Clear invalid refresh token cookie
      res.clearCookie('refreshToken', { path: '/api/auth' });
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }

    // Set new refresh token cookie
    res.cookie('refreshToken', result.refreshToken, getRefreshCookieOptions());

    // Return new access token
    res.json({
      accessToken: result.accessToken,
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ message: 'Token refresh failed' });
  }
});

// Get current user
router.get('/user', jwtAuth, (req, res) => {
  const user = req.user as any;
  const { password, ...userProfile } = user;
  res.json(userProfile);
});

// Logout from current device
router.post('/logout', async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    
    if (refreshToken) {
      await authService.revokeRefreshToken(refreshToken);
    }

    // Clear refresh token cookie
    res.clearCookie('refreshToken', { path: '/api/auth' });
    
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Logout failed' });
  }
});

// Logout from all devices
router.post('/logout-all', jwtAuth, async (req, res) => {
  try {
    const user = req.user as any;
    await authService.revokeAllUserTokens(user.id);

    // Clear refresh token cookie
    res.clearCookie('refreshToken', { path: '/api/auth' });
    
    res.json({ message: 'Logged out from all devices successfully' });
  } catch (error) {
    console.error('Logout all error:', error);
    res.status(500).json({ message: 'Logout from all devices failed' });
  }
});

// Google OAuth login (start)
router.get('/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google OAuth callback
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  async (req, res) => {
    try {
      const googleUser = req.user as any;
      
      const result = await authService.upsertOAuthUser({
        email: googleUser.email,
        firstName: googleUser.firstName,
        lastName: googleUser.lastName,
        profileImageUrl: googleUser.profileImageUrl,
      });

      // Set refresh token as HttpOnly cookie
      res.cookie('refreshToken', result.refreshToken, getRefreshCookieOptions());

      // Redirect to dashboard with access token in URL hash (will be moved to memory by frontend)
      const redirectUrl = `/dashboard#token=${result.accessToken}`;
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('Google callback error:', error);
      res.redirect('/login?error=auth_failed');
    }
  }
);

export default router;