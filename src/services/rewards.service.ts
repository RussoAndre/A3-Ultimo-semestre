import { apiService as api } from './api';
import {
  UserRewards,
  Badge,
  PointsTransaction,
  LeaderboardEntry,
  PointsAward,
  RewardTier,
} from '../types/rewards.types';

// Point values for different actions
export const POINTS_CONFIG = {
  DEVICE_REGISTRATION: 10,
  DEVICE_DISPOSAL_RECYCLING: 20,
  DEVICE_DISPOSAL_DONATION: 15,
  DEVICE_DISPOSAL_PROPER: 10,
  RECOMMENDATION_COMPLETED: 50, // Base value, can be adjusted by impact
  EDUCATION_ARTICLE_READ: 10,
};

// Tier thresholds
export const TIER_THRESHOLDS = {
  [RewardTier.BRONZE]: 0,
  [RewardTier.SILVER]: 100,
  [RewardTier.GOLD]: 500,
  [RewardTier.PLATINUM]: 1000,
};

class RewardsService {
  /**
   * Calculate the current tier based on total points
   */
  calculateTier(totalPoints: number): RewardTier {
    if (totalPoints >= TIER_THRESHOLDS[RewardTier.PLATINUM]) {
      return RewardTier.PLATINUM;
    } else if (totalPoints >= TIER_THRESHOLDS[RewardTier.GOLD]) {
      return RewardTier.GOLD;
    } else if (totalPoints >= TIER_THRESHOLDS[RewardTier.SILVER]) {
      return RewardTier.SILVER;
    }
    return RewardTier.BRONZE;
  }

  /**
   * Calculate points to next tier
   */
  calculatePointsToNextTier(totalPoints: number): number | null {
    const currentTier = this.calculateTier(totalPoints);
    
    const tiers = [
      RewardTier.BRONZE,
      RewardTier.SILVER,
      RewardTier.GOLD,
      RewardTier.PLATINUM,
    ];
    
    const currentIndex = tiers.indexOf(currentTier);
    if (currentIndex === tiers.length - 1) {
      return null; // Already at max tier
    }
    
    const nextTier = tiers[currentIndex + 1];
    return TIER_THRESHOLDS[nextTier] - totalPoints;
  }

  /**
   * Calculate points for a recommendation based on impact
   */
  calculateRecommendationPoints(potentialSavingsKwh: number): number {
    const basePoints = POINTS_CONFIG.RECOMMENDATION_COMPLETED;
    // Add bonus points based on savings (1 point per 10 kWh saved)
    const bonusPoints = Math.floor(potentialSavingsKwh / 10);
    return basePoints + bonusPoints;
  }

  /**
   * Get user rewards data
   */
  async getUserRewards(): Promise<UserRewards> {
    const response = await api.get<UserRewards>('/rewards/points');
    return response.data;
  }

  /**
   * Get earned badges
   */
  async getEarnedBadges(): Promise<Badge[]> {
    const response = await api.get<Badge[]>('/rewards/badges');
    return response.data;
  }

  /**
   * Get points transaction history
   */
  async getPointsHistory(limit?: number): Promise<PointsTransaction[]> {
    const response = await api.get<PointsTransaction[]>('/rewards/history', {
      params: { limit },
    });
    return response.data;
  }

  /**
   * Award points for an action
   */
  async awardPoints(award: PointsAward): Promise<UserRewards> {
    const response = await api.post<UserRewards>('/rewards/award', award);
    return response.data;
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(
    period: 'weekly' | 'monthly' | 'all-time' = 'all-time',
    limit: number = 10
  ): Promise<LeaderboardEntry[]> {
    const response = await api.get<LeaderboardEntry[]>('/rewards/leaderboard', {
      params: { period, limit },
    });
    return response.data;
  }

  /**
   * Update leaderboard consent
   */
  async updateLeaderboardConsent(consent: boolean): Promise<void> {
    await api.put('/rewards/leaderboard-consent', { consent });
  }

  /**
   * Get user's leaderboard rank
   */
  async getUserRank(
    period: 'weekly' | 'monthly' | 'all-time' = 'all-time'
  ): Promise<{ rank: number; totalUsers: number }> {
    const response = await api.get<{ rank: number; totalUsers: number }>(
      '/rewards/rank',
      { params: { period } }
    );
    return response.data;
  }
}

export default new RewardsService();
