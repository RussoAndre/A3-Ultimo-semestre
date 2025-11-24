# Security Quick Reference Guide

Quick reference for developers working with the EcoTech security features.

## Authentication

### Login
```typescript
import { useAuth } from './hooks/useAuth'

const { login, isLoading, error } = useAuth()

await login({
  email: 'user@example.com',
  password: 'SecurePass123!',
  rememberMe: true
})
```

### Check Authentication
```typescript
const { isAuthenticated, user } = useAuth()

if (isAuthenticated) {
  console.log('User:', user)
}
```

### Logout
```typescript
const { logout } = useAuth()
await logout()
```

## Input Validation

### Validate Email
```typescript
import { validateEmail } from './utils/validation'

const result = validateEmail('user@example.com')
if (!result.isValid) {
  console.error(result.errors)
}
```

### Validate Password
```typescript
import { validatePassword } from './utils/validation'

const result = validatePassword('MyPassword123!')
if (!result.isValid) {
  console.error(result.errors)
}
```

### Form Validation Hook
```typescript
import { useFormValidation } from './hooks/useFormValidation'

const { values, errors, getFieldProps, handleSubmit } = useFormValidation({
  initialValues: { email: '', password: '' },
  validationRules: {
    email: (value) => validateEmail(value),
    password: (value) => validatePassword(value),
  },
})

<input {...getFieldProps('email')} />
{errors.email && <span>{errors.email[0]}</span>}
```

## Input Sanitization

### Sanitize String
```typescript
import { sanitizeString } from './utils/security'

const clean = sanitizeString(userInput)
```

### Sanitize HTML
```typescript
import { sanitizeHTML } from './utils/validation'

const clean = sanitizeHTML(htmlContent)
```

## LGPD Compliance

### Get User Consents
```typescript
import { useLGPD } from './hooks/useLGPD'

const { getConsents } = useLGPD()
const consents = await getConsents()
```

### Update Consent
```typescript
const { updateConsent } = useLGPD()
await updateConsent('analytics', true)
```

### Request Data Export
```typescript
const { requestDataExport, downloadDataExport } = useLGPD()
const request = await requestDataExport()
await downloadDataExport(request.id)
```

### Request Data Deletion
```typescript
const { requestDataDeletion } = useLGPD()
await requestDataDeletion('User requested account closure')
```

## Session Management

### Use Session Manager
```typescript
import { useSessionManager } from './hooks/useSessionManager'

const { isSessionValid, getTimeUntilExpiry, resetSession } = useSessionManager()

// Check if session is valid
if (isSessionValid()) {
  console.log('Session is active')
}

// Get time until expiry
const timeLeft = getTimeUntilExpiry()
console.log(`Session expires in ${timeLeft}ms`)

// Reset session after user activity
resetSession()
```

## Encryption

### Encrypt Data
```typescript
import { encryptData } from './utils/encryption'

const encrypted = await encryptData('sensitive data', 'password')
```

### Decrypt Data
```typescript
import { decryptData } from './utils/encryption'

const decrypted = await decryptData(encrypted, 'password')
```

### Secure Storage
```typescript
import { SecureStorage } from './utils/encryption'

const storage = new SecureStorage('encryption-password')
await storage.setItem('key', 'value')
const value = await storage.getItem('key')
```

## Rate Limiting

### Check Rate Limit
```typescript
import { rateLimiter, RATE_LIMITS } from './utils/security'

if (rateLimiter.isRateLimited('login:user@example.com', RATE_LIMITS.LOGIN)) {
  console.error('Too many attempts')
}

// Record attempt
rateLimiter.recordAttempt('login:user@example.com')

// Reset on success
rateLimiter.reset('login:user@example.com')
```

## Security Headers

### Check Security Features
```typescript
import { checkSecurityFeatures } from './utils/securityHeaders'

const check = checkSecurityFeatures()
if (!check.isSecure) {
  console.warn('Security warnings:', check.warnings)
}
```

## API Calls with Security

### Making Secure API Calls
```typescript
import { apiService } from './services/api'

// CSRF token is automatically added to POST/PUT/PATCH/DELETE requests
// Authorization header is automatically added if token exists

const data = await apiService.post('/endpoint', { data })
```

## Common Patterns

### Protected Route
```typescript
import { ProtectedRoute } from './components/auth'

<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  }
/>
```

### Form with Validation
```typescript
const LoginForm = () => {
  const { handleSubmit, getFieldProps, errors } = useFormValidation({
    initialValues: { email: '', password: '' },
    validationRules: {
      email: validateEmail,
      password: validatePassword,
    },
  })

  const onSubmit = async (values) => {
    await login(values)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...getFieldProps('email')} />
      {errors.email && <span>{errors.email[0]}</span>}
      
      <input {...getFieldProps('password')} type="password" />
      {errors.password && <span>{errors.password[0]}</span>}
      
      <button type="submit">Login</button>
    </form>
  )
}
```

### LGPD Consent Component
```typescript
import { ConsentManagement } from './components/profile/ConsentManagement'

<ConsentManagement />
```

### Data Management Component
```typescript
import { DataManagement } from './components/profile/DataManagement'

<DataManagement />
```

## Security Checklist

### Before Committing Code
- [ ] All user inputs are validated
- [ ] All user inputs are sanitized
- [ ] No sensitive data in console.logs
- [ ] No hardcoded credentials
- [ ] Error messages don't leak sensitive info
- [ ] SQL queries use parameterized queries (backend)
- [ ] XSS prevention measures in place
- [ ] CSRF tokens used for state-changing operations

### Before Deployment
- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Audit logging enabled
- [ ] Backups configured
- [ ] Error monitoring set up
- [ ] Dependencies updated
- [ ] Security scan completed

## Environment Variables

Required environment variables:
```
VITE_API_BASE_URL=https://api.example.com
VITE_APP_URL=https://app.example.com
```

Optional security-related variables:
```
VITE_DISABLE_RIGHT_CLICK=false
VITE_DISABLE_TEXT_SELECTION=false
VITE_BREAK_OUT_OF_IFRAME=true
```

## Common Issues

### Token Expired
- Tokens are automatically refreshed
- If refresh fails, user is redirected to login
- Check token expiration settings in `src/config/security.ts`

### Rate Limited
- Wait for the rate limit window to expire
- Check rate limit configuration in `src/utils/security.ts`
- Adjust limits if needed for your use case

### Session Expired
- Sessions expire after 30 minutes of inactivity
- User is automatically logged out
- Adjust timeout in `src/config/security.ts`

### CORS Errors
- Ensure API server has correct CORS configuration
- Check `withCredentials: true` in API service
- Verify API_BASE_URL is correct

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [LGPD Official Text](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

## Support

For security issues or questions:
- Review `src/docs/SECURITY_IMPLEMENTATION.md`
- Check code examples in this guide
- Contact security team: security@ecotech.example.com
