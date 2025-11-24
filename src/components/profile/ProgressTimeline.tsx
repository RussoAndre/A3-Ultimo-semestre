import { useTranslation } from '../../hooks/useTranslation';
import Card from '../common/Card';
import type { Milestone, ProgressMetrics } from '../../types/profile.types';

interface ProgressTimelineProps {
  milestones: Milestone[];
  progressMetrics: ProgressMetrics | null;
}

export function ProgressTimeline({ milestones, progressMetrics }: ProgressTimelineProps) {
  const { t } = useTranslation();

  const getMilestoneIcon = (type: Milestone['type']) => {
    switch (type) {
      case 'device':
        return '📱';
      case 'energy':
        return '⚡';
      case 'recycling':
        return '♻️';
      case 'education':
        return '📚';
      case 'points':
        return '🏆';
      case 'streak':
        return '🔥';
      default:
        return '✨';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Progress Metrics Summary */}
      {progressMetrics && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('profile.statistics')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">{t('profile.totalEnergySaved')}</span>
                <span className="text-lg font-semibold text-green-600">
                  {progressMetrics.totalEnergySavedKwh.toFixed(2)} kWh
                </span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">{t('profile.co2Reduced')}</span>
                <span className="text-lg font-semibold text-blue-600">
                  {progressMetrics.totalCO2ReductionKg.toFixed(2)} kg
                </span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">{t('profile.devicesRegistered')}</span>
                <span className="text-lg font-semibold text-gray-900">
                  {progressMetrics.devicesRegistered}
                </span>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">{t('profile.currentStreak')}</span>
                <span className="text-lg font-semibold text-orange-600">
                  {progressMetrics.currentStreak} {t('profile.days')}
                </span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">{t('profile.longestStreak')}</span>
                <span className="text-lg font-semibold text-orange-600">
                  {progressMetrics.longestStreak} {t('profile.days')}
                </span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">{t('profile.articlesRead')}</span>
                <span className="text-lg font-semibold text-gray-900">
                  {progressMetrics.articlesRead}
                </span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Milestones Timeline */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-6">{t('profile.milestones')}</h3>
        
        {milestones.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">{t('profile.noMilestones')}</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200" />

            {/* Milestones */}
            <div className="space-y-6">
              {milestones.map((milestone, index) => (
                <div key={milestone.id} className="relative flex items-start">
                  {/* Icon */}
                  <div className="flex-shrink-0 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-2xl z-10">
                    {getMilestoneIcon(milestone.type)}
                  </div>

                  {/* Content */}
                  <div className="ml-6 flex-1">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-base font-semibold text-gray-900 mb-1">
                            {milestone.title}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">{milestone.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>{formatDate(milestone.achievedAt)}</span>
                            <span className="flex items-center">
                              <span className="text-green-600 font-medium">
                                +{milestone.points} {t('rewards.points')}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
