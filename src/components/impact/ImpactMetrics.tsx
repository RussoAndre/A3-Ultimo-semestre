import { useTranslation } from '../../hooks/useTranslation'
import { ImpactMetrics as ImpactMetricsType } from '../../types/impact.types'
import { formatCO2, formatTrees, formatWater } from '../../utils/impactCalculations'
import { formatEnergyConsumption } from '../../utils/energyCalculations'

interface ImpactMetricsProps {
  metrics: ImpactMetricsType
  className?: string
}

export function ImpactMetrics({ metrics, className = '' }: ImpactMetricsProps) {
  const { t } = useTranslation()

  const metricCards = [
    {
      key: 'energy',
      label: t('impact.energySaved'),
      value: formatEnergyConsumption(metrics.energySavedKwh, 2),
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
      color: 'text-yellow-600 bg-yellow-50',
    },
    {
      key: 'co2',
      label: t('impact.co2Reduction'),
      value: formatCO2(metrics.co2ReductionKg, 2),
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
          />
        </svg>
      ),
      color: 'text-blue-600 bg-blue-50',
    },
    {
      key: 'trees',
      label: t('impact.treesEquivalent'),
      value: formatTrees(metrics.treesEquivalent, 1),
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
          />
        </svg>
      ),
      color: 'text-green-600 bg-green-50',
    },
    {
      key: 'water',
      label: t('impact.waterSaved'),
      value: formatWater(metrics.waterSavedLiters, 0),
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
      ),
      color: 'text-cyan-600 bg-cyan-50',
    },
  ]

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 ${className}`}>
      {metricCards.map((metric) => (
        <div
          key={metric.key}
          className="bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-200 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-2">{metric.label}</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 break-words">{metric.value}</p>
            </div>
            <div className={`p-2 sm:p-3 rounded-lg ${metric.color} flex-shrink-0`}>{metric.icon}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
