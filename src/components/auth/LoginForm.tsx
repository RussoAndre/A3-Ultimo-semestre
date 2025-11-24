import { useForm } from 'react-hook-form'
import Button from '../common/Button'
import { useTranslation } from '../../hooks/useTranslation'

interface LoginFormData {
  email: string
  password: string
  rememberMe: boolean
}

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => Promise<void>
  isLoading?: boolean
  error?: string
}

export const LoginForm = ({ onSubmit, isLoading = false, error }: LoginFormProps) => {
  const { t } = useTranslation()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: {
      rememberMe: false,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          {t('auth.email')}
        </label>
        <input
          id="email"
          type="email"
          {...register('email', {
            required: t('auth.emailRequired'),
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: t('auth.emailInvalid'),
            },
          })}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
            errors.email ? 'border-error-500' : 'border-gray-300'
          }`}
          placeholder={t('auth.emailPlaceholder')}
          disabled={isLoading}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-error-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
          {t('auth.password')}
        </label>
        <input
          id="password"
          type="password"
          {...register('password', {
            required: t('auth.passwordRequired'),
            minLength: {
              value: 8,
              message: t('auth.passwordMinLength'),
            },
          })}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
            errors.password ? 'border-error-500' : 'border-gray-300'
          }`}
          placeholder={t('auth.passwordPlaceholder')}
          disabled={isLoading}
        />
        {errors.password && (
          <p className="mt-1 text-sm text-error-600">{errors.password.message}</p>
        )}
      </div>

      <div className="flex items-center">
        <input
          id="rememberMe"
          type="checkbox"
          {...register('rememberMe')}
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          disabled={isLoading}
        />
        <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
          {t('auth.rememberMe')}
        </label>
      </div>

      <Button
        type="submit"
        variant="primary"
        isLoading={isLoading}
        className="w-full"
      >
        {t('auth.login')}
      </Button>
    </form>
  )
}
