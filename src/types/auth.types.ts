export interface User {
  id: string
  email: string
  preferredLanguage: 'en' | 'pt'
  createdAt: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterCredentials {
  email: string
  password: string
  language: 'en' | 'pt'
}

export interface AuthResponse {
  user: User
  tokens: AuthTokens
}

export interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}
