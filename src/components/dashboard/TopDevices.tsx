import { useMemo } from 'react'
import { useTopConsumingDevices } from '../../hooks/useEnergyData'
import { useTranslation } from '../../hooks/useTranslation'
import LoadingSpinner from '../common/LoadingSpinner'
import { getDateRange, formatDateToISO } from '../../utils/energyCalculations'

interface TopDevicesProps {
  limit?: number
}

export function TopDevices({ limit = 5 }: TopDevicesProps) {
  const { t } = useTranslation()
  
  // Get last 30 days data
  const dateRange = useMemo(() => {
    const { startDate, endDate } = getDateRange(30)
    return {
      startDate: formatDateToISO(startDate),
      endDate: formatDateToISO(endDate),
    }
  }, [])

  const { data: topDevices, isLoading, error } = useTopConsumingDevices(limit, dateRange)

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">
            {t('dashboard.topDevices.error', 'Error loading top devices')}
          </p>
        </div>
      </div>
    )
  }

  if (!topDevices || topDevices.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          {t('dashboard.topDevices', 'Top Consuming Devices')}
        </h2>
        <div className="text-center py-12">
          <p className="text-gray-500">
            {t('dashboard.topDevices.noData', 'No device data available')}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        {t('dashboard.topDevices', 'Top Consuming Devices')}
      </h2>

      <div className="space-y-4">
        {topDevices.map((device, index) => (
          <div
            key={device.deviceId}
            className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {/* Rank badge */}
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                index === 0
                  ? 'bg-yellow-100 text-yellow-700'
                  : index === 1
                  ? 'bg-gray-200 text-gray-700'
                  : index === 2
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-blue-100 text-blue-700'
              }`}
            >
              {index + 1}
            </div>

            {/* Device info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 truncate">
                {device.deviceName}
              </h3>
              <p className="text-xs text-gray-500">
                {t(`devices.types.${device.deviceType}`, device.deviceType)}
              </p>
            </div>

            {/* Consumption info */}
            <div className="text-right">
              <p className="text-sm font-bold text-gray-900">
                {device.totalKwh.toFixed(2)} kWh
              </p>
              <p className="text-xs text-gray-500">{device.percentage.toFixed(1)}%</p>
            </div>

            {/* Progress bar */}
            <div className="w-24 hidden sm:block">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-600 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(device.percentage, 100)}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            {t('dashboard.topDevices.totalShown', 'Total from top {{count}} devices', {
              count: topDevices.length,
            })}
          </span>
          <span className="font-semibold text-gray-900">
            {topDevices.reduce((sum, device) => sum + device.totalKwh, 0).toFixed(2)} kWh
          </span>
        </div>
      </div>
    </div>
  )
}
