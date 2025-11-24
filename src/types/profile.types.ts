export interface UserProfile {
  id: string;
  email: string;
  preferredLanguage: 'en' | 'pt';
  createdAt: string;
  notificationPreferences: NotificationPreferences;
  consentLeaderboard: boolean;
  consentDataProcessing: boolean;
}

export interface NotificationPreferences {
  emailNotifications: boolean;
  recommendationAlerts: boolean;
  achievementNotifications: boolean;
  weeklyReports: boolean;
}

export interface ProgressMetrics {
  totalEnergySavedKwh: number;
  totalCO2ReductionKg: number;
  devicesRegistered: number;
  devicesRecycled: number;
  daysActive: number;
  recommendationsCompleted: number;
  articlesRead: number;
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
}

export interface Milestone {
  id: string;
  type: 'device' | 'energy' | 'recycling' | 'education' | 'points' | 'streak';
  title: string;
  description: string;
  achievedAt: Date;
  points: number;
}

export interface ProfileUpdateData {
  preferredLanguage?: 'en' | 'pt';
  notificationPreferences?: Partial<NotificationPreferences>;
  consentLeaderboard?: boolean;
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AccountDeletionRequest {
  password: string;
  reason?: string;
}
