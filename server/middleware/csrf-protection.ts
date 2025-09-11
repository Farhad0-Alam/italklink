import type { Request, Response, NextFunction } from 'express';
import { randomBytes, createHash } from 'crypto';
import { AuthenticationError } from './error-handling';

// CSRF token management
const CSRF_TOKEN_LENGTH = 32;
const CSRF_HEADER_NAME = 'x-csrf-token';
const CSRF_COOKIE_NAME = 'csrf-token';

export interface CSRFConfig {
  cookieName?: string;
  headerName?: string;
  ignoreMethods?: string[];
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  httpOnly?: boolean;
  maxAge?: number;
}

export class CSRFProtection {
  private config: Required<CSRFConfig>;

  constructor(config: CSRFConfig = {}) {
    this.config = {
      cookieName: config.cookieName || CSRF_COOKIE_NAME,
      headerName: config.headerName || CSRF_HEADER_NAME,
      ignoreMethods: config.ignoreMethods || ['GET', 'HEAD', 'OPTIONS'],
      secure: config.secure ?? process.env.NODE_ENV === 'production',
      sameSite: config.sameSite || 'strict',
      httpOnly: config.httpOnly ?? false, // CSRF tokens need to be accessible to JavaScript
      maxAge: config.maxAge || 24 * 60 * 60 * 1000, // 24 hours
    };
  }

  generateToken(): string {
    return randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
  }

  hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  verifyToken(providedToken: string, storedHash: string): boolean {
    if (!providedToken || !storedHash) {
      return false;
    }
    
    const providedHash = this.hashToken(providedToken);
    return providedHash === storedHash;
  }

  // Middleware to generate and set CSRF token
  generateCSRFToken = (req: Request, res: Response, next: NextFunction) => {
    // Skip if not using sessions
    if (!req.session) {
      return next();
    }

    // Generate new token if none exists or if it's expired
    if (!req.session.csrfToken || !req.session.csrfTokenExpiry || 
        Date.now() > req.session.csrfTokenExpiry) {
      
      const token = this.generateToken();
      req.session.csrfToken = this.hashToken(token);
      req.session.csrfTokenExpiry = Date.now() + this.config.maxAge;

      // Set cookie with the actual token (client needs this)
      res.cookie(this.config.cookieName, token, {
        httpOnly: this.config.httpOnly,
        secure: this.config.secure,
        sameSite: this.config.sameSite,
        maxAge: this.config.maxAge,
      });

      // Also provide in response header for API consumers
      res.setHeader('X-CSRF-Token', token);
    }

    next();
  };

  // Middleware to verify CSRF token
  verifyCSRFToken = (req: Request, res: Response, next: NextFunction) => {
    // Skip for safe methods
    if (this.config.ignoreMethods.includes(req.method)) {
      return next();
    }

    // Skip if not using sessions
    if (!req.session || !req.session.csrfToken) {
      return next(new AuthenticationError('CSRF token required - please refresh the page', 'CSRF_TOKEN_MISSING'));
    }

    // Check if token is expired
    if (req.session.csrfTokenExpiry && Date.now() > req.session.csrfTokenExpiry) {
      return next(new AuthenticationError('CSRF token expired - please refresh the page', 'CSRF_TOKEN_EXPIRED'));
    }

    // Get token from header or cookie
    const providedToken = req.headers[this.config.headerName] as string ||
                         req.cookies[this.config.cookieName];

    if (!providedToken) {
      return next(new AuthenticationError('CSRF token required in header or cookie', 'CSRF_TOKEN_MISSING'));
    }

    // Verify token
    if (!this.verifyToken(providedToken, req.session.csrfToken)) {
      return next(new AuthenticationError('Invalid CSRF token', 'CSRF_TOKEN_INVALID'));
    }

    next();
  };

  // Combined middleware for convenience
  protect = [this.generateCSRFToken, this.verifyCSRFToken];
}

// Default CSRF protection instance
export const csrfProtection = new CSRFProtection({
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
});

// Middleware functions
export const generateCSRFToken = csrfProtection.generateCSRFToken;
export const verifyCSRFToken = csrfProtection.verifyCSRFToken;

// Double-submit cookie pattern for stateless CSRF protection
export const doubleSubmitCSRF = (req: Request, res: Response, next: NextFunction) => {
  // Skip for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const cookieToken = req.cookies['csrf-token'];
  const headerToken = req.headers['x-csrf-token'] as string;

  // For mutation requests, both tokens must be present and match
  if (!cookieToken || !headerToken) {
    return next(new AuthenticationError('CSRF token required in both cookie and header', 'CSRF_TOKEN_MISSING'));
  }

  if (cookieToken !== headerToken) {
    return next(new AuthenticationError('CSRF token mismatch between cookie and header', 'CSRF_TOKEN_MISMATCH'));
  }

  next();
};

// Enhanced CORS configuration for CSRF protection
export const enhancedCORS = (req: Request, res: Response, next: NextFunction) => {
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5000',
    'https://localhost:3000', 
    'https://localhost:5000'
  ];

  const origin = req.headers.origin;
  
  // For development on Replit or other platforms, allow same-origin requests
  const isAllowedOrigin = !origin || // Same-origin requests (no origin header)
    allowedOrigins.includes(origin) ||
    origin.includes('.repl.co') || // Allow Replit domains
    origin.includes('.replit.dev') || // Allow new Replit dev domains
    origin.includes('.pike.replit.dev') || // Allow Replit pike domains
    origin.includes('localhost') || // Allow localhost variants
    origin.startsWith('http://127.0.0.1') || // Allow local IP
    origin.startsWith('https://127.0.0.1'); // Allow local IP with HTTPS
  
  // For credentialed requests, be strict about origins but allow development environments
  if (req.headers.cookie || req.headers.authorization) {
    if (!isAllowedOrigin) {
      console.log(`CORS blocked: ${origin} not in allowed origins for credentialed request`);
      return res.status(403).json({
        error: 'Forbidden',
        code: 'INVALID_ORIGIN_FOR_CREDENTIALED_REQUEST',
        message: 'Invalid origin for request with credentials',
      });
    }
  }
  
  // Set CORS headers
  if (isAllowedOrigin || !origin) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }
  
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,Authorization,X-CSRF-Token');
  res.setHeader('Access-Control-Expose-Headers', 'X-CSRF-Token');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
};

// Secure session configuration helper
export const getSecureSessionConfig = () => {
  return {
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'strict' as const,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
    name: 'sessionId', // Don't use default session name
  };
};