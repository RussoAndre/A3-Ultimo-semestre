import { useMemo, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { useDailyConsumption } from '../../hooks/useEnergyData'
import LoadingSpinner from '../common/LoadingSpinner'
import { useTranslation } from '../../hooks/useTranslation'
import { DeviceType } from '../../types/device.types'

interface EnergyChartProps {
  days?: number
  deviceType?: DeviceType
  deviceId?: string
}

export function EnergyChart({ days = 30, deviceType, deviceId }: EnergyChartProps) {
  const { t } = useTranslation()
  const [period, setPeriod] = useState<30 | 7 | 90>(days as 30 | 7 | 90)
  
  const { data: consumptionData, isLoading, error } = useDailyConsumption(period)

  // Format data for the chart
  const chartData = useMemo(() => {
    if (!consumptionData) return []

    return consumptionData.map(item => ({
      date: formatDate(item.date),
      fullDate: item.date,
      consumption: Number(item.totalKwh.toFixed(2)),
    }))
  }, [consumptionData])

  // Calculate statistics
  const stats = useMemo(() => {
    if (!consumptionData || consumptionData.length === 0) {
      return { total: 0, average: 0, peak: 0 }
    }

    const total = consumptionData.reduce((sum, item) => sum + item.totalKwh, 0)
    const average = total / consumptionData.length
    const peak = Math.max(...consumptionData.map(item => item.totalKwh))

    return {
      total: Number(total.toFixed(2)),
      average: Number(average.toFixed(2)),
      peak: Number(peak.toFixed(2)),
    }
  }, [consumptionData])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">
          {t('dashboard.energyChart.error', 'Error loading energy data')}
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      {/* Header with title and period selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-0">
          {t('dashboard.energyChart.title', 'Energy Consumption Trend')}
        </h2>
        
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setPeriod(7)}
            className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap min-h-[44px] ${
              period === 7
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t('dashboard.energyChart.7days', '7 Days')}
          </button>
          <button
            onClick={() => setPeriod(30)}
            className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap min-h-[44px] ${
              period === 30
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t('dashboard.energyChart.30days', '30 Days')}
          </button>
          <button
            onClick={() => setPeriod(90)}
            className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap min-h-[44px] ${
              period === 90
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t('dashboard.energyChart.90days', '90 Days')}
          </button>
        </div>
      </div>

      {/* Statistics cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-green-50 rounded-lg p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-gray-600 mb-1">
            {t('dashboard.energyChart.totalConsumption', 'Total Consumption')}
          </p>
          <p className="text-xl sm:text-2xl font-bold text-green-700">{stats.total} kWh</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-gray-600 mb-1">
            {t('dashboard.energyChart.averageDaily', 'Average Daily')}
          </p>
          <p className="text-xl sm:text-2xl font-bold text-blue-700">{stats.average} kWh</p>
        </div>
        <div className="bg-amber-50 rounded-lg p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-gray-600 mb-1">
            {t('dashboard.energyChart.peakDay', 'Peak Day')}
          </p>
          <p className="text-xl sm:text-2xl font-bold text-amber-700">{stats.peak} kWh</p>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full" style={{ height: '300px', minHeight: '250px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              stroke="#6b7280"
              style={{ fontSize: '10px' }}
              tick={{ fill: '#6b7280' }}
              interval="preserveStartEnd"
            />
            <YAxis
              stroke="#6b7280"
              style={{ fontSize: '10px' }}
              tick={{ fill: '#6b7280' }}
              width={40}
              label={{
                value: 'kWh',
                angle: -90,
                position: 'insideLeft',
                style: { fill: '#6b7280', fontSize: '10px' },
              }}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: '#10b981', strokeWidth: 1 }}
            />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="line"
            />
            <Line
              type="monotone"
              dataKey="consumption"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: '#10b981', r: 4 }}
              activeDot={{ r: 6 }}
              name={t('dashboard.energyChart.consumption', 'Consumption (kWh)')}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Empty state */}
      {chartData.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {t('dashboard.energyChart.noData', 'No consumption data available for this period')}
          </p>
        </div>
      )}
    </div>
  )
}

// Custom tooltip component
function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <p className="text-sm font-medium text-gray-900 mb-1">{data.fullDate}</p>
        <p className="text-sm text-green-600">
          <span className="font-semibold">{data.consumption} kWh</span>
        </p>
      </div>
    )
  }
  return null
}

// Helper function to format date for display
function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${month}/${day}`
}
