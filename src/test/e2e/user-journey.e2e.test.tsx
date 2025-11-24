import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, mockApiResponses } from '../test-utils';
import App from '../../App';
import * as authService from '../../services/auth.service';
import * as deviceService from '../../services/device.service';
import * as energyService from '../../services/energy.service';
import * as recommendationService from '../../services/recommendation.service';
import * as rewardsService from '../../services/rewards.service';
import * as profileService from '../../services/profile.service';

/**
 * End-to-End Tests for EcoTech Energy Management System
 * 
 * These tests cover complete user journeys through the application:
 * - User registration to dashboard flow
 * - Device management workflow
 * - Rewards earning and badge unlocking
 * - Profile updates and settings changes
 * - Multilingual functionality
 * 
 * Requirements: 1.1, 2.1, 8.1, 9.5, 13.1
 */

describe('E2E: Complete User Journey', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('User Registration to Dashboard Flow', () => {
    it('should complete full registration and navigate to dashboard', async () => {
      const user = userEvent.setup();
      
      // Mock API responses
      const registerSpy = vi.spyOn(authService, 'register').mockResolvedValue(mockApiResponses.auth.register);
      const getDevicesSpy = vi.spyOn(deviceService, 'getDevices').mockResolvedValue(mockApiResponses.devices.list);
      const getConsumptionSpy = vi.spyOn(energyService, 'getConsumptionSummary').mockResolvedValue(mockApiResponses.energy.summary);
      const getRecommendationsSpy = vi.spyOn(recommendationService, 'getRecommendations').mockResolvedValue(mockApiResponses.recommendations.list);

      renderWithProviders(<App />);

      // Navigate to register page
      const registerLink = screen.getByRole('link', { name: /register|sign up/i });
      await user.click(registerLink);

      // Fill registration form
      await waitFor(() => {
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      });

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

      await user.type(emailInput, 'newuser@example.com');
      await user.type(passwordInput, 'SecurePass123!');
      await user.type(confirmPasswordInput, 'SecurePass123!');

      // Submit registration
      const submitButton = screen.getByRole('button', { name: /register|sign up/i });
      await user.click(submitButton);

      // Verify registration API call
      await waitFor(() => {
        expect(registerSpy).toHaveBeenCalledWith({
          email: 'newuser@example.com',
          password: 'SecurePass123!',
          preferredLanguage: expect.any(String),
        });
      });

      // Verify redirect to dashboard
      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      }, { timeout: 3000 });

      // Verify dashboard data is loaded
      expect(getDevicesSpy).toHaveBeenCalled();
      expect(getConsumptionSpy).toHaveBeenCalled();
      expect(getRecommendationsSpy).toHaveBeenCalled();
    });

    it('should handle registration errors gracefully', async () => {
      const user = userEvent.setup();
      
      vi.spyOn(authService, 'register').mockRejectedValue(new Error('Email already exists'));

      renderWithProviders(<App />);

      // Navigate to register
      const registerLink = screen.getByRole('link', { name: /register|sign up/i });
      await user.click(registerLink);

      await waitFor(() => {
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      });

      // Fill form with existing email
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

      await user.type(emailInput, 'existing@example.com');
      await user.type(passwordInput, 'Password123!');
      await user.type(confirmPasswordInput, 'Password123!');

      const submitButton = screen.getByRole('button', { name: /register|sign up/i });
      await user.click(submitButton);

      // Verify error message is displayed
      await waitFor(() => {
        expect(screen.getByText(/email already exists/i)).toBeInTheDocument();
      });
    });
  });

  describe('Device Management Complete Workflow', () => {
    beforeEach(() => {
      // Mock authenticated state
      vi.spyOn(authService, 'login').mockResolvedValue(mockApiResponses.auth.login);
      vi.spyOn(deviceService, 'getDevices').mockResolvedValue(mockApiResponses.devices.list);
    });

    it('should add, edit, and delete a device', async () => {
      const user = userEvent.setup();
      
      const createDeviceSpy = vi.spyOn(deviceService, 'createDevice').mockResolvedValue(mockApiResponses.devices.create);
      const updateDeviceSpy = vi.spyOn(deviceService, 'updateDevice').mockResolvedValue({
        ...mockApiResponses.devices.create,
        wattage: 40,
      });
      const deleteDeviceSpy = vi.spyOn(deviceService, 'deleteDevice').mockResolvedValue(undefined);

      const { store } = renderWithProviders(<App />, {
        preloadedState: {
          auth: {
            isAuthenticated: true,
            user: mockApiResponses.auth.login.user,
            token: mockApiResponses.auth.login.token,
          },
        },
      });

      // Wait for dashboard to load
      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      });

      // Add new device
      const addDeviceButton = screen.getByRole('button', { name: /add device/i });
      await user.click(addDeviceButton);

      // Fill device form
      await waitFor(() => {
        expect(screen.getByLabelText(/device name/i)).toBeInTheDocument();
      });

      const nameInput = screen.getByLabelText(/device name/i);
      const typeSelect = screen.getByLabelText(/device type/i);
      const wattageInput = screen.getByLabelText(/wattage/i);
      const usageInput = screen.getByLabelText(/daily usage hours/i);

      await user.type(nameInput, 'Monitor');
      await user.selectOptions(typeSelect, 'monitor');
      await user.type(wattageInput, '30');
      await user.type(usageInput, '8');

      const saveButton = screen.getByRole('button', { name: /save|add/i });
      await user.click(saveButton);

      // Verify device creation
      await waitFor(() => {
        expect(createDeviceSpy).toHaveBeenCalledWith({
          name: 'Monitor',
          type: 'monitor',
          wattage: 30,
          dailyUsageHours: 8,
        });
      });

      // Edit device
      const editButton = screen.getAllByRole('button', { name: /edit/i })[0];
      await user.click(editButton);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Monitor')).toBeInTheDocument();
      });

      const wattageEditInput = screen.getByLabelText(/wattage/i);
      await user.clear(wattageEditInput);
      await user.type(wattageEditInput, '40');

      const updateButton = screen.getByRole('button', { name: /update|save/i });
      await user.click(updateButton);

      await waitFor(() => {
        expect(updateDeviceSpy).toHaveBeenCalled();
      });

      // Delete device
      const deleteButton = screen.getAllByRole('button', { name: /delete|remove/i })[0];
      await user.click(deleteButton);

      // Confirm deletion
      const confirmButton = screen.getByRole('button', { name: /confirm|yes/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(deleteDeviceSpy).toHaveBeenCalled();
      });
    });

    it('should record device disposal and award points', async () => {
      const user = userEvent.setup();
      
      const disposalSpy = vi.spyOn(deviceService, 'recordDisposal').mockResolvedValue({
        ...mockApiResponses.devices.list[0],
        status: 'disposed',
        disposalMethod: 'recycling',
      });
      const awardPointsSpy = vi.spyOn(rewardsService, 'awardPoints').mockResolvedValue({
        totalPoints: 120,
        pointsAwarded: 20,
      });

      renderWithProviders(<App />, {
        preloadedState: {
          auth: {
            isAuthenticated: true,
            user: mockApiResponses.auth.login.user,
            token: mockApiResponses.auth.login.token,
          },
        },
      });

      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      });

      // Find device and record disposal
      const disposalButton = screen.getByRole('button', { name: /record disposal/i });
      await user.click(disposalButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/disposal method/i)).toBeInTheDocument();
      });

      const disposalMethodSelect = screen.getByLabelText(/disposal method/i);
      await user.selectOptions(disposalMethodSelect, 'recycling');

      const submitDisposalButton = screen.getByRole('button', { name: /submit|record/i });
      await user.click(submitDisposalButton);

      // Verify disposal recorded and points awarded
      await waitFor(() => {
        expect(disposalSpy).toHaveBeenCalled();
        expect(awardPointsSpy).toHaveBeenCalled();
      });

      // Verify points notification
      await waitFor(() => {
        expect(screen.getByText(/20 points/i)).toBeInTheDocument();
      });
    });
  });

  describe('Rewards Earning and Badge Unlocking', () => {
    beforeEach(() => {
      vi.spyOn(authService, 'login').mockResolvedValue(mockApiResponses.auth.login);
    });

    it('should earn points for completing recommendation', async () => {
      const user = userEvent.setup();
      
      vi.spyOn(recommendationService, 'getRecommendations').mockResolvedValue(mockApiResponses.recommendations.list);
      const completeRecommendationSpy = vi.spyOn(recommendationService, 'completeRecommendation').mockResolvedValue({
        ...mockApiResponses.recommendations.list[0],
        completed: true,
      });
      const awardPointsSpy = vi.spyOn(rewardsService, 'awardPoints').mockResolvedValue({
        totalPoints: 150,
        pointsAwarded: 50,
      });

      renderWithProviders(<App />, {
        preloadedState: {
          auth: {
            isAuthenticated: true,
            user: mockApiResponses.auth.login.user,
            token: mockApiResponses.auth.login.token,
          },
        },
      });

      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      });

      // Find and complete recommendation
      const completeButton = screen.getByRole('button', { name: /mark as complete|complete/i });
      await user.click(completeButton);

      // Verify recommendation completed and points awarded
      await waitFor(() => {
        expect(completeRecommendationSpy).toHaveBeenCalled();
        expect(awardPointsSpy).toHaveBeenCalledWith(expect.any(String), 50, 'recommendation_completed');
      });

      // Verify points notification
      await waitFor(() => {
        expect(screen.getByText(/50 points/i)).toBeInTheDocument();
      });
    });

    it('should unlock badge when reaching tier threshold', async () => {
      const user = userEvent.setup();
      
      vi.spyOn(rewardsService, 'getUserRewards').mockResolvedValue({
        userId: '1',
        totalPoints: 500,
        currentTier: 'silver',
        badges: [
          {
            id: '1',
            name: 'Energy Saver',
            description: 'Saved 100 kWh',
            iconUrl: '/badges/energy-saver.svg',
            earnedAt: new Date(),
            category: 'energy',
          },
        ],
        pointsHistory: [],
      });

      renderWithProviders(<App />, {
        preloadedState: {
          auth: {
            isAuthenticated: true,
            user: mockApiResponses.auth.login.user,
            token: mockApiResponses.auth.login.token,
          },
        },
      });

      // Navigate to rewards page
      const rewardsLink = screen.getByRole('link', { name: /rewards/i });
      await user.click(rewardsLink);

      // Verify badge is displayed
      await waitFor(() => {
        expect(screen.getByText(/energy saver/i)).toBeInTheDocument();
        expect(screen.getByText(/silver/i)).toBeInTheDocument();
      });
    });

    it('should display user on leaderboard with consent', async () => {
      const user = userEvent.setup();
      
      vi.spyOn(rewardsService, 'getLeaderboard').mockResolvedValue([
        { userId: '1', username: 'User1', points: 500, rank: 1 },
        { userId: '2', username: 'User2', points: 400, rank: 2 },
        { userId: '3', username: 'User3', points: 300, rank: 3 },
      ]);

      renderWithProviders(<App />, {
        preloadedState: {
          auth: {
            isAuthenticated: true,
            user: { ...mockApiResponses.auth.login.user, consentLeaderboard: true },
            token: mockApiResponses.auth.login.token,
          },
        },
      });

      // Navigate to leaderboard
      const leaderboardLink = screen.getByRole('link', { name: /leaderboard/i });
      await user.click(leaderboardLink);

      // Verify leaderboard is displayed
      await waitFor(() => {
        expect(screen.getByText(/user1/i)).toBeInTheDocument();
        expect(screen.getByText(/500/)).toBeInTheDocument();
      });
    });
  });

  describe('Profile Updates and Settings Changes', () => {
    beforeEach(() => {
      vi.spyOn(authService, 'login').mockResolvedValue(mockApiResponses.auth.login);
    });

    it('should update profile settings successfully', async () => {
      const user = userEvent.setup();
      
      const updateProfileSpy = vi.spyOn(profileService, 'updateProfile').mockResolvedValue({
        ...mockApiResponses.auth.login.user,
        preferredLanguage: 'pt',
      });

      renderWithProviders(<App />, {
        preloadedState: {
          auth: {
            isAuthenticated: true,
            user: mockApiResponses.auth.login.user,
            token: mockApiResponses.auth.login.token,
          },
        },
      });

      // Navigate to profile
      const profileLink = screen.getByRole('link', { name: /profile/i });
      await user.click(profileLink);

      await waitFor(() => {
        expect(screen.getByText(/settings/i)).toBeInTheDocument();
      });

      // Update language preference
      const languageSelect = screen.getByLabelText(/language/i);
      await user.selectOptions(languageSelect, 'pt');

      const saveButton = screen.getByRole('button', { name: /save|update/i });
      await user.click(saveButton);

      // Verify profile update
      await waitFor(() => {
        expect(updateProfileSpy).toHaveBeenCalledWith(expect.objectContaining({
          preferredLanguage: 'pt',
        }));
      });

      // Verify success message
      await waitFor(() => {
        expect(screen.getByText(/settings updated/i)).toBeInTheDocument();
      });
    });

    it('should toggle notification preferences', async () => {
      const user = userEvent.setup();
      
      const updateProfileSpy = vi.spyOn(profileService, 'updateProfile').mockResolvedValue({
        ...mockApiResponses.auth.login.user,
        notificationPreferences: { email: false },
      });

      renderWithProviders(<App />, {
        preloadedState: {
          auth: {
            isAuthenticated: true,
            user: mockApiResponses.auth.login.user,
            token: mockApiResponses.auth.login.token,
          },
        },
      });

      // Navigate to profile settings
      const profileLink = screen.getByRole('link', { name: /profile/i });
      await user.click(profileLink);

      await waitFor(() => {
        expect(screen.getByText(/notifications/i)).toBeInTheDocument();
      });

      // Toggle email notifications
      const emailNotificationToggle = screen.getByRole('checkbox', { name: /email notifications/i });
      await user.click(emailNotificationToggle);

      const saveButton = screen.getByRole('button', { name: /save|update/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(updateProfileSpy).toHaveBeenCalled();
      });
    });

    it('should update leaderboard consent', async () => {
      const user = userEvent.setup();
      
      const updateProfileSpy = vi.spyOn(profileService, 'updateProfile').mockResolvedValue({
        ...mockApiResponses.auth.login.user,
        consentLeaderboard: true,
      });

      renderWithProviders(<App />, {
        preloadedState: {
          auth: {
            isAuthenticated: true,
            user: { ...mockApiResponses.auth.login.user, consentLeaderboard: false },
            token: mockApiResponses.auth.login.token,
          },
        },
      });

      // Navigate to profile
      const profileLink = screen.getByRole('link', { name: /profile/i });
      await user.click(profileLink);

      await waitFor(() => {
        expect(screen.getByText(/leaderboard/i)).toBeInTheDocument();
      });

      // Enable leaderboard consent
      const leaderboardConsent = screen.getByRole('checkbox', { name: /leaderboard/i });
      await user.click(leaderboardConsent);

      const saveButton = screen.getByRole('button', { name: /save|update/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(updateProfileSpy).toHaveBeenCalledWith(expect.objectContaining({
          consentLeaderboard: true,
        }));
      });
    });
  });

  describe('Multilingual Functionality', () => {
    beforeEach(() => {
      vi.spyOn(authService, 'login').mockResolvedValue(mockApiResponses.auth.login);
    });

    it('should switch language from English to Portuguese', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(<App />, {
        preloadedState: {
          auth: {
            isAuthenticated: true,
            user: mockApiResponses.auth.login.user,
            token: mockApiResponses.auth.login.token,
          },
        },
      });

      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      });

      // Find language selector
      const languageSelector = screen.getByRole('button', { name: /language|en|english/i });
      await user.click(languageSelector);

      // Select Portuguese
      const portugueseOption = screen.getByRole('menuitem', { name: /português|pt/i });
      await user.click(portugueseOption);

      // Verify language changed
      await waitFor(() => {
        expect(screen.getByText(/painel/i)).toBeInTheDocument(); // "Dashboard" in Portuguese
      });

      // Verify language persisted in localStorage
      expect(localStorage.getItem('i18nextLng')).toBe('pt');
    });

    it('should display all content in selected language', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(<App />, {
        preloadedState: {
          auth: {
            isAuthenticated: true,
            user: { ...mockApiResponses.auth.login.user, preferredLanguage: 'pt' },
            token: mockApiResponses.auth.login.token,
          },
        },
      });

      // Verify Portuguese content is displayed
      await waitFor(() => {
        expect(screen.getByText(/painel/i)).toBeInTheDocument();
      });

      // Navigate to devices page
      const devicesLink = screen.getByRole('link', { name: /dispositivos/i });
      await user.click(devicesLink);

      // Verify devices page in Portuguese
      await waitFor(() => {
        expect(screen.getByText(/adicionar dispositivo/i)).toBeInTheDocument();
      });
    });

    it('should maintain language preference across sessions', async () => {
      const user = userEvent.setup();
      
      // Set language to Portuguese
      localStorage.setItem('i18nextLng', 'pt');

      renderWithProviders(<App />, {
        preloadedState: {
          auth: {
            isAuthenticated: true,
            user: { ...mockApiResponses.auth.login.user, preferredLanguage: 'pt' },
            token: mockApiResponses.auth.login.token,
          },
        },
      });

      // Verify Portuguese is loaded
      await waitFor(() => {
        expect(screen.getByText(/painel/i)).toBeInTheDocument();
      });
    });

    it('should translate dynamic content like recommendations', async () => {
      const user = userEvent.setup();
      
      vi.spyOn(recommendationService, 'getRecommendations').mockResolvedValue([
        {
          ...mockApiResponses.recommendations.list[0],
          title: 'Ativar modo de economia de energia',
          description: 'Reduza o consumo de energia ativando o modo de economia',
        },
      ]);

      renderWithProviders(<App />, {
        preloadedState: {
          auth: {
            isAuthenticated: true,
            user: { ...mockApiResponses.auth.login.user, preferredLanguage: 'pt' },
            token: mockApiResponses.auth.login.token,
          },
        },
      });

      await waitFor(() => {
        expect(screen.getByText(/ativar modo de economia de energia/i)).toBeInTheDocument();
      });
    });
  });
});
