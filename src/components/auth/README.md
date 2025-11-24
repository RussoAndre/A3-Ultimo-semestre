# Authentication System

This directory contains the authentication components and related functionality for the EcoTech application.

## Components

### LoginForm
Form component for user login with email/password validation.
- Email validation with regex pattern
- Password minimum length validation (8 characters)
- Remember Me checkbox for persistent sessions
- Loading and error states

### RegisterForm
Form component for user registration with comprehensive validation.
- Email validation
- Password strength validation (uppercase, lowercase, number)
- Password confirmation matching
- Language preference selection (English/Portuguese)
- Loading and error states

### ProtectedRoute
Route wrapper component that guards protected routes.
- Redirects unauthenticated users to login
- Preserves attempted location for post-login redirect
- Shows loading spinner during authentication check

## Services

### auth.service.ts
Authentication service handling API calls and token management.
- `login()` - Authenticate user with credentials
- `register()` - Create new user account
- `logout()` - End user session
- `refreshToken()` - Refresh expired access token
- `getCurrentUser()` - Fetch current user data
- Token storage in localStorage (remember me) or sessionStorage

### api.ts
Base API service with Axios configuration.
- Automatic token injection in request headers
- Automatic token refresh on 401 responses
- Request/response interceptors
- Error handling

## State Management

### authSlice.ts
Redux slice for authentication state.
- User data
- Access and refresh tokens
- Authentication status
- Loading and error states
- Async thunks for login, register, logout

## Hooks

### useAuth
Custom hook providing authentication functionality.
- Access to user data and auth status
- Login, register, logout functions
- User refresh function
- Loading and error states

## Pages

### LoginPage
Full login page with form and navigation to register.

### RegisterPage
Full registration page with form and navigation to login.

### DashboardPage
Protected dashboard page (example of protected route).

## Usage

```tsx
// In a component
import { useAuth } from '../../hooks/useAuth'

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth()
  
  // Use authentication state and functions
}

// Protecting a route
import { ProtectedRoute } from './components/auth'

<Route path="/dashboard" element={
  <ProtectedRoute>
    <DashboardPage />
  </ProtectedRoute>
} />
```

## Environment Variables

Required in `.env`:
```
VITE_API_BASE_URL=http://localhost:4000/api
```

## Security Features

- OAuth 2.0 authentication flow
- JWT token management
- Automatic token refresh
- Secure token storage (httpOnly cookies recommended for production)
- Password validation requirements
- LGPD compliance ready
