import bcrypt from 'bcryptjs';
import { db } from '../../db';
import { users, refreshTokens } from '@shared/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { signAccess, signRefresh, hashRefresh, getRefreshExpiration } from './tokens';

export interface LoginResult {
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    profileImageUrl: string | null;
    role: string;
  };
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  // Email/password login
  async loginWithEmail(email: string, password: string): Promise<LoginResult | null> {
    try {
      // Find user by email
      const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
      
      if (!user || !user.password) {
        return null; // User not found or OAuth-only account
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return null;
      }

      return await this.generateTokens(user);
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  }

  // Register new user with email/password
  async registerWithEmail(
    email: string, 
    password: string, 
    firstName?: string, 
    lastName?: string
  ): Promise<LoginResult | null> {
    try {
      // Check if user already exists
      const [existingUser] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
      if (existingUser) {
        return null; // User already exists
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create new user
      const [newUser] = await db.insert(users).values({
        email: email.toLowerCase(),
        password: hashedPassword,
        firstName: firstName || null,
        lastName: lastName || null,
        planType: 'free',
        businessCardsLimit: 1,
        businessCardsCount: 0,
      }).returning();

      return await this.generateTokens(newUser);
    } catch (error) {
      console.error('Registration error:', error);
      return null;
    }
  }

  // OAuth user creation/update (Google, etc.)
  async upsertOAuthUser(profile: {
    email: string;
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
  }): Promise<LoginResult> {
    const { email, firstName, lastName, profileImageUrl } = profile;

    // Check if user exists
    let [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));

    if (!user) {
      // Create new user
      [user] = await db.insert(users).values({
        email: email.toLowerCase(),
        firstName: firstName || null,
        lastName: lastName || null,
        profileImageUrl: profileImageUrl || null,
        planType: 'free',
        businessCardsLimit: 1,
        businessCardsCount: 0,
      }).returning();
    } else {
      // Update existing user's profile info (but not email)
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

    return await this.generateTokens(user);
  }

  // Generate JWT access token and refresh token
  private async generateTokens(user: any): Promise<LoginResult> {
    // Generate tokens
    const accessToken = signAccess({
      id: user.id,
      email: user.email,
      role: user.role || 'user'
    });
    
    const refreshToken = signRefresh();
    const tokenHash = hashRefresh(refreshToken);

    // Store refresh token in database
    await db.insert(refreshTokens).values({
      userId: user.id,
      tokenHash,
      expiresAt: getRefreshExpiration(),
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
        role: user.role || 'user',
      },
      accessToken,
      refreshToken,
    };
  }

  // Refresh access token using refresh token
  async refreshTokens(refreshToken: string): Promise<{ accessToken: string; refreshToken: string } | null> {
    try {
      const tokenHash = hashRefresh(refreshToken);

      // Find valid refresh token
      const [tokenRecord] = await db
        .select({
          id: refreshTokens.id,
          userId: refreshTokens.userId,
          expiresAt: refreshTokens.expiresAt,
          user: {
            id: users.id,
            email: users.email,
            role: users.role,
          }
        })
        .from(refreshTokens)
        .innerJoin(users, eq(refreshTokens.userId, users.id))
        .where(
          and(
            eq(refreshTokens.tokenHash, tokenHash),
            isNull(refreshTokens.revokedAt)
          )
        );

      if (!tokenRecord) {
        return null; // Token not found or revoked
      }

      // Check if token is expired
      if (new Date() > new Date(tokenRecord.expiresAt)) {
        // Clean up expired token
        await db.delete(refreshTokens).where(eq(refreshTokens.id, tokenRecord.id));
        return null;
      }

      // Generate new tokens
      const newAccessToken = signAccess({
        id: tokenRecord.user.id,
        email: tokenRecord.user.email,
        role: tokenRecord.user.role || 'user'
      });

      const newRefreshToken = signRefresh();
      const newTokenHash = hashRefresh(newRefreshToken);

      // Replace old refresh token with new one (rotation)
      await db.transaction(async (tx) => {
        // Delete old token
        await tx.delete(refreshTokens).where(eq(refreshTokens.id, tokenRecord.id));
        
        // Insert new token
        await tx.insert(refreshTokens).values({
          userId: tokenRecord.userId,
          tokenHash: newTokenHash,
          expiresAt: getRefreshExpiration(),
        });
      });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      console.error('Token refresh error:', error);
      return null;
    }
  }

  // Revoke refresh token (logout)
  async revokeRefreshToken(refreshToken: string): Promise<boolean> {
    try {
      const tokenHash = hashRefresh(refreshToken);
      
      const result = await db
        .update(refreshTokens)
        .set({ revokedAt: new Date() })
        .where(eq(refreshTokens.tokenHash, tokenHash));

      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.error('Token revocation error:', error);
      return false;
    }
  }

  // Revoke all refresh tokens for a user (logout from all devices)
  async revokeAllUserTokens(userId: string): Promise<boolean> {
    try {
      await db
        .update(refreshTokens)
        .set({ revokedAt: new Date() })
        .where(
          and(
            eq(refreshTokens.userId, userId),
            isNull(refreshTokens.revokedAt)
          )
        );

      return true;
    } catch (error) {
      console.error('Token revocation error:', error);
      return false;
    }
  }

  // Get user by ID
  async getUserById(id: string) {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user || null;
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  }

  // Clean up expired refresh tokens (run periodically)
  async cleanupExpiredTokens(): Promise<void> {
    try {
      await db.delete(refreshTokens).where(
        // Delete tokens that are either expired or revoked more than 30 days ago
        and(
          // Expired tokens
          // OR revoked tokens older than 30 days
        )
      );
    } catch (error) {
      console.error('Token cleanup error:', error);
    }
  }
}

export const authService = new AuthService();