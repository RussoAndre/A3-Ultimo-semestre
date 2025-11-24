import { useEffect } from 'react'
import { useDevices } from '../../hooks/useDevices'
import { useTranslation } from '../../hooks/useTranslation'
import LoadingSpinner from '../common/LoadingSpinner'
import Card from '../common/Card'

export const DisposalHistory = () => {
  const { t } = useTranslation()
  const { disposedDevices, loading, loadDisposalHistory } = useDevices()

  useEffect(() => {
    loadDisposalHistory()
  }, [loadDisposalHistory])

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
      </div>
    )
  }

  if (disposedDevices.length === 0) {
    return (
      <Card>
        <div className="text-center py-8">
          <span className="text-4xl mb-3 block">♻️</span>
          <p className="text-gray-600">{t('devices.noDevices')}</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">{t('devices.disposal.title')}</h3>
      
      <div className="space-y-3">
        {disposedDevices.map((device) => (
          <Card key={device.id}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{device.name}</h4>
                <p className="text-sm text-gray-600">{t(`devices.types.${device.type}`)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {device.disposalMethod && t(`devices.disposal.${device.disposalMethod}`)}
                </p>
                <p className="text-xs text-gray-500">
                  {device.disposedAt && formatDate(device.disposedAt)}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
