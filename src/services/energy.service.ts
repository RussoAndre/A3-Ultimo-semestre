import { apiService } from './api'
import {
  EnergyConsumption,
  ConsumptionSummary,
  ConsumptionQueryParams,
  ConsumptionTrend,
  DailyConsumption,
  TopConsumingDevice,
  ConsumptionByDevice,
  ConsumptionByType,
} from '../types/energy.types'
import {
  aggregateByDay,
  calculateAverageDailyConsumption,
  calculatePercentageChange,
  aggregateByDevice,
  aggregateByDeviceType,
  getDateRange,
  formatDateToISO,
} from '../utils/energyCalculations'
import { Device, DeviceType } from '../types/device.types'

class EnergyService {
  private readonly BASE_URL = '/energy'

  /**
   * Get energy consumption data with optional filters
   */
  async getConsumption(params?: ConsumptionQueryParams): Promise<EnergyConsumption[]> {
    const queryParams = new URLSearchParams()
    
    if (params?.startDate) queryParams.append('startDate', params.startDate)
    if (params?.endDate) queryParams.append('endDate', params.endDate)
    if (params?.deviceId) queryParams.append('deviceId', params.deviceId)
    if (params?.deviceType) queryParams.append('deviceType', params.deviceType)
    
    const url = `${this.BASE_URL}/consumption${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return apiService.get<EnergyConsumption[]>(url)
  }

  /**
   * Get consumption summary for a period
   */
  async getConsumptionSummary(params?: ConsumptionQueryParams): Promise<ConsumptionSummary> {
    const queryParams = new URLSearchParams()
    
    if (params?.startDate) queryParams.append('startDate', params.startDate)
    if (params?.endDate) queryParams.append('endDate', params.endDate)
    
    const url = `${this.BASE_URL}/summary${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return apiService.get<ConsumptionSummary>(url)
  }

  /**
   * Get consumption trends (daily, weekly, monthly)
   */
  async getConsumptionTrends(params?: ConsumptionQueryParams): Promise<ConsumptionTrend> {
    const queryParams = new URLSearchParams()
    
    if (params?.startDate) queryParams.append('startDate', params.startDate)
    if (params?.endDate) queryParams.append('endDate', params.endDate)
    if (params?.period) queryParams.append('period', params.period)
    
    const url = `${this.BASE_URL}/trends${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return apiService.get<ConsumptionTrend>(url)
  }

  /**
   * Calculate consumption summary from raw data (client-side aggregation)
   */
  calculateSummaryFromData(
    consumptionData: EnergyConsumption[],
    devices: Device[],
    previousPeriodData?: EnergyConsumption[]
  ): ConsumptionSummary {
    // Calculate total consumption
    const totalKwh = consumptionData.reduce((sum, record) => sum + record.consumptionKwh, 0)
    
    // Calculate average daily consumption
    const uniqueDates = new Set<string>()
    consumptionData.forEach(record => {
      const date = record.date
      const dateStr = typeof date === 'string' ? date : date.toISOString()
      uniqueDates.add(dateStr.split('T')[0])
    })
    const days = uniqueDates.size || 1
    const averageDailyKwh = calculateAverageDailyConsumption(totalKwh, days)
    
    // Calculate comparison to previous period
    let comparisonToPreviousPeriod = 0
    if (previousPeriodData && previousPeriodData.length > 0) {
      const previousTotal = previousPeriodData.reduce((sum, record) => sum + record.consumptionKwh, 0)
      comparisonToPreviousPeriod = calculatePercentageChange(totalKwh, previousTotal)
    }
    
    // Aggregate by device
    const byDevice = aggregateByDevice(consumptionData)
    
    // Aggregate by device type
    const consumptionWithType = consumptionData.map(record => {
      const device = devices.find(d => d.id === record.deviceId)
      return {
        deviceType: device?.type || DeviceType.OTHER,
        consumptionKwh: record.consumptionKwh,
      }
    })
    const byType = aggregateByDeviceType(consumptionWithType)
    
    return {
      totalKwh,
      averageDailyKwh,
      comparisonToPreviousPeriod,
      byDevice,
      byType,
    }
  }

  /**
   * Get daily consumption data for charting
   */
  async getDailyConsumption(days: number = 30): Promise<DailyConsumption[]> {
    const { startDate, endDate } = getDateRange(days)
    
    const consumptionData = await this.getConsumption({
      startDate: formatDateToISO(startDate),
      endDate: formatDateToISO(endDate),
    })
    
    const aggregated = aggregateByDay(consumptionData)
    
    // Fill in missing dates with 0 consumption
    const result: DailyConsumption[] = []
    const currentDate = new Date(startDate)
    
    while (currentDate <= endDate) {
      const dateKey = formatDateToISO(currentDate)
      result.push({
        date: dateKey,
        totalKwh: aggregated[dateKey] || 0,
      })
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    return result
  }

  /**
   * Get top consuming devices
   */
  async getTopConsumingDevices(
    devices: Device[],
    limit: number = 5,
    params?: ConsumptionQueryParams
  ): Promise<TopConsumingDevice[]> {
    const consumptionData = await this.getConsumption(params)
    const byDevice = aggregateByDevice(consumptionData)
    
    const totalConsumption = Object.values(byDevice).reduce((sum, val) => sum + val, 0)
    
    const topDevices: TopConsumingDevice[] = Object.entries(byDevice)
      .map(([deviceId, totalKwh]) => {
        const device = devices.find(d => d.id === deviceId)
        return {
          deviceId,
          deviceName: device?.name || 'Unknown Device',
          deviceType: device?.type || DeviceType.OTHER,
          totalKwh,
          percentage: totalConsumption > 0 ? (totalKwh / totalConsumption) * 100 : 0,
        }
      })
      .sort((a, b) => b.totalKwh - a.totalKwh)
      .slice(0, limit)
    
    return topDevices
  }

  /**
   * Get consumption breakdown by device type
   */
  async getConsumptionByType(
    devices: Device[],
    params?: ConsumptionQueryParams
  ): Promise<ConsumptionByType[]> {
    const consumptionData = await this.getConsumption(params)
    
    const consumptionWithType = consumptionData.map(record => {
      const device = devices.find(d => d.id === record.deviceId)
      return {
        deviceType: device?.type || DeviceType.OTHER,
        consumptionKwh: record.consumptionKwh,
      }
    })
    
    const byType = aggregateByDeviceType(consumptionWithType)
    const totalConsumption = Object.values(byType).reduce((sum, val) => sum + val, 0)
    
    return Object.entries(byType).map(([type, totalKwh]) => ({
      type: type as DeviceType,
      totalKwh,
      percentage: totalConsumption > 0 ? (totalKwh / totalConsumption) * 100 : 0,
    }))
  }

  /**
   * Get consumption breakdown by device
   */
  async getConsumptionByDevice(
    devices: Device[],
    params?: ConsumptionQueryParams
  ): Promise<ConsumptionByDevice[]> {
    const consumptionData = await this.getConsumption(params)
    const byDevice = aggregateByDevice(consumptionData)
    
    return Object.entries(byDevice).map(([deviceId, totalKwh]) => {
      const device = devices.find(d => d.id === deviceId)
      return {
        deviceId,
        deviceName: device?.name || 'Unknown Device',
        deviceType: device?.type || DeviceType.OTHER,
        totalKwh,
      }
    })
  }
}

export const energyService = new EnergyService()
