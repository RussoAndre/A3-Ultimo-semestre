import { useState } from 'react'
import { useTranslation } from '../hooks/useTranslation'
import { ImpactReport, ReportDownload } from '../components/impact'
import Layout from '../components/common/Layout'

function ImpactPage() {
  const { t } = useTranslation()
  const [comparisonPeriod, setComparisonPeriod] = useState<'month' | 'quarter' | 'year'>(
    'month'
  )

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('impact.title')}</h1>
          <p className="mt-2 text-gray-600">
            Track your environmental impact and contribution to sustainability
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Impact Report */}
          <ImpactReport
            comparisonPeriod={comparisonPeriod}
            onPeriodChange={setComparisonPeriod}
          />

          {/* Report Download */}
          <ReportDownload />
        </div>
      </div>
    </Layout>
  )
}

export default ImpactPage
