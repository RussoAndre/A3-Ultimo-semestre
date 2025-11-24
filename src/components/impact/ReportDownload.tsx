import { useState } from 'react'
import { useTranslation } from '../../hooks/useTranslation'
import { impactService } from '../../services/impact.service'
import Card from '../common/Card'
import LoadingSpinner from '../common/LoadingSpinner'
import { formatDateToISO } from '../../utils/energyCalculations'

interface ReportDownloadProps {
  className?: string
}

export function ReportDownload({ className = '' }: ReportDownloadProps) {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Default to current month
  const today = new Date()
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

  const [startDate, setStartDate] = useState(formatDateToISO(firstDayOfMonth))
  const [endDate, setEndDate] = useState(formatDateToISO(today))

  const handleDownload = async () => {
    try {
      setLoading(true)
      setError(null)

      const blob = await impactService.downloadImpactReport({
        startDate,
        endDate,
      })

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `impact-report-${startDate}-to-${endDate}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Error downloading report:', err)
      setError(t('errors.generic'))
    } finally {
      setLoading(false)
    }
  }

  const setQuickDateRange = (range: 'month' | 'quarter' | 'year') => {
    const end = new Date()
    const start = new Date()

    switch (range) {
      case 'month':
        start.setDate(1)
        break
      case 'quarter':
        const currentQuarter = Math.floor(end.getMonth() / 3)
        start.setMonth(currentQuarter * 3, 1)
        break
      case 'year':
        start.setMonth(0, 1)
        break
    }

    setStartDate(formatDateToISO(start))
    setEndDate(formatDateToISO(end))
  }

  return (
    <Card className={className}>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {t('impact.downloadReport')}
          </h3>
          <p className="text-sm text-gray-600">
            Generate a comprehensive PDF report of your environmental impact
          </p>
        </div>

        {/* Quick Date Range Buttons */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Quick Select:</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setQuickDateRange('month')}
              className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {t('energy.thisMonth')}
            </button>
            <button
              onClick={() => setQuickDateRange('quarter')}
              className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              This Quarter
            </button>
            <button
              onClick={() => setQuickDateRange('year')}
              className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              This Year
            </button>
          </div>
        </div>

        {/* Custom Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              max={endDate}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
              max={formatDateToISO(new Date())}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Download Button */}
        <button
          onClick={handleDownload}
          disabled={loading || !startDate || !endDate}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <>
              <LoadingSpinner />
              <span>Generating Report...</span>
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span>{t('impact.downloadReport')}</span>
            </>
          )}
        </button>

        {/* Report Contents Info */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-medium text-blue-900 mb-2">Report includes:</p>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Energy consumption and savings</li>
            <li>• CO₂ reduction and environmental equivalents</li>
            <li>• Device disposal history</li>
            <li>• Sustainability score and progress</li>
            <li>• Detailed metrics and comparisons</li>
          </ul>
        </div>
      </div>
    </Card>
  )
}
