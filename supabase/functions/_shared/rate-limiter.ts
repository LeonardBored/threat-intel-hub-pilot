interface RateLimitConfig {
  windowMs: number;     // Time window in milliseconds
  maxRequests: number;  // Max requests per window
  identifier: string;   // Unique identifier (IP, user ID, etc.)
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  limit: number;
}

// In-memory store (resets when function cold starts)
const rateLimitStore = new Map<string, RateLimitEntry>();

export function rateLimit(config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  const key = `${config.identifier}`;
  
  // Clean expired entries to prevent memory leaks
  for (const [k, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(k);
    }
  }
  
  let entry = rateLimitStore.get(key);
  
  // Create new entry or reset if window expired
  if (!entry || entry.resetTime < now) {
    entry = {
      count: 1,
      resetTime: now + config.windowMs
    };
    rateLimitStore.set(key, entry);
    
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: entry.resetTime,
      limit: config.maxRequests
    };
  }
  
  // Check if limit exceeded
  if (entry.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
      limit: config.maxRequests
    };
  }
  
  // Increment counter
  entry.count++;
  rateLimitStore.set(key, entry);
  
  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
    limit: config.maxRequests
  };
}

// Helper function to extract client identifier
export function getClientIdentifier(req: Request): string {
  // Try to get IP address from various headers
  const cfConnectingIP = req.headers.get('cf-connecting-ip');
  const xForwardedFor = req.headers.get('x-forwarded-for');
  const xRealIP = req.headers.get('x-real-ip');
  
  // Try to get user from authorization header
  const authHeader = req.headers.get('authorization');
  const userAgent = req.headers.get('user-agent');
  
  let identifier = 'anonymous';
  
  // Prefer Cloudflare's connecting IP
  if (cfConnectingIP) {
    identifier = cfConnectingIP;
  } else if (xRealIP) {
    identifier = xRealIP;
  } else if (xForwardedFor) {
    identifier = xForwardedFor.split(',')[0].trim();
  }
  
  // If we have auth, combine with IP for better identification
  if (authHeader) {
    // Extract a hash of the auth header for privacy
    const authHash = authHeader.substring(0, 10);
    identifier = `${identifier}-${authHash}`;
  }
  
  return identifier;
}

// Helper function to create rate limit headers
export function createRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000).toString(),
    'Retry-After': result.allowed ? '0' : Math.ceil((result.resetTime - Date.now()) / 1000).toString()
  };
}

// Helper function to create rate limit error response
export function createRateLimitErrorResponse(
  result: RateLimitResult, 
  corsHeaders: Record<string, string>
): Response {
  const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);
  
  return new Response(
    JSON.stringify({
      error: 'Rate limit exceeded',
      message: `Too many requests. Please try again in ${retryAfter} seconds.`,
      details: {
        limit: result.limit,
        remaining: result.remaining,
        resetTime: result.resetTime,
        retryAfter
      }
    }),
    {
      status: 429,
      headers: {
        ...corsHeaders,
        ...createRateLimitHeaders(result),
        'Content-Type': 'application/json'
      }
    }
  );
}
