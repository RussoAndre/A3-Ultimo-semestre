import { apiService } from './api'
import {
  Recommendation,
  RecommendationResponse,
  CompleteRecommendationDto,
  RecommendationPriority,
  RecommendationCategory,
} from '../types/recommendation.types'
import { Device, DeviceType } from '../types/device.types'

class RecommendationService {
  private readonly BASE_URL = '/recommendations'

  /**
   * Fetch personalized recommendations for the current user
   */
  async getRecommendations(): Promise<Recommendation[]> {
    try {
      const response = await apiService.get<RecommendationResponse>(this.BASE_URL)
      return response.recommendations
    } catch (error) {
      console.error('Error fetching recommendations:', error)
      throw error
    }
  }

  /**
   * Mark a recommendation as completed
   */
  async completeRecommendation(recommendationId: string): Promise<Recommendation> {
    try {
      const dto: CompleteRecommendationDto = { recommendationId }
      const response = await apiService.post<Recommendation>(
        `${this.BASE_URL}/${recommendationId}/complete`,
        dto
      )
      return response
    } catch (error) {
      console.error('Error completing recommendation:', error)
      throw error
    }
  }

  /**
   * Get recommendation history (completed recommendations)
   */
  async getRecommendationHistory(): Promise<Recommendation[]> {
    try {
      const response = await apiService.get<RecommendationResponse>(
        `${this.BASE_URL}/history`
      )
      return response.recommendations
    } catch (error) {
      console.error('Error fetching recommendation history:', error)
      throw error
    }
  }

  /**
   * Generate recommendations based on device data (client-side logic)
   * This can be used as a fallback or for preview purposes
   */
  generateRecommendations(devices: Device[]): Recommendation[] {
    const recommendations: Recommendation[] = []
    const activeDevices = devices.filter((d) => d.status === 'active')

    if (activeDevices.length === 0) {
      return recommendations
    }

    // Find high-consumption devices
    const highConsumptionDevices = activeDevices
      .filter((d) => d.estimatedDailyConsumption > 2) // > 2 kWh per day
      .sort((a, b) => b.estimatedDailyConsumption - a.estimatedDailyConsumption)

    if (highConsumptionDevices.length > 0) {
      const topDevice = highConsumptionDevices[0]
      recommendations.push({
        id: `rec-high-consumption-${topDevice.id}`,
        userId: topDevice.userId,
        title: 'Reduce usage of high-consumption device',
        description: `Your ${topDevice.name} consumes ${topDevice.estimatedDailyConsumption.toFixed(2)} kWh daily. Consider reducing usage hours or upgrading to a more efficient model.`,
        potentialSavingsKwh: topDevice.estimatedDailyConsumption * 0.3 * 30, // 30% reduction over 30 days
        potentialSavingsCO2: topDevice.estimatedDailyConsumption * 0.3 * 30 * 0.5, // 0.5 kg CO2 per kWh
        priority: RecommendationPriority.HIGH,
        category: RecommendationCategory.DEVICE,
        completed: false,
        pointsReward: 50,
        createdAt: new Date(),
      })
    }

    // Check for devices with excessive usage hours
    const excessiveUsageDevices = activeDevices.filter((d) => d.dailyUsageHours > 12)

    if (excessiveUsageDevices.length > 0) {
      const device = excessiveUsageDevices[0]
      recommendations.push({
        id: `rec-excessive-usage-${device.id}`,
        userId: device.userId,
        title: 'Optimize device usage schedule',
        description: `Your ${device.name} runs for ${device.dailyUsageHours} hours daily. Consider implementing a usage schedule to reduce unnecessary runtime.`,
        potentialSavingsKwh: device.estimatedDailyConsumption * 0.25 * 30, // 25% reduction
        potentialSavingsCO2: device.estimatedDailyConsumption * 0.25 * 30 * 0.5,
        priority: RecommendationPriority.MEDIUM,
        category: RecommendationCategory.BEHAVIOR,
        completed: false,
        pointsReward: 30,
        createdAt: new Date(),
      })
    }

    // Check for old computers (potential upgrade recommendation)
    const computers = activeDevices.filter(
      (d) => d.type === DeviceType.COMPUTER && d.wattage > 200
    )

    if (computers.length > 0) {
      const computer = computers[0]
      recommendations.push({
        id: `rec-upgrade-computer-${computer.id}`,
        userId: computer.userId,
        title: 'Consider upgrading to energy-efficient computer',
        description: `Your ${computer.name} uses ${computer.wattage}W. Modern energy-efficient computers can reduce power consumption by up to 50%.`,
        potentialSavingsKwh: computer.estimatedDailyConsumption * 0.5 * 30, // 50% reduction
        potentialSavingsCO2: computer.estimatedDailyConsumption * 0.5 * 30 * 0.5,
        priority: RecommendationPriority.MEDIUM,
        category: RecommendationCategory.UPGRADE,
        completed: false,
        pointsReward: 40,
        createdAt: new Date(),
      })
    }

    // Check for lighting devices
    const lightingDevices = activeDevices.filter((d) => d.type === DeviceType.LIGHTING)

    if (lightingDevices.length > 0 && lightingDevices.some((d) => d.wattage > 60)) {
      recommendations.push({
        id: `rec-led-upgrade`,
        userId: lightingDevices[0].userId,
        title: 'Switch to LED lighting',
        description: 'Replace traditional bulbs with LED alternatives to reduce lighting energy consumption by up to 75%.',
        potentialSavingsKwh: lightingDevices.reduce((sum, d) => sum + d.estimatedDailyConsumption, 0) * 0.75 * 30,
        potentialSavingsCO2: lightingDevices.reduce((sum, d) => sum + d.estimatedDailyConsumption, 0) * 0.75 * 30 * 0.5,
        priority: RecommendationPriority.HIGH,
        category: RecommendationCategory.UPGRADE,
        completed: false,
        pointsReward: 45,
        createdAt: new Date(),
      })
    }

    // General power management recommendation
    if (activeDevices.length >= 3) {
      const totalDailyConsumption = activeDevices.reduce(
        (sum, d) => sum + d.estimatedDailyConsumption,
        0
      )
      recommendations.push({
        id: `rec-power-management`,
        userId: activeDevices[0].userId,
        title: 'Enable power management features',
        description: 'Enable sleep mode and power-saving features on all devices to reduce standby power consumption.',
        potentialSavingsKwh: totalDailyConsumption * 0.15 * 30, // 15% reduction
        potentialSavingsCO2: totalDailyConsumption * 0.15 * 30 * 0.5,
        priority: RecommendationPriority.LOW,
        category: RecommendationCategory.BEHAVIOR,
        completed: false,
        pointsReward: 25,
        createdAt: new Date(),
      })
    }

    // Sort by priority (high -> medium -> low)
    const priorityOrder = {
      [RecommendationPriority.HIGH]: 0,
      [RecommendationPriority.MEDIUM]: 1,
      [RecommendationPriority.LOW]: 2,
    }

    return recommendations.sort(
      (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
    )
  }
}

export const recommendationService = new RecommendationService()
