/**
 * Security utilities for authentication and data protection
 */

// Token validation
export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const expirationTime = payload.exp * 1000 // Convert to milliseconds
    return Date.now() >= expirationTime
  } catch {
    return true
  }
}

// Extract token expiration time
export const getTokenExpiration = (token: string): number | null => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp * 1000 // Convert to milliseconds
  } catch {
    return null
  }
}

// Input sanitization to prevent XSS
export const sanitizeInput = (input: string): string => {
  const div = document.createElement('div')
  div.textContent = input
  return div.innerHTML
}

// Validate email format
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Password strength validation
export const validatePasswordStrength = (password: string): {
  isValid: boolean
  errors: string[]
} => {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Generate secure random string
export const generateSecureRandom = (length: number = 32): string => {
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

// CSRF token management
const CSRF_TOKEN_KEY = 'csrf_token'

export const getCSRFToken = (): string => {
  let token = sessionStorage.getItem(CSRF_TOKEN_KEY)
  if (!token) {
    token = generateSecureRandom()
    sessionStorage.setItem(CSRF_TOKEN_KEY, token)
  }
  return token
}

export const clearCSRFToken = (): void => {
  sessionStorage.removeItem(CSRF_TOKEN_KEY)
}

// Rate limiting helper (client-side)
interface RateLimitConfig {
  maxAttempts: number
  windowMs: number
}

class RateLimiter {
  private attempts: Map<string, number[]> = new Map()

  isRateLimited(key: string, config: RateLimitConfig): boolean {
    const now = Date.now()
    const attempts = this.attempts.get(key) || []
    
    // Filter out attempts outside the time window
    const recentAttempts = attempts.filter(
      timestamp => now - timestamp < config.windowMs
    )
    
    this.attempts.set(key, recentAttempts)
    
    return recentAttempts.length >= config.maxAttempts
  }

  recordAttempt(key: string): void {
    const attempts = this.attempts.get(key) || []
    attempts.push(Date.now())
    this.attempts.set(key, attempts)
  }

  reset(key: string): void {
    this.attempts.delete(key)
  }

  getRemainingAttempts(key: string, config: RateLimitConfig): number {
    const now = Date.now()
    const attempts = this.attempts.get(key) || []
    const recentAttempts = attempts.filter(
      timestamp => now - timestamp < config.windowMs
    )
    return Math.max(0, config.maxAttempts - recentAttempts.length)
  }
}

export const rateLimiter = new RateLimiter()

// Rate limit configurations
export const RATE_LIMITS = {
  LOGIN: { maxAttempts: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
  REGISTER: { maxAttempts: 3, windowMs: 60 * 60 * 1000 }, // 3 attempts per hour
  PASSWORD_RESET: { maxAttempts: 3, windowMs: 60 * 60 * 1000 }, // 3 attempts per hour
}
