import { useState, useEffect } from 'react'
import { useTranslation } from '../../hooks/useTranslation'
import { useAppSelector } from '../../hooks/useAppSelector'
import { impactService } from '../../services/impact.service'
import { EnvironmentalImpact, ImpactComparison } from '../../types/impact.types'
import { ImpactMetrics } from './ImpactMetrics'
import { ImpactChart } from './ImpactChart'
import LoadingSpinner from '../common/LoadingSpinner'
import Card from '../common/Card'

interface ImpactReportProps {
  comparisonPeriod?: 'month' | 'quarter' | 'year'
  onPeriodChange?: (period: 'month' | 'quarter' | 'year') => void
}

export function ImpactReport({
  comparisonPeriod = 'month',
  onPeriodChange,
}: ImpactReportProps) {
  const { t } = useTranslation()
  const { user } = useAppSelector((state) => state.auth)
  const devices = useAppSelector((state) => state.devices?.devices || [])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [impactData, setImpactData] = useState<ImpactComparison | null>(null)

  useEffect(() => {
    loadImpactData()
  }, [comparisonPeriod, user?.id, devices])

  const loadImpactData = async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      setError(null)

      const comparison = await impactService.getImpactComparison(
        user.id,
        devices,
        comparisonPeriod
      )

      setImpactData(comparison)
    } catch (err) {
      console.error('Error loading impact data:', err)
      setError(t('errors.generic'))
    } finally {
      setLoading(false)
    }
  }

  const handlePeriodChange = (period: 'month' | 'quarter' | 'year') => {
    if (onPeriodChange) {
      onPeriodChange(period)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <div className="text-center py-8">
          <p className="text-red-600">{error}</p>
          <button
            onClick={loadImpactData}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            {t('common.retry')}
          </button>
        </div>
      </Card>
    )
  }

  if (!impactData) {
    return (
      <Card>
        <div className="text-center py-8">
          <p className="text-gray-600">{t('dashboard.quickStats.noData')}</p>
        </div>
      </Card>
    )
  }

  const { current, previous, percentageChange } = impactData

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">{t('impact.report')}</h2>
        <div className="flex gap-2">
          {(['month', 'quarter', 'year'] as const).map((period) => (
            <button
              key={period}
              onClick={() => handlePeriodChange(period)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                comparisonPeriod === period
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {period === 'month' && t('energy.thisMonth')}
              {period === 'quarter' && 'Quarter'}
              {period === 'year' && 'Year'}
            </button>
          ))}
        </div>
      </div>

      {/* Sustainability Score */}
      <Card>
        <div className="text-center py-8">
          <p className="text-sm font-medium text-gray-600 mb-2">
            {t('impact.sustainabilityScore')}
          </p>
          <div className="relative inline-flex items-center justify-center">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-gray-200"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${(current.sustainabilityScore / 100) * 351.86} 351.86`}
                className="text-green-600"
              />
            </svg>
            <div className="absolute">
              <p className="text-4xl font-bold text-gray-900">
                {current.sustainabilityScore}
              </p>
              <p className="text-sm text-gray-600">/ 100</p>
            </div>
          </div>
          {percentageChange.sustainabilityScore !== 0 && (
            <p
              className={`mt-4 text-sm font-medium ${
                percentageChange.sustainabilityScore > 0
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}
            >
              {percentageChange.sustainabilityScore > 0 ? '↑' : '↓'}{' '}
              {Math.abs(percentageChange.sustainabilityScore).toFixed(1)}%{' '}
              {t('impact.comparison')}
            </p>
          )}
        </div>
      </Card>

      {/* Impact Metrics */}
      <ImpactMetrics
        metrics={{
          energySavedKwh: current.energySavedKwh,
          co2ReductionKg: current.co2ReductionKg,
          treesEquivalent: current.treesEquivalent,
          waterSavedLiters: current.waterSavedLiters,
        }}
      />

      {/* Devices Recycled */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">
              {t('impact.devicesRecycled')}
            </p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {current.devicesRecycled}
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <svg
              className="w-12 h-12 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </div>
        </div>
      </Card>

      {/* Progress Charts */}
      <ImpactChart current={current} previous={previous} period={comparisonPeriod} />
    </div>
  )
}
