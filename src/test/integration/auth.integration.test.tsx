import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, mockApiResponses } from '../test-utils';
import LoginPage from '../../pages/LoginPage';
import RegisterPage from '../../pages/RegisterPage';
import * as authService from '../../services/auth.service';

describe('Authentication Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('User Registration Flow', () => {
    it('should complete user registration successfully', async () => {
      const user = userEvent.setup();
      const registerSpy = vi.spyOn(authService, 'register').mockResolvedValue(mockApiResponses.auth.register);

      renderWithProviders(<RegisterPage />);

      // Fill in registration form
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

      await user.type(emailInput, 'newuser@example.com');
      await user.type(passwordInput, 'SecurePass123!');
      await user.type(confirmPasswordInput, 'SecurePass123!');

      // Submit form
      const submitButton = screen.getByRole('button', { name: /register/i });
      await user.click(submitButton);

      // Verify API was called with correct data
      await waitFor(() => {
        expect(registerSpy).toHaveBeenCalledWith({
          email: 'newuser@example.com',
          password: 'SecurePass123!',
          preferredLanguage: expect.any(String),
        });
      });
    });

    it('should display validation errors for invalid inputs', async () => {
      const user = userEvent.setup();
      renderWithProviders(<RegisterPage />);

      // Submit form without filling fields
      const submitButton = screen.getByRole('button', { name: /register/i });
      await user.click(submitButton);

      // Check for validation errors
      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });
    });

    it('should show error when passwords do not match', async () => {
      const user = userEvent.setup();
      renderWithProviders(<RegisterPage />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'Password123!');
      await user.type(confirmPasswordInput, 'DifferentPass123!');

      const submitButton = screen.getByRole('button', { name: /register/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      });
    });
  });

  describe('User Login Flow', () => {
    it('should complete user login successfully', async () => {
      const user = userEvent.setup();
      const loginSpy = vi.spyOn(authService, 'login').mockResolvedValue(mockApiResponses.auth.login);

      renderWithProviders(<LoginPage />);

      // Fill in login form
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'Password123!');

      // Submit form
      const submitButton = screen.getByRole('button', { name: /login|sign in/i });
      await user.click(submitButton);

      // Verify API was called
      await waitFor(() => {
        expect(loginSpy).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'Password123!',
        });
      });
    });

    it('should display error for invalid credentials', async () => {
      const user = userEvent.setup();
      const loginSpy = vi.spyOn(authService, 'login').mockRejectedValue(new Error('Invalid credentials'));

      renderWithProviders(<LoginPage />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await user.type(emailInput, 'wrong@example.com');
      await user.type(passwordInput, 'WrongPassword');

      const submitButton = screen.getByRole('button', { name: /login|sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });
    });

    it('should persist authentication state after login', async () => {
      const user = userEvent.setup();
      vi.spyOn(authService, 'login').mockResolvedValue(mockApiResponses.auth.login);

      const { store } = renderWithProviders(<LoginPage />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'Password123!');

      const submitButton = screen.getByRole('button', { name: /login|sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        const state = store.getState();
        expect(state.auth.isAuthenticated).toBe(true);
        expect(state.auth.user).toBeDefined();
      });
    });
  });
});
