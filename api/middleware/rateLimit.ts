import { NextRequest } from 'next/server';

interface RateLimitConfig {
  uniqueTokenPerInterval: number;
  interval: number;
}

class RateLimitStore {
  private store = new Map<string, { count: number; timestamp: number }>();

  check(key: string, config: RateLimitConfig): { success: boolean; remaining: number } {
    const now = Date.now();
    const windowStart = now - config.interval;
    
    // Clean up old entries
    for (const [k, v] of this.store.entries()) {
      if (v.timestamp < windowStart) {
        this.store.delete(k);
      }
    }

    const current = this.store.get(key);
    if (!current) {
      this.store.set(key, { count: 1, timestamp: now });
      return { success: true, remaining: config.uniqueTokenPerInterval - 1 };
    }

    if (current.timestamp < windowStart) {
      this.store.set(key, { count: 1, timestamp: now });
      return { success: true, remaining: config.uniqueTokenPerInterval - 1 };
    }

    if (current.count >= config.uniqueTokenPerInterval) {
      return { success: false, remaining: 0 };
    }

    current.count += 1;
    return { success: true, remaining: config.uniqueTokenPerInterval - current.count };
  }
}

const store = new RateLimitStore();

export function rateLimit(config: RateLimitConfig) {
  return {
    check: (request: NextRequest) => {
      const ip = getClientIp(request);
      return store.check(ip, config);
    }
  };
}

function getClientIp(request: NextRequest): string {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) {
    return xff.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || 'unknown';
}

export const deepgramLimiter = rateLimit({
  uniqueTokenPerInterval: 50,
  interval: 60 * 60 * 1000, // per hour
});