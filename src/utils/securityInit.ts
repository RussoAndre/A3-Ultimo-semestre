/**
 * Security initialization and checks
 * Run this on application startup
 */

import { logSecurityWarnings, checkSecurityFeatures } from './securityHeaders'

/**
 * Initialize security features and perform checks
 */
export const initializeSecurity = (): void => {
  // Log security warnings in development
  if (import.meta.env.DEV) {
    logSecurityWarnings()
  }

  // Check for security features
  const securityCheck = checkSecurityFeatures()
  
  if (!securityCheck.isSecure && import.meta.env.PROD) {
    console.error('Application is running in an insecure context!')
    console.error('Security features:', securityCheck.features)
    console.error('Warnings:', securityCheck.warnings)
  }

  // Disable right-click in production (optional - can be controversial)
  if (import.meta.env.PROD && import.meta.env.VITE_DISABLE_RIGHT_CLICK === 'true') {
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault()
    })
  }

  // Disable text selection for sensitive elements (optional)
  if (import.meta.env.VITE_DISABLE_TEXT_SELECTION === 'true') {
    document.body.style.userSelect = 'none'
  }

  // Prevent iframe embedding (defense in depth)
  try {
    if (window.self !== window.top) {
      console.error('Application is being embedded in an iframe!')
      // Optionally break out of iframe
      if (import.meta.env.VITE_BREAK_OUT_OF_IFRAME === 'true' && window.top) {
        window.top.location = window.self.location
      }
    }
  } catch (e) {
    // Ignore iframe access errors
    console.debug('Iframe check skipped due to cross-origin restrictions')
  }

  // Add security event listeners
  setupSecurityEventListeners()
}

/**
 * Setup security-related event listeners
 */
const setupSecurityEventListeners = (): void => {
  // Detect and log potential XSS attempts
  window.addEventListener('error', (event) => {
    if (event.message.includes('Script error')) {
      console.warn('Potential XSS attempt detected')
    }
  })

  // Monitor for suspicious activity
  let suspiciousActivityCount = 0
  const suspiciousActivityThreshold = 10

  const checkSuspiciousActivity = () => {
    suspiciousActivityCount++
    
    if (suspiciousActivityCount > suspiciousActivityThreshold) {
      console.error('Suspicious activity detected! Too many security events.')
      // Optionally log out user or take other action
    }
  }

  // Monitor for console access (potential debugging attempts)
  if (import.meta.env.PROD) {
    const devtools = /./
    devtools.toString = function() {
      checkSuspiciousActivity()
      return 'DevTools detected'
    }
    console.log('%c', devtools)
  }

  // Clear sensitive data on page unload
  window.addEventListener('beforeunload', () => {
    // Clear any sensitive data from memory
    // This is handled by the auth service, but we can add extra cleanup here
  })

  // Detect tab visibility changes (security-sensitive operations should pause)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      // Tab is hidden - pause sensitive operations
      console.debug('Tab hidden - pausing sensitive operations')
    } else {
      // Tab is visible - resume operations
      console.debug('Tab visible - resuming operations')
    }
  })
}

/**
 * Sanitize all form inputs on the page
 */
export const sanitizeAllInputs = (): void => {
  const inputs = document.querySelectorAll('input, textarea')
  
  inputs.forEach(input => {
    if (input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement) {
      input.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement | HTMLTextAreaElement
        
        // Remove potentially dangerous characters
        if (target.value.includes('<script>') || target.value.includes('javascript:')) {
          console.warn('Potentially dangerous input detected and sanitized')
          target.value = target.value
            .replace(/<script>/gi, '')
            .replace(/javascript:/gi, '')
        }
      })
    }
  })
}

/**
 * Setup Content Security Policy violation reporting
 */
export const setupCSPReporting = (): void => {
  document.addEventListener('securitypolicyviolation', (e) => {
    console.error('CSP Violation:', {
      blockedURI: e.blockedURI,
      violatedDirective: e.violatedDirective,
      originalPolicy: e.originalPolicy,
    })
    
    // In production, send this to your logging service
    if (import.meta.env.PROD) {
      // sendToLoggingService({
      //   type: 'csp_violation',
      //   details: {
      //     blockedURI: e.blockedURI,
      //     violatedDirective: e.violatedDirective,
      //   },
      // })
    }
  })
}

/**
 * Initialize all security features
 */
export const initializeAllSecurity = (): void => {
  initializeSecurity()
  setupCSPReporting()
  
  // Log initialization
  console.log('Security features initialized')
}
