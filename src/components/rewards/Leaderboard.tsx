import { useState, useEffect } from 'react';
import { useRewards } from '../../hooks/useRewards';
import { useTranslation } from '../../hooks/useTranslation';
import LoadingSpinner from '../common/LoadingSpinner';

type TimePeriod = 'weekly' | 'monthly' | 'all-time';

const Leaderboard = () => {
  const { leaderboard, loading, fetchLeaderboard, updateLeaderboardConsent } =
    useRewards();
  const { t } = useTranslation();
  const [period, setPeriod] = useState<TimePeriod>('all-time');
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [hasConsent, setHasConsent] = useState(true); // In real app, get from user profile

  useEffect(() => {
    if (hasConsent) {
      fetchLeaderboard(period);
    }
  }, [period, hasConsent, fetchLeaderboard]);

  const handleConsentChange = async (consent: boolean) => {
    try {
      await updateLeaderboardConsent(consent);
      setHasConsent(consent);
      setShowConsentModal(false);
      if (consent) {
        fetchLeaderboard(period);
      }
    } catch (error) {
      console.error('Failed to update consent:', error);
    }
  };

  const getRankMedal = (rank: number): string => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${rank}`;
    }
  };

  const getRankColor = (rank: number): string => {
    switch (rank) {
      case 1:
        return 'text-yellow-600 bg-yellow-50';
      case 2:
        return 'text-gray-600 bg-gray-50';
      case 3:
        return 'text-amber-700 bg-amber-50';
      default:
        return 'text-gray-700 bg-white';
    }
  };

  if (!hasConsent) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          {t('rewards.leaderboard.title')}
        </h2>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏆</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {t('rewards.leaderboard.consentRequired')}
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {t('rewards.leaderboard.consentMessage')}
          </p>
          <button
            onClick={() => handleConsentChange(true)}
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            {t('rewards.leaderboard.joinLeaderboard')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">
          {t('rewards.leaderboard.title')}
        </h2>
        <button
          onClick={() => setShowConsentModal(true)}
          className="text-sm text-gray-600 hover:text-gray-800"
        >
          {t('rewards.leaderboard.privacySettings')}
        </button>
      </div>

      {/* Period Filter */}
      <div className="flex space-x-2 mb-6">
        <button
          onClick={() => setPeriod('weekly')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            period === 'weekly'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {t('rewards.leaderboard.weekly')}
        </button>
        <button
          onClick={() => setPeriod('monthly')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            period === 'monthly'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {t('rewards.leaderboard.monthly')}
        </button>
        <button
          onClick={() => setPeriod('all-time')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            period === 'all-time'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {t('rewards.leaderboard.allTime')}
        </button>
      </div>

      {/* Leaderboard List */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner />
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-2">🏆</div>
          <p>{t('rewards.leaderboard.empty')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {leaderboard.map((entry) => (
            <div
              key={entry.userId}
              className={`flex items-center justify-between p-4 rounded-lg transition-all ${
                entry.isCurrentUser
                  ? 'bg-green-50 border-2 border-green-500'
                  : getRankColor(entry.rank)
              }`}
            >
              <div className="flex items-center space-x-4 flex-1">
                {/* Rank */}
                <div className="w-12 text-center">
                  <span className="text-2xl font-bold">
                    {getRankMedal(entry.rank)}
                  </span>
                </div>

                {/* Username */}
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">
                    {entry.username}
                    {entry.isCurrentUser && (
                      <span className="ml-2 text-sm text-green-600">
                        ({t('rewards.leaderboard.you')})
                      </span>
                    )}
                  </div>
                </div>

                {/* Points */}
                <div className="text-right">
                  <div className="text-xl font-bold text-green-600">
                    {entry.totalPoints.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {t('rewards.points')}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Consent Modal */}
      {showConsentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {t('rewards.leaderboard.privacySettings')}
            </h3>
            <p className="text-gray-600 mb-6">
              {t('rewards.leaderboard.privacyMessage')}
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => handleConsentChange(false)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                {t('rewards.leaderboard.hideMe')}
              </button>
              <button
                onClick={() => setShowConsentModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
