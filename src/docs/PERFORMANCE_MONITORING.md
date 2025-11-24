# Performance Monitoring Implementation

This document describes the performance monitoring system implemented in the EcoTech application.

## Overview

The performance monitoring system tracks Web Vitals, API response times, and errors to ensure the application meets performance requirements (sub-2-second response times, Lighthouse score ≥ 90).

## Components

### 1. Performance Monitoring (`src/utils/performanceMonitoring.ts`)

Tracks Web Vitals and custom performance metrics:

- **First Contentful Paint (FCP)**: Time until first content is rendered (target: < 1.8s)
- **Largest Contentful Paint (LCP)**: Time until largest content is rendered (target: < 2.5s)
- **First Input Delay (FID)**: Time from user interaction to browser response (target: < 100ms)
- **Cumulative Layout Shift (CLS)**: Visual stability metric (target: < 0.1)
- **Time to Interactive (TTI)**: Time until page is fully interactive (target: < 3.8s)
- **Time to First Byte (TTFB)**: Server response time (target: < 800ms)

#### Usage

```typescript
import { performanceMonitor, measureAsync, measureSync } from './utils/performanceMonitoring';

// Track custom async operation
await measureAsync('fetchUserData', async () => {
  return await api.get('/users/me');
});

// Track custom sync operation
const result = measureSync('calculateTotal', () => {
  return items.reduce((sum, item) => sum + item.price, 0);
});

// Get metrics summary
const metrics = performanceMonitor.getMetricsSummary();
console.log(metrics);
```

### 2. Error Tracking (`src/utils/errorTracking.ts`)

Captures and logs errors for monitoring and debugging:

- Uncaught errors
- Unhandled promise rejections
- Console errors (in development)
- Custom error tracking

#### Usage

```typescript
import { errorTracker, withErrorTracking } from './utils/errorTracking';

// Capture an error manually
try {
  // risky operation
} catch (error) {
  errorTracker.captureError(error, { context: 'user-action' });
}

// Wrap async function with error tracking
const fetchData = withErrorTracking(async () => {
  return await api.get('/data');
}, { operation: 'fetchData' });

// Set user context for error reports
errorTracker.setUserContext(userId, userEmail);

// Get error statistics
const stats = errorTracker.getErrorStats();
console.log(stats); // { error: 2, warning: 5, info: 10 }
```

### 3. API Monitoring (`src/utils/apiMonitoring.ts`)

Tracks API call performance and response times:

- Request duration tracking
- Success/failure rates
- Slow request detection (> 2 seconds)
- Average response times by endpoint

#### Usage

The API monitoring is automatically integrated into the Axios instance via interceptors. No manual tracking is required.

```typescript
import { apiMonitor } from './utils/apiMonitoring';

// Get API statistics
const stats = apiMonitor.getStats();
console.log(stats);
// {
//   totalCalls: 150,
//   successfulCalls: 145,
//   failedCalls: 5,
//   averageResponseTime: 234,
//   slowestCall: { endpoint: '/api/devices', duration: 1850, ... },
//   fastestCall: { endpoint: '/api/auth/me', duration: 45, ... }
// }

// Get metrics for specific endpoint
const deviceMetrics = apiMonitor.getMetricsByEndpoint('/api/devices');

// Get average response time for endpoint
const avgTime = apiMonitor.getAverageResponseTime('/api/devices');

// Get slow requests
const slowRequests = apiMonitor.getSlowRequests();
```

### 4. Loading Indicators

#### useLoadingIndicator Hook

Shows loading indicators only for actions exceeding 1 second:

```typescript
import { useLoadingIndicator } from '../hooks/useLoadingIndicator';

function MyComponent() {
  const { showLoading, withLoading } = useLoadingIndicator({
    threshold: 1000, // Show after 1 second
    minDisplayTime: 500, // Show for at least 500ms
  });

  const handleSubmit = async () => {
    await withLoading(api.post('/data', formData));
  };

  return (
    <div>
      {showLoading && <LoadingSpinner />}
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}
```

#### Global Loading Indicator

Displays a progress bar at the top of the page:

```typescript
import { GlobalLoadingIndicator } from '../components/common';

function App() {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <>
      <GlobalLoadingIndicator isLoading={isLoading} />
      {/* rest of app */}
    </>
  );
}
```

#### Inline Loading Indicator

Shows a spinner for component-level loading:

```typescript
import { InlineLoadingIndicator } from '../components/common';

function DataDisplay() {
  const { data, isLoading } = useQuery('data', fetchData);

  if (isLoading) {
    return <InlineLoadingIndicator message="Loading data..." size="md" />;
  }

  return <div>{data}</div>;
}
```

#### Button Loading Indicator

Shows loading state within buttons:

```typescript
import { ButtonLoadingIndicator } from '../components/common';

function SubmitButton() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <button disabled={isSubmitting}>
      <ButtonLoadingIndicator isLoading={isSubmitting} loadingText="Saving...">
        Save Changes
      </ButtonLoadingIndicator>
    </button>
  );
}
```

