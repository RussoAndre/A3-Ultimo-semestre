/**
 * Types for LGPD (Brazilian General Data Protection Law) compliance
 */

export type ConsentType = 'data_processing' | 'marketing' | 'analytics' | 'leaderboard'

export interface UserConsent {
  userId: string
  consentType: ConsentType
  granted: boolean
  grantedAt?: Date
  revokedAt?: Date
  version: string // Version of terms/privacy policy
}

export interface ConsentRecord {
  id: string
  userId: string
  consents: UserConsent[]
  lastUpdated: Date
}

export interface DataDeletionRequest {
  id: string
  userId: string
  requestedAt: Date
  scheduledDeletionDate: Date
  status: 'pending' | 'processing' | 'completed' | 'cancelled'
  reason?: string
}

export interface DataExportRequest {
  id: string
  userId: string
  requestedAt: Date
  completedAt?: Date
  status: 'pending' | 'processing' | 'completed' | 'failed'
  downloadUrl?: string
  expiresAt?: Date
}

export interface AuditLogEntry {
  id: string
  userId: string
  action: string
  resource: string
  timestamp: Date
  ipAddress?: string
  userAgent?: string
  details?: Record<string, any>
}

export interface PrivacySettings {
  userId: string
  dataProcessingConsent: boolean
  marketingConsent: boolean
  analyticsConsent: boolean
  leaderboardConsent: boolean
  dataRetentionPreference?: 'minimum' | 'standard' | 'extended'
  communicationPreferences: {
    email: boolean
    push: boolean
    sms: boolean
  }
}

export interface LGPDComplianceStatus {
  hasRequiredConsents: boolean
  missingConsents: ConsentType[]
  lastConsentUpdate: Date | null
  pendingDataDeletion: boolean
  dataExportAvailable: boolean
}
