import { useTranslation } from '../../hooks/useTranslation'
import { EnvironmentalImpact } from '../../types/impact.types'
import Card from '../common/Card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface ImpactChartProps {
  current: EnvironmentalImpact
  previous: EnvironmentalImpact
  period: 'month' | 'quarter' | 'year'
}

export function ImpactChart({ current, previous, period }: ImpactChartProps) {
  const { t } = useTranslation()

  const getPeriodLabel = (isPrevious: boolean) => {
    if (period === 'month') {
      return isPrevious ? t('energy.lastMonth') : t('energy.thisMonth')
    }
    if (period === 'quarter') {
      return isPrevious ? 'Previous Quarter' : 'Current Quarter'
    }
    return isPrevious ? 'Previous Year' : 'Current Year'
  }

  const chartData = [
    {
      name: getPeriodLabel(true),
      energySaved: Math.max(0, previous.energySavedKwh),
      co2Reduction: previous.co2ReductionKg,
      devicesRecycled: previous.devicesRecycled,
    },
    {
      name: getPeriodLabel(false),
      energySaved: Math.max(0, current.energySavedKwh),
      co2Reduction: current.co2ReductionKg,
      devicesRecycled: current.devicesRecycled,
    },
  ]

  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {t('impact.comparison')}
      </h3>

      <div className="space-y-8">
        {/* Energy Saved Chart */}
        <div>
          <p className="text-sm font-medium text-gray-600 mb-3">
            {t('impact.energySaved')} (kWh)
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="energySaved" fill="#10B981" name={t('impact.energySaved')} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* CO2 Reduction Chart */}
        <div>
          <p className="text-sm font-medium text-gray-600 mb-3">
            {t('impact.co2Reduction')} (kg)
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="co2Reduction" fill="#3B82F6" name={t('impact.co2Reduction')} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Devices Recycled Chart */}
        <div>
          <p className="text-sm font-medium text-gray-600 mb-3">
            {t('impact.devicesRecycled')}
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar
                dataKey="devicesRecycled"
                fill="#059669"
                name={t('impact.devicesRecycled')}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  )
}
