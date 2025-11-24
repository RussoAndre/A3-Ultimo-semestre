import { useTranslation } from '../../hooks/useTranslation';
import Card from '../common/Card';
import type { UserBadge } from '../../types/rewards.types';

interface AchievementsListProps {
  badges: UserBadge[];
}

export function AchievementsList({ badges }: AchievementsListProps) {
  const { t } = useTranslation();

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getCategoryColor = (category: UserBadge['category']) => {
    switch (category) {
      case 'energy':
        return 'bg-green-100 text-green-800';
      case 'recycling':
        return 'bg-blue-100 text-blue-800';
      case 'education':
        return 'bg-purple-100 text-purple-800';
      case 'milestone':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: UserBadge['category']) => {
    switch (category) {
      case 'energy':
        return '⚡';
      case 'recycling':
        return '♻️';
      case 'education':
        return '📚';
      case 'milestone':
        return '🏆';
      default:
        return '✨';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">{t('profile.achievements')}</h3>
          <span className="text-sm text-gray-600">
            {badges.length} {t('rewards.badges')}
          </span>
        </div>

        {badges.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏆</div>
            <p className="text-gray-500 mb-2">{t('rewards.history.empty')}</p>
            <p className="text-sm text-gray-400">
              Complete actions to earn your first badge!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className="relative bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-6 border-2 border-green-200 hover:border-green-400 transition-colors"
              >
                {/* Badge Icon */}
                <div className="flex items-center justify-center mb-4">
                  {badge.iconUrl ? (
                    <img
                      src={badge.iconUrl}
                      alt={badge.name}
                      className="w-20 h-20 object-contain"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-4xl shadow-md">
                      {getCategoryIcon(badge.category)}
                    </div>
                  )}
                </div>

                {/* Badge Info */}
                <div className="text-center">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">{badge.name}</h4>
                  <p className="text-sm text-gray-600 mb-3">{badge.description}</p>

                  {/* Category Badge */}
                  <div className="flex items-center justify-center mb-3">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                        badge.category
                      )}`}
                    >
                      {badge.category.charAt(0).toUpperCase() + badge.category.slice(1)}
                    </span>
                  </div>

                  {/* Earned Date */}
                  <div className="text-xs text-gray-500">
                    {t('rewards.earnedOn')} {formatDate(badge.earnedAt)}
                  </div>

                  {/* Points Required */}
                  {badge.pointsRequired > 0 && (
                    <div className="mt-2 text-xs text-green-600 font-medium">
                      {badge.pointsRequired} {t('rewards.pointsRequired')}
                    </div>
                  )}
                </div>

                {/* Shine Effect */}
                <div className="absolute top-2 right-2">
                  <div className="w-6 h-6 bg-yellow-400 rounded-full opacity-50 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Badge Categories Summary */}
      {badges.length > 0 && (
        <Card>
          <h4 className="text-base font-semibold text-gray-900 mb-4">
            {t('rewards.badges.title')} by Category
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(['energy', 'recycling', 'education', 'milestone'] as const).map((category) => {
              const count = badges.filter((b) => b.category === category).length;
              return (
                <div key={category} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-3xl mb-2">{getCategoryIcon(category)}</div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">{count}</div>
                  <div className="text-xs text-gray-600 capitalize">{category}</div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
