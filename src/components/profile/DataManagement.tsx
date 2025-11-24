/**
 * Component for data deletion and export (LGPD compliance)
 */

import { useState, useEffect } from 'react'
import { useLGPD } from '../../hooks/useLGPD'
import { useTranslation } from '../../hooks/useTranslation'
import Button from '../common/Button'
import { LoadingSpinner } from '../common/LoadingSpinner'
import type { DataDeletionRequest } from '../../types/lgpd.types'

export const DataManagement = () => {
  const { t } = useTranslation()
  const {
    requestDataDeletion,
    cancelDataDeletion,
    getDataDeletionStatus,
    requestDataExport,
    downloadDataExport,
    isLoading,
    error,
  } = useLGPD()

  const [deletionRequest, setDeletionRequest] = useState<DataDeletionRequest | null>(null)
  const [showDeletionConfirm, setShowDeletionConfirm] = useState(false)
  const [deletionReason, setDeletionReason] = useState('')
  const [exportRequestId, setExportRequestId] = useState<string | null>(null)

  useEffect(() => {
    loadDeletionStatus()
  }, [])

  const loadDeletionStatus = async () => {
    const status = await getDataDeletionStatus()
    setDeletionRequest(status)
  }

  const handleRequestDeletion = async () => {
    const request = await requestDataDeletion(deletionReason)
    if (request) {
      setDeletionRequest(request)
      setShowDeletionConfirm(false)
      setDeletionReason('')
    }
  }

  const handleCancelDeletion = async () => {
    if (deletionRequest) {
      const success = await cancelDataDeletion(deletionRequest.id)
      if (success) {
        setDeletionRequest(null)
      }
    }
  }

  const handleRequestExport = async () => {
    const request = await requestDataExport()
    if (request) {
      setExportRequestId(request.id)
      // Poll for completion or show success message
      setTimeout(() => {
        handleDownloadExport(request.id)
      }, 2000)
    }
  }

  const handleDownloadExport = async (requestId: string) => {
    await downloadDataExport(requestId)
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {t('lgpd.dataManagement.title', 'Data Management')}
        </h3>
        <p className="text-sm text-gray-600">
          {t('lgpd.dataManagement.description', 'Export or delete your personal data')}
        </p>
      </div>

      {/* Data Export Section */}
      <div className="border border-gray-200 rounded-lg p-6 bg-white">
        <h4 className="font-medium text-gray-900 mb-2">
          {t('lgpd.dataExport.title', 'Export Your Data')}
        </h4>
        <p className="text-sm text-gray-600 mb-4">
          {t(
            'lgpd.dataExport.description',
            'Download a copy of all your data stored in our system in JSON format.'
          )}
        </p>
        <Button
          onClick={handleRequestExport}
          disabled={isLoading}
          variant="secondary"
        >
          {isLoading && exportRequestId ? (
            <span className="flex items-center gap-2">
              <LoadingSpinner size="sm" />
              {t('lgpd.dataExport.preparing', 'Preparing export...')}
            </span>
          ) : (
            t('lgpd.dataExport.button', 'Export My Data')
          )}
        </Button>
      </div>

      {/* Data Deletion Section */}
      <div className="border border-red-200 rounded-lg p-6 bg-red-50">
        <h4 className="font-medium text-red-900 mb-2">
          {t('lgpd.dataDeletion.title', 'Delete Your Account')}
        </h4>
        
        {deletionRequest ? (
          <div className="space-y-4">
            <div className="bg-white border border-red-200 rounded p-4">
              <p className="text-sm text-gray-700 mb-2">
                <strong>{t('lgpd.dataDeletion.status', 'Status:')}</strong>{' '}
                <span className="capitalize">{deletionRequest.status}</span>
              </p>
              <p className="text-sm text-gray-700 mb-2">
                <strong>{t('lgpd.dataDeletion.requestedAt', 'Requested:')}</strong>{' '}
                {formatDate(deletionRequest.requestedAt)}
              </p>
              <p className="text-sm text-gray-700">
                <strong>{t('lgpd.dataDeletion.scheduledDate', 'Scheduled deletion:')}</strong>{' '}
                {formatDate(deletionRequest.scheduledDeletionDate)}
              </p>
            </div>
            
            <p className="text-sm text-red-800">
              {t(
                'lgpd.dataDeletion.pendingMessage',
                'Your account is scheduled for deletion. You can cancel this request before the scheduled date.'
              )}
            </p>
            
            <Button
              onClick={handleCancelDeletion}
              disabled={isLoading}
              variant="secondary"
            >
              {t('lgpd.dataDeletion.cancel', 'Cancel Deletion Request')}
            </Button>
          </div>
        ) : showDeletionConfirm ? (
          <div className="space-y-4">
            <p className="text-sm text-red-800">
              {t(
                'lgpd.dataDeletion.warning',
                'This action will permanently delete your account and all associated data within 30 days. This cannot be undone.'
              )}
            </p>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('lgpd.dataDeletion.reasonLabel', 'Reason (optional)')}
              </label>
              <textarea
                value={deletionReason}
                onChange={(e) => setDeletionReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder={t('lgpd.dataDeletion.reasonPlaceholder', 'Tell us why you\'re leaving...')}
              />
            </div>
            
            <div className="flex gap-3">
              <Button
                onClick={handleRequestDeletion}
                disabled={isLoading}
                variant="primary"
                className="bg-red-600 hover:bg-red-700"
              >
                {t('lgpd.dataDeletion.confirm', 'Confirm Deletion')}
              </Button>
              <Button
                onClick={() => setShowDeletionConfirm(false)}
                variant="secondary"
              >
                {t('common.cancel', 'Cancel')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-red-800">
              {t(
                'lgpd.dataDeletion.description',
                'Permanently delete your account and all associated data. This action cannot be undone.'
              )}
            </p>
            <Button
              onClick={() => setShowDeletionConfirm(true)}
              variant="primary"
              className="bg-red-600 hover:bg-red-700"
            >
              {t('lgpd.dataDeletion.button', 'Delete My Account')}
            </Button>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
    </div>
  )
}
