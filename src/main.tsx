import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import './index.css'
import './i18n/config'
import { ErrorBoundary, ToastProvider } from './components/common'
import { initializeAllSecurity } from './utils/securityInit'
import { registerServiceWorker } from './utils/serviceWorkerRegistration'

// Initialize security features with error handling
try {
  initializeAllSecurity()
} catch (error) {
  console.error('Security initialization error:', error)
}

// Register service worker for offline support
try {
  registerServiceWorker()
} catch (error) {
  console.error('Service worker registration error:', error)
}

// Create a client for React Query with optimized caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnMount: false,
      refetchOnReconnect: 'always',
    },
    mutations: {
      retry: 1,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <App />
        </ToastProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)
