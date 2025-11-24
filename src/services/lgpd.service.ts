/**
 * Service for LGPD compliance operations
 */

import { apiService } from './api'
import type {
  ConsentType,
  ConsentRecord,
  DataDeletionRequest,
  DataExportRequest,
  PrivacySettings,
  LGPDComplianceStatus,
  AuditLogEntry,
} from '../types/lgpd.types'

class LGPDService {
  // Consent Management
  async getConsents(): Promise<ConsentRecord> {
    try {
      return await apiService.get<ConsentRecord>('/lgpd/consents')
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch consents')
    }
  }

  async updateConsent(consentType: ConsentType, granted: boolean): Promise<ConsentRecord> {
    try {
      return await apiService.post<ConsentRecord>('/lgpd/consents', {
        consentType,
        granted,
      })
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update consent')
    }
  }

  async updateMultipleConsents(
    consents: Array<{ consentType: ConsentType; granted: boolean }>
  ): Promise<ConsentRecord> {
    try {
      return await apiService.post<ConsentRecord>('/lgpd/consents/bulk', {
        consents,
      })
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update consents')
    }
  }

  async getComplianceStatus(): Promise<LGPDComplianceStatus> {
    try {
      return await apiService.get<LGPDComplianceStatus>('/lgpd/compliance-status')
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch compliance status')
    }
  }

  // Data Deletion
  async requestDataDeletion(reason?: string): Promise<DataDeletionRequest> {
    try {
      return await apiService.post<DataDeletionRequest>('/lgpd/data-deletion', {
        reason,
      })
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to request data deletion')
    }
  }

  async cancelDataDeletion(requestId: string): Promise<void> {
    try {
      await apiService.post(`/lgpd/data-deletion/${requestId}/cancel`)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to cancel data deletion')
    }
  }

  async getDataDeletionStatus(): Promise<DataDeletionRequest | null> {
    try {
      return await apiService.get<DataDeletionRequest | null>('/lgpd/data-deletion/status')
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch deletion status')
    }
  }

  // Data Export (Data Portability)
  async requestDataExport(): Promise<DataExportRequest> {
    try {
      return await apiService.post<DataExportRequest>('/lgpd/data-export')
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to request data export')
    }
  }

  async getDataExportStatus(requestId: string): Promise<DataExportRequest> {
    try {
      return await apiService.get<DataExportRequest>(`/lgpd/data-export/${requestId}`)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch export status')
    }
  }

  async downloadDataExport(requestId: string): Promise<Blob> {
    try {
      const response = await apiService.get<Blob>(`/lgpd/data-export/${requestId}/download`, {
        responseType: 'blob',
      })
      return response
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to download data export')
    }
  }

  // Privacy Settings
  async getPrivacySettings(): Promise<PrivacySettings> {
    try {
      return await apiService.get<PrivacySettings>('/lgpd/privacy-settings')
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch privacy settings')
    }
  }

  async updatePrivacySettings(settings: Partial<PrivacySettings>): Promise<PrivacySettings> {
    try {
      return await apiService.put<PrivacySettings>('/lgpd/privacy-settings', settings)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update privacy settings')
    }
  }

  // Audit Logs (User can view their own access logs)
  async getAuditLogs(limit: number = 50, offset: number = 0): Promise<AuditLogEntry[]> {
    try {
      return await apiService.get<AuditLogEntry[]>('/lgpd/audit-logs', {
        params: { limit, offset },
      })
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch audit logs')
    }
  }

  // Data Access Request (View what data is stored)
  async getStoredData(): Promise<any> {
    try {
      return await apiService.get('/lgpd/stored-data')
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch stored data')
    }
  }
}

export const lgpdService = new LGPDService()
