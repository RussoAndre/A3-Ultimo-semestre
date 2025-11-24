import { DeviceType } from './device.types'

export interface EnergyConsumption {
  id: string
  userId: string
  deviceId: string
  date: Date | string
  consumptionKwh: number
  cost?: number
}

export interface ConsumptionSummary {
  totalKwh: number
  averageDailyKwh: number
  comparisonToPreviousPeriod: number // percentage
  byDevice: Record<string, number>
  byType: Record<DeviceType, number>
}

export interface ConsumptionByDevice {
  deviceId: string
  deviceName: string
  deviceType: DeviceType
  totalKwh: number
}

export interface ConsumptionByType {
  type: DeviceType
  totalKwh: number
  percentage: number
}

export interface DailyConsumption {
  date: string
  totalKwh: number
  byDevice?: Record<string, number>
}

export interface ConsumptionTrend {
  daily: DailyConsumption[]
  weekly: DailyConsumption[]
  monthly: DailyConsumption[]
}

export interface ConsumptionQueryParams {
  startDate?: string
  endDate?: string
  deviceId?: string
  deviceType?: DeviceType
  period?: 'daily' | 'weekly' | 'monthly'
}

export interface TopConsumingDevice {
  deviceId: string
  deviceName: string
  deviceType: DeviceType
  totalKwh: number
  percentage: number
}
