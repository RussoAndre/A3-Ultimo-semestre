import { useCallback } from 'react'
import { useAppDispatch } from './useAppDispatch'
import { useAppSelector } from './useAppSelector'
import { login as loginAction, register as registerAction, logout as logoutAction, getCurrentUser } from '../store/authSlice'
import type { LoginCredentials, RegisterCredentials } from '../types/auth.types'

export const useAuth = () => {
  const dispatch = useAppDispatch()
  const { user, isAuthenticated, isLoading, error } = useAppSelector((state) => state.auth)

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      const result = await dispatch(loginAction(credentials))
      if (loginAction.fulfilled.match(result)) {
        return result.payload
      }
      throw new Error(result.payload as string)
    },
    [dispatch]
  )

  const register = useCallback(
    async (credentials: RegisterCredentials) => {
      const result = await dispatch(registerAction(credentials))
      if (registerAction.fulfilled.match(result)) {
        return result.payload
      }
      throw new Error(result.payload as string)
    },
    [dispatch]
  )

  const logout = useCallback(async () => {
    await dispatch(logoutAction())
  }, [dispatch])

  const refreshUser = useCallback(async () => {
    const result = await dispatch(getCurrentUser())
    if (getCurrentUser.fulfilled.match(result)) {
      return result.payload
    }
    throw new Error(result.payload as string)
  }, [dispatch])

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    refreshUser,
  }
}
