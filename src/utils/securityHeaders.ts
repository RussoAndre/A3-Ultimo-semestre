/**
 * Security headers configuration and utilities
 * These should be implemented on the server side, but this file documents them
 */

import { SECURITY_HEADERS } from '../config/security'

/**
 * Apply security headers to the application
 * Note: This is primarily for documentation. Headers should be set by the server.
 */
export const getSecurityHeaders = (): Record<string, string> => {
  return SECURITY_HEADERS
}

/**
 * Content Security Policy helper
 * Generates a CSP meta tag for the HTML head
 */
export const generateCSPMetaTag = (): string => {
  const csp = SECURITY_HEADERS['Content-Security-Policy']
  return `<meta http-equiv="Content-Security-Policy" content="${csp}">`
}

/**
 * Check if the application is running in a secure context
 */
export const isSecureContext = (): boolean => {
  return window.isSecureContext
}

/**
 * Validate that security features are available
 */
export const checkSecurityFeatures = (): {
  isSecure: boolean
  features: {
    crypto: boolean
    secureContext: boolean
    https: boolean
  }
  warnings: string[]
} => {
  const warnings: string[] = []
  
  const features = {
    crypto: typeof crypto !== 'undefined' && typeof crypto.subtle !== 'undefined',
    secureContext: window.isSecureContext,
    https: window.location.protocol === 'https:',
  }
  
  if (!features.crypto) {
    warnings.push('Web Crypto API is not available')
  }
  
  if (!features.secureContext) {
    warnings.push('Application is not running in a secure context')
  }
  
  if (!features.https && window.location.hostname !== 'localhost') {
    warnings.push('Application is not using HTTPS')
  }
  
  return {
    isSecure: features.crypto && features.secureContext,
    features,
    warnings,
  }
}

/**
 * Log security warnings to console
 */
export const logSecurityWarnings = (): void => {
  const check = checkSecurityFeatures()
  
  if (check.warnings.length > 0) {
    console.warn('Security warnings detected:')
    check.warnings.forEach(warning => {
      console.warn(`- ${warning}`)
    })
  }
}

/**
 * Middleware to add security headers to fetch requests
 */
export const addSecurityHeaders = (headers: Headers): Headers => {
  // Add custom security headers if needed
  headers.set('X-Requested-With', 'XMLHttpRequest')
  
  return headers
}

/**
 * Server-side security headers configuration (for backend implementation)
 * This is a reference for backend developers
 */
export const SERVER_SECURITY_CONFIG = {
  helmet: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    frameguard: {
      action: 'deny',
    },
    noSniff: true,
    xssFilter: true,
    referrerPolicy: {
      policy: 'strict-origin-when-cross-origin',
    },
  },
  cors: {
    origin: import.meta.env.VITE_APP_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
  },
}
