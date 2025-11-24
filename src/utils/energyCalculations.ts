/**
 * Calculate daily energy consumption in kWh
 * Formula: (wattage × hours) / 1000 = kWh
 * 
 * @param wattage - Device power consumption in watts
 * @param hours - Daily usage hours
 * @returns Daily energy consumption in kWh
 */
export function calculateDailyConsumption(wattage: number, hours: number): number {
  if (wattage < 0 || hours < 0) {
    throw new Error('Wattage and hours must be positive numbers')
  }

  if (hours > 24) {
    throw new Error('Daily usage hours cannot exceed 24')
  }

  return (wattage * hours) / 1000
}

/**
 * Calculate monthly energy consumption in kWh
 * 
 * @param dailyConsumption - Daily consumption in kWh
 * @param days - Number of days (default 30)
 * @returns Monthly energy consumption in kWh
 */
export function calculateMonthlyConsumption(dailyConsumption: number, days: number = 30): number {
  if (dailyConsumption < 0 || days < 0) {
    throw new Error('Daily consumption and days must be positive numbers')
  }

  return dailyConsumption * days
}

/**
 * Calculate yearly energy consumption in kWh
 * 
 * @param dailyConsumption - Daily consumption in kWh
 * @returns Yearly energy consumption in kWh
 */
export function calculateYearlyConsumption(dailyConsumption: number): number {
  if (dailyConsumption < 0) {
    throw new Error('Daily consumption must be a positive number')
  }

  return dailyConsumption * 365
}

/**
 * Calculate energy cost based on consumption and rate
 * 
 * @param consumptionKwh - Energy consumption in kWh
 * @param ratePerKwh - Cost per kWh in local currency
 * @returns Total cost
 */
export function calculateEnergyCost(consumptionKwh: number, ratePerKwh: number): number {
  if (consumptionKwh < 0 || ratePerKwh < 0) {
    throw new Error('Consumption and rate must be positive numbers')
  }

  return consumptionKwh * ratePerKwh
}

/**
 * Format energy consumption for display
 * 
 * @param kwh - Energy in kWh
 * @param decimals - Number of decimal places (default 2)
 * @returns Formatted string with unit
 */
export function formatEnergyConsumption(kwh: number, decimals: number = 2): string {
  return `${kwh.toFixed(decimals)} kWh`
}

/**
 * Calculate CO2 emissions from energy consumption
 * Using average emission factor of 0.5 kg CO2 per kWh (varies by region)
 * 
 * @param kwh - Energy consumption in kWh
 * @param emissionFactor - kg CO2 per kWh (default 0.5)
 * @returns CO2 emissions in kg
 */
export function calculateCO2Emissions(kwh: number, emissionFactor: number = 0.5): number {
  if (kwh < 0 || emissionFactor < 0) {
    throw new Error('kWh and emission factor must be positive numbers')
  }

  return kwh * emissionFactor
}

/**
 * Aggregate consumption data by day
 * 
 * @param consumptionData - Array of consumption records
 * @returns Map of date to total consumption
 */
export function aggregateByDay(
  consumptionData: Array<{ date: Date | string; consumptionKwh: number }>
): Record<string, number> {
  const aggregated: Record<string, number> = {}

  consumptionData.forEach((record) => {
    const date = typeof record.date === 'string'
      ? record.date.split('T')[0]
      : record.date.toISOString().split('T')[0]

    aggregated[date] = (aggregated[date] || 0) + record.consumptionKwh
  })

  return aggregated
}

/**
 * Aggregate consumption data by week
 * 
 * @param consumptionData - Array of consumption records
 * @returns Map of week start date to total consumption
 */
export function aggregateByWeek(
  consumptionData: Array<{ date: Date | string; consumptionKwh: number }>
): Record<string, number> {
  const aggregated: Record<string, number> = {}

  consumptionData.forEach((record) => {
    const date = typeof record.date === 'string' ? new Date(record.date) : record.date
    const weekStart = getWeekStart(date)
    const weekKey = weekStart.toISOString().split('T')[0]

    aggregated[weekKey] = (aggregated[weekKey] || 0) + record.consumptionKwh
  })

  return aggregated
}

/**
 * Aggregate consumption data by month
 * 
 * @param consumptionData - Array of consumption records
 * @returns Map of month (YYYY-MM) to total consumption
 */
export function aggregateByMonth(
  consumptionData: Array<{ date: Date | string; consumptionKwh: number }>
): Record<string, number> {
  const aggregated: Record<string, number> = {}

  consumptionData.forEach((record) => {
    const date = typeof record.date === 'string' ? new Date(record.date) : record.date
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

    aggregated[monthKey] = (aggregated[monthKey] || 0) + record.consumptionKwh
  })

  return aggregated
}

/**
 * Get the start of the week (Monday) for a given date
 * 
 * @param date - Input date
 * @returns Date object representing the start of the week
 */
function getWeekStart(date: Date): Date {
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
  const weekStart = new Date(date)
  weekStart.setDate(diff)
  weekStart.setHours(0, 0, 0, 0)
  return weekStart
}

/**
 * Calculate average daily consumption
 * 
 * @param totalKwh - Total consumption in kWh
 * @param days - Number of days
 * @returns Average daily consumption
 */
export function calculateAverageDailyConsumption(totalKwh: number, days: number): number {
  if (days <= 0) {
    throw new Error('Days must be greater than 0')
  }

  return totalKwh / days
}

/**
 * Calculate percentage change between two values
 * 
 * @param current - Current value
 * @param previous - Previous value
 * @returns Percentage change (positive for increase, negative for decrease)
 */
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0
  }

  return ((current - previous) / previous) * 100
}

/**
 * Aggregate consumption by device
 * 
 * @param consumptionData - Array of consumption records with device info
 * @returns Map of device ID to total consumption
 */
export function aggregateByDevice(
  consumptionData: Array<{ deviceId: string; consumptionKwh: number }>
): Record<string, number> {
  const aggregated: Record<string, number> = {}

  consumptionData.forEach((record) => {
    aggregated[record.deviceId] = (aggregated[record.deviceId] || 0) + record.consumptionKwh
  })

  return aggregated
}

/**
 * Aggregate consumption by device type
 * 
 * @param consumptionData - Array of consumption records with device type
 * @returns Map of device type to total consumption
 */
export function aggregateByDeviceType<T extends string>(
  consumptionData: Array<{ deviceType: T; consumptionKwh: number }>
): Record<T, number> {
  const aggregated: Record<string, number> = {}

  consumptionData.forEach((record) => {
    aggregated[record.deviceType] = (aggregated[record.deviceType] || 0) + record.consumptionKwh
  })

  return aggregated as Record<T, number>
}

/**
 * Get date range for the last N days
 * 
 * @param days - Number of days to go back
 * @returns Object with startDate and endDate
 */
export function getDateRange(days: number): { startDate: Date; endDate: Date } {
  const endDate = new Date()
  endDate.setHours(23, 59, 59, 999)

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  startDate.setHours(0, 0, 0, 0)

  return { startDate, endDate }
}

/**
 * Format date to ISO string (YYYY-MM-DD)
 * 
 * @param date - Date to format
 * @returns ISO date string
 */
export function formatDateToISO(date: Date): string {
  return date.toISOString().split('T')[0]
}
