import { Device, DeviceStatus } from '../../types/device.types'
import { useTranslation } from '../../hooks/useTranslation'
import { formatEnergyConsumption } from '../../utils/energyCalculations'
import Button from '../common/Button'

interface DeviceCardProps {
  device: Device
  onEdit: (device: Device) => void
  onDelete: (device: Device) => void
  onDispose?: (device: Device) => void
}

export const DeviceCard = ({ device, onEdit, onDelete, onDispose }: DeviceCardProps) => {
  const { t } = useTranslation()

  const isDisposed = device.status === DeviceStatus.DISPOSED

  const getDeviceTypeIcon = () => {
    switch (device.type) {
      case 'computer':
        return '💻'
      case 'monitor':
        return '🖥️'
      case 'printer':
        return '🖨️'
      case 'appliance':
        return '🔌'
      case 'lighting':
        return '💡'
      default:
        return '📱'
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString()
  }

  return (
    <article
      className={`bg-white rounded-lg shadow-md p-4 sm:p-6 border ${
        isDisposed ? 'border-gray-300 opacity-75' : 'border-gray-200'
      }`}
      aria-label={`${device.name} - ${t(`devices.types.${device.type}`)}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <span className="text-2xl sm:text-3xl flex-shrink-0" aria-hidden="true">{getDeviceTypeIcon()}</span>
          <div className="min-w-0 flex-1">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{device.name}</h3>
            <p className="text-xs sm:text-sm text-gray-500">{t(`devices.types.${device.type}`)}</p>
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            isDisposed
              ? 'bg-gray-100 text-gray-700'
              : 'bg-green-100 text-green-700'
          }`}
          role="status"
          aria-label={`${t('devices.status')}: ${t(`devices.${device.status}`)}`}
        >
          {t(`devices.${device.status}`)}
        </span>
      </div>

      {/* Device Details */}
      <dl className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <dt className="text-gray-600">{t('devices.wattage')}:</dt>
          <dd className="font-medium text-gray-900">{device.wattage} W</dd>
        </div>
        <div className="flex justify-between text-sm">
          <dt className="text-gray-600">{t('devices.dailyUsage')}:</dt>
          <dd className="font-medium text-gray-900">{device.dailyUsageHours} h</dd>
        </div>
        <div className="flex justify-between text-sm">
          <dt className="text-gray-600">{t('devices.estimatedConsumption')}:</dt>
          <dd className="font-semibold text-green-600">
            {formatEnergyConsumption(device.estimatedDailyConsumption)}
          </dd>
        </div>
      </dl>

      {/* Disposal Info */}
      {isDisposed && device.disposedAt && (
        <div className="bg-gray-50 rounded-md p-3 mb-4">
          <p className="text-xs text-gray-600 mb-1">{t('devices.disposal.title')}</p>
          <div className="flex justify-between text-sm">
            <span className="text-gray-700">
              {device.disposalMethod && t(`devices.disposal.${device.disposalMethod}`)}
            </span>
            <span className="text-gray-600">{formatDate(device.disposedAt)}</span>
          </div>
        </div>
      )}

      {/* Registration Date */}
      <p className="text-xs text-gray-500 mb-4">
        {t('devices.registeredAt')}: {formatDate(device.registeredAt)}
      </p>

      {/* Actions */}
      {!isDisposed && (
        <div className="flex flex-col sm:flex-row gap-2" role="group" aria-label={t('devices.actions')}>
          <Button
            variant="secondary"
            onClick={() => onEdit(device)}
            className="flex-1 text-xs sm:text-sm min-h-[44px]"
            aria-label={`${t('common.edit')} ${device.name}`}
          >
            {t('common.edit')}
          </Button>
          {onDispose && (
            <Button
              variant="secondary"
              onClick={() => onDispose(device)}
              className="flex-1 text-xs sm:text-sm min-h-[44px]"
              aria-label={`${t('devices.disposal.title')} ${device.name}`}
            >
              {t('devices.disposal.title')}
            </Button>
          )}
          <Button
            variant="secondary"
            onClick={() => onDelete(device)}
            className="text-xs sm:text-sm text-red-600 hover:bg-red-50 min-h-[44px]"
            aria-label={`${t('common.delete')} ${device.name}`}
          >
            {t('common.delete')}
          </Button>
        </div>
      )}
    </article>
  )
}
