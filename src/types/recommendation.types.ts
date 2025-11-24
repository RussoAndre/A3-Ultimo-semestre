export enum RecommendationPriority {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

export enum RecommendationCategory {
  DEVICE = 'device',
  BEHAVIOR = 'behavior',
  UPGRADE = 'upgrade',
}

export interface Recommendation {
  id: string
  userId: string
  title: string
  description: string
  potentialSavingsKwh: number
  potentialSavingsCO2: number
  priority: RecommendationPriority
  category: RecommendationCategory
  completed: boolean
  completedAt?: Date
  pointsReward: number
  createdAt: Date
}

export interface CompleteRecommendationDto {
  recommendationId: string
}

export interface RecommendationResponse {
  recommendations: Recommendation[]
  totalCount: number
}
