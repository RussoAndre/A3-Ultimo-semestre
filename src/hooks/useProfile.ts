import { useState, useEffect, useCallback } from 'react';
import { profileService } from '../services/profile.service';
import type {
  UserProfile,
  ProgressMetrics,
  Milestone,
  ProfileUpdateData,
  PasswordChangeData,
  AccountDeletionRequest,
} from '../types/profile.types';

interface UseProfileReturn {
  profile: UserProfile | null;
  progressMetrics: ProgressMetrics | null;
  milestones: Milestone[];
  isLoading: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: ProfileUpdateData) => Promise<void>;
  fetchProgressMetrics: () => Promise<void>;
  fetchMilestones: () => Promise<void>;
  changePassword: (data: PasswordChangeData) => Promise<void>;
  deleteAccount: (data: AccountDeletionRequest) => Promise<void>;
}

export function useProfile(): UseProfileReturn {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [progressMetrics, setProgressMetrics] = useState<ProgressMetrics | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await profileService.getProfile();
      setProfile(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch profile');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (data: ProfileUpdateData) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedProfile = await profileService.updateProfile(data);
      setProfile(updatedProfile);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchProgressMetrics = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await profileService.getProgressMetrics();
      setProgressMetrics(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch progress metrics');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchMilestones = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await profileService.getMilestones();
      setMilestones(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch milestones');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const changePassword = useCallback(async (data: PasswordChangeData) => {
    setIsLoading(true);
    setError(null);
    try {
      await profileService.changePassword(data);
    } catch (err: any) {
      setError(err.message || 'Failed to change password');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteAccount = useCallback(async (data: AccountDeletionRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      await profileService.deleteAccount(data);
    } catch (err: any) {
      setError(err.message || 'Failed to delete account');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch profile on mount
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    progressMetrics,
    milestones,
    isLoading,
    error,
    fetchProfile,
    updateProfile,
    fetchProgressMetrics,
    fetchMilestones,
    changePassword,
    deleteAccount,
  };
}
