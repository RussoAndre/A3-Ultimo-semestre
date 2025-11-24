import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios'
import { getCSRFToken } from '../utils/security'
import { createApiMonitoringInterceptors } from '../utils/apiMonitoring'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

class ApiService {
  private api: AxiosInstance
  private refreshTokenPromise: Promise<string> | null = null
  private useHttpOnlyCookies: boolean = true // Use httpOnly cookies for enhanced security

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
      withCredentials: true, // Enable sending cookies with requests
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // API monitoring interceptors
    const monitoringInterceptors = createApiMonitoringInterceptors()
    
    // Request interceptor to add auth token and CSRF token
    this.api.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Add monitoring metadata
        config = monitoringInterceptors.request(config)
        
        // Add CSRF token for state-changing operations
        if (config.method && ['post', 'put', 'patch', 'delete'].includes(config.method.toLowerCase())) {
          if (config.headers) {
            config.headers['X-CSRF-Token'] = getCSRFToken()
          }
        }

        // Add Authorization header if not using httpOnly cookies
        if (!this.useHttpOnlyCookies) {
          const token = this.getAccessToken()
          if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`
          }
        }
        // When using httpOnly cookies, the token is automatically sent via cookies
        
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor to handle token refresh
    this.api.interceptors.response.use(
      (response) => {
        // Track successful API call
        monitoringInterceptors.response(response)
        return response
      },
      async (error: AxiosError) => {
        // Track failed API call
        monitoringInterceptors.error(error)
        
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

        // If error is 401 and we haven't retried yet, try to refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true

          try {
            const newAccessToken = await this.refreshAccessToken()
            
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
            }
            
            return this.api(originalRequest)
          } catch (refreshError) {
            // Refresh failed, clear tokens and redirect to login
            this.clearTokens()
            window.location.href = '/login'
            return Promise.reject(refreshError)
          }
        }

        return Promise.reject(error)
      }
    )
  }

  private async refreshAccessToken(): Promise<string> {
    // Prevent multiple simultaneous refresh requests
    if (this.refreshTokenPromise) {
      return this.refreshTokenPromise
    }

    this.refreshTokenPromise = (async () => {
      try {
        if (this.useHttpOnlyCookies) {
          // When using httpOnly cookies, refresh token is sent automatically
          const response = await axios.post(
            `${API_BASE_URL}/auth/refresh`,
            {},
            { withCredentials: true }
          )
          
          // Token is set in httpOnly cookie by server
          return response.data.accessToken || 'cookie-based'
        } else {
          // Fallback to localStorage-based tokens
          const refreshToken = this.getRefreshToken()
          if (!refreshToken) {
            throw new Error('No refresh token available')
          }

          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          })

          const { accessToken } = response.data
          this.setAccessToken(accessToken)
          
          return accessToken
        }
      } catch (error) {
        // Clear tokens on refresh failure
        this.clearTokens()
        throw error
      } finally {
        this.refreshTokenPromise = null
      }
    })()

    return this.refreshTokenPromise
  }

  private getAccessToken(): string | null {
    return localStorage.getItem('accessToken')
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken')
  }

  private setAccessToken(token: string): void {
    localStorage.setItem('accessToken', token)
  }

  private clearTokens(): void {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  }

  // Public API methods
  async get<T>(url: string, config?: any): Promise<T> {
    const response = await this.api.get<T>(url, config)
    return response.data
  }

  async post<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.api.post<T>(url, data, config)
    return response.data
  }

  async put<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.api.put<T>(url, data, config)
    return response.data
  }

  async delete<T>(url: string, config?: any): Promise<T> {
    const response = await this.api.delete<T>(url, config)
    return response.data
  }

  async patch<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.api.patch<T>(url, data, config)
    return response.data
  }
}

export const apiService = new ApiService()
