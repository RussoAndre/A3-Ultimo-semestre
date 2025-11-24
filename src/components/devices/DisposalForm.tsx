import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDevices } from '../../hooks/useDevices'
import { useTranslation } from '../../hooks/useTranslation'
import { usePoints } from '../../contexts/PointsContext'
import { Device, DisposalMethod } from '../../types/device.types'
import Button from '../common/Button'
import Card from '../common/Card'

interface DisposalFormData {
  disposalMethod: DisposalMethod | ''
  disposedAt: string
}

interface DisposalFormProps {
  device: Device
  onCancel: () => void
}

export const DisposalForm = ({ device, onCancel }: DisposalFormProps) => {
  const { t } = useTranslation()
  const { recordDisposal } = useDevices()
  const { awardDeviceDisposalPoints } = usePoints()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DisposalFormData>({
    defaultValues: {
      disposalMethod: '',
      disposedAt: new Date().toISOString().split('T')[0],
    },
  })

  const handleFormSubmit = async (data: DisposalFormData) => {
    if (!data.disposalMethod) return

    setIsSubmitting(true)
    setError(null)

    try {
      await recordDisposal(device.id, {
        disposalMethod: data.disposalMethod,
        disposedAt: new Date(data.disposedAt),
      })
      
      // Award points based on disposal method
      const methodMap: Record<DisposalMethod, 'recycling' | 'donation' | 'proper'> = {
        [DisposalMethod.RECYCLING]: 'recycling',
        [DisposalMethod.DONATION]: 'donation',
        [DisposalMethod.PROPER_DISPOSAL]: 'proper',
      }
      await awardDeviceDisposalPoints(methodMap[data.disposalMethod])
      
      onCancel()
    } catch (err: any) {
      setError(err.message || 'Failed to record disposal')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getPointsForMethod = (method: DisposalMethod): number => {
    switch (method) {
      case DisposalMethod.RECYCLING:
        return 20
      case DisposalMethod.DONATION:
        return 15
      case DisposalMethod.PROPER_DISPOSAL:
        return 10
      default:
        return 0
    }
  }

  return (
    <Card>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {t('devices.disposal.title')}
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          {device.name} - {t(`devices.types.${device.type}`)}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* Disposal Method */}
        <div>
          <label htmlFor="disposalMethod" className="block text-sm font-medium text-gray-700 mb-1">
            {t('devices.disposal.method')}
          </label>
          <select
            id="disposalMethod"
            {...register('disposalMethod', {
              required: t('validation.required'),
            })}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.disposalMethod ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isSubmitting}
          >
            <option value="">{t('devices.disposal.method')}</option>
            <option value={DisposalMethod.RECYCLING}>
              {t('devices.disposal.recycling')} (+{getPointsForMethod(DisposalMethod.RECYCLING)}{' '}
              {t('rewards.points')})
            </option>
            <option value={DisposalMethod.DONATION}>
              {t('devices.disposal.donation')} (+{getPointsForMethod(DisposalMethod.DONATION)}{' '}
              {t('rewards.points')})
            </option>
            <option value={DisposalMethod.PROPER_DISPOSAL}>
              {t('devices.disposal.properDisposal')} (+
              {getPointsForMethod(DisposalMethod.PROPER_DISPOSAL)} {t('rewards.points')})
            </option>
          </select>
          {errors.disposalMethod && (
            <p className="mt-1 text-sm text-red-600">{errors.disposalMethod.message}</p>
          )}
        </div>

        {/* Disposal Date */}
        <div>
          <label htmlFor="disposedAt" className="block text-sm font-medium text-gray-700 mb-1">
            {t('devices.disposal.date')}
          </label>
          <input
            id="disposedAt"
            type="date"
            {...register('disposedAt', {
              required: t('validation.required'),
            })}
            max={new Date().toISOString().split('T')[0]}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.disposedAt ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isSubmitting}
          />
          {errors.disposedAt && (
            <p className="mt-1 text-sm text-red-600">{errors.disposedAt.message}</p>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-green-50 border border-green-200 rounded-md p-3">
          <p className="text-sm text-gray-700">
            ♻️ {t('rewards.actions.deviceDisposal')} - Earn points for responsible disposal!
          </p>
        </div>

        {/* Form Actions */}
        <div className="flex gap-3 pt-4">
          <Button type="submit" variant="primary" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? t('common.loading') : t('common.confirm')}
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
            {t('common.cancel')}
          </Button>
        </div>
      </form>
    </Card>
  )
}
