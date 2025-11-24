/**
 * Input validation utilities to prevent XSS, SQL injection, and other attacks
 */

// Validation result type
export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

// Email validation
export const validateEmail = (email: string): ValidationResult => {
  const errors: string[] = []
  
  if (!email || email.trim().length === 0) {
    errors.push('Email is required')
  } else {
    // RFC 5322 compliant email regex (simplified)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      errors.push('Invalid email format')
    }
    
    if (email.length > 254) {
      errors.push('Email is too long (max 254 characters)')
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Password validation
export const validatePassword = (password: string): ValidationResult => {
  const errors: string[] = []
  
  if (!password) {
    errors.push('Password is required')
  } else {
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters')
    }
    
    if (password.length > 128) {
      errors.push('Password is too long (max 128 characters)')
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
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Name validation (for device names, user names, etc.)
export const validateName = (name: string, fieldName: string = 'Name'): ValidationResult => {
  const errors: string[] = []
  
  if (!name || name.trim().length === 0) {
    errors.push(`${fieldName} is required`)
  } else {
    if (name.length < 2) {
      errors.push(`${fieldName} must be at least 2 characters`)
    }
    
    if (name.length > 100) {
      errors.push(`${fieldName} is too long (max 100 characters)`)
    }
    
    // Allow letters, numbers, spaces, hyphens, and underscores
    const nameRegex = /^[a-zA-Z0-9\s\-_]+$/
    if (!nameRegex.test(name)) {
      errors.push(`${fieldName} contains invalid characters`)
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Number validation
export const validateNumber = (
  value: number | string,
  fieldName: string,
  options: {
    min?: number
    max?: number
    integer?: boolean
  } = {}
): ValidationResult => {
  const errors: string[] = []
  const num = typeof value === 'string' ? parseFloat(value) : value
  
  if (isNaN(num)) {
    errors.push(`${fieldName} must be a valid number`)
  } else {
    if (options.min !== undefined && num < options.min) {
      errors.push(`${fieldName} must be at least ${options.min}`)
    }
    
    if (options.max !== undefined && num > options.max) {
      errors.push(`${fieldName} must be at most ${options.max}`)
    }
    
    if (options.integer && !Number.isInteger(num)) {
      errors.push(`${fieldName} must be an integer`)
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  }
}

// URL validation
export const validateURL = (url: string): ValidationResult => {
  const errors: string[] = []
  
  if (!url || url.trim().length === 0) {
    errors.push('URL is required')
  } else {
    try {
      const urlObj = new URL(url)
      
      // Only allow http and https protocols
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        errors.push('URL must use HTTP or HTTPS protocol')
      }
    } catch {
      errors.push('Invalid URL format')
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Date validation
export const validateDate = (date: string | Date, fieldName: string = 'Date'): ValidationResult => {
  const errors: string[] = []
  
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  if (isNaN(dateObj.getTime())) {
    errors.push(`${fieldName} is not a valid date`)
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Sanitize HTML to prevent XSS
export const sanitizeHTML = (html: string): string => {
  const div = document.createElement('div')
  div.textContent = html
  return div.innerHTML
}

// Sanitize string input
export const sanitizeString = (input: string): string => {
  if (!input) return ''
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
}

// Validate and sanitize device data
export const validateDeviceData = (data: {
  name: string
  wattage: number
  dailyUsageHours: number
}): ValidationResult => {
  const errors: string[] = []
  
  // Validate name
  const nameValidation = validateName(data.name, 'Device name')
  if (!nameValidation.isValid) {
    errors.push(...nameValidation.errors)
  }
  
  // Validate wattage
  const wattageValidation = validateNumber(data.wattage, 'Wattage', {
    min: 0,
    max: 100000,
  })
  if (!wattageValidation.isValid) {
    errors.push(...wattageValidation.errors)
  }
  
  // Validate daily usage hours
  const usageValidation = validateNumber(data.dailyUsageHours, 'Daily usage hours', {
    min: 0,
    max: 24,
  })
  if (!usageValidation.isValid) {
    errors.push(...usageValidation.errors)
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Validate file upload
export const validateFileUpload = (
  file: File,
  options: {
    maxSize?: number // in bytes
    allowedTypes?: string[]
  } = {}
): ValidationResult => {
  const errors: string[] = []
  const maxSize = options.maxSize || 5 * 1024 * 1024 // Default 5MB
  const allowedTypes = options.allowedTypes || ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
  
  if (file.size > maxSize) {
    errors.push(`File size must be less than ${maxSize / 1024 / 1024}MB`)
  }
  
  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} is not allowed`)
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  }
}

// SQL injection prevention - validate query parameters
export const validateQueryParam = (param: string): boolean => {
  // Check for common SQL injection patterns
  const sqlInjectionPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
    /(--|;|\/\*|\*\/)/g,
    /(\bOR\b.*=.*)/gi,
    /(\bAND\b.*=.*)/gi,
    /(union.*select)/gi,
  ]
  
  return !sqlInjectionPatterns.some(pattern => pattern.test(param))
}

// Validate JSON structure
export const validateJSON = (jsonString: string): ValidationResult => {
  const errors: string[] = []
  
  try {
    JSON.parse(jsonString)
  } catch (error) {
    errors.push('Invalid JSON format')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Comprehensive form validation
export const validateForm = <T extends Record<string, any>>(
  data: T,
  rules: Record<keyof T, (value: any) => ValidationResult>
): { isValid: boolean; errors: Record<keyof T, string[]> } => {
  const errors: Record<string, string[]> = {}
  let isValid = true
  
  for (const field in rules) {
    const validation = rules[field](data[field])
    if (!validation.isValid) {
      errors[field] = validation.errors
      isValid = false
    }
  }
  
  return {
    isValid,
    errors: errors as Record<keyof T, string[]>,
  }
}
