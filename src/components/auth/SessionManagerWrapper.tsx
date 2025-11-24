/**
 * Wrapper component to integrate session management into the app
 */

import { ReactNode } from 'react'
import { useSessionManager } from '../../hooks/useSessionManager'

interface SessionManagerWrapperProps {
  children: ReactNode
}

export const SessionManagerWrapper = ({ children }: SessionManagerWrapperProps) => {
  // Initialize session management
  useSessionManager()

  return <>{children}</>
}
