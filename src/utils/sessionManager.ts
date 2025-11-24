/**
 * Session management utility for tracking user activity and automatic logout
 */

import { SESSION_CONFIG } from '../config/security'

type SessionEventListener = () => void

class SessionManager {
  private lastActivityTime: number = Date.now()
  private checkIntervalId: number | null = null
  private listeners: SessionEventListener[] = []

  constructor() {
    this.setupActivityListeners()
  }

  // Start monitoring session
  start(): void {
    this.lastActivityTime = Date.now()
    
    if (this.checkIntervalId) {
      return // Already started
    }

    // Check session validity periodically
    this.checkIntervalId = window.setInterval(() => {
      this.checkSession()
    }, SESSION_CONFIG.checkInterval)
  }

  // Stop monitoring session
  stop(): void {
    if (this.checkIntervalId) {
      clearInterval(this.checkIntervalId)
      this.checkIntervalId = null
    }
  }

  // Update last activity time
  updateActivity(): void {
    this.lastActivityTime = Date.now()
  }

  // Check if session is still valid
  isSessionValid(): boolean {
    const now = Date.now()
    const timeSinceLastActivity = now - this.lastActivityTime
    return timeSinceLastActivity < SESSION_CONFIG.timeout
  }

  // Get time until session expires (in milliseconds)
  getTimeUntilExpiry(): number {
    const now = Date.now()
    const timeSinceLastActivity = now - this.lastActivityTime
    return Math.max(0, SESSION_CONFIG.timeout - timeSinceLastActivity)
  }

  // Add listener for session expiry
  onSessionExpired(listener: SessionEventListener): () => void {
    this.listeners.push(listener)
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  // Check session and notify listeners if expired
  private checkSession(): void {
    if (!this.isSessionValid()) {
      this.notifyListeners()
      this.stop()
    }
  }

  // Notify all listeners
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener()
      } catch (error) {
        console.error('Error in session expiry listener:', error)
      }
    })
  }

  // Setup listeners for user activity
  private setupActivityListeners(): void {
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ]

    // Throttle activity updates to avoid excessive calls
    let throttleTimeout: number | null = null
    const throttledUpdate = () => {
      if (!throttleTimeout) {
        throttleTimeout = window.setTimeout(() => {
          this.updateActivity()
          throttleTimeout = null
        }, 1000) // Update at most once per second
      }
    }

    events.forEach(event => {
      document.addEventListener(event, throttledUpdate, { passive: true })
    })
  }

  // Reset session (useful after re-authentication)
  reset(): void {
    this.lastActivityTime = Date.now()
  }
}

export const sessionManager = new SessionManager()
