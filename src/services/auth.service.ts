import { apiService } from './api'
import { 
  rateLimiter, 
  RATE_LIMITS, 
  sanitizeInput, 
  isValidEmail,
  validatePasswordStrength,
  clearCSRFToken
} from '../utils/security'
import { initializeMockDataForUser } from '../utils/mockData'
import type { 
  LoginCredentials, 
  RegisterCredentials, 
  AuthResponse, 
  User 
} from '../types/auth.types'

class AuthService {
  private readonly TOKEN_KEY = 'accessToken'
  private readonly REFRESH_TOKEN_KEY = 'refreshToken'
  private readonly USER_KEY = 'user'
  private readonly useHttpOnlyCookies: boolean = false // Disabled for mock mode
  private readonly MOCK_MODE = true // Enable mock mode for demo

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // MOCK MODE: Simulate login without backend
    if (this.MOCK_MODE) {
      return this.mockLogin(credentials)
    }
    

    // Rate limiting check
    const rateLimitKey = `login:${credentials.email}`
    if (rateLimiter.isRateLimited(rateLimitKey, RATE_LIMITS.LOGIN)) {
      const remaining = rateLimiter.getRemainingAttempts(rateLimitKey, RATE_LIMITS.LOGIN)
      throw new Error(
        `Too many login attempts. Please try again later. (${remaining} attempts remaining)`
      )
    }

    // Input validation
    if (!isValidEmail(credentials.email)) {
      throw new Error('Invalid email format')
    }

    // Sanitize inputs
    const sanitizedCredentials = {
      email: sanitizeInput(credentials.email.toLowerCase().trim()),
      password: credentials.password, // Don't sanitize password
      rememberMe: credentials.rememberMe,
    }

    try {
      const response = await apiService.post<AuthResponse>('/auth/login', sanitizedCredentials)
      
      // Store tokens (only if not using httpOnly cookies)
      if (!this.useHttpOnlyCookies) {
        this.setTokens(response.tokens.accessToken, response.tokens.refreshToken, credentials.rememberMe)
      }
      this.setUser(response.user)
      
      // Reset rate limiter on successful login
      rateLimiter.reset(rateLimitKey)
      
      return response
    } catch (error: any) {
      // Record failed attempt
      rateLimiter.recordAttempt(rateLimitKey)
      throw new Error(error.response?.data?.message || 'Login failed')
    }
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    // MOCK MODE: Simulate registration without backend
    if (this.MOCK_MODE) {
      return this.mockRegister(credentials)
    }
    
    // Rate limiting check
    const rateLimitKey = `register:${credentials.email}`
    if (rateLimiter.isRateLimited(rateLimitKey, RATE_LIMITS.REGISTER)) {
      throw new Error('Too many registration attempts. Please try again later.')
    }

    // Input validation
    if (!isValidEmail(credentials.email)) {
      throw new Error('Invalid email format')
    }

