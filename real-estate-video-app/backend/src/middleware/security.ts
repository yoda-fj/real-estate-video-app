import { Request, Response, NextFunction } from 'express';

/**
 * Security headers middleware
 * Adds essential security headers to all responses
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; img-src 'self' data: https:; media-src 'self' https:;"
  );
  
  next();
}

/**
 * Rate limiting store (in-memory, replace with Redis in production)
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Periodic cleanup of expired rate limit records (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Simple rate limiting middleware
 * Limits requests per IP address
 * 
 * Note: This implementation is suitable for single-instance deployments.
 * For production with multiple instances, use Redis-based rate limiting
 * (e.g., rate-limiter-flexible with Redis).
 */
export function rateLimit(
  maxRequests: number = 100,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    
    const record = rateLimitStore.get(ip);
    
    // Clean up old records
    if (record && now > record.resetTime) {
      rateLimitStore.delete(ip);
    }
    
    if (!record || now > record.resetTime) {
      rateLimitStore.set(ip, {
        count: 1,
        resetTime: now + windowMs,
      });
      return next();
    }
    
    if (record.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        error: 'Too many requests, please try again later',
        retryAfter: Math.ceil((record.resetTime - now) / 1000),
      });
    }
    
    // Atomic increment (safe in Node.js single-threaded event loop)
    record.count++;
    next();
  };
}

/**
 * Validate file content to prevent malicious uploads
 */
export function validateFileContent(buffer: Buffer, mimetype: string): boolean {
  // Check file signatures (magic numbers)
  const signatures: { [key: string]: number[][] } = {
    'image/jpeg': [[0xFF, 0xD8, 0xFF]],
    'image/png': [[0x89, 0x50, 0x4E, 0x47]],
    'image/webp': [[0x52, 0x49, 0x46, 0x46]], // First 4 bytes of WEBP
  };
  
  const expectedSignature = signatures[mimetype];
  if (!expectedSignature) {
    return false;
  }
  
  // Check if buffer starts with any of the expected signatures
  return expectedSignature.some(sig => {
    for (let i = 0; i < sig.length; i++) {
      if (buffer[i] !== sig[i]) {
        return false;
      }
    }
    return true;
  });
}

/**
 * Sanitize filename to prevent path traversal
 */
export function sanitizeFilename(filename: string): string {
  // Remove any path components
  const basename = filename.replace(/^.*[\\\/]/, '');
  
  // Remove dangerous characters
  return basename.replace(/[^a-zA-Z0-9._-]/g, '_');
}

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}
