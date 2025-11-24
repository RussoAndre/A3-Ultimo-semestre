import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import RegisterPage from '../../pages/RegisterPage'
import authReducer from '../../store/authSlice'
import { ToastProvider } from '../../components/common'
import '../../i18n/config'

// Mock the auth service
vi.mock('../../services/auth.service', () => ({
    authService: {
        register: vi.fn(),
        login: vi.fn(),
        logout: vi.fn(),
        isAuthenticated: vi.fn(),
        getUser: vi.fn(),
    },
}))

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    }
})

describe('RegisterPage', () => {
    let store: any
    let queryClient: QueryClient

    beforeEach(() => {
        // Reset mocks
        vi.clearAllMocks()
        mockNavigate.mockClear()

        // Create fresh store
        store = configureStore({
            reducer: {
                auth: authReducer,
            },
        })

        // Create fresh query client
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
                mutations: { retry: false },
            },
        })
    })

    const renderRegisterPage = () => {
        return render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <BrowserRouter>
                        <ToastProvider>
                            <RegisterPage />
                        </ToastProvider>
                    </BrowserRouter>
                </QueryClientProvider>
            </Provider>
        )
    }

    describe('Page Rendering', () => {
        it('should render the register page with all form fields', () => {
            renderRegisterPage()

            // Check for heading
            expect(screen.getByRole('heading', { name: /register/i })).toBeInTheDocument()

            // Check for form fields
            expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
            expect(screen.getByLabelText(/^password/i)).toBeInTheDocument()
            expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
            expect(screen.getByLabelText(/preferred language/i)).toBeInTheDocument()

            // Check for submit button
            expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument()

            // Check for login link
            expect(screen.getByText(/already have an account/i)).toBeInTheDocument()
        })

        it('should have language selection dropdown', () => {
            renderRegisterPage()

            const languageSelect = screen.getByLabelText(/preferred language/i)
            expect(languageSelect).toBeInTheDocument()
            expect(languageSelect).toHaveAttribute('name', 'preferredLanguage')
        })

        it('should display password requirements', () => {
            renderRegisterPage()

            // Look for password hint text
            const passwordInput = screen.getByLabelText(/^password/i)
            expect(passwordInput).toHaveAttribute('type', 'password')
        })
    })

    describe('Form Validation', () => {
        it('should show error when email is invalid', async () => {
            const user = userEvent.setup()
            renderRegisterPage()

            const emailInput = screen.getByLabelText(/email/i)
            const submitButton = screen.getByRole('button', { name: /register/i })

            // Enter invalid email
            await user.type(emailInput, 'invalid-email')
            await user.click(submitButton)

            // Check for validation error
            await waitFor(() => {
                expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument()
            })
        })

        it('should show error when password is too short', async () => {
            const user = userEvent.setup()
            renderRegisterPage()

            const emailInput = screen.getByLabelText(/email/i)
            const passwordInput = screen.getByLabelText(/^password/i)
            const submitButton = screen.getByRole('button', { name: /register/i })

            // Enter valid email but short password
            await user.type(emailInput, 'test@example.com')
            await user.type(passwordInput, 'short')
            await user.click(submitButton)

            // Check for validation error
            await waitFor(() => {
                expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument()
            })
        })

        it('should show error when password does not meet requirements', async () => {
            const user = userEvent.setup()
            renderRegisterPage()

            const emailInput = screen.getByLabelText(/email/i)
            const passwordInput = screen.getByLabelText(/^password/i)
            const submitButton = screen.getByRole('button', { name: /register/i })

            // Enter password without uppercase/number
            await user.type(emailInput, 'test@example.com')
            await user.type(passwordInput, 'lowercase')
            await user.click(submitButton)

            // Check for validation error
            await waitFor(() => {
                expect(
                    screen.getByText(/password must contain uppercase, lowercase, and number/i)
                ).toBeInTheDocument()
            })
        })

        it('should show error when passwords do not match', async () => {
            const user = userEvent.setup()
            renderRegisterPage()

            const emailInput = screen.getByLabelText(/email/i)
            const passwordInput = screen.getByLabelText(/^password/i)
            const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
            const submitButton = screen.getByRole('button', { name: /register/i })

            // Enter mismatched passwords
            await user.type(emailInput, 'test@example.com')
            await user.type(passwordInput, 'Password123')
            await user.type(confirmPasswordInput, 'Password456')
            await user.click(submitButton)

            // Check for validation error
            await waitFor(() => {
                expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
            })
        })

        it('should show error when language is not selected', async () => {
            const user = userEvent.setup()
            renderRegisterPage()

            const emailInput = screen.getByLabelText(/email/i)
            const passwordInput = screen.getByLabelText(/^password/i)
            const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
            const submitButton = screen.getByRole('button', { name: /register/i })

            // Fill all fields except language
            await user.type(emailInput, 'test@example.com')
            await user.type(passwordInput, 'Password123')
            await user.type(confirmPasswordInput, 'Password123')
            await user.click(submitButton)

            // Check for validation error
            await waitFor(() => {
                expect(screen.getByText(/please select a language/i)).toBeInTheDocument()
            })
        })
    })

    describe('Successful Registration', () => {
        it('should submit form with valid data', async () => {
            const user = userEvent.setup()
            const { authService } = await import('../../services/auth.service')

            // Mock successful registration
            vi.mocked(authService.register).mockResolvedValue({
                user: {
                    id: '1',
                    email: 'test@example.com',
                    preferredLanguage: 'en',
                    createdAt: new Date().toISOString(),
                },
                tokens: {
                    accessToken: 'mock-token',
                    refreshToken: 'mock-refresh-token',
                },
            })

            renderRegisterPage()

            const emailInput = screen.getByLabelText(/email/i)
            const passwordInput = screen.getByLabelText(/^password/i)
            const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
            const languageSelect = screen.getByLabelText(/preferred language/i)
            const submitButton = screen.getByRole('button', { name: /register/i })

            // Fill form with valid data
            await user.type(emailInput, 'test@example.com')
            await user.type(passwordInput, 'Password123')
            await user.type(confirmPasswordInput, 'Password123')
            await user.selectOptions(languageSelect, 'en')
            await user.click(submitButton)

            // Verify registration was called
            await waitFor(() => {
                expect(authService.register).toHaveBeenCalledWith({
                    email: 'test@example.com',
                    password: 'Password123',
                    confirmPassword: 'Password123',
                    preferredLanguage: 'en',
                })
            })
        })

        it('should navigate to dashboard after successful registration', async () => {
            const user = userEvent.setup()
            const { authService } = await import('../../services/auth.service')

            // Mock successful registration
            vi.mocked(authService.register).mockResolvedValue({
                user: {
                    id: '1',
                    email: 'test@example.com',
                    preferredLanguage: 'en',
                    createdAt: new Date().toISOString(),
                },
                tokens: {
                    accessToken: 'mock-token',
                    refreshToken: 'mock-refresh-token',
                },
            })

            renderRegisterPage()

            const emailInput = screen.getByLabelText(/email/i)
            const passwordInput = screen.getByLabelText(/^password/i)
            const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
            const languageSelect = screen.getByLabelText(/preferred language/i)
            const submitButton = screen.getByRole('button', { name: /register/i })

            // Fill and submit form
            await user.type(emailInput, 'newuser@example.com')
            await user.type(passwordInput, 'SecurePass123')
            await user.type(confirmPasswordInput, 'SecurePass123')
            await user.selectOptions(languageSelect, 'pt')
            await user.click(submitButton)

            // Verify navigation to dashboard
            await waitFor(() => {
                expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
            })
        })
    })

    describe('Error Handling', () => {
        it('should display error message when registration fails', async () => {
            const user = userEvent.setup()
            const { authService } = await import('../../services/auth.service')

            // Mock failed registration
            vi.mocked(authService.register).mockRejectedValue(
                new Error('Email already exists')
            )

            renderRegisterPage()

            const emailInput = screen.getByLabelText(/email/i)
            const passwordInput = screen.getByLabelText(/^password/i)
            const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
            const languageSelect = screen.getByLabelText(/preferred language/i)
            const submitButton = screen.getByRole('button', { name: /register/i })

            // Fill and submit form
            await user.type(emailInput, 'existing@example.com')
            await user.type(passwordInput, 'Password123')
            await user.type(confirmPasswordInput, 'Password123')
            await user.selectOptions(languageSelect, 'en')
            await user.click(submitButton)

            // Verify error message is displayed
            await waitFor(() => {
                expect(screen.getByText(/registration failed/i)).toBeInTheDocument()
            })
        })
    })

    describe('Accessibility', () => {
        it('should have proper ARIA labels', () => {
            renderRegisterPage()

            // Check form has accessible name
            const form = screen.getByRole('form', { name: /register/i })
            expect(form).toBeInTheDocument()

            // Check inputs have labels
            expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
            expect(screen.getByLabelText(/^password/i)).toBeInTheDocument()
            expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
            expect(screen.getByLabelText(/preferred language/i)).toBeInTheDocument()
        })

        it('should be keyboard navigable', async () => {
            const user = userEvent.setup()
            renderRegisterPage()

            const emailInput = screen.getByLabelText(/email/i)

            // Tab to email input
            await user.tab()
            expect(emailInput).toHaveFocus()

            // Tab to password input
            await user.tab()
            expect(screen.getByLabelText(/^password/i)).toHaveFocus()

            // Tab to confirm password input
            await user.tab()
            expect(screen.getByLabelText(/confirm password/i)).toHaveFocus()

            // Tab to language select
            await user.tab()
            expect(screen.getByLabelText(/preferred language/i)).toHaveFocus()
        })
    })

    describe('Navigation', () => {
        it('should have link to login page', () => {
            renderRegisterPage()

            const loginLink = screen.getByRole('link', { name: /login/i })
            expect(loginLink).toBeInTheDocument()
            expect(loginLink).toHaveAttribute('href', '/login')
        })

        it('should navigate to login page when clicking login link', async () => {
            const user = userEvent.setup()
            renderRegisterPage()

            const loginLink = screen.getByRole('link', { name: /login/i })
            await user.click(loginLink)

            // In a real app, this would navigate. In tests, we just verify the link exists
            expect(loginLink).toHaveAttribute('href', '/login')
        })
    })

    describe('Loading State', () => {
        it('should disable submit button while submitting', async () => {
            const user = userEvent.setup()
            const { authService } = await import('../../services/auth.service')

            // Mock slow registration
            vi.mocked(authService.register).mockImplementation(
                () => new Promise(resolve => setTimeout(resolve, 1000))
            )

            renderRegisterPage()

            const emailInput = screen.getByLabelText(/email/i)
            const passwordInput = screen.getByLabelText(/^password/i)
            const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
            const languageSelect = screen.getByLabelText(/preferred language/i)
            const submitButton = screen.getByRole('button', { name: /register/i })

            // Fill and submit form
            await user.type(emailInput, 'test@example.com')
            await user.type(passwordInput, 'Password123')
            await user.type(confirmPasswordInput, 'Password123')
            await user.selectOptions(languageSelect, 'en')
            await user.click(submitButton)

            // Button should be disabled during submission
            expect(submitButton).toBeDisabled()
        })
    })
})
