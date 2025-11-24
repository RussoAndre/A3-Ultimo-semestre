import { useRewards } from '../../hooks/useRewards';
import { useTranslation } from '../../hooks/useTranslation';
import { RewardTier } from '../../types/rewards.types';
import { TIER_THRESHOLDS } from '../../services/rewards.service';
import LoadingSpinner from '../common/LoadingSpinner';

const RewardsPanel = () => {
  const { rewards, loading, pointsToNextTier } = useRewards();
  const { t } = useTranslation();

  if (loading && !rewards) {
    return (
      <div className="flex justify-center items-center p-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (!rewards) {
    return null;
  }

  const getTierColor = (tier: RewardTier): string => {
    switch (tier) {
      case RewardTier.BRONZE:
        return 'text-amber-700 bg-amber-100';
      case RewardTier.SILVER:
        return 'text-gray-700 bg-gray-200';
      case RewardTier.GOLD:
        return 'text-yellow-700 bg-yellow-100';
      case RewardTier.PLATINUM:
        return 'text-purple-700 bg-purple-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  const getTierIcon = (tier: RewardTier): string => {
    switch (tier) {
      case RewardTier.BRONZE:
        return '🥉';
      case RewardTier.SILVER:
        return '🥈';
      case RewardTier.GOLD:
        return '🥇';
      case RewardTier.PLATINUM:
        return '💎';
      default:
        return '🏆';
    }
  };

  const calculateProgress = (): number => {
    const currentTier = rewards.currentTier;
    const tiers = [
      RewardTier.BRONZE,
      RewardTier.SILVER,
      RewardTier.GOLD,
      RewardTier.PLATINUM,
    ];
    const currentIndex = tiers.indexOf(currentTier);

    if (currentIndex === tiers.length - 1) {
      return 100; // Max tier reached
    }

    const currentThreshold = TIER_THRESHOLDS[currentTier];
    const nextTier = tiers[currentIndex + 1];
    const nextThreshold = TIER_THRESHOLDS[nextTier];
    const tierRange = nextThreshold - currentThreshold;
    const pointsInTier = rewards.totalPoints - currentThreshold;

    return (pointsInTier / tierRange) * 100;
  };

  const progress = calculateProgress();

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6">
        {t('rewards.title')}
      </h2>

      {/* Points Display */}
      <div className="text-center mb-4 sm:mb-6">
        <div className="text-4xl sm:text-5xl font-bold text-green-600 mb-2">
          {rewards.totalPoints.toLocaleString()}
        </div>
        <div className="text-sm sm:text-base text-gray-600">{t('rewards.totalPoints')}</div>
      </div>

      {/* Current Tier */}
      <div className="flex items-center justify-center mb-4 sm:mb-6">
        <div
          className={`inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 rounded-full text-base sm:text-lg font-semibold ${getTierColor(
            rewards.currentTier
          )}`}
        >
          <span className="text-xl sm:text-2xl mr-2">{getTierIcon(rewards.currentTier)}</span>
          <span className="capitalize">{rewards.currentTier} {t('rewards.tier')}</span>
        </div>
      </div>

      {/* Progress to Next Tier */}
      {pointsToNextTier !== null && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>{t('rewards.progressToNext')}</span>
            <span>
              {pointsToNextTier} {t('rewards.pointsRemaining')}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-green-500 to-blue-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {pointsToNextTier === null && (
        <div className="text-center text-green-600 font-semibold">
          🎉 {t('rewards.maxTierReached')}
        </div>
      )}
    </div>
  );
};

export default RewardsPanel;
