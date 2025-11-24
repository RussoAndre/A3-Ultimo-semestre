/**
 * Component for managing user consents (LGPD compliance)
 */

import { useState, useEffect } from 'react'
import { useLGPD } from '../../hooks/useLGPD'
import { useTranslation } from '../../hooks/useTranslation'
import Button from '../common/Button'
import { LoadingSpinner } from '../common/LoadingSpinner'
import type { ConsentType } from '../../types/lgpd.types'

interface ConsentItem {
  type: ConsentType
  titleKey: string
  descriptionKey: string
  required: boolean
}

const CONSENT_ITEMS: ConsentItem[] = [
  {
    type: 'data_processing',
    titleKey: 'lgpd.consent.dataProcessing.title',
    descriptionKey: 'lgpd.consent.dataProcessing.description',
    required: true,
  },
  {
    type: 'analytics',
    titleKey: 'lgpd.consent.analytics.title',
    descriptionKey: 'lgpd.consent.analytics.description',
    required: false,
  },
  {
    type: 'marketing',
    titleKey: 'lgpd.consent.marketing.title',
    descriptionKey: 'lgpd.consent.marketing.description',
    required: false,
  },
  {
    type: 'leaderboard',
    titleKey: 'lgpd.consent.leaderboard.title',
    descriptionKey: 'lgpd.consent.leaderboard.description',
    required: false,
  },
]

export const ConsentManagement = () => {
  const { t } = useTranslation()
  const { getConsents, updateConsent, isLoading } = useLGPD()
  const [consents, setConsents] = useState<Record<ConsentType, boolean>>({
    data_processing: false,
    analytics: false,
    marketing: false,
    leaderboard: false,
  })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    loadConsents()
  }, [])

  const loadConsents = async () => {
    const consentRecord = await getConsents()
    if (consentRecord) {
      const consentMap: Record<ConsentType, boolean> = {
        data_processing: false,
        analytics: false,
        marketing: false,
        leaderboard: false,
      }
      
      consentRecord.consents.forEach(consent => {
        consentMap[consent.consentType] = consent.granted
      })
      
      setConsents(consentMap)
    }
  }

  const handleConsentChange = async (consentType: ConsentType, granted: boolean) => {
    setIsSaving(true)
    const success = await updateConsent(consentType, granted)
    
    if (success) {
      setConsents(prev => ({
        ...prev,
        [consentType]: granted,
      }))
    }
    
    setIsSaving(false)
  }

  if (isLoading && !isSaving) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {t('lgpd.consent.title', 'Consent Management')}
        </h3>
        <p className="text-sm text-gray-600">
          {t('lgpd.consent.description', 'Manage your data processing consents in accordance with LGPD')}
        </p>
      </div>

      <div className="space-y-4">
        {CONSENT_ITEMS.map(item => (
          <div
            key={item.type}
            className="border border-gray-200 rounded-lg p-4 bg-white"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-gray-900">
                    {t(item.titleKey, item.type)}
                  </h4>
                  {item.required && (
                    <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">
                      {t('lgpd.consent.required', 'Required')}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {t(item.descriptionKey, `Description for ${item.type}`)}
                </p>
              </div>
              
              <label className="relative inline-flex items-center cursor-pointer ml-4">
                <input
                  type="checkbox"
                  checked={consents[item.type]}
                  onChange={(e) => handleConsentChange(item.type, e.target.checked)}
                  disabled={item.required || isSaving}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
              </label>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>{t('lgpd.consent.note', 'Note:')}</strong>{' '}
          {t(
            'lgpd.consent.noteText',
            'You can change these settings at any time. Required consents are necessary for the basic functionality of the application.'
          )}
        </p>
      </div>
    </div>
  )
}
