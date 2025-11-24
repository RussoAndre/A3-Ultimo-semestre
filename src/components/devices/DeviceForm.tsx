import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from '../../hooks/useTranslation'
import { DeviceType, DeviceFormData, Device } from '../../types/device.types'
import { calculateDailyConsumption, formatEnergyConsumption } from '../../utils/energyCalculations'
import Button from '../common/Button'

interface DeviceFormProps {
  device?: Device
  onSubmit: (data: DeviceFormData) => void
  onCancel: () => void
  isLoading?: boolean
}

export const DeviceForm = ({ device, onSubmit, onCancel, isLoading }: DeviceFormProps) => {
  const { t } = useTranslation()
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm<DeviceFormData>({
    defaultValues: device
      ? {
          name: device.name,
          type: device.type,
          wattage: device.wattage.toString(),
          dailyUsageHours: device.dailyUsageHours.toString(),
        }
      : {
          name: '',
          type: '',
          wattage: '',
          dailyUsageHours: '',
        },
  })

  const wattage = watch('wattage')
  const dailyUsageHours = watch('dailyUsageHours')

  // Calculate real-time consumption estimate
  const estimatedConsumption =
    wattage && dailyUsageHours && Number(wattage) > 0 && Number(dailyUsageHours) > 0
      ? calculateDailyConsumption(Number(wattage), Number(dailyUsageHours))
      : 0

  const handleFormSubmit = (data: DeviceFormData) => {
    onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Device Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          {t('devices.deviceName')}
        </label>
        <input
          id="name"
          type="text"
          {...register('name', {
            required: t('validation.required'),
          })}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder={t('devices.deviceName')}
          disabled={isLoading}
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
      </div>

      {/* Device Type */}
      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
          {t('devices.deviceType')}
        </label>
        <select
          id="type"
          {...register('type', {
            required: t('validation.required'),
          })}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
            errors.type ? 'border-red-500' : 'border-gray-300'
          }`}
          disabled={isLoading}
        >
          <option value="">{t('devices.deviceType')}</option>
          <option value={DeviceType.COMPUTER}>{t('devices.types.computer')}</option>
          <option value={DeviceType.MONITOR}>{t('devices.types.monitor')}</option>
          <option value={DeviceType.PRINTER}>{t('devices.types.printer')}</option>
          <option value={DeviceType.APPLIANCE}>{t('devices.types.appliance')}</option>
          <option value={DeviceType.LIGHTING}>{t('devices.types.lighting')}</option>
          <option value={DeviceType.OTHER}>{t('devices.types.other')}</option>
        </select>
        {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>}
      </div>

      {/* Wattage */}
      <div>
        <label htmlFor="wattage" className="block text-sm font-medium text-gray-700 mb-1">
          {t('devices.wattage')}
        </label>
        <input
          id="wattage"
          type="number"
          step="0.01"
          {...register('wattage', {
            required: t('validation.required'),
            validate: (value) => {
              const num = Number(value)
              if (num <= 0) return t('validation.positiveNumber')
              return true
            },
          })}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
            errors.wattage ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="100"
          disabled={isLoading}
        />
        {errors.wattage && <p className="mt-1 text-sm text-red-600">{errors.wattage.message}</p>}
      </div>

      {/* Daily Usage Hours */}
      <div>
        <label htmlFor="dailyUsageHours" className="block text-sm font-medium text-gray-700 mb-1">
          {t('devices.dailyUsage')}
        </label>
        <input
          id="dailyUsageHours"
          type="number"
          step="0.1"
          {...register('dailyUsageHours', {
            required: t('validation.required'),
            validate: (value) => {
              const num = Number(value)
              if (num <= 0) return t('validation.positiveNumber')
              if (num > 24) return t('validation.maxValue', { max: 24 })
              return true
            },
          })}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
            errors.dailyUsageHours ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="8"
          disabled={isLoading}
        />
        {errors.dailyUsageHours && (
          <p className="mt-1 text-sm text-red-600">{errors.dailyUsageHours.message}</p>
        )}
      </div>

      {/* Real-time Consumption Estimate */}
      {estimatedConsumption > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-md p-3">
          <p className="text-sm text-gray-700">
            {t('devices.estimatedConsumption')}:{' '}
            <span className="font-semibold text-green-700">
              {formatEnergyConsumption(estimatedConsumption)}
            </span>
          </p>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex gap-3 pt-4">
        <Button type="submit" variant="primary" disabled={isLoading} className="flex-1">
          {isLoading ? t('common.loading') : t('common.save')}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
          {t('common.cancel')}
        </Button>
      </div>
    </form>
  )
}
