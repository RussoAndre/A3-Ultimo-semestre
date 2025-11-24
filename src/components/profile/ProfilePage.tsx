import { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useProfile } from '../../hooks/useProfile';
import { useRewards } from '../../hooks/useRewards';
import LoadingSpinner from '../common/LoadingSpinner';
import Card from '../common/Card';
import { ProgressTimeline } from './ProgressTimeline';
import { AchievementsList } from './AchievementsList';
import { SettingsForm } from './SettingsForm';
import { calculateDaysActive, calculateSustainabilityScore } from '../../utils/progressCalculations';

export function ProfilePage() {
  const { t } = useTranslation();
  const { profile, progressMetrics, milestones, isLoading, fetchProgressMetrics, fetchMilestones } = useProfile();
  const { rewards } = useRewards();
  const [activeTab, setActiveTab] = useState<'progress' | 'achievements' | 'settings'>('progress');

  useEffect(() => {
    fetchProgressMetrics();
    fetchMilestones();
  }, [fetchProgressMetrics, fetchMilestones]);

  if (isLoading && !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">{t('errors.generic')}</p>
      </div>
    );
  }

  const daysActive = calculateDaysActive(profile.createdAt);
  const sustainabilityScore = progressMetrics ? calculateSustainabilityScore(progressMetrics) : 0;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-8">
      {/* Profile Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{t('profile.myProfile')}</h1>
        <p className="text-sm sm:text-base text-gray-600 break-words">{profile.email}</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
        <Card className="p-4 sm:p-6">
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1">
              {progressMetrics?.totalPoints || 0}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">{t('rewards.totalPoints')}</div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1">{daysActive}</div>
            <div className="text-xs sm:text-sm text-gray-600">{t('profile.daysActive')}</div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1">
              {progressMetrics?.totalEnergySavedKwh.toFixed(1) || '0.0'}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">{t('profile.totalEnergySaved')} (kWh)</div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-emerald-600 mb-1">{sustainabilityScore}</div>
            <div className="text-xs sm:text-sm text-gray-600">{t('profile.sustainabilityScore')}</div>
          </div>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <Card className="p-3 sm:p-4">
          <div className="text-xl sm:text-2xl font-semibold text-gray-900 mb-1">
            {progressMetrics?.devicesRegistered || 0}
          </div>
          <div className="text-xs text-gray-600">{t('profile.devicesRegistered')}</div>
        </Card>

        <Card className="p-3 sm:p-4">
          <div className="text-xl sm:text-2xl font-semibold text-gray-900 mb-1">
            {progressMetrics?.devicesRecycled || 0}
          </div>
          <div className="text-xs text-gray-600">{t('profile.devicesRecycled')}</div>
        </Card>

        <Card className="p-3 sm:p-4">
          <div className="text-xl sm:text-2xl font-semibold text-gray-900 mb-1">
            {progressMetrics?.recommendationsCompleted || 0}
          </div>
          <div className="text-xs text-gray-600">{t('profile.recommendationsCompleted')}</div>
        </Card>

        <Card className="p-3 sm:p-4">
          <div className="text-xl sm:text-2xl font-semibold text-gray-900 mb-1">
            {progressMetrics?.articlesRead || 0}
          </div>
          <div className="text-xs text-gray-600">{t('profile.articlesRead')}</div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6 overflow-x-auto">
        <nav className="-mb-px flex space-x-4 sm:space-x-8">
          <button
            onClick={() => setActiveTab('progress')}
            className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap min-h-[44px] ${
              activeTab === 'progress'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {t('profile.progress')}
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap min-h-[44px] ${
              activeTab === 'achievements'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {t('profile.achievements')}
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap min-h-[44px] ${
              activeTab === 'settings'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {t('profile.settings')}
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'progress' && (
          <ProgressTimeline milestones={milestones} progressMetrics={progressMetrics} />
        )}
        {activeTab === 'achievements' && <AchievementsList badges={rewards?.badges || []} />}
        {activeTab === 'settings' && <SettingsForm profile={profile} />}
      </div>
    </div>
  );
}
