/**
 * Security configuration for the application
 */

// Content Security Policy configuration
export const CSP_DIRECTIVES = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'"], // Note: Remove unsafe-inline in production
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", 'data:', 'https:'],
  'font-src': ["'self'", 'data:'],
  'connect-src': ["'self'", import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'],
  'frame-ancestors': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
}

// Generate CSP header string
export const generateCSPHeader = (): string => {
  return Object.entries(CSP_DIRECTIVES)
    .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
    .join('; ')
}

// Security headers configuration (for backend implementation)
export const SECURITY_HEADERS = {
  // Prevent clickjacking
  'X-Frame-Options': 'DENY',
  
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // Enable XSS protection
  'X-XSS-Protection': '1; mode=block',
  
  // Referrer policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Permissions policy
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  
  // Strict Transport Security (HTTPS only)
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  
  // Content Security Policy
  'Content-Security-Policy': generateCSPHeader(),
}

// OAuth 2.0 configuration
export const OAUTH_CONFIG = {
  // Token expiration times
  ACCESS_TOKEN_EXPIRY: 15 * 60, // 15 minutes in seconds
  REFRESH_TOKEN_EXPIRY: 7 * 24 * 60 * 60, // 7 days in seconds
  
  // Token refresh threshold (refresh when token has less than this time remaining)
  REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutes in milliseconds
  
  // Cookie configuration for httpOnly tokens
  COOKIE_OPTIONS: {
    httpOnly: true,
    secure: import.meta.env.PROD, // HTTPS only in production
    sameSite: 'strict' as const,
    path: '/',
  },
}

// Password policy
export const PASSWORD_POLICY = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  maxLength: 128,
}

// Rate limiting configuration (for backend implementation)
export const RATE_LIMIT_CONFIG = {
  // Authentication endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
  },
  
  // Registration endpoint
  register: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 requests per window
  },
  
  // General API endpoints
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
  },
  
  // Password reset
  passwordReset: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 requests per window
  },
}

// Session configuration
export const SESSION_CONFIG = {
  // Session timeout (30 minutes of inactivity)
  timeout: 30 * 60 * 1000,
  
  // Check session validity interval
  checkInterval: 60 * 1000, // Check every minute
}

// LGPD compliance configuration
export const LGPD_CONFIG = {
  // Data deletion SLA (in days)
  deletionSLA: 30,
  
  // Data retention period (in days)
  dataRetention: 365,
  
  // Required consent types
  consentTypes: [
    'data_processing',
    'marketing',
    'analytics',
    'leaderboard',
  ] as const,
}

// Encryption configuration (for backend implementation)
export const ENCRYPTION_CONFIG = {
  // Algorithm for data encryption
  algorithm: 'aes-256-gcm',
  
  // Key derivation
  keyDerivation: {
    algorithm: 'pbkdf2',
    iterations: 100000,
    keyLength: 32,
    digest: 'sha256',
  },
  
  // Password hashing
  passwordHash: {
    algorithm: 'bcrypt',
    saltRounds: 12,
  },
}

// Audit logging configuration
export const AUDIT_CONFIG = {
  // Events to log
  events: [
    'user.login',
    'user.logout',
    'user.register',
    'user.delete',
    'user.data_export',
    'user.consent_update',
    'data.access',
    'data.modify',
    'data.delete',
  ] as const,
  
  // Retention period for audit logs (in days)
  retentionDays: 365,
}
