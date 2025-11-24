import type { ProgressMetrics } from '../types/profile.types';
import type { RewardTier } from '../types/rewards.types';

/**
 * Calculate days active based on account creation date
 */
export function calculateDaysActive(createdAt: string | Date): number {
  const created = new Date(createdAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - created.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Calculate current streak based on activity dates
 */
export function calculateCurrentStreak(activityDates: Date[]): number {
  if (activityDates.length === 0) return 0;

  // Sort dates in descending order
  const sortedDates = activityDates
    .map(d => new Date(d).setHours(0, 0, 0, 0))
    .sort((a, b) => b - a);

  const today = new Date().setHours(0, 0, 0, 0);
  const yesterday = today - 24 * 60 * 60 * 1000;

  // Check if most recent activity is today or yesterday
  if (sortedDates[0] !== today && sortedDates[0] !== yesterday) {
    return 0;
  }

  let streak = 1;
  let currentDate = sortedDates[0];

  for (let i = 1; i < sortedDates.length; i++) {
    const expectedPrevDate = currentDate - 24 * 60 * 60 * 1000;
    if (sortedDates[i] === expectedPrevDate) {
      streak++;
      currentDate = sortedDates[i];
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Calculate longest streak from activity dates
 */
export function calculateLongestStreak(activityDates: Date[]): number {
  if (activityDates.length === 0) return 0;

  const sortedDates = activityDates
    .map(d => new Date(d).setHours(0, 0, 0, 0))
    .sort((a, b) => a - b);

  let longestStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < sortedDates.length; i++) {
    const dayDiff = (sortedDates[i] - sortedDates[i - 1]) / (24 * 60 * 60 * 1000);
    
    if (dayDiff === 1) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else if (dayDiff > 1) {
      currentStreak = 1;
    }
  }

  return longestStreak;
}

/**
 * Calculate progress percentage towards next tier
 */
export function calculateTierProgress(
  currentPoints: number,
  currentTier: RewardTier
): { progress: number; pointsToNext: number; nextTier: RewardTier | null } {
  const tierThresholds: Record<RewardTier, number> = {
    [RewardTier.BRONZE]: 0,
    [RewardTier.SILVER]: 500,
    [RewardTier.GOLD]: 1500,
    [RewardTier.PLATINUM]: 3000,
  };

  const tierOrder = [
    RewardTier.BRONZE,
    RewardTier.SILVER,
    RewardTier.GOLD,
    RewardTier.PLATINUM,
  ];

  const currentIndex = tierOrder.indexOf(currentTier);
  const nextTier = currentIndex < tierOrder.length - 1 ? tierOrder[currentIndex + 1] : null;

  if (!nextTier) {
    return { progress: 100, pointsToNext: 0, nextTier: null };
  }

  const currentThreshold = tierThresholds[currentTier];
  const nextThreshold = tierThresholds[nextTier];
  const pointsInCurrentTier = currentPoints - currentThreshold;
  const pointsNeededForNextTier = nextThreshold - currentThreshold;
  const progress = Math.min(100, (pointsInCurrentTier / pointsNeededForNextTier) * 100);
  const pointsToNext = Math.max(0, nextThreshold - currentPoints);

  return { progress, pointsToNext, nextTier };
}

/**
 * Calculate sustainability score (0-100) based on various metrics
 */
export function calculateSustainabilityScore(metrics: ProgressMetrics): number {
  const weights = {
    energySaved: 0.3,
    devicesRecycled: 0.2,
    recommendations: 0.2,
    education: 0.15,
    streak: 0.15,
  };

  // Normalize each metric to 0-100 scale
  const energyScore = Math.min(100, (metrics.totalEnergySavedKwh / 100) * 100);
  const recyclingScore = Math.min(100, (metrics.devicesRecycled / 10) * 100);
  const recommendationScore = Math.min(100, (metrics.recommendationsCompleted / 20) * 100);
  const educationScore = Math.min(100, (metrics.articlesRead / 15) * 100);
  const streakScore = Math.min(100, (metrics.currentStreak / 30) * 100);

  const totalScore =
    energyScore * weights.energySaved +
    recyclingScore * weights.devicesRecycled +
    recommendationScore * weights.recommendations +
    educationScore * weights.education +
    streakScore * weights.streak;

  return Math.round(totalScore);
}

/**
 * Format progress metrics for display
 */
export function formatProgressMetric(value: number, type: 'energy' | 'co2' | 'count'): string {
  switch (type) {
    case 'energy':
      return `${value.toFixed(2)} kWh`;
    case 'co2':
      return `${value.toFixed(2)} kg`;
    case 'count':
      return value.toString();
    default:
      return value.toString();
  }
}

/**
 * Get achievement level based on metric value
 */
export function getAchievementLevel(
  value: number,
  thresholds: { bronze: number; silver: number; gold: number; platinum: number }
): RewardTier {
  if (value >= thresholds.platinum) return RewardTier.PLATINUM;
  if (value >= thresholds.gold) return RewardTier.GOLD;
  if (value >= thresholds.silver) return RewardTier.SILVER;
  return RewardTier.BRONZE;
}
