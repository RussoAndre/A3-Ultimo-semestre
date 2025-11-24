import { apiService } from './api';
import type {
  UserProfile,
  ProgressMetrics,
  Milestone,
  ProfileUpdateData,
  PasswordChangeData,
  AccountDeletionRequest,
} from '../types/profile.types';

class ProfileService {
  async getProfile(): Promise<UserProfile> {
    try {
      const profile = await apiService.get<UserProfile>('/profile');
      return profile;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch profile');
    }
  }

  async updateProfile(data: ProfileUpdateData): Promise<UserProfile> {
    try {
      const updatedProfile = await apiService.put<UserProfile>('/profile', data);
      return updatedProfile;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
  }

  async getProgressMetrics(): Promise<ProgressMetrics> {
    try {
      const metrics = await apiService.get<ProgressMetrics>('/profile/progress');
      return metrics;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch progress metrics');
    }
  }

  async getMilestones(): Promise<Milestone[]> {
    try {
      const milestones = await apiService.get<Milestone[]>('/profile/milestones');
      return milestones;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch milestones');
    }
  }

  async changePassword(data: PasswordChangeData): Promise<void> {
    try {
      await apiService.post('/profile/change-password', data);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to change password');
    }
  }

  async deleteAccount(data: AccountDeletionRequest): Promise<void> {
    try {
      await apiService.delete('/profile', { data });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete account');
    }
  }
}

export const profileService = new ProfileService();