    // Password strength validation
    const passwordValidation = validatePasswordStrength(credentials.password)
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.errors.join('. '))
    }

    // Sanitize inputs
    const sanitizedCredentials = {
      email: sanitizeInput(credentials.email.toLowerCase().trim()),
      password: credentials.password, // Don't sanitize password
      preferredLanguage: credentials.preferredLanguage,
    }

    try {
      rateLimiter.recordAttempt(rateLimitKey)
      
      const response = await apiService.post<AuthResponse>('/auth/register', sanitizedCredentials)
      
      // Store tokens (only if not using httpOnly cookies)
      if (!this.useHttpOnlyCookies) {
        this.setTokens(response.tokens.accessToken, response.tokens.refreshToken)
      }
      this.setUser(response.user)
      
      return response
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed')
    }
  }

  async logout(): Promise<void> {
    try {
      await apiService.post('/auth/logout')
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API call failed:', error)
    } finally {
      this.clearAuth()
      clearCSRFToken()
    }
  }

  async refreshToken(): Promise<string> {
    try {
      const refreshToken = this.getRefreshToken()
      if (!refreshToken) {
        throw new Error('No refresh token available')
      }

      const response = await apiService.post<{ accessToken: string }>('/auth/refresh', {
        refreshToken,
      })

      this.setAccessToken(response.accessToken)
      return response.accessToken
    } catch (error: any) {
      this.clearAuth()
      throw new Error(error.response?.data?.message || 'Token refresh failed')
    }
  }

  async getCurrentUser(): Promise<User> {
    try {
      const user = await apiService.get<User>('/auth/me')
      this.setUser(user)
      return user
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get current user')
    }
  }

  // Token management
  private setTokens(accessToken: string, refreshToken: string, remember: boolean = false): void {
    const storage = remember ? localStorage : sessionStorage
    storage.setItem(this.TOKEN_KEY, accessToken)
    storage.setItem(this.REFRESH_TOKEN_KEY, refreshToken)
  }

  private setAccessToken(accessToken: string): void {
    const storage = this.getStorage()
    storage.setItem(this.TOKEN_KEY, accessToken)
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY) || sessionStorage.getItem(this.TOKEN_KEY)
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY) || sessionStorage.getItem(this.REFRESH_TOKEN_KEY)
  }

  private setUser(user: User): void {
    const storage = this.getStorage()
    storage.setItem(this.USER_KEY, JSON.stringify(user))
  }

  getUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY) || sessionStorage.getItem(this.USER_KEY)
    if (!userStr) return null
    
    try {
      return JSON.parse(userStr)
    } catch {
      return null
    }
  }

  private getStorage(): Storage {
    // Check which storage has the token
    if (localStorage.getItem(this.TOKEN_KEY)) {
      return localStorage
    }
    return sessionStorage
  }

  clearAuth(): void {
    // Clear tokens from storage (only relevant if not using httpOnly cookies)
    localStorage.removeItem(this.TOKEN_KEY)
    localStorage.removeItem(this.REFRESH_TOKEN_KEY)
    localStorage.removeItem(this.USER_KEY)
    sessionStorage.removeItem(this.TOKEN_KEY)
    sessionStorage.removeItem(this.REFRESH_TOKEN_KEY)
    sessionStorage.removeItem(this.USER_KEY)
    
    // Clear CSRF token
    clearCSRFToken()
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken()
  }

  // Mock methods for demo without backend
  private async mockLogin(credentials: LoginCredentials): Promise<AuthResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))

    // Input validation
    if (!isValidEmail(credentials.email)) {
      throw new Error('Invalid email format')
    }

    // Check if user exists in localStorage
    const users = JSON.parse(localStorage.getItem('mock_users') || '{}')
    const user = users[credentials.email.toLowerCase()]

    if (!user) {
      throw new Error('Invalid email or password')
    }

    // In mock mode, we don't actually verify password for simplicity
    // In production, this would check hashed passwords

    const mockToken = `mock_token_${Date.now()}`
    const mockRefreshToken = `mock_refresh_${Date.now()}`

    const response: AuthResponse = {
      user: user,
      tokens: {
        accessToken: mockToken,
        refreshToken: mockRefreshToken,
      },
    }

    this.setTokens(mockToken, mockRefreshToken, credentials.rememberMe || false)
    this.setUser(user)

    // Initialize mock data for demo
    initializeMockDataForUser(user.id)

    return response
  }

  private async mockRegister(credentials: RegisterCredentials): Promise<AuthResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))

    // Input validation
    if (!isValidEmail(credentials.email)) {
      throw new Error('Invalid email format')
    }

    // Password strength validation
    const passwordValidation = validatePasswordStrength(credentials.password)
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.errors.join('. '))
    }

    // Check if user already exists
    const users = JSON.parse(localStorage.getItem('mock_users') || '{}')
    const emailLower = credentials.email.toLowerCase()

    if (users[emailLower]) {
      throw new Error('Email already registered')
    }

    // Create new user
    const newUser: User = {
      id: `user_${Date.now()}`,
      email: emailLower,
      preferredLanguage: credentials.preferredLanguage,
      createdAt: new Date().toISOString(),
    }

    // Store user
    users[emailLower] = newUser
    localStorage.setItem('mock_users', JSON.stringify(users))

    const mockToken = `mock_token_${Date.now()}`
    const mockRefreshToken = `mock_refresh_${Date.now()}`

    const response: AuthResponse = {
      user: newUser,
      tokens: {
        accessToken: mockToken,
        refreshToken: mockRefreshToken,
      },
    }

    this.setTokens(mockToken, mockRefreshToken)
    this.setUser(newUser)

    // Initialize mock data for new user
    initializeMockDataForUser(newUser.id)

    return response
  }
}

export const authService = new AuthService()
