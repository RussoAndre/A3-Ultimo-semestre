import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from './useAppDispatch'
import {
  fetchDevices,
  fetchDeviceById,
  createDevice,
  updateDevice,
  deleteDevice,
  disposeDevice,
  fetchDisposalHistory,
  clearError,
  setSelectedDevice,
  clearSelectedDevice,
} from '../store/deviceSlice'
import {
  CreateDeviceDto,
  UpdateDeviceDto,
  DisposeDeviceDto,
  Device,
} from '../types/device.types'

export const useDevices = () => {
  const dispatch = useAppDispatch()
  const { devices, disposedDevices, selectedDevice, loading, error } = useAppSelector(
    (state) => state.devices
  )

  const loadDevices = useCallback(() => {
    return dispatch(fetchDevices())
  }, [dispatch])

  const loadDeviceById = useCallback(
    (id: string) => {
      return dispatch(fetchDeviceById(id))
    },
    [dispatch]
  )

  const addDevice = useCallback(
    (data: CreateDeviceDto) => {
      return dispatch(createDevice(data))
    },
    [dispatch]
  )

  const editDevice = useCallback(
    (id: string, data: UpdateDeviceDto) => {
      return dispatch(updateDevice({ id, data }))
    },
    [dispatch]
  )

  const removeDevice = useCallback(
    (id: string) => {
      return dispatch(deleteDevice(id))
    },
    [dispatch]
  )

  const recordDisposal = useCallback(
    (id: string, data: DisposeDeviceDto) => {
      return dispatch(disposeDevice({ id, data }))
    },
    [dispatch]
  )

  const loadDisposalHistory = useCallback(() => {
    return dispatch(fetchDisposalHistory())
  }, [dispatch])

  const selectDevice = useCallback(
    (device: Device | null) => {
      dispatch(setSelectedDevice(device))
    },
    [dispatch]
  )

  const deselectDevice = useCallback(() => {
    dispatch(clearSelectedDevice())
  }, [dispatch])

  const clearDeviceError = useCallback(() => {
    dispatch(clearError())
  }, [dispatch])

  return {
    devices,
    disposedDevices,
    selectedDevice,
    loading,
    error,
    loadDevices,
    loadDeviceById,
    addDevice,
    editDevice,
    removeDevice,
    recordDisposal,
    loadDisposalHistory,
    selectDevice,
    deselectDevice,
    clearDeviceError,
  }
}
