import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, mockApiResponses } from '../test-utils';
import App from '../../App';
import * as authService from '../../services/auth.service';
import * as educationService from '../../services/education.service';
import * as impactService from '../../services/impact.service';
import * as rewardsService from '../../services/rewards.service';

/**
 * End-to-End Tests for Education and Impact Features
 * 
 * These tests cover:
 * - Educational content completion workflow
 * - Impact report generation and download
 * - Points earning through education
 * 
 * Requirements: 7.1, 7.3, 6.1, 6.5
 */

describe('E2E: Education and Impact Features', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('Educational Content Workflow', () => {
    beforeEach(() => {
      vi.spyOn(authService, 'login').mockResolvedValue(mockApiResponses.auth.login);
    });

    it('should browse and complete educational articles', async () => {
      const user = userEvent.setup();
      
      vi.spyOn(educationService, 'getArticles').mockResolvedValue(mockApiResponses.education.articles);
      const completeArticleSpy = vi.spyOn(educationService, 'completeArticle').mockResolvedValue({
        ...mockApiResponses.education.articles[0],
        completed: true,
      });
      const awardPointsSpy = vi.spyOn(rewardsService, 'awardPoints').mockResolvedValue({
        totalPoints: 110,
        pointsAwarded: 10,
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

      // Navigate to education page
      const educationLink = screen.getByRole('link', { name: /education|learn/i });
      await user.click(educationLink);

      await waitFor(() => {
        expect(screen.getByText(/green computing basics/i)).toBeInTheDocument();
      });

      // Click on article
      const articleCard = screen.getByText(/green computing basics/i);
      await user.click(articleCard);

      // Read article and mark as complete
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /mark as complete|complete/i })).toBeInTheDocument();
      });

      const completeButton = screen.getByRole('button', { name: /mark as complete|complete/i });
      await user.click(completeButton);

      // Verify article completion and points awarded
      await waitFor(() => {
        expect(completeArticleSpy).toHaveBeenCalledWith('1');
        expect(awardPointsSpy).toHaveBeenCalledWith(expect.any(String), 10, 'article_completed');
      });

      // Verify points notification
      await waitFor(() => {
        expect(screen.getByText(/10 points/i)).toBeInTheDocument();
      });
    });

    it('should filter articles by category', async () => {
      const user = userEvent.setup();
      
      const allArticles = [
        {
          id: '1',
          title: 'Green Computing Basics',
          category: 'green-computing',
          sdgRelated: 'SDG 13',
          pointsReward: 10,
          completed: false,
        },
        {
          id: '2',
          title: 'Responsible Consumption',
          category: 'sdg-12',
          sdgRelated: 'SDG 12',
          pointsReward: 10,
          completed: false,
        },
      ];

      vi.spyOn(educationService, 'getArticles').mockResolvedValue(allArticles);

      renderWithProviders(<App />, {
        preloadedState: {
          auth: {
            isAuthenticated: true,
            user: mockApiResponses.auth.login.user,
            token: mockApiResponses.auth.login.token,
          },
        },
      });

      // Navigate to education
      const educationLink = screen.getByRole('link', { name: /education|learn/i });
      await user.click(educationLink);

      await waitFor(() => {
        expect(screen.getByText(/green computing basics/i)).toBeInTheDocument();
        expect(screen.getByText(/responsible consumption/i)).toBeInTheDocument();
      });

      // Filter by category
      const categoryFilter = screen.getByRole('combobox', { name: /category|filter/i });
      await user.selectOptions(categoryFilter, 'green-computing');

      // Verify only green computing articles are shown
      await waitFor(() => {
        expect(screen.getByText(/green computing basics/i)).toBeInTheDocument();
        expect(screen.queryByText(/responsible consumption/i)).not.toBeInTheDocument();
      });
    });

    it('should search for articles', async () => {
      const user = userEvent.setup();
      
      const allArticles = [
        {
          id: '1',
          title: 'Green Computing Basics',
          category: 'green-computing',
          sdgRelated: 'SDG 13',
          pointsReward: 10,
          completed: false,
        },
        {
          id: '2',
          title: 'Energy Saving Tips',
          category: 'energy',
          sdgRelated: 'SDG 13',
          pointsReward: 10,
          completed: false,
        },
      ];

      vi.spyOn(educationService, 'getArticles').mockResolvedValue(allArticles);

      renderWithProviders(<App />, {
        preloadedState: {
          auth: {
            isAuthenticated: true,
            user: mockApiResponses.auth.login.user,
            token: mockApiResponses.auth.login.token,
          },
        },
      });

      // Navigate to education
      const educationLink = screen.getByRole('link', { name: /education|learn/i });
      await user.click(educationLink);

      await waitFor(() => {
        expect(screen.getByText(/green computing basics/i)).toBeInTheDocument();
      });

      // Search for articles
      const searchInput = screen.getByRole('textbox', { name: /search/i });
      await user.type(searchInput, 'energy');

      // Verify search results
      await waitFor(() => {
        expect(screen.getByText(/energy saving tips/i)).toBeInTheDocument();
        expect(screen.queryByText(/green computing basics/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Environmental Impact Reporting', () => {
    beforeEach(() => {
      vi.spyOn(authService, 'login').mockResolvedValue(mockApiResponses.auth.login);
    });

    it('should generate and view impact report', async () => {
      const user = userEvent.setup();
      
      const getImpactSpy = vi.spyOn(impactService, 'getImpactReport').mockResolvedValue(mockApiResponses.impact.report);

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
      const impactLink = screen.getByRole('link', { name: /impact|environmental/i });
      await user.click(impactLink);

      // Verify impact report is loaded
      await waitFor(() => {
        expect(getImpactSpy).toHaveBeenCalled();
      });

      // Verify impact metrics are displayed
      await waitFor(() => {
        expect(screen.getByText(/50/)).toBeInTheDocument(); // energySavedKwh
        expect(screen.getByText(/25/)).toBeInTheDocument(); // co2ReductionKg
        expect(screen.getByText(/2/)).toBeInTheDocument(); // treesEquivalent
      });
    });

    it('should download impact report as PDF', async () => {
      const user = userEvent.setup();
      
      vi.spyOn(impactService, 'getImpactReport').mockResolvedValue(mockApiResponses.impact.report);
      const downloadSpy = vi.spyOn(impactService, 'downloadReport').mockResolvedValue(new Blob(['PDF content']));

      // Mock URL.createObjectURL
      global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
      global.URL.revokeObjectURL = vi.fn();

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
      const impactLink = screen.getByRole('link', { name: /impact|environmental/i });
      await user.click(impactLink);

      await waitFor(() => {
        expect(screen.getByText(/download report/i)).toBeInTheDocument();
      });

      // Click download button
      const downloadButton = screen.getByRole('button', { name: /download report/i });
      await user.click(downloadButton);

      // Verify download was initiated
      await waitFor(() => {
        expect(downloadSpy).toHaveBeenCalled();
      });
    });

    it('should filter impact report by date range', async () => {
      const user = userEvent.setup();
      
      const getImpactSpy = vi.spyOn(impactService, 'getImpactReport').mockResolvedValue(mockApiResponses.impact.report);

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
      const impactLink = screen.getByRole('link', { name: /impact|environmental/i });
      await user.click(impactLink);

      await waitFor(() => {
        expect(screen.getByText(/date range/i)).toBeInTheDocument();
      });

      // Select date range
      const startDateInput = screen.getByLabelText(/start date/i);
      const endDateInput = screen.getByLabelText(/end date/i);

      await user.type(startDateInput, '2024-01-01');
      await user.type(endDateInput, '2024-01-31');

      const applyButton = screen.getByRole('button', { name: /apply|filter/i });
      await user.click(applyButton);

      // Verify API called with date range
      await waitFor(() => {
        expect(getImpactSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            startDate: '2024-01-01',
            endDate: '2024-01-31',
          })
        );
      });
    });

    it('should display comparison to previous period', async () => {
      const user = userEvent.setup();
      
      vi.spyOn(impactService, 'getImpactReport').mockResolvedValue({
        ...mockApiResponses.impact.report,
        comparisonToPreviousPeriod: {
          energySavedChange: 15,
          co2ReductionChange: 10,
        },
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

      // Navigate to impact page
      const impactLink = screen.getByRole('link', { name: /impact|environmental/i });
      await user.click(impactLink);

      // Verify comparison is displayed
      await waitFor(() => {
        expect(screen.getByText(/15%/i)).toBeInTheDocument();
        expect(screen.getByText(/improvement|increase/i)).toBeInTheDocument();
      });
    });
  });

  describe('Complete User Journey: Education to Impact', () => {
    it('should complete full cycle from learning to seeing impact', async () => {
      const user = userEvent.setup();
      
      vi.spyOn(authService, 'login').mockResolvedValue(mockApiResponses.auth.login);
      vi.spyOn(educationService, 'getArticles').mockResolvedValue(mockApiResponses.education.articles);
      vi.spyOn(educationService, 'completeArticle').mockResolvedValue({
        ...mockApiResponses.education.articles[0],
        completed: true,
      });
      vi.spyOn(rewardsService, 'awardPoints').mockResolvedValue({
        totalPoints: 110,
        pointsAwarded: 10,
      });
      vi.spyOn(impactService, 'getImpactReport').mockResolvedValue(mockApiResponses.impact.report);

      renderWithProviders(<App />, {
        preloadedState: {
          auth: {
            isAuthenticated: true,
            user: mockApiResponses.auth.login.user,
            token: mockApiResponses.auth.login.token,
          },
        },
      });

      // Step 1: Read educational article
      const educationLink = screen.getByRole('link', { name: /education|learn/i });
      await user.click(educationLink);

      await waitFor(() => {
        expect(screen.getByText(/green computing basics/i)).toBeInTheDocument();
      });

      const articleCard = screen.getByText(/green computing basics/i);
      await user.click(articleCard);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /mark as complete|complete/i })).toBeInTheDocument();
      });

      const completeButton = screen.getByRole('button', { name: /mark as complete|complete/i });
      await user.click(completeButton);

      // Verify points earned
      await waitFor(() => {
        expect(screen.getByText(/10 points/i)).toBeInTheDocument();
      });

      // Step 2: View impact report
      const impactLink = screen.getByRole('link', { name: /impact|environmental/i });
      await user.click(impactLink);

      // Verify impact metrics
      await waitFor(() => {
        expect(screen.getByText(/sustainability score/i)).toBeInTheDocument();
        expect(screen.getByText(/75/)).toBeInTheDocument();
      });

      // Step 3: Check rewards
      const rewardsLink = screen.getByRole('link', { name: /rewards/i });
      await user.click(rewardsLink);

      // Verify total points updated
      await waitFor(() => {
        expect(screen.getByText(/110/)).toBeInTheDocument();
      });
    });
  });
});
