import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Provider } from 'react-redux'
import { lazy, Suspense, useEffect } from 'react'
import { store } from './store'
import { PointsProvider } from './contexts/PointsContext'
import { ProtectedRoute } from './components/auth'
import { SessionManagerWrapper } from './components/auth/SessionManagerWrapper'
import { LoadingSpinner } from './components/common'
import { PerformanceDashboard } from './components/common/PerformanceDashboard'
import { performanceMonitor } from './utils/performanceMonitoring'
import { initializeSmoothScroll, observeElementsForAnimation } from './utils/appPolish'

// Lazy load page components for code splitting
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const ImpactPage = lazy(() => import('./pages/ImpactPage'))
const EducationPage = lazy(() => import('./pages/EducationPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))

function App() {
  useEffect(() => {
    // Initialize performance monitoring
    // The performanceMonitor is already initialized as a singleton
    
    // Initialize smooth scroll and animations
    initializeSmoothScroll();
    const cleanupAnimations = observeElementsForAnimation();
    
    // Log initial page load
    if (import.meta.env.DEV) {
      console.log('🚀 EcoTech Application Initialized');
      console.log('✨ Performance Monitoring Active');
      console.log('🎨 Smooth Animations Enabled');
    }

    // Cleanup on unmount
    return () => {
      performanceMonitor.disconnect();
      if (cleanupAnimations) cleanupAnimations();
    };
  }, []);

  return (
    <Provider store={store}>
      <PointsProvider>
        <BrowserRouter>
          <SessionManagerWrapper>
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/impact"
                  element={
                    <ProtectedRoute>
                      <ImpactPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/education"
                  element={
                    <ProtectedRoute>
                      <EducationPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Suspense>
          </SessionManagerWrapper>
          <PerformanceDashboard />
        </BrowserRouter>
      </PointsProvider>
    </Provider>
  )
}

export default App
