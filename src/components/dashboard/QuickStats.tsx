import { useMemo } from 'react'
import { useConsumptionSummary } from '../../hooks/useEnergyData'
import { useTranslation } from '../../hooks/useTranslation'
import LoadingSpinner from '../common/LoadingSpinner'
import { formatDateToISO } from '../../utils/energyCalculations'

export function QuickStats() {
    const { t } = useTranslation()

    // Get current month data
    const currentMonthRange = useMemo(() => {
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        return {
            startDate: formatDateToISO(startOfMonth),
            endDate: formatDateToISO(endOfMonth),
        }
    }, [])

    // Get previous month data for comparison
    const previousMonthRange = useMemo(() => {
        const now = new Date()
        const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0)
        return {
            startDate: formatDateToISO(startOfPrevMonth),
            endDate: formatDateToISO(endOfPrevMonth),
        }
    }, [])

    const { data: currentSummary, isLoading: isLoadingCurrent } = useConsumptionSummary(currentMonthRange)
    const { data: previousSummary, isLoading: isLoadingPrevious } = useConsumptionSummary(previousMonthRange)

    const isLoading = isLoadingCurrent || isLoadingPrevious

    // Calculate comparison percentage
    const comparisonPercentage = useMemo(() => {
        if (!currentSummary || !previousSummary) return 0
        if (previousSummary.totalKwh === 0) return currentSummary.totalKwh > 0 ? 100 : 0

        return ((currentSummary.totalKwh - previousSummary.totalKwh) / previousSummary.totalKwh) * 100
    }, [currentSummary, previousSummary])

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-center h-32">
                    <LoadingSpinner />
                </div>
            </div>
        )
    }

    if (!currentSummary) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-gray-500 text-center">
                    {t('dashboard.quickStats.noData', 'No consumption data available')}
                </p>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">
                {t('dashboard.quickStats', 'Quick Stats')}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                {/* Total Consumption */}
                <div className="flex flex-col p-3 sm:p-0">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs sm:text-sm font-medium text-gray-600">
                            {t('dashboard.totalConsumption', 'Total Consumption')}
                        </span>
                        <svg
                            className="w-5 h-5 text-green-600"
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
                    <div className="flex items-baseline">
                        <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                            {currentSummary.totalKwh.toFixed(2)}
                        </span>
                        <span className="ml-2 text-xs sm:text-sm text-gray-500">kWh</span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                        {t('dashboard.quickStats.thisMonth', 'This month')}
                    </p>
                </div>

                {/* Average Daily */}
                <div className="flex flex-col p-3 sm:p-0">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs sm:text-sm font-medium text-gray-600">
                            {t('dashboard.averageDaily', 'Average Daily')}
                        </span>
                        <svg
                            className="w-5 h-5 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                            />
                        </svg>
                    </div>
                    <div className="flex items-baseline">
                        <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                            {currentSummary.averageDailyKwh.toFixed(2)}
                        </span>
                        <span className="ml-2 text-xs sm:text-sm text-gray-500">kWh</span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                        {t('dashboard.quickStats.perDay', 'Per day')}
                    </p>
                </div>

                {/* Comparison to Previous Period */}
                <div className="flex flex-col p-3 sm:p-0">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs sm:text-sm font-medium text-gray-600">
                            {t('dashboard.comparisonToPrevious', 'vs Previous Period')}
                        </span>
                        {comparisonPercentage < 0 ? (
                            <svg
                                className="w-5 h-5 text-green-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
                                />
                            </svg>
                        ) : (
                            <svg
                                className="w-5 h-5 text-red-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                                />
                            </svg>
                        )}
                    </div>
                    <div className="flex items-baseline">
                        <span
                            className={`text-2xl sm:text-3xl font-bold ${comparisonPercentage < 0 ? 'text-green-600' : 'text-red-600'
                                }`}
                        >
                            {comparisonPercentage > 0 ? '+' : ''}
                            {comparisonPercentage.toFixed(1)}%
                        </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                        {comparisonPercentage < 0
                            ? t('dashboard.quickStats.decreased', 'Decreased from last month')
                            : t('dashboard.quickStats.increased', 'Increased from last month')}
                    </p>
                </div>
            </div>
        </div>
    )
}
