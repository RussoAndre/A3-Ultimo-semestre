import { apiService } from './api'
import {
  Device,
  CreateDeviceDto,
  UpdateDeviceDto,
  DisposeDeviceDto,
} from '../types/device.types'
import { calculateDailyConsumption } from '../utils/energyCalculations'

class DeviceService {
  private readonly BASE_URL = '/devices'

  /**
   * Get all devices for the current user
   */
  async getDevices(): Promise<Device[]> {
    return apiService.get<Device[]>(this.BASE_URL)
  }

  /**
   * Get a specific device by ID
   */
  async getDeviceById(id: string): Promise<Device> {
    return apiService.get<Device>(`${this.BASE_URL}/${id}`)
  }

  /**
   * Create a new device
   */
  async createDevice(data: CreateDeviceDto): Promise<Device> {
    // Calculate estimated daily consumption before sending to API
    const estimatedDailyConsumption = calculateDailyConsumption(
      data.wattage,
      data.dailyUsageHours
    )

    const deviceData = {
      ...data,
      estimatedDailyConsumption,
    }

    return apiService.post<Device>(this.BASE_URL, deviceData)
  }

  /**
   * Update an existing device
   */
  async updateDevice(id: string, data: UpdateDeviceDto): Promise<Device> {
    // Recalculate consumption if wattage or usage hours changed
    let updateData = { ...data }
    
    if (data.wattage !== undefined || data.dailyUsageHours !== undefined) {
      // Need to fetch current device to get missing values
      const currentDevice = await this.getDeviceById(id)
      const wattage = data.wattage ?? currentDevice.wattage
      const dailyUsageHours = data.dailyUsageHours ?? currentDevice.dailyUsageHours
      
      const estimatedDailyConsumption = calculateDailyConsumption(wattage, dailyUsageHours)
      updateData = {
        ...updateData,
        estimatedDailyConsumption,
      } as any
    }

    return apiService.put<Device>(`${this.BASE_URL}/${id}`, updateData)
  }

  /**
   * Delete a device
   */
  async deleteDevice(id: string): Promise<void> {
    return apiService.delete<void>(`${this.BASE_URL}/${id}`)
  }

  /**
   * Record device disposal
   */
  async disposeDevice(id: string, data: DisposeDeviceDto): Promise<Device> {
    const disposalData = {
      disposalMethod: data.disposalMethod,
      disposedAt: data.disposedAt || new Date().toISOString(),
    }

    return apiService.post<Device>(`${this.BASE_URL}/${id}/dispose`, disposalData)
  }

  /**
   * Get disposal history for the current user
   */
  async getDisposalHistory(): Promise<Device[]> {
    return apiService.get<Device[]>(`${this.BASE_URL}/disposed`)
  }
}

export const deviceService = new DeviceService()
