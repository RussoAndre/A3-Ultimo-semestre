import { useForm } from 'react-hook-form'
import Button from '../common/Button'
import { useTranslation } from '../../hooks/useTranslation'

interface RegisterFormData {
  email: string
  password: string
  confirmPassword: string
  language: 'en' | 'pt'
}

interface RegisterFormProps {
  onSubmit: (data: RegisterFormData) => Promise<void>
  isLoading?: boolean
  error?: string
}

export const RegisterForm = ({ onSubmit, isLoading = false, error }: RegisterFormProps) => {
  const { t, i18n } = useTranslation()
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    defaultValues: {
      language: i18n.language as 'en' | 'pt',
    },
  })

  const password = watch('password')

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
            pattern: {
              value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
              message: t('auth.passwordPattern'),
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

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
          {t('auth.confirmPassword')}
        </label>
        <input
          id="confirmPassword"
          type="password"
          {...register('confirmPassword', {
            required: t('auth.confirmPasswordRequired'),
            validate: (value) => value === password || t('auth.passwordMismatch'),
          })}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
            errors.confirmPassword ? 'border-error-500' : 'border-gray-300'
          }`}
          placeholder={t('auth.confirmPasswordPlaceholder')}
          disabled={isLoading}
        />
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-error-600">{errors.confirmPassword.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
          {t('auth.preferredLanguage')}
        </label>
        <select
          id="language"
          {...register('language', {
            required: t('auth.languageRequired'),
          })}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
            errors.language ? 'border-error-500' : 'border-gray-300'
          }`}
          disabled={isLoading}
        >
          <option value="en">{t('languages.english')}</option>
          <option value="pt">{t('languages.portuguese')}</option>
        </select>
        {errors.language && (
          <p className="mt-1 text-sm text-error-600">{errors.language.message}</p>
        )}
      </div>

      <Button
        type="submit"
        variant="primary"
        isLoading={isLoading}
        className="w-full"
      >
        {t('auth.register')}
      </Button>
    </form>
  )
}