### 5. Performance Dashboard (Development Only)

A floating dashboard that displays real-time performance metrics during development:

- Web Vitals with color-coded ratings
- API performance statistics
- Error tracking statistics
- Clear metrics and log to console actions

The dashboard is automatically included in the app and only visible in development mode. Click the "📊 Performance" button in the bottom-right corner to open it.

## Lighthouse CI Integration

### Local Testing

Run Lighthouse CI locally:

```bash
# Install Lighthouse CI globally
npm install -g @lhci/cli

# Build the application
npm run build

# Run Lighthouse CI
npm run lighthouse

# Run with specific preset
npm run lighthouse:mobile
npm run lighthouse:desktop
```

### CI/CD Integration

Lighthouse CI runs automatically on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

The workflow is defined in `.github/workflows/lighthouse-ci.yml`.

### Configuration

Lighthouse CI configuration is in `lighthouserc.json`:

- **Performance Score**: Minimum 90
- **Accessibility Score**: Minimum 90
- **Best Practices Score**: Minimum 90
- **SEO Score**: Minimum 90
- **FCP**: Maximum 1800ms
- **LCP**: Maximum 2500ms
- **CLS**: Maximum 0.1
- **TBT**: Maximum 300ms
- **TTI**: Maximum 3800ms

## Performance Thresholds

### Web Vitals

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| FCP    | ≤ 1.8s | ≤ 3.0s | > 3.0s |
| LCP    | ≤ 2.5s | ≤ 4.0s | > 4.0s |
| FID    | ≤ 100ms | ≤ 300ms | > 300ms |
| CLS    | ≤ 0.1 | ≤ 0.25 | > 0.25 |
| TTI    | ≤ 3.8s | ≤ 7.3s | > 7.3s |
| TTFB   | ≤ 800ms | ≤ 1.8s | > 1.8s |

### API Response Times

- **Target**: < 2 seconds for all API calls
- **Warning**: > 2 seconds (logged as slow request)
- **Monitoring**: All API calls are tracked automatically

## Best Practices

### 1. Use Loading Indicators Appropriately

```typescript
// ✅ Good: Show loading only for slow operations
const { showLoading, withLoading } = useLoadingIndicator({ threshold: 1000 });

// ❌ Bad: Show loading immediately for fast operations
const [isLoading, setIsLoading] = useState(true);
```

### 2. Track Custom Performance Metrics

```typescript
// Track important user interactions
performanceMonitor.trackCustomMetric('form-submission', duration);
performanceMonitor.trackCustomMetric('chart-render', duration);
```

### 3. Handle Errors Gracefully

```typescript
// Capture errors with context
errorTracker.captureError(error, {
  component: 'DeviceForm',
  action: 'submit',
  userId: user.id,
});
```

### 4. Monitor API Performance

```typescript
// Check for slow endpoints periodically
const slowRequests = apiMonitor.getSlowRequests();
if (slowRequests.length > 0) {
  console.warn('Slow API requests detected:', slowRequests);
}
```

## Monitoring in Production

### Recommended Services

For production monitoring, integrate with:

1. **Sentry** - Error tracking and performance monitoring
2. **Google Analytics** - Web Vitals tracking
3. **LogRocket** - Session replay and error tracking
4. **New Relic** - Full-stack application monitoring

### Integration Example (Sentry)

```typescript
// In performanceMonitoring.ts
import * as Sentry from '@sentry/react';

private sendMetricToAnalytics(metric: PerformanceMetric): void {
  if (import.meta.env.PROD) {
    Sentry.captureMessage(`Performance: ${metric.name}`, {
      level: metric.rating === 'poor' ? 'warning' : 'info',
      tags: {
        metric_name: metric.name,
        metric_rating: metric.rating,
      },
      extra: {
        value: metric.value,
      },
    });
  }
}
```

## Troubleshooting

### High FCP/LCP Times

- Check for render-blocking resources
- Optimize images (use WebP, lazy loading)
- Reduce JavaScript bundle size
- Use code splitting

### High CLS

- Set explicit dimensions for images and videos
- Avoid inserting content above existing content
- Use CSS transforms instead of layout-triggering properties

### Slow API Responses

- Check network conditions
- Optimize database queries
- Implement caching
- Use pagination for large datasets

### High Error Rates

- Check error logs in Performance Dashboard
- Review error context and stack traces
- Fix common error patterns
- Add better error handling

## Requirements Satisfied

This implementation satisfies the following requirements:

- **14.1**: Sub-2-second response times with performance monitoring
- **14.5**: Loading indicators for actions exceeding 1 second
- **Lighthouse CI**: Automated performance tracking with score ≥ 90
- **Error Tracking**: Comprehensive error monitoring and logging
- **API Monitoring**: Response time tracking and optimization
