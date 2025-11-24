import { useState, useEffect, useCallback } from 'react';
import rewardsService, { POINTS_CONFIG } from '../services/rewards.service';
import {
  UserRewards,
  Badge,
  PointsTransaction,
  LeaderboardEntry,
  PointsAward,
} from '../types/rewards.types';

interface UseRewardsReturn {
  rewards: UserRewards | null;
  badges: Badge[];
  pointsHistory: PointsTransaction[];
  leaderboard: LeaderboardEntry[];
  loading: boolean;
  error: string | null;
  refreshRewards: () => Promise<void>;
  awardPoints: (award: PointsAward) => Promise<void>;
  fetchLeaderboard: (
    period?: 'weekly' | 'monthly' | 'all-time',
    limit?: number
  ) => Promise<void>;
  updateLeaderboardConsent: (consent: boolean) => Promise<void>;
  pointsToNextTier: number | null;
}

export const useRewards = (): UseRewardsReturn => {
  const [rewards, setRewards] = useState<UserRewards | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [pointsHistory, setPointsHistory] = useState<PointsTransaction[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshRewards = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [rewardsData, badgesData, historyData] = await Promise.all([
        rewardsService.getUserRewards(),
        rewardsService.getEarnedBadges(),
        rewardsService.getPointsHistory(10),
      ]);
      setRewards(rewardsData);
      setBadges(badgesData);
      setPointsHistory(historyData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch rewards');
      console.error('Error fetching rewards:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const awardPoints = useCallback(
    async (award: PointsAward) => {
      try {
        setError(null);
        const updatedRewards = await rewardsService.awardPoints(award);
        setRewards(updatedRewards);
        // Refresh history to show new transaction
        const historyData = await rewardsService.getPointsHistory(10);
        setPointsHistory(historyData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to award points');
        console.error('Error awarding points:', err);
        throw err;
      }
    },
    []
  );

  const fetchLeaderboard = useCallback(
    async (
      period: 'weekly' | 'monthly' | 'all-time' = 'all-time',
      limit: number = 10
    ) => {
      try {
        setLoading(true);
        setError(null);
        const leaderboardData = await rewardsService.getLeaderboard(
          period,
          limit
        );
        setLeaderboard(leaderboardData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch leaderboard'
        );
        console.error('Error fetching leaderboard:', err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateLeaderboardConsent = useCallback(async (consent: boolean) => {
    try {
      setError(null);
      await rewardsService.updateLeaderboardConsent(consent);
      // Refresh rewards to get updated consent status
      await refreshRewards();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to update consent'
      );
      console.error('Error updating leaderboard consent:', err);
      throw err;
    }
  }, [refreshRewards]);

  useEffect(() => {
    refreshRewards();
  }, [refreshRewards]);

  const pointsToNextTier = rewards
    ? rewardsService.calculatePointsToNextTier(rewards.totalPoints)
    : null;

  return {
    rewards,
    badges,
    pointsHistory,
    leaderboard,
    loading,
    error,
    refreshRewards,
    awardPoints,
    fetchLeaderboard,
    updateLeaderboardConsent,
    pointsToNextTier,
  };
};

export { POINTS_CONFIG };
