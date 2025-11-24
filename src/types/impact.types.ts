export interface DateRange {
  startDate: string
  endDate: string
}

export interface EnvironmentalImpact {
  userId: string
  period: DateRange
  energySavedKwh: number
  co2ReductionKg: number
  treesEquivalent: number
  waterSavedLiters: number
  devicesRecycled: number
  sustainabilityScore: number // 0-100
}

export interface ImpactMetrics {
  co2ReductionKg: number
  treesEquivalent: number
  waterSavedLiters: number
  energySavedKwh: number
}

export interface ImpactComparison {
  current: EnvironmentalImpact
  previous: EnvironmentalImpact
  percentageChange: {
    energySaved: number
    co2Reduction: number
    sustainabilityScore: number
  }
}

export interface ImpactReportParams {
  startDate?: string
  endDate?: string
  comparisonPeriod?: 'month' | 'quarter' | 'year'
}
