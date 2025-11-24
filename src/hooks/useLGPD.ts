/**
 * Hook for LGPD compliance operations
 */

import { useState, useCallback } from 'react'
import { lgpdService } from '../services/lgpd.service'
import type {
  ConsentType,
  ConsentRecord,
  DataDeletionRequest,
  DataExportRequest,
  PrivacySettings,
  LGPDComplianceStatus,
} from '../types/lgpd.types'

export const useLGPD = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Consent Management
  const getConsents = useCallback(async (): Promise<ConsentRecord | null> => {
    setIsLoading(true)
    setError(null)
    try {
      const consents = await lgpdService.getConsents()
      return consents
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateConsent = useCallback(
    async (consentType: ConsentType, granted: boolean): Promise<boolean> => {
      setIsLoading(true)
      setError(null)
      try {
        await lgpdService.updateConsent(consentType, granted)
        return true
      } catch (err: any) {
        setError(err.message)
        return false
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const updateMultipleConsents = useCallback(
    async (consents: Array<{ consentType: ConsentType; granted: boolean }>): Promise<boolean> => {
      setIsLoading(true)
      setError(null)
      try {
        await lgpdService.updateMultipleConsents(consents)
        return true
      } catch (err: any) {
        setError(err.message)
        return false
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const getComplianceStatus = useCallback(async (): Promise<LGPDComplianceStatus | null> => {
    setIsLoading(true)
    setError(null)
    try {
      const status = await lgpdService.getComplianceStatus()
      return status
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Data Deletion
  const requestDataDeletion = useCallback(async (reason?: string): Promise<DataDeletionRequest | null> => {
    setIsLoading(true)
    setError(null)
    try {
      const request = await lgpdService.requestDataDeletion(reason)
      return request
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const cancelDataDeletion = useCallback(async (requestId: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    try {
      await lgpdService.cancelDataDeletion(requestId)
      return true
    } catch (err: any) {
      setError(err.message)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getDataDeletionStatus = useCallback(async (): Promise<DataDeletionRequest | null> => {
    setIsLoading(true)
    setError(null)
    try {
      const status = await lgpdService.getDataDeletionStatus()
      return status
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Data Export
  const requestDataExport = useCallback(async (): Promise<DataExportRequest | null> => {
    setIsLoading(true)
    setError(null)
    try {
      const request = await lgpdService.requestDataExport()
      return request
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const downloadDataExport = useCallback(async (requestId: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    try {
      const blob = await lgpdService.downloadDataExport(requestId)
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `ecotech-data-export-${new Date().toISOString()}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      return true
    } catch (err: any) {
      setError(err.message)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Privacy Settings
  const getPrivacySettings = useCallback(async (): Promise<PrivacySettings | null> => {
    setIsLoading(true)
    setError(null)
    try {
      const settings = await lgpdService.getPrivacySettings()
      return settings
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updatePrivacySettings = useCallback(
    async (settings: Partial<PrivacySettings>): Promise<boolean> => {
      setIsLoading(true)
      setError(null)
      try {
        await lgpdService.updatePrivacySettings(settings)
        return true
      } catch (err: any) {
        setError(err.message)
        return false
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  return {
    isLoading,
    error,
    // Consent operations
    getConsents,
    updateConsent,
    updateMultipleConsents,
    getComplianceStatus,
    // Data deletion operations
    requestDataDeletion,
    cancelDataDeletion,
    getDataDeletionStatus,
    // Data export operations
    requestDataExport,
    downloadDataExport,
    // Privacy settings
    getPrivacySettings,
    updatePrivacySettings,
  }
}
