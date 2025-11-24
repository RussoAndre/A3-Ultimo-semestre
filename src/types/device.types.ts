export enum DeviceType {
  COMPUTER = 'computer',
  MONITOR = 'monitor',
  PRINTER = 'printer',
  APPLIANCE = 'appliance',
  LIGHTING = 'lighting',
  OTHER = 'other',
}

export enum DeviceStatus {
  ACTIVE = 'active',
  DISPOSED = 'disposed',
}

export enum DisposalMethod {
  RECYCLING = 'recycling',
  DONATION = 'donation',
  PROPER_DISPOSAL = 'proper_disposal',
}

export interface Device {
  id: string
  userId: string
  name: string
  type: DeviceType
  wattage: number
  dailyUsageHours: number
  estimatedDailyConsumption: number // kWh
  registeredAt: Date
  status: DeviceStatus
  disposedAt?: Date
  disposalMethod?: DisposalMethod
}

export interface CreateDeviceDto {
  name: string
  type: DeviceType
  wattage: number
  dailyUsageHours: number
}

export interface UpdateDeviceDto {
  name?: string
  type?: DeviceType
  wattage?: number
  dailyUsageHours?: number
}

export interface DisposeDeviceDto {
  disposalMethod: DisposalMethod
  disposedAt?: Date
}

export interface DeviceFormData {
  name: string
  type: DeviceType | ''
  wattage: string
  dailyUsageHours: string
}
