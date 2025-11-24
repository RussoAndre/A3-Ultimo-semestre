# Security Implementation Guide

This document describes the security features implemented in the EcoTech application.

## Overview

The application implements comprehensive security measures including:
- OAuth 2.0 authentication with JWT tokens
- LGPD compliance for data protection
- Input validation and sanitization
- Security headers
- Rate limiting
- Session management
- Data encryption

## 1. Authentication & Authorization

### OAuth 2.0 Implementation

**Location:** `src/services/auth.service.ts`, `src/services/api.ts`

- JWT tokens with httpOnly cookies (recommended) or localStorage fallback
- Automatic token refresh with retry mechanism
- Secure token storage
- CSRF protection for state-changing operations

**Key Features:**
- Access tokens expire after 15 minutes
- Refresh tokens expire after 7 days
- Automatic token refresh before expiration
- Rate limiting on authentication endpoints (5 attempts per 15 minutes)

### Session Management

**Location:** `src/utils/sessionManager.ts`, `src/hooks/useSessionManager.ts`

- Automatic logout after 30 minutes of inactivity
- Activity tracking (mouse, keyboard, touch events)
- Session expiry notifications
- Graceful session cleanup

## 2. LGPD Compliance

### Consent Management

**Location:** `src/services/lgpd.service.ts`, `src/components/profile/ConsentManagement.tsx`

- User consent tracking for:
  - Data processing (required)
  - Analytics (optional)
  - Marketing (optional)
  - Leaderboard participation (optional)
- Consent versioning
- Audit trail for consent changes

### Data Rights

**Location:** `src/components/profile/DataManagement.tsx`

**Right to Access:**
- Users can view all stored data
- Audit logs available for review

**Right to Portability:**
- Data export in JSON format
- Download includes all user data
- Export expires after 7 days

**Right to Deletion:**
- 30-day deletion SLA
- Cancellable deletion requests
- Complete data removal including backups

### Audit Logging

**Location:** `src/types/lgpd.types.ts`

All data access and modifications are logged with:
- User ID
- Action type
- Timestamp
- IP address (server-side)
- User agent

## 3. Input Validation & Sanitization

### Client-Side Validation

**Location:** `src/utils/validation.ts`, `src/utils/security.ts`

**Validation Functions:**
- Email validation (RFC 5322 compliant)
- Password strength validation (8+ chars, uppercase, lowercase, numbers, special chars)
- Name validation (alphanumeric with spaces, hyphens, underscores)
- Number validation with min/max constraints
- URL validation (HTTP/HTTPS only)
- Date validation
- File upload validation (size, type)

**Sanitization:**
- HTML sanitization to prevent XSS
- String sanitization (remove dangerous characters)
- SQL injection pattern detection
- JavaScript protocol removal

### Form Validation Hook

**Location:** `src/hooks/useFormValidation.ts`

Provides:
- Automatic field validation
- Error tracking
- Touch state management
- Sanitization on input
- ARIA attributes for accessibility

## 4. Security Headers

### Implemented Headers

**Location:** `src/config/security.ts`, `vite.config.ts`

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Content-Security-Policy: [see below]
```

### Content Security Policy

```
default-src 'self';
script-src 'self';
style-src 'self' 'unsafe-inline';
img-src 'self' data: https:;
connect-src 'self' [API_URL];
font-src 'self' data:;
frame-ancestors 'none';
base-uri 'self';
form-action 'self';
```

## 5. Rate Limiting

### Client-Side Rate Limiting

**Location:** `src/utils/security.ts`

- Login: 5 attempts per 15 minutes
- Registration: 3 attempts per hour
- Password reset: 3 attempts per hour

### Server-Side Rate Limiting

**Recommended Configuration:**
- Authentication endpoints: 5 requests per 15 minutes
- General API: 100 requests per 15 minutes
- IP-based limiting
- User-based limiting for authenticated requests

## 6. Data Encryption

### Client-Side Encryption

**Location:** `src/utils/encryption.ts`

**Features:**
- AES-256-GCM encryption
- PBKDF2 key derivation (100,000 iterations)
- Random salt and IV generation
- Secure storage wrapper

**Use Cases:**
- Sensitive data in localStorage
- Temporary data storage
- Client-side data protection

### Server-Side Encryption

**Recommended:**
- TLS 1.3 for data in transit
- AES-256 encryption for data at rest
- Bcrypt for password hashing (cost factor 12)
- Encrypted database backups

## 7. CSRF Protection

**Location:** `src/services/api.ts`, `src/utils/security.ts`

- CSRF tokens for all state-changing operations (POST, PUT, PATCH, DELETE)
- Token stored in sessionStorage
- Token sent in X-CSRF-Token header
- Server validates token on each request

## 8. Security Initialization

**Location:** `src/utils/securityInit.ts`, `src/main.tsx`

On application startup:
- Security feature checks
- CSP violation reporting
- Security event listeners
- Development warnings

## 9. Best Practices

### Password Policy

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character
- Maximum 128 characters

### Token Management

- Never store tokens in localStorage in production (use httpOnly cookies)
- Implement token rotation
- Clear tokens on logout
- Validate token expiration

### API Security

- Always use HTTPS in production
- Validate all inputs server-side
- Use parameterized queries
- Implement proper error handling (don't leak sensitive info)
- Log security events

### Frontend Security

- Sanitize all user inputs
- Use Content Security Policy
- Implement CSRF protection
- Validate file uploads
- Use secure dependencies

## 10. Security Checklist

### Before Deployment

- [ ] Enable HTTPS with valid SSL certificate
- [ ] Configure security headers on server
- [ ] Enable httpOnly cookies for tokens
- [ ] Set up rate limiting on server
- [ ] Configure CORS properly
- [ ] Enable audit logging
- [ ] Set up error monitoring
- [ ] Review and update CSP
- [ ] Test authentication flows
- [ ] Test LGPD compliance features
- [ ] Scan for vulnerabilities
- [ ] Update dependencies
- [ ] Remove console.logs in production
- [ ] Disable source maps in production
- [ ] Configure backup strategy
- [ ] Set up incident response plan

### Regular Maintenance

- [ ] Update dependencies monthly
- [ ] Review security logs weekly
- [ ] Test backup restoration quarterly
- [ ] Conduct security audits annually
- [ ] Update security documentation
- [ ] Train team on security practices

## 11. Incident Response

### In Case of Security Breach

1. **Immediate Actions:**
   - Isolate affected systems
   - Revoke all active tokens
   - Force password reset for affected users
   - Enable additional logging

2. **Investigation:**
   - Review audit logs
   - Identify breach scope
   - Document findings

3. **Notification:**
   - Notify affected users within 72 hours (LGPD requirement)
   - Report to authorities if required
   - Provide remediation steps

4. **Remediation:**
   - Patch vulnerabilities
   - Update security measures
   - Conduct post-mortem
   - Update documentation

## 12. Resources

### Documentation
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [LGPD Official Text](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

### Tools
- [OWASP ZAP](https://www.zaproxy.org/) - Security testing
- [npm audit](https://docs.npmjs.com/cli/v8/commands/npm-audit) - Dependency scanning
- [Snyk](https://snyk.io/) - Vulnerability scanning
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Security audits

## 13. Contact

For security concerns or to report vulnerabilities:
- Email: security@ecotech.example.com
- Bug Bounty: [if applicable]

**Note:** Please do not disclose security vulnerabilities publicly until they have been addressed.
