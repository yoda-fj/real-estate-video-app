# 🔒 Security Guidelines & Best Practices

## Overview

This document outlines security measures implemented in the Real Estate Video Generator application and provides guidelines for secure deployment and operation.

## 🛡️ Security Measures Implemented

### 1. Input Validation

#### File Uploads
- **File Size Limit**: 10MB per file, max 10 files per request
- **MIME Type Validation**: Only JPEG, PNG, WEBP allowed
- **Magic Number Verification**: Validates actual file content matches declared MIME type
- **Filename Sanitization**: Removes dangerous characters and path components

```typescript
// Example: File validation in upload service
if (!validateFileContent(file, contentType)) {
  throw new Error('Invalid file content');
}
```

#### API Input Validation
- **Zod Schemas**: All API endpoints use Zod for runtime type checking
- **UUID Validation**: Strict UUID format checking for IDs
- **URL Validation**: Validates URLs before use

### 2. Rate Limiting

Rate limits applied per endpoint:
- **Script Generation**: 50 requests per 15 minutes
- **TTS**: 30 requests per 15 minutes
- **Upload**: 20 requests per 15 minutes
- **Video Render**: 10 requests per 15 minutes

```typescript
app.use('/api/video', rateLimit(10, 15 * 60 * 1000), videoRoutes);
```

**Production Recommendation**: Replace in-memory store with Redis for distributed systems.

### 3. Path Traversal Protection

All file path operations are protected:
- Rejects paths containing `..`
- Rejects absolute paths (starting with `/`)
- Sanitizes filenames before storage

```typescript
// Path traversal check
if (storagePath.includes('..') || storagePath.startsWith('/')) {
  return res.status(400).json({ success: false, error: 'Invalid path' });
}
```

### 4. Security Headers

Automatically applied to all responses:
- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-Content-Type-Options: nosniff` - Prevents MIME sniffing
- `X-XSS-Protection: 1; mode=block` - XSS protection
- `Referrer-Policy: strict-origin-when-cross-origin` - Controls referrer info
- `Content-Security-Policy` - Restricts resource loading

### 5. CORS Configuration

Restricted to specific origins:
```typescript
cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
})
```

### 6. Error Handling

- Generic error messages in production
- Detailed errors only in development mode
- No stack traces exposed to clients
- Sensitive data filtered from logs

### 7. Environment Variables

All sensitive configuration in environment variables:
- API keys never in source code
- `.env` files in `.gitignore`
- `.env.example` provided for reference

## ⚠️ Known Limitations (Development Mode)

### Current Issues

1. **In-Memory Rate Limiting**
   - **Issue**: Rate limits don't persist across server restarts
   - **Risk**: Low (development only)
   - **Fix**: Use Redis in production

2. **Static File Serving**
   - **Issue**: Backend serves uploaded files directly
   - **Risk**: Medium (scalability and caching)
   - **Fix**: Use CDN or object storage with direct URLs

3. **No Request Logging**
   - **Issue**: No audit trail for security events
   - **Risk**: Medium (incident response)
   - **Fix**: Implement structured logging with Winston/Bunyan

4. **No Authentication on Some Endpoints**
   - **Issue**: Health check and some routes don't require auth
   - **Risk**: Low (intentional for health checks)
   - **Fix**: Add JWT verification on sensitive routes

## 🔐 Production Deployment Checklist

### Before Deployment

- [ ] **HTTPS Only**: Configure SSL/TLS certificates
- [ ] **Environment Variables**: Set all required vars in production environment
- [ ] **Database Security**: Enable Row Level Security (RLS) in Supabase
- [ ] **API Keys**: Rotate all development keys
- [ ] **Rate Limiting**: Configure Redis for distributed rate limiting
- [ ] **CDN Setup**: Configure CDN for static assets and uploads
- [ ] **Monitoring**: Set up error tracking (Sentry, Rollbar, etc.)
- [ ] **Logging**: Implement structured logging
- [ ] **Backups**: Configure automated database backups
- [ ] **DDoS Protection**: Use Cloudflare or similar service

### Supabase Security

```sql
-- Enable Row Level Security
ALTER TABLE video_projects ENABLE ROW LEVEL SECURITY;

-- Users can only access their own projects
CREATE POLICY "Users can view own projects"
ON video_projects FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects"
ON video_projects FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
ON video_projects FOR UPDATE
USING (auth.uid() = user_id);
```

### Redis Rate Limiting

```typescript
import Redis from 'ioredis';
import { RateLimiterRedis } from 'rate-limiter-flexible';

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || '6379'),
});

const rateLimiter = new RateLimiterRedis({
  storeClient: redis,
  points: 100,
  duration: 900, // 15 minutes
});
```

## 🚨 Security Incident Response

### If You Suspect a Security Breach

1. **Immediately**:
   - Rotate all API keys and secrets
   - Review access logs for suspicious activity
   - Disable affected user accounts if necessary

2. **Investigation**:
   - Check server logs for unusual patterns
   - Review database audit logs
   - Identify scope of breach

3. **Remediation**:
   - Patch vulnerability
   - Notify affected users (if data exposed)
   - Update security measures
   - Document incident and lessons learned

### Reporting Vulnerabilities

If you discover a security vulnerability:
1. **Do NOT** open a public issue
2. Email security details to: [your-security-email]
3. Include: Description, steps to reproduce, potential impact
4. Allow reasonable time for fix before disclosure

## 📋 Security Testing

### Regular Testing Procedures

1. **Dependency Audits**
   ```bash
   npm audit --production
   npm audit fix
   ```

2. **Static Analysis**
   ```bash
   # Run ESLint with security rules
   npm run lint
   
   # TypeScript strict mode
   tsc --noEmit --strict
   ```

3. **OWASP Top 10 Testing**
   - SQL Injection (N/A - using Supabase ORM)
   - XSS (Protected by CSP and input sanitization)
   - Broken Authentication (Using Supabase Auth)
   - Sensitive Data Exposure (Environment variables, HTTPS)
   - XML External Entities (N/A - no XML processing)
   - Broken Access Control (RLS in database)
   - Security Misconfiguration (Hardened headers)
   - Cross-Site Scripting (Input sanitization)
   - Insecure Deserialization (JSON only, validated)
   - Components with Known Vulnerabilities (Regular audits)

## 🔍 Monitoring & Alerts

### Recommended Monitoring

- **Error Rate**: Alert on spike in 5xx errors
- **Rate Limit Hits**: Monitor for unusual patterns
- **Failed Authentication**: Track failed login attempts
- **Large File Uploads**: Alert on unusually large uploads
- **API Response Times**: Detect performance degradation
- **Database Queries**: Monitor slow queries

### Log Levels

- **ERROR**: Security violations, system failures
- **WARN**: Rate limit hits, validation failures
- **INFO**: Normal operations, user actions
- **DEBUG**: Detailed information (development only)

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Supabase Security](https://supabase.com/docs/guides/auth/row-level-security)

## 📝 Changelog

### 2024-02-08
- ✅ Added rate limiting middleware
- ✅ Implemented security headers
- ✅ Added file content validation
- ✅ Fixed path traversal vulnerabilities
- ✅ Removed sensitive data from health endpoint
- ✅ Added input validation with Zod

---

**Remember**: Security is an ongoing process. Regularly review and update security measures as new threats emerge.
