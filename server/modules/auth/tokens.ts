import crypto from 'crypto';

// Token configuration
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'access-secret-dev';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh-secret-dev';
const ACCESS_EXPIRES_IN = '15m';
const REFRESH_DAYS = parseInt(process.env.REFRESH_DAYS || '30');

// Simple JWT implementation for access tokens
export function signAccess(user: { id: string; email: string; role?: string }): string {
  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role || 'user',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (15 * 60) // 15 minutes
  };
  
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  
  const signature = crypto
    .createHmac('sha256', ACCESS_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');
    
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export function verifyAccess(token: string): { sub: string; email: string; role: string } | null {
  try {
    const [encodedHeader, encodedPayload, signature] = token.split('.');
    
    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', ACCESS_SECRET)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64url');
      
    if (signature !== expectedSignature) {
      return null;
    }
    
    // Decode payload
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString());
    
    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    
    return {
      sub: payload.sub,
      email: payload.email,
      role: payload.role || 'user'
    };
  } catch (error) {
    return null;
  }
}

// Generate cryptographically secure refresh token
export function signRefresh(): string {
  return crypto.randomBytes(32).toString('base64url');
}

// Hash refresh token for database storage
export function hashRefresh(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// Utility to add days to a date
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// Get refresh token expiration date
export function getRefreshExpiration(): Date {
  return addDays(new Date(), REFRESH_DAYS);
}

// Cookie configuration for refresh tokens
export function getRefreshCookieOptions() {
  const maxAge = REFRESH_DAYS * 24 * 60 * 60 * 1000; // milliseconds
  
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/api/auth',
    maxAge,
  };
}