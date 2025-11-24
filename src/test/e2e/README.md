# End-to-End Tests

This directory contains comprehensive end-to-end tests for the EcoTech Energy Management System.

## Test Coverage

### User Journey Tests (`user-journey.e2e.test.tsx`)

Tests complete user workflows through the application:

1. **User Registration to Dashboard Flow**
   - Complete registration process
   - Automatic redirect to dashboard
   - Dashboard data loading
   - Error handling for registration failures

2. **Device Management Complete Workflow**
   - Adding new devices
   - Editing device information
   - Deleting devices
   - Recording device disposal
   - Points awarded for recycling

3. **Rewards Earning and Badge Unlocking**
   - Earning points for completing recommendations
   - Badge unlocking at tier thresholds
   - Leaderboard display with user consent
   - Points history tracking

4. **Profile Updates and Settings Changes**
   - Updating profile settings
   - Changing language preferences
   - Toggling notification preferences
   - Managing leaderboard consent

5. **Multilingual Functionality**
   - Switching between English and Portuguese
   - Language persistence across sessions
   - Dynamic content translation
   - Recommendation and report translations

### Education and Impact Tests (`education-impact.e2e.test.tsx`)

Tests educational content and environmental impact features:

1. **Educational Content Workflow**
   - Browsing articles
   - Completing articles
   - Earning points for reading
   - Filtering by category
   - Searching articles

2. **Environmental Impact Reporting**
   - Generating impact reports
   - Viewing impact metrics
   - Downloading PDF reports
   - Filtering by date range
   - Comparing to previous periods

3. **Complete Education to Impact Journey**
   - Reading educational content
   - Earning points
   - Viewing updated impact metrics
   - Checking rewards progress

### Cross-Browser Tests (`cross-browser.e2e.test.tsx`)

Tests application compatibility across different browsers and viewports:

1. **Browser Compatibility**
   - Chrome rendering and interactions
   - Firefox rendering and interactions
   - Safari rendering and interactions
   - Consistent form validation
   - Navigation across browsers

2. **Responsive Design**
   - Mobile viewport rendering (iPhone, Android)
   - Tablet viewport rendering (iPad)
   - Touch interactions
   - Responsive charts
   - Mobile navigation

3. **Browser-Specific Features**
   - localStorage compatibility
   - CSS Grid/Flexbox support
   - Date input handling
   - Performance across browsers

## Running Tests

### Run All E2E Tests
```bash
npm run test:e2e
```

### Run E2E Tests in Watch Mode
```bash
npm run test:e2e:watch
```

### Run Specific Test File
```bash
npm run test:e2e -- user-journey.e2e.test.tsx
```

### Run All Tests (Unit + Integration + E2E)
```bash
npm run test:all
```

## Test Configuration

E2E tests are configured with:
- **Timeout**: 30 seconds per test
- **Retries**: 2 retries for flaky tests
- **Environment**: jsdom for browser simulation
- **Mocking**: API services mocked for consistent testing

## Requirements Coverage

These E2E tests cover the following requirements:

- **Requirement 1.1**: User registration and authentication
- **Requirement 2.1**: Device registration and management
- **Requirement 8.1**: Rewards and points system
- **Requirement 9.5**: Profile updates and settings
- **Requirement 13.1**: Multilingual support
- **Requirement 7.1**: Educational content access
- **Requirement 7.3**: Points for completing education
- **Requirement 6.1**: Environmental impact reporting
- **Requirement 6.5**: Report download functionality
- **Requirement 10.1-10.5**: Responsive design and mobile optimization

## Best Practices

1. **Test Isolation**: Each test is independent and doesn't rely on other tests
2. **Mock API Calls**: All API calls are mocked for consistent, fast tests
3. **User-Centric**: Tests simulate real user interactions
4. **Accessibility**: Tests use accessible queries (roles, labels)
5. **Wait Strategies**: Proper use of `waitFor` for async operations
6. **Clean State**: `beforeEach` hooks ensure clean state for each test

## Debugging Tests

### View Test UI
```bash
npm run test:ui
```

### Run Tests with Verbose Output
```bash
npm run test:e2e -- --reporter=verbose
```

### Debug Specific Test
Add `.only` to focus on a single test:
```typescript
it.only('should complete registration', async () => {
  // test code
});
```

## CI/CD Integration

These tests are designed to run in CI/CD pipelines:
- Fast execution with mocked APIs
- No external dependencies
- Deterministic results
- Comprehensive coverage

## Future Enhancements

Potential improvements for E2E testing:

1. **Real Browser Testing**: Integration with Playwright or Cypress for real browser testing
2. **Visual Regression**: Screenshot comparison for UI consistency
3. **Performance Metrics**: Detailed performance tracking across tests
4. **Network Conditions**: Testing under various network conditions
5. **Accessibility Audits**: Automated accessibility testing with axe-core
