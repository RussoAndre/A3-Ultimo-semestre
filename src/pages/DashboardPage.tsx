import { useEffect, useCallback } from 'react'
import { Layout } from '../components/common'
import { useTranslation } from '../hooks/useTranslation'
import { useAuth } from '../hooks/useAuth'
import { useDevices } from '../hooks/useDevices'
import { useRecommendations } from '../hooks/useRecommendations'
import { DeviceList } from '../components/devices'
import { EnergyChart, QuickStats, ConsumptionBreakdown, TopDevices } from '../components/dashboard'
import { RecommendationCard } from '../components/recommendations'
import LoadingSpinner from '../components/common/LoadingSpinner'
import Button from '../components/common/Button'

const DashboardPage = () => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { devices, loading: devicesLoading, loadDevices } = useDevices()
  const {
    recommendations,
    loading: recommendationsLoading,
    completeRecommendation,
    refreshRecommendations,
    generateLocalRecommendations,
  } = useRecommendations()

  // Load devices on mount
  useEffect(() => {
    loadDevices()
  }, [loadDevices])

  // Generate local recommendations when devices change
  useEffect(() => {
    if (devices.length > 0) {
      generateLocalRecommendations(devices)
    }
  }, [devices, generateLocalRecommendations])

  const hasDevices = devices.length > 0

  // Get top 3 recommendations sorted by priority
  const topRecommendations = recommendations
    .filter((rec) => !rec.completed)
    .slice(0, 3)

  const handleCompleteRecommendation = useCallback(
    async (recommendationId: string) => {
      try {
        await completeRecommendation(recommendationId)
        // Optionally refresh recommendations after completion
        // await refreshRecommendations()
      } catch (error) {
        console.error('Error completing recommendation:', error)
      }
    },
    [completeRecommendation]
  )

  const handleRefreshRecommendations = useCallback(async () => {
    await refreshRecommendations()
  }, [refreshRecommendations])

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 break-words">
            {t('dashboard.welcome', 'Welcome')}, {user?.email}!
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600">
            {t('dashboard.subtitle', 'Track your energy consumption and environmental impact')}
          </p>
        </div>

        {/* Loading state for initial data fetch */}
        {devicesLoading && devices.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            {/* Quick Stats Section */}
            {hasDevices && <QuickStats />}

            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Energy Chart - Full width on mobile, half on desktop */}
              {hasDevices && (
                <div className="lg:col-span-2">
                  <EnergyChart />
                </div>
              )}

              {/* Device List */}
              <div className={hasDevices ? '' : 'lg:col-span-2'}>
                <DeviceList />
              </div>

              {/* Recommendations Section - Only show if has devices */}
              {hasDevices && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {t('recommendations.title', 'Recommendations')}
                    </h2>
                    <Button
                      onClick={handleRefreshRecommendations}
                      variant="secondary"
                      disabled={recommendationsLoading}
                      className="text-sm"
                    >
                      {recommendationsLoading ? t('common.loading') : '🔄 Refresh'}
                    </Button>
                  </div>

                  {recommendationsLoading && topRecommendations.length === 0 ? (
                    <div className="flex items-center justify-center py-8">
                      <LoadingSpinner />
                    </div>
                  ) : topRecommendations.length > 0 ? (
                    <div className="space-y-4">
                      {topRecommendations.map((recommendation) => (
                        <RecommendationCard
                          key={recommendation.id}
                          recommendation={recommendation}
                          onComplete={handleCompleteRecommendation}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                          className="w-8 h-8 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {t('recommendations.noRecommendations', 'No recommendations available')}
                      </h3>
                      <p className="text-gray-600">
                        {t('recommendations.checkBackLater', 'Check back later for personalized tips')}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Secondary Dashboard Grid - Only show if has devices */}
            {hasDevices && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Consumption Breakdown */}
                <ConsumptionBreakdown />

                {/* Top Devices */}
                <TopDevices />
              </div>
            )}

            {/* Empty State - Show when no devices */}
            {!hasDevices && (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {t('dashboard.emptyState.title', 'Start Your Energy Journey')}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {t(
                      'dashboard.emptyState.description',
                      'Add your first device to start tracking your energy consumption and earn rewards for sustainable practices!'
                    )}
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  )
}

export default DashboardPage
