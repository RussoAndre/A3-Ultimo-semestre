import { useState, useEffect } from 'react'
import { useDevices } from '../../hooks/useDevices'
import { useTranslation } from '../../hooks/useTranslation'
import { usePoints } from '../../contexts/PointsContext'
import { Device, DeviceFormData, CreateDeviceDto, UpdateDeviceDto } from '../../types/device.types'
import { DeviceCard } from './DeviceCard'
import { DeviceForm } from './DeviceForm'
import { DisposalForm } from './DisposalForm'
import Button from '../common/Button'
import LoadingSpinner from '../common/LoadingSpinner'
import Card from '../common/Card'

export const DeviceList = () => {
  const { t } = useTranslation()
  const {
    devices,
    loading,
    error,
    loadDevices,
    addDevice,
    editDevice,
    removeDevice,
    clearDeviceError,
  } = useDevices()
  const { awardDeviceRegistrationPoints } = usePoints()

  const [showForm, setShowForm] = useState(false)
  const [editingDevice, setEditingDevice] = useState<Device | null>(null)
  const [disposingDevice, setDisposingDevice] = useState<Device | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadDevices()
  }, [loadDevices])

  useEffect(() => {
    if (error) {
      // Show error toast (would integrate with toast system)
      console.error('Device error:', error)
      setTimeout(() => clearDeviceError(), 3000)
    }
  }, [error, clearDeviceError])

  const handleAddDevice = () => {
    setEditingDevice(null)
    setShowForm(true)
  }

  const handleEditDevice = (device: Device) => {
    setEditingDevice(device)
    setShowForm(true)
  }

  const handleDeleteDevice = async (device: Device) => {
    if (window.confirm(t('devices.deleteDevice') + '?')) {
      try {
        await removeDevice(device.id)
      } catch (err) {
        console.error('Failed to delete device:', err)
      }
    }
  }

  const handleDisposeDevice = (device: Device) => {
    setDisposingDevice(device)
  }

  const handleFormSubmit = async (data: DeviceFormData) => {
    setIsSubmitting(true)
    try {
      if (editingDevice) {
        // Update existing device
        const updateData: UpdateDeviceDto = {
          name: data.name,
          type: data.type as any,
          wattage: Number(data.wattage),
          dailyUsageHours: Number(data.dailyUsageHours),
        }
        await editDevice(editingDevice.id, updateData)
      } else {
        // Create new device
        const createData: CreateDeviceDto = {
          name: data.name,
          type: data.type as any,
          wattage: Number(data.wattage),
          dailyUsageHours: Number(data.dailyUsageHours),
        }
        await addDevice(createData)
        // Award points for device registration
        await awardDeviceRegistrationPoints()
      }
      setShowForm(false)
      setEditingDevice(null)
    } catch (err) {
      console.error('Failed to save device:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingDevice(null)
  }

  const handleDisposalCancel = () => {
    setDisposingDevice(null)
  }

  if (loading && devices.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t('devices.title')}</h2>
          <p className="text-gray-600 mt-1">
            {devices.length} {devices.length === 1 ? 'device' : 'devices'}
          </p>
        </div>
        {!showForm && (
          <Button variant="primary" onClick={handleAddDevice}>
            {t('devices.addDevice')}
          </Button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Device Form */}
      {showForm && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingDevice ? t('devices.editDevice') : t('devices.addDevice')}
          </h3>
          <DeviceForm
            device={editingDevice || undefined}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            isLoading={isSubmitting}
          />
        </Card>
      )}

      {/* Disposal Form */}
      {disposingDevice && (
        <DisposalForm device={disposingDevice} onCancel={handleDisposalCancel} />
      )}

      {/* Device List */}
      {devices.length === 0 && !showForm ? (
        <Card>
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">📱</span>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('devices.noDevices')}
            </h3>
            <p className="text-gray-600 mb-6">{t('devices.addFirstDevice')}</p>
            <Button variant="primary" onClick={handleAddDevice}>
              {t('devices.addDevice')}
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {devices.map((device) => (
            <DeviceCard
              key={device.id}
              device={device}
              onEdit={handleEditDevice}
              onDelete={handleDeleteDevice}
              onDispose={handleDisposeDevice}
            />
          ))}
        </div>
      )}
    </div>
  )
}
