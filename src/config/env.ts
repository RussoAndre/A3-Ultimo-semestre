export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api',
  apiTimeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000', 10),
  environment: import.meta.env.VITE_ENV || 'development',
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
}
