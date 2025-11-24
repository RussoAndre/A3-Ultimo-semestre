import { useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { LoginForm } from '../components/auth'
import { useAuth } from '../hooks/useAuth'
import { useTranslation } from '../hooks/useTranslation'
import { useToast } from '../components/common'

const LoginPage = () => {
  const { t } = useTranslation()
  const { login, isLoading, error, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()

  const from = (location.state as any)?.from?.pathname || '/dashboard'

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, from])

  const handleLogin = async (data: { email: string; password: string; rememberMe: boolean }) => {
    try {
      await login(data)
      toast.success(t('auth.loginSuccess'))
      navigate(from, { replace: true })
    } catch (err: any) {
      toast.error(err.message || t('auth.loginError'))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="text-4xl font-bold text-primary-600">EcoTech</div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          {t('auth.login')}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {t('auth.dontHaveAccount')}{' '}
          <Link
            to="/register"
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            {t('auth.register')}
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
          <LoginForm onSubmit={handleLogin} isLoading={isLoading} error={error || undefined} />
        </div>
      </div>
    </div>
  )
}

export default LoginPage
