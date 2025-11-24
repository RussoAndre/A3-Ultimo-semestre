import { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { useConsumptionByType } from '../../hooks/useEnergyData'
import { useTranslation } from '../../hooks/useTranslation'
import LoadingSpinner from '../common/LoadingSpinner'
import { getDateRange, formatDateToISO } from '../../utils/energyCalculations'
import { DeviceType } from '../../types/device.types'

const COLORS: Record<DeviceType, string> = {
  [DeviceType.COMPUTER]: '#3B82F6',
  [DeviceType.MONITOR]: '#10B981',
  [DeviceType.PRINTER]: '#F59E0B',
  [DeviceType.APPLIANCE]: '#EF4444',
  [DeviceType.LIGHTING]: '#8B5CF6',
  [DeviceType.OTHER]: '#6B7280',
}

export function ConsumptionBreakdown() {
  const { t } = useTranslation()
  
  // Get last 30 days data
  const dateRange = useMemo(() => {
    const { startDate, endDate } = getDateRange(30)
    return {
      startDate: formatDateToISO(startDate),
      endDate: formatDateToISO(endDate),
    }
  }, [])

  const { data: consumptionByType, isLoading, error } = useConsumptionByType(dateRange)

  // Format data for the pie chart
  const chartData = useMemo(() => {
    if (!consumptionByType) return []

    return consumptionByType
      .filter(item => item.totalKwh > 0)
      .map(item => ({
        name: t(`devices.types.${item.type}`, item.type),
        value: Number(item.totalKwh.toFixed(2)),
        percentage: item.percentage,
        type: item.type,
      }))
  }, [consumptionByType, t])

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">
            {t('dashboard.consumptionBreakdown.error', 'Error loading consumption breakdown')}
          </p>
        </div>
      </div>
    )
  }

  if (!chartData || chartData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          {t('dashboard.consumptionBreakdown.title', 'Consumption by Device Type')}
        </h2>
        <div className="text-center py-12">
          <p className="text-gray-500">
            {t('dashboard.consumptionBreakdown.noData', 'No consumption data available')}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        {t('dashboard.consumptionBreakdown.title', 'Consumption by Device Type')}
      </h2>

      <div className="flex flex-col lg:flex-row items-center gap-8">
        {/* Pie Chart */}
        <div className="w-full lg:w-1/2" style={{ height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.type as DeviceType]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend with details */}
        <div className="w-full lg:w-1/2">
          <div className="space-y-3">
            {chartData.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: COLORS[item.type as DeviceType] }}
                  />
                  <span className="text-sm font-medium text-gray-700">{item.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{item.value} kWh</p>
                  <p className="text-xs text-gray-500">{item.percentage.toFixed(1)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Custom label for pie chart
function renderCustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) {
  const RADIAN = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  if (percent < 0.05) return null // Don't show label for small slices

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      className="text-xs font-semibold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

// Custom tooltip
function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <p className="text-sm font-medium text-gray-900 mb-1">{data.name}</p>
        <p className="text-sm text-green-600">
          <span className="font-semibold">{data.value} kWh</span>
        </p>
        <p className="text-xs text-gray-500">{data.percentage.toFixed(1)}% of total</p>
      </div>
    )
  }
  return null
}
