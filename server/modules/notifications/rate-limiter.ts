/**
 * Simple in-memory rate limiter for notifications
 * In production, consider using Redis or database for persistence
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

export class RateLimiter {
  private limits = new Map<string, RateLimitEntry>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every hour
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60 * 60 * 1000);
  }

  /**
   * Check if request is within rate limit
   * @param key - Unique identifier for the rate limit (e.g., "user:123:card:456")
   * @param maxRequests - Maximum number of requests allowed
   * @param windowMs - Time window in milliseconds
   * @returns true if within limit, false if exceeded
   */
  checkLimit(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const entry = this.limits.get(key);

    if (!entry) {
      // First request for this key
      return true;
    }

    if (now >= entry.resetTime) {
      // Window has expired, reset
      return true;
    }

    // Check if we're within the limit
    return entry.count < maxRequests;
  }

  /**
   * Record usage of a rate limit
   * Call this after a successful operation
   */
  recordUsage(key: string, windowMs: number = 24 * 60 * 60 * 1000): void {
    const now = Date.now();
    const entry = this.limits.get(key);

    if (!entry || now >= entry.resetTime) {
      // First usage or window expired
      this.limits.set(key, {
        count: 1,
        resetTime: now + windowMs,
      });
    } else {
      // Increment existing entry
      entry.count++;
      this.limits.set(key, entry);
    }
  }

  /**
   * Get current usage for a key
   */
  getUsage(key: string): { count: number; resetTime: number } | null {
    const entry = this.limits.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now >= entry.resetTime) {
      // Expired
      this.limits.delete(key);
      return null;
    }

    return { ...entry };
  }

  /**
   * Reset rate limit for a key (admin function)
   */
  reset(key: string): void {
    this.limits.delete(key);
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.limits.forEach((entry, key) => {
      if (now >= entry.resetTime) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.limits.delete(key));
    
    if (keysToDelete.length > 0) {
      console.log(`Rate limiter: Cleaned up ${keysToDelete.length} expired entries`);
    }
  }

  /**
   * Get current rate limit statistics
   */
  getStats(): { totalKeys: number; entries: Array<{ key: string; count: number; resetTime: number }> } {
    const now = Date.now();
    const entries: Array<{ key: string; count: number; resetTime: number }> = [];

    this.limits.forEach((entry, key) => {
      if (now < entry.resetTime) {
        entries.push({ key, count: entry.count, resetTime: entry.resetTime });
      }
    });

    return {
      totalKeys: entries.length,
      entries,
    };
  }

  /**
   * Cleanup interval when shutting down
   */
  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.limits.clear();
  }
}