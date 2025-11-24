import { useState, useEffect } from 'react';
import { useRewards } from '../../hooks/useRewards';
import { useTranslation } from '../../hooks/useTranslation';
import { Badge } from '../../types/rewards.types';
import LoadingSpinner from '../common/LoadingSpinner';

interface BadgeCardProps {
  badge: Badge;
  earned: boolean;
  earnedAt?: Date;
  showAnimation?: boolean;
}

const BadgeCard = ({ badge, earned, earnedAt, showAnimation }: BadgeCardProps) => {
  const { t } = useTranslation();
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (showAnimation && earned) {
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [showAnimation, earned]);

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'energy':
        return 'border-green-500';
      case 'recycling':
        return 'border-blue-500';
      case 'education':
        return 'border-purple-500';
      case 'milestone':
        return 'border-yellow-500';
      default:
        return 'border-gray-300';
    }
  };

  return (
    <div
      className={`relative p-4 rounded-lg border-2 transition-all duration-300 ${
        earned ? getCategoryColor(badge.category) : 'border-gray-200'
      } ${earned ? 'bg-white' : 'bg-gray-50 opacity-60'} ${
        animate ? 'scale-110 shadow-lg' : ''
      }`}
    >
      {/* Badge Icon */}
      <div className="flex justify-center mb-3">
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl ${
            earned ? 'bg-gradient-to-br from-yellow-200 to-yellow-400' : 'bg-gray-200'
          }`}
        >
          {badge.iconUrl || '🏆'}
        </div>
      </div>

      {/* Badge Name */}
      <h3
        className={`text-center font-semibold mb-1 ${
          earned ? 'text-gray-900' : 'text-gray-500'
        }`}
      >
        {badge.name}
      </h3>

      {/* Badge Description */}
      <p
        className={`text-xs text-center mb-2 ${
          earned ? 'text-gray-600' : 'text-gray-400'
        }`}
      >
        {badge.description}
      </p>

      {/* Earned Date or Lock Icon */}
      {earned && earnedAt ? (
        <div className="text-xs text-center text-green-600">
          {t('rewards.earnedOn')} {new Date(earnedAt).toLocaleDateString()}
        </div>
      ) : (
        <div className="text-center text-gray-400">
          <span className="text-lg">🔒</span>
          <div className="text-xs mt-1">
            {badge.pointsRequired} {t('rewards.pointsRequired')}
          </div>
        </div>
      )}

      {/* Animation overlay */}
      {animate && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-6xl animate-bounce">✨</div>
        </div>
      )}
    </div>
  );
};

const BadgeDisplay = () => {
  const { badges, rewards, loading } = useRewards();
  const { t } = useTranslation();

  // Mock all available badges (in real app, this would come from API)
  const allBadges: Badge[] = [
    {
      id: '1',
      name: t('rewards.badges.firstDevice'),
      description: t('rewards.badges.firstDeviceDesc'),
      iconUrl: '📱',
      category: 'milestone',
      pointsRequired: 10,
    },
    {
      id: '2',
      name: t('rewards.badges.energySaver'),
      description: t('rewards.badges.energySaverDesc'),
      iconUrl: '⚡',
      category: 'energy',
      pointsRequired: 100,
    },
    {
      id: '3',
      name: t('rewards.badges.recycler'),
      description: t('rewards.badges.recyclerDesc'),
      iconUrl: '♻️',
      category: 'recycling',
      pointsRequired: 50,
    },
    {
      id: '4',
      name: t('rewards.badges.scholar'),
      description: t('rewards.badges.scholarDesc'),
      iconUrl: '📚',
      category: 'education',
      pointsRequired: 50,
    },
    {
      id: '5',
      name: t('rewards.badges.champion'),
      description: t('rewards.badges.championDesc'),
      iconUrl: '🏆',
      category: 'milestone',
      pointsRequired: 500,
    },
    {
      id: '6',
      name: t('rewards.badges.ecoWarrior'),
      description: t('rewards.badges.ecoWarriorDesc'),
      iconUrl: '🌍',
      category: 'milestone',
      pointsRequired: 1000,
    },
  ];

  if (loading && !rewards) {
    return (
      <div className="flex justify-center items-center p-8">
        <LoadingSpinner />
      </div>
    );
  }

  const earnedBadgeIds = new Set(badges.map((b) => b.id));

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">
        {t('rewards.badges.title')}
      </h2>

      <div className="mb-4 text-gray-600">
        {t('rewards.badges.earned')}: {badges.length} / {allBadges.length}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {allBadges.map((badge) => {
          const earnedBadge = badges.find((b) => b.id === badge.id);
          return (
            <BadgeCard
              key={badge.id}
              badge={badge}
              earned={earnedBadgeIds.has(badge.id)}
              earnedAt={earnedBadge?.earnedAt}
            />
          );
        })}
      </div>
    </div>
  );
};

export default BadgeDisplay;
