import { apiService } from './api'
import { energyService } from './energy.service'
import {
  EnvironmentalImpact,
  ImpactMetrics,
  ImpactComparison,
  ImpactReportParams,
  DateRange,
} from '../types/impact.types'
import { Device, DisposalMethod } from '../types/device.types'
import { EnergyConsumption } from '../types/energy.types'
import {
  calculateCO2Reduction,
  calculateTreesEquivalent,
  calculateWaterSaved,
  calculateSustainabilityScore,
  calculateEnergySaved,
  getComparisonDateRanges,
} from '../utils/impactCalculations'
import { formatDateToISO } from '../utils/energyCalculations'

class ImpactService {
  private readonly BASE_URL = '/impact'

  /**
   * Get environmental impact report from API
   */
  async getImpactReport(params?: ImpactReportParams): Promise<EnvironmentalImpact> {
    const queryParams = new URLSearchParams()
    
    if (params?.startDate) queryParams.append('startDate', params.startDate)
    if (params?.endDate) queryParams.append('endDate', params.endDate)
    if (params?.comparisonPeriod) queryParams.append('comparisonPeriod', params.comparisonPeriod)
    
    const url = `${this.BASE_URL}/report${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return apiService.get<EnvironmentalImpact>(url)
  }

  /**
   * Calculate environmental impact from consumption data (client-side)
   */
  async calculateImpact(
    userId: string,
    devices: Device[],
    params?: ImpactReportParams
  ): Promise<EnvironmentalImpact> {
    // Determine date range
    const endDate = params?.endDate ? new Date(params.endDate) : new Date()
    const startDate = params?.startDate
      ? new Date(params.startDate)
      : new Date(endDate.getFullYear(), endDate.getMonth(), 1) // Default to current month
    
    const period: DateRange = {
      startDate: formatDateToISO(startDate),
      endDate: formatDateToISO(endDate),
    }
    
    // Get consumption data for current period
    const currentConsumption = await energyService.getConsumption({
      startDate: period.startDate,
      endDate: period.endDate,
    })
    
    // Get baseline consumption (previous period of same length)
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const baselineStartDate = new Date(startDate)
    baselineStartDate.setDate(baselineStartDate.getDate() - daysDiff)
    const baselineEndDate = new Date(startDate)
    baselineEndDate.setDate(baselineEndDate.getDate() - 1)
    
    const baselineConsumption = await energyService.getConsumption({
      startDate: formatDateToISO(baselineStartDate),
      endDate: formatDateToISO(baselineEndDate),
    })
    
    // Calculate totals
    const currentTotal = currentConsumption.reduce((sum, record) => sum + record.consumptionKwh, 0)
    const baselineTotal = baselineConsumption.reduce((sum, record) => sum + record.consumptionKwh, 0)
    
    // Calculate energy saved
    const energySavedKwh = calculateEnergySaved(currentTotal, baselineTotal)
    
    // Calculate environmental metrics
    const co2ReductionKg = calculateCO2Reduction(Math.max(0, energySavedKwh))
    const treesEquivalent = calculateTreesEquivalent(co2ReductionKg)
    const waterSavedLiters = calculateWaterSaved(Math.max(0, energySavedKwh))
    
    // Count recycled devices in the period
    const devicesRecycled = devices.filter(
      (device) =>
        device.disposalMethod === DisposalMethod.RECYCLING &&
        device.disposedAt &&
        new Date(device.disposedAt) >= startDate &&
        new Date(device.disposedAt) <= endDate
    ).length
    
    // Calculate sustainability score
    const sustainabilityScore = calculateSustainabilityScore(
      Math.max(0, energySavedKwh),
      devicesRecycled,
      co2ReductionKg
    )
    
    return {
      userId,
      period,
      energySavedKwh,
      co2ReductionKg,
      treesEquivalent,
      waterSavedLiters,
      devicesRecycled,
      sustainabilityScore,
    }
  }

  /**
   * Get impact comparison between current and previous period
   */
  async getImpactComparison(
    userId: string,
    devices: Device[],
    comparisonPeriod: 'month' | 'quarter' | 'year' = 'month'
  ): Promise<ImpactComparison> {
    const dateRanges = getComparisonDateRanges(comparisonPeriod)
    
    // Calculate current period impact
    const currentImpact = await this.calculateImpact(userId, devices, {
      startDate: formatDateToISO(dateRanges.current.startDate),
      endDate: formatDateToISO(dateRanges.current.endDate),
    })
    
    // Calculate previous period impact
    const previousImpact = await this.calculateImpact(userId, devices, {
      startDate: formatDateToISO(dateRanges.previous.startDate),
      endDate: formatDateToISO(dateRanges.previous.endDate),
    })
    
    // Calculate percentage changes
    const percentageChange = {
      energySaved: this.calculatePercentageChange(
        currentImpact.energySavedKwh,
        previousImpact.energySavedKwh
      ),
      co2Reduction: this.calculatePercentageChange(
        currentImpact.co2ReductionKg,
        previousImpact.co2ReductionKg
      ),
      sustainabilityScore: this.calculatePercentageChange(
        currentImpact.sustainabilityScore,
        previousImpact.sustainabilityScore
      ),
    }
    
    return {
      current: currentImpact,
      previous: previousImpact,
      percentageChange,
    }
  }

  /**
   * Calculate impact metrics from energy saved
   */
  calculateImpactMetrics(energySavedKwh: number): ImpactMetrics {
    const co2ReductionKg = calculateCO2Reduction(energySavedKwh)
    const treesEquivalent = calculateTreesEquivalent(co2ReductionKg)
    const waterSavedLiters = calculateWaterSaved(energySavedKwh)
    
    return {
      co2ReductionKg,
      treesEquivalent,
      waterSavedLiters,
      energySavedKwh,
    }
  }

  /**
   * Get total devices recycled by user
   */
  getTotalDevicesRecycled(devices: Device[]): number {
    return devices.filter(
      (device) => device.disposalMethod === DisposalMethod.RECYCLING
    ).length
  }

  /**
   * Get devices disposed in a specific period
   */
  getDevicesDisposedInPeriod(
    devices: Device[],
    startDate: Date,
    endDate: Date
  ): Device[] {
    return devices.filter(
      (device) =>
        device.disposedAt &&
        new Date(device.disposedAt) >= startDate &&
        new Date(device.disposedAt) <= endDate
    )
  }

  /**
   * Calculate percentage change between two values
   */
  private calculatePercentageChange(current: number, previous: number): number {
    if (previous === 0) {
      return current > 0 ? 100 : 0
    }
    
    return ((current - previous) / previous) * 100
  }

  /**
   * Download impact report as PDF
   */
  async downloadImpactReport(params?: ImpactReportParams): Promise<Blob> {
    const queryParams = new URLSearchParams()
    
    if (params?.startDate) queryParams.append('startDate', params.startDate)
    if (params?.endDate) queryParams.append('endDate', params.endDate)
    
    const url = `${this.BASE_URL}/report/download${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return apiService.get<Blob>(url, { responseType: 'blob' })
  }
}

export const impactService = new ImpactService()
