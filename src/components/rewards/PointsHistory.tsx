import { useRewards } from '../../hooks/useRewards';
import { useTranslation } from '../../hooks/useTranslation';
import LoadingSpinner from '../common/LoadingSpinner';

const PointsHistory = () => {
  const { pointsHistory, loading } = useRewards();
  const { t } = useTranslation();

  if (loading && pointsHistory.length === 0) {
    return (
      <div className="flex justify-center items-center p-8">
        <LoadingSpinner />
      </div>
    );
  }

  const getActionIcon = (actionType: string): string => {
    if (actionType.includes('device')) return '📱';
    if (actionType.includes('disposal') || actionType.includes('recycl')) return '♻️';
    if (actionType.includes('recommendation')) return '💡';
    if (actionType.includes('education') || actionType.includes('article')) return '📚';
    return '⭐';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">
        {t('rewards.history.title')}
      </h2>

      {pointsHistory.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">🎯</div>
          <p>{t('rewards.history.empty')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pointsHistory.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3 flex-1">
                <div className="text-2xl">{getActionIcon(transaction.actionType)}</div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {transaction.description}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(transaction.createdAt).toLocaleDateString()} •{' '}
                    {new Date(transaction.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
              <div
                className={`text-lg font-bold ${
                  transaction.points > 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {transaction.points > 0 ? '+' : ''}
                {transaction.points}
              </div>
            </div>
          ))}
        </div>
      )}

      {pointsHistory.length > 0 && (
        <div className="mt-4 text-center">
          <button
            className="text-green-600 hover:text-green-700 font-medium text-sm"
            onClick={() => {
              // In real app, this would load more history
              console.log('Load more history');
            }}
          >
            {t('rewards.history.viewAll')}
          </button>
        </div>
      )}
    </div>
  );
};

export default PointsHistory;
