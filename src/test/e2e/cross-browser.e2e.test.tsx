import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, mockApiResponses } from '../test-utils';
import App from '../../App';
import * as authService from '../../services/auth.service';
import * as deviceService from '../../services/device.service';
import { browsers, mobileViewports, setupBrowserEnvironment, setupMobileViewport } from './cross-browser.config';

/**
 * Cross-Browser E2E Tests
 * 
 * These tests verify that the application works correctly across
 * different browsers (Chrome, Firefox, Safari) and viewports.
 * 
 * Requirements: 10.1, 10.2, 10.4, 10.5
 */

describe('E2E: Cross-Browser Compatibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe.each(browsers)('Browser: $name', (browser) => {
    beforeEach(() => {
      setupBrowserEnvironment(browser);
    });

    it('should render dashboard correctly', async () => {
      vi.spyOn(authService, 'login').mockResolvedValue(mockApiResponses.auth.login);
      vi.spyOn(deviceService, 'getDevices').mockResolvedValue(mockApiResponses.devices.list);

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

      // Verify key elements are rendered
      expect(screen.getByText(/devices/i)).toBeInTheDocument();
      expect(screen.getByText(/energy consumption/i)).toBeInTheDocument();
    });

    it('should handle user interactions correctly', async () => {
      const user = userEvent.setup();
      
      vi.spyOn(authService, 'login').mockResolvedValue(mockApiResponses.auth.login);
      const createDeviceSpy = vi.spyOn(deviceService, 'createDevice').mockResolvedValue(mockApiResponses.devices.create);

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

      // Add device
      const addButton = screen.getByRole('button', { name: /add device/i });
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/device name/i)).toBeInTheDocument();
      });

      const nameInput = screen.getByLabelText(/device name/i);
      await user.type(nameInput, 'Test Device');

      const saveButton = screen.getByRole('button', { name: /save|add/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(createDeviceSpy).toHaveBeenCalled();
      });
    });

    it('should navigate between pages correctly', async () => {
      const user = userEvent.setup();
      
      vi.spyOn(authService, 'login').mockResolvedValue(mockApiResponses.auth.login);

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

      // Navigate to profile
      const profileLink = screen.getByRole('link', { name: /profile/i });
      await user.click(profileLink);

      await waitFor(() => {
        expect(screen.getByText(/settings/i)).toBeInTheDocument();
      });

      // Navigate back to dashboard
      const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
      await user.click(dashboardLink);

      await waitFor(() => {
        expect(screen.getByText(/energy consumption/i)).toBeInTheDocument();
      });
    });

    it('should handle form validation consistently', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(<App />);

      // Navigate to register
      const registerLink = screen.getByRole('link', { name: /register|sign up/i });
      await user.click(registerLink);

      await waitFor(() => {
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      });

      // Submit empty form
      const submitButton = screen.getByRole('button', { name: /register|sign up/i });
      await user.click(submitButton);

      // Verify validation errors
      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Design Tests', () => {
    describe.each(mobileViewports)('Viewport: $name', (viewport) => {
      beforeEach(() => {
        setupMobileViewport(viewport);
      });

      it('should render mobile layout correctly', async () => {
        vi.spyOn(authService, 'login').mockResolvedValue(mockApiResponses.auth.login);

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

        // Verify mobile navigation is present
        const menuButton = screen.getByRole('button', { name: /menu|navigation/i });
        expect(menuButton).toBeInTheDocument();
      });

      it('should handle touch interactions', async () => {
        const user = userEvent.setup();
        
        vi.spyOn(authService, 'login').mockResolvedValue(mockApiResponses.auth.login);

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

        // Open mobile menu
        const menuButton = screen.getByRole('button', { name: /menu|navigation/i });
        await user.click(menuButton);

        // Verify menu items are visible
        await waitFor(() => {
          expect(screen.getByRole('link', { name: /profile/i })).toBeVisible();
        });
      });

      it('should display charts responsively', async () => {
        vi.spyOn(authService, 'login').mockResolvedValue(mockApiResponses.auth.login);

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

        // Verify chart container adapts to viewport
        const chartContainer = screen.getByTestId('energy-chart');
        expect(chartContainer).toBeInTheDocument();
        
        // Chart should not overflow viewport
        const rect = chartContainer.getBoundingClientRect();
        expect(rect.width).toBeLessThanOrEqual(viewport.width);
      });
    });
  });

  describe('Browser-Specific Features', () => {
    it('should handle localStorage across browsers', async () => {
      const user = userEvent.setup();
      
      vi.spyOn(authService, 'login').mockResolvedValue(mockApiResponses.auth.login);

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

      // Change language
      const languageSelector = screen.getByRole('button', { name: /language|en/i });
      await user.click(languageSelector);

      const portugueseOption = screen.getByRole('menuitem', { name: /português|pt/i });
      await user.click(portugueseOption);

      // Verify language persisted
      expect(localStorage.getItem('i18nextLng')).toBe('pt');
    });

    it('should handle CSS features consistently', async () => {
      vi.spyOn(authService, 'login').mockResolvedValue(mockApiResponses.auth.login);

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

      // Verify CSS Grid/Flexbox layout
      const dashboardContainer = screen.getByTestId('dashboard-container');
      const styles = window.getComputedStyle(dashboardContainer);
      
      // Should use modern layout
      expect(['grid', 'flex']).toContain(styles.display);
    });

    it('should handle date inputs across browsers', async () => {
      const user = userEvent.setup();
      
      vi.spyOn(authService, 'login').mockResolvedValue(mockApiResponses.auth.login);

      renderWithProviders(<App />, {
        preloadedState: {
          auth: {
            isAuthenticated: true,
            user: mockApiResponses.auth.login.user,
            token: mockApiResponses.auth.login.token,
          },
        },
      });

      // Navigate to impact page
      const impactLink = screen.getByRole('link', { name: /impact/i });
      await user.click(impactLink);

      await waitFor(() => {
        expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
      });

      // Test date input
      const dateInput = screen.getByLabelText(/start date/i);
      await user.type(dateInput, '2024-01-01');

      expect(dateInput).toHaveValue('2024-01-01');
    });
  });

  describe('Performance Across Browsers', () => {
    it('should load dashboard within performance budget', async () => {
      const startTime = performance.now();
      
      vi.spyOn(authService, 'login').mockResolvedValue(mockApiResponses.auth.login);
      vi.spyOn(deviceService, 'getDevices').mockResolvedValue(mockApiResponses.devices.list);

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

      const endTime = performance.now();
      const loadTime = endTime - startTime;

      // Should load within 2 seconds (requirement 14.1)
      expect(loadTime).toBeLessThan(2000);
    });

    it('should handle large datasets efficiently', async () => {
      const largeDeviceList = Array.from({ length: 50 }, (_, i) => ({
        id: `${i}`,
        name: `Device ${i}`,
        type: 'computer',
        wattage: 65,
        dailyUsageHours: 8,
        estimatedDailyConsumption: 0.52,
        status: 'active',
      }));

      vi.spyOn(authService, 'login').mockResolvedValue(mockApiResponses.auth.login);
      vi.spyOn(deviceService, 'getDevices').mockResolvedValue(largeDeviceList);

      const startTime = performance.now();

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

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render efficiently even with large datasets
      expect(renderTime).toBeLessThan(3000);
    });
  });
});
