import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { RegisterForm } from '../components/auth'
import { useAuth } from '../hooks/useAuth'
import { useTranslation } from '../hooks/useTranslation'
import { useToast } from '../components/common'

const RegisterPage = () => {
  const { t, i18n } = useTranslation()
  const { register, isLoading, error, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleRegister = async (data: {
    email: string
    password: string
    confirmPassword: string
    language: 'en' | 'pt'
  }) => {
    try {
      await register({
        email: data.email,
        password: data.password,
        language: data.language,
      })
      
      // Update i18n language to match user preference
      i18n.changeLanguage(data.language)
      
      toast.success(t('auth.registerSuccess'))
      navigate('/dashboard', { replace: true })
    } catch (err: any) {
      toast.error(err.message || t('auth.registerError'))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="text-4xl font-bold text-primary-600">EcoTech</div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          {t('auth.register')}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {t('auth.alreadyHaveAccount')}{' '}
          <Link
            to="/login"
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            {t('auth.login')}
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
          <RegisterForm onSubmit={handleRegister} isLoading={isLoading} error={error || undefined} />
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
