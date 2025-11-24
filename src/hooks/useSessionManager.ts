/**
 * Hook for managing user session and automatic logout
 */

import { useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { sessionManager } from '../utils/sessionManager'
import { useAuth } from './useAuth'

export const useSessionManager = () => {
  const navigate = useNavigate()
  const { logout, isAuthenticated } = useAuth()

  const handleSessionExpired = useCallback(async () => {
    console.warn('Session expired due to inactivity')
    
    try {
      await logout()
    } catch (error) {
      console.error('Error during session expiry logout:', error)
    }
    
    // Redirect to login with message
    navigate('/login?reason=session_expired', { replace: true })
  }, [logout, navigate])

  useEffect(() => {
    if (!isAuthenticated) {
      sessionManager.stop()
      return
    }

    // Start session monitoring
    sessionManager.start()

    // Subscribe to session expiry events
    const unsubscribe = sessionManager.onSessionExpired(handleSessionExpired)

    // Cleanup
    return () => {
      unsubscribe()
    }
  }, [isAuthenticated, handleSessionExpired])

  return {
    isSessionValid: sessionManager.isSessionValid.bind(sessionManager),
    getTimeUntilExpiry: sessionManager.getTimeUntilExpiry.bind(sessionManager),
    resetSession: sessionManager.reset.bind(sessionManager),
  }
}
