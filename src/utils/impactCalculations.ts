/**
 * Environmental Impact Calculation Utilities
 * 
 * Conversion factors based on environmental research:
 * - CO2: 0.5 kg CO2 per kWh (average grid emission factor)
 * - Trees: 1 tree absorbs ~21 kg CO2 per year
 * - Water: Power generation uses ~2 liters per kWh
 */

// Conversion factors
export const CONVERSION_FACTORS = {
  CO2_PER_KWH: 0.5, // kg CO2 per kWh
  TREE_CO2_ABSORPTION_PER_YEAR: 21, // kg CO2 per tree per year
  WATER_PER_KWH: 2, // liters of water per kWh
  DAYS_PER_YEAR: 365,
} as const

/**
 * Calculate CO2 reduction from energy saved
 * 
 * @param energySavedKwh - Energy saved in kWh
 * @returns CO2 reduction in kg
 */
export function calculateCO2Reduction(energySavedKwh: number): number {
  if (energySavedKwh < 0) {
    throw new Error('Energy saved must be a positive number')
  }
  
  return energySavedKwh * CONVERSION_FACTORS.CO2_PER_KWH
}

/**
 * Calculate trees equivalent based on CO2 reduction
 * 
 * @param co2ReductionKg - CO2 reduction in kg
 * @returns Number of trees equivalent
 */
export function calculateTreesEquivalent(co2ReductionKg: number): number {
  if (co2ReductionKg < 0) {
    throw new Error('CO2 reduction must be a positive number')
  }
  
  return co2ReductionKg / CONVERSION_FACTORS.TREE_CO2_ABSORPTION_PER_YEAR
}

/**
 * Calculate water saved from energy reduction
 * 
 * @param energySavedKwh - Energy saved in kWh
 * @returns Water saved in liters
 */
export function calculateWaterSaved(energySavedKwh: number): number {
  if (energySavedKwh < 0) {
    throw new Error('Energy saved must be a positive number')
  }
  
  return energySavedKwh * CONVERSION_FACTORS.WATER_PER_KWH
}

/**
 * Calculate sustainability score based on multiple factors
 * Score is 0-100 based on:
 * - Energy saved (40%)
 * - Devices recycled (30%)
 * - CO2 reduction (30%)
 * 
 * @param energySavedKwh - Energy saved in kWh
 * @param devicesRecycled - Number of devices properly disposed
 * @param co2ReductionKg - CO2 reduction in kg
 * @returns Sustainability score (0-100)
 */
export function calculateSustainabilityScore(
  energySavedKwh: number,
  devicesRecycled: number,
  co2ReductionKg: number
): number {
  // Normalize values to 0-100 scale
  // Energy: 100 kWh saved = 40 points (max)
  const energyScore = Math.min((energySavedKwh / 100) * 40, 40)
  
  // Devices: 10 devices recycled = 30 points (max)
  const deviceScore = Math.min((devicesRecycled / 10) * 30, 30)
  
  // CO2: 50 kg reduced = 30 points (max)
  const co2Score = Math.min((co2ReductionKg / 50) * 30, 30)
  
  const totalScore = energyScore + deviceScore + co2Score
  
  return Math.round(Math.min(totalScore, 100))
}

/**
 * Calculate energy saved compared to baseline
 * 
 * @param currentConsumption - Current period consumption in kWh
 * @param baselineConsumption - Baseline period consumption in kWh
 * @returns Energy saved in kWh (positive if reduced, negative if increased)
 */
export function calculateEnergySaved(
  currentConsumption: number,
  baselineConsumption: number
): number {
  if (currentConsumption < 0 || baselineConsumption < 0) {
    throw new Error('Consumption values must be positive numbers')
  }
  
  return baselineConsumption - currentConsumption
}

/**
 * Format CO2 value for display
 * 
 * @param co2Kg - CO2 in kg
 * @param decimals - Number of decimal places
 * @returns Formatted string with unit
 */
export function formatCO2(co2Kg: number, decimals: number = 2): string {
  if (co2Kg >= 1000) {
    return `${(co2Kg / 1000).toFixed(decimals)} tons`
  }
  return `${co2Kg.toFixed(decimals)} kg`
}

/**
 * Format trees equivalent for display
 * 
 * @param trees - Number of trees
 * @param decimals - Number of decimal places
 * @returns Formatted string
 */
export function formatTrees(trees: number, decimals: number = 1): string {
  return `${trees.toFixed(decimals)} trees`
}

/**
 * Format water saved for display
 * 
 * @param liters - Water in liters
 * @param decimals - Number of decimal places
 * @returns Formatted string with unit
 */
export function formatWater(liters: number, decimals: number = 0): string {
  if (liters >= 1000) {
    return `${(liters / 1000).toFixed(decimals)} m³`
  }
  return `${liters.toFixed(decimals)} liters`
}

/**
 * Get date range for comparison period
 * 
 * @param period - Comparison period type
 * @param referenceDate - Reference date (defaults to today)
 * @returns Object with current and previous period date ranges
 */
export function getComparisonDateRanges(
  period: 'month' | 'quarter' | 'year',
  referenceDate: Date = new Date()
): {
  current: { startDate: Date; endDate: Date }
  previous: { startDate: Date; endDate: Date }
} {
  const endDate = new Date(referenceDate)
  endDate.setHours(23, 59, 59, 999)
  
  let startDate: Date
  let previousStartDate: Date
  let previousEndDate: Date
  
  switch (period) {
    case 'month':
      // Current month
      startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1)
      startDate.setHours(0, 0, 0, 0)
      
      // Previous month
      previousEndDate = new Date(startDate)
      previousEndDate.setDate(previousEndDate.getDate() - 1)
      previousEndDate.setHours(23, 59, 59, 999)
      
      previousStartDate = new Date(previousEndDate.getFullYear(), previousEndDate.getMonth(), 1)
      previousStartDate.setHours(0, 0, 0, 0)
      break
      
    case 'quarter':
      // Current quarter
      const currentQuarter = Math.floor(endDate.getMonth() / 3)
      startDate = new Date(endDate.getFullYear(), currentQuarter * 3, 1)
      startDate.setHours(0, 0, 0, 0)
      
      // Previous quarter
      previousEndDate = new Date(startDate)
      previousEndDate.setDate(previousEndDate.getDate() - 1)
      previousEndDate.setHours(23, 59, 59, 999)
      
      const previousQuarter = Math.floor(previousEndDate.getMonth() / 3)
      previousStartDate = new Date(previousEndDate.getFullYear(), previousQuarter * 3, 1)
      previousStartDate.setHours(0, 0, 0, 0)
      break
      
    case 'year':
      // Current year
      startDate = new Date(endDate.getFullYear(), 0, 1)
      startDate.setHours(0, 0, 0, 0)
      
      // Previous year
      previousStartDate = new Date(endDate.getFullYear() - 1, 0, 1)
      previousStartDate.setHours(0, 0, 0, 0)
      
      previousEndDate = new Date(endDate.getFullYear() - 1, 11, 31)
      previousEndDate.setHours(23, 59, 59, 999)
      break
  }
  
  return {
    current: { startDate, endDate },
    previous: { startDate: previousStartDate, endDate: previousEndDate },
  }
}
