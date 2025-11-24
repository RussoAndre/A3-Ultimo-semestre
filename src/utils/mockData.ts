/**
 * Mock data generators for demo purposes
 * This provides fake data when no real backend is available
 */

import type { Device, DeviceType } from '../types/device.types'
import type { EnergyConsumption } from '../types/energy.types'
import type { Recommendation } from '../types/recommendation.types'
import type { UserRewards, Badge, PointsTransaction } from '../types/rewards.types'

/**
 * Generate mock devices for a user
 */
export function generateMockDevices(userId: string): Device[] {
  const now = new Date()
  const devices: Device[] = [
    {
      id: 'device_1',
      userId,
      name: 'Dell Laptop',
      type: 'computer' as DeviceType,
      wattage: 65,
      dailyUsageHours: 8,
      estimatedDailyConsumption: 0.52, // 65W * 8h / 1000
      status: 'active',
      registeredAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    },
    {
      id: 'device_2',
      userId,
      name: 'Samsung Monitor 24"',
      type: 'monitor' as DeviceType,
      wattage: 30,
      dailyUsageHours: 8,
      estimatedDailyConsumption: 0.24, // 30W * 8h / 1000
      status: 'active',
      registeredAt: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'device_3',
      userId,
      name: 'HP Printer',
      type: 'printer' as DeviceType,
      wattage: 15,
      dailyUsageHours: 2,
      estimatedDailyConsumption: 0.03, // 15W * 2h / 1000
      status: 'active',
      registeredAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'device_4',
      userId,
      name: 'LED Desk Lamp',
      type: 'lighting' as DeviceType,
      wattage: 12,
      dailyUsageHours: 6,
      estimatedDailyConsumption: 0.072, // 12W * 6h / 1000
      status: 'active',
      registeredAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
    },
  ]

  return devices
}

/**
 * Generate mock energy consumption data
 */
export function generateMockEnergyData(days: number = 30): EnergyConsumption[] {
  const data: EnergyConsumption[] = []
  const now = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    const baseConsumption = 0.85 // Base daily consumption in kWh
    const variation = (Math.random() - 0.5) * 0.3 // Random variation ±0.15 kWh

    data.push({
      date: date.toISOString().split('T')[0],
      consumption: Math.max(0.5, baseConsumption + variation),
      cost: (baseConsumption + variation) * 0.15, // $0.15 per kWh
    })
  }

  return data
}

/**
 * Generate mock recommendations
 */
export function generateMockRecommendations(): Recommendation[] {
  return [
    {
      id: 'rec_1',
      title: 'Enable Power Saving Mode on Your Laptop',
      description: 'Activating power saving mode can reduce your laptop energy consumption by up to 30%. This simple change can save approximately 0.15 kWh per day.',
      priority: 'high',
      potentialSavingsKwh: 4.5, // Monthly savings
      potentialSavingsCost: 0.68,
      category: 'energy_saving',
      completed: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'rec_2',
      title: 'Adjust Monitor Brightness',
      description: 'Reducing your monitor brightness to 70% can decrease energy consumption by 20% without significantly affecting visibility.',
      priority: 'medium',
      potentialSavingsKwh: 1.44,
      potentialSavingsCost: 0.22,
      category: 'energy_saving',
      completed: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'rec_3',
      title: 'Unplug Devices When Not in Use',
      description: 'Devices in standby mode still consume energy. Unplugging your printer when not in use can save up to 0.5 kWh per month.',
      priority: 'low',
      potentialSavingsKwh: 0.5,
      potentialSavingsCost: 0.08,
      category: 'best_practices',
      completed: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'rec_4',
      title: 'Use Natural Light During Daytime',
      description: 'Take advantage of natural daylight and turn off your desk lamp during daytime hours. This can save approximately 2 kWh per month.',
      priority: 'medium',
      potentialSavingsKwh: 2.0,
      potentialSavingsCost: 0.30,
      category: 'energy_saving',
      completed: false,
      createdAt: new Date().toISOString(),
    },
  ]
}

/**
 * Generate mock user rewards
 */
export function generateMockRewards(userId: string): UserRewards {
  return {
    userId,
    totalPoints: 150,
    currentTier: 'silver',
    pointsToNextTier: 350,
    badges: generateMockBadges(),
    recentTransactions: generateMockTransactions(),
  }
}

/**
 * Generate mock badges
 */
function generateMockBadges(): Badge[] {
  const now = new Date()
  return [
    {
      id: 'badge_1',
      name: 'First Device',
      description: 'Register your first device',
      icon: '🎯',
      earnedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      points: 10,
    },
    {
      id: 'badge_2',
      name: 'Energy Saver',
      description: 'Save 100 kWh of energy',
      icon: '⚡',
      earnedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      points: 50,
    },
    {
      id: 'badge_3',
      name: 'Scholar',
      description: 'Complete 5 educational articles',
      icon: '📚',
      earnedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      points: 50,
    },
  ]
}

/**
 * Generate mock points transactions
 */
function generateMockTransactions(): PointsTransaction[] {
  const now = new Date()
  return [
    {
      id: 'trans_1',
      userId: 'user_1',
      points: 50,
      action: 'articleRead',
      description: 'Completed article: Green Computing Basics',
      createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'trans_2',
      userId: 'user_1',
      points: 50,
      action: 'recommendationCompleted',
      description: 'Completed recommendation: Enable Power Saving Mode',
      createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'trans_3',
      userId: 'user_1',
      points: 10,
      action: 'deviceRegistration',
      description: 'Registered device: Dell Laptop',
      createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'trans_4',
      userId: 'user_1',
      points: 10,
      action: 'deviceRegistration',
      description: 'Registered device: Samsung Monitor',
      createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'trans_5',
      userId: 'user_1',
      points: 20,
      action: 'deviceDisposal',
      description: 'Properly disposed old printer',
      createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]
}

/**
 * Initialize mock data for a new user
 */
export function initializeMockDataForUser(userId: string): void {
  const mockDataKey = `mock_data_${userId}`
  
  // Check if mock data already exists
  if (localStorage.getItem(mockDataKey)) {
    return // Already initialized
  }

  const mockData = {
    devices: generateMockDevices(userId),
    energyData: generateMockEnergyData(30),
    recommendations: generateMockRecommendations(),
    rewards: generateMockRewards(userId),
    initialized: true,
    initializedAt: new Date().toISOString(),
  }

  localStorage.setItem(mockDataKey, JSON.stringify(mockData))
}

/**
 * Get mock data for a user
 */
export function getMockDataForUser(userId: string) {
  const mockDataKey = `mock_data_${userId}`
  const data = localStorage.getItem(mockDataKey)
  
  if (!data) {
    initializeMockDataForUser(userId)
    return JSON.parse(localStorage.getItem(mockDataKey) || '{}')
  }
  
  return JSON.parse(data)
}

/**
 * Clear mock data for a user
 */
export function clearMockDataForUser(userId: string): void {
  const mockDataKey = `mock_data_${userId}`
  localStorage.removeItem(mockDataKey)
}
