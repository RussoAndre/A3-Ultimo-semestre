# Common UI Components

This directory contains the design system and common UI components for the EcoTech application.

## Components

### Layout Components

#### Layout
Main layout wrapper that includes Header and Sidebar navigation.

```tsx
import { Layout } from './components/common'

function App() {
  return (
    <Layout>
      <YourContent />
    </Layout>
  )
}
```

#### Header
Top navigation bar with logo, menu toggle, language selector, and user menu.

#### Sidebar
Collapsible sidebar navigation with links to all main sections. Responsive with mobile overlay.

### UI Components

#### Button
Reusable button component with primary/secondary variants and loading state.

```tsx
import { Button } from './components/common'

<Button variant="primary" onClick={handleClick}>
  Click Me
</Button>

<Button variant="secondary" isLoading={loading}>
  Loading...
</Button>
```

Props:
- `variant`: 'primary' | 'secondary' (default: 'primary')
- `isLoading`: boolean (default: false)
- `disabled`: boolean
- All standard button HTML attributes

#### Card
Container component with consistent styling (rounded corners, shadows, padding).

```tsx
import { Card } from './components/common'

<Card>
  <h3>Card Title</h3>
  <p>Card content</p>
</Card>
```

#### LoadingSpinner
Animated loading indicator with optional text.

```tsx
import { LoadingSpinner } from './components/common'

<LoadingSpinner size="lg" text="Loading..." />
```

Props:
- `size`: 'sm' | 'md' | 'lg' (default: 'md')
- `text`: string (optional)

#### LanguageSelector
Dropdown to switch between English and Portuguese.

### Error Handling

#### ErrorBoundary
React error boundary component that catches JavaScript errors and displays a fallback UI.

```tsx
import { ErrorBoundary } from './components/common'

<ErrorBoundary>
  <YourApp />
</ErrorBoundary>
```

Props:
- `fallback`: ReactNode (optional custom fallback UI)

### Toast Notifications

#### ToastProvider & useToast
Context provider and hook for displaying toast notifications.

```tsx
// Wrap your app with ToastProvider
import { ToastProvider } from './components/common'

<ToastProvider>
  <App />
</ToastProvider>

// Use the hook in your components
import { useToast } from './components/common'

function MyComponent() {
  const toast = useToast()
  
  const handleSuccess = () => {
    toast.success('Operation successful!')
  }
  
  const handleError = () => {
    toast.error('Something went wrong')
  }
  
  const handleWarning = () => {
    toast.warning('Warning message')
  }
  
  const handleInfo = () => {
    toast.info('Information message')
  }
  
  return (
    <Button onClick={handleSuccess}>Show Toast</Button>
  )
}
```

Toast methods:
- `success(message, duration?)`: Show success toast
- `error(message, duration?)`: Show error toast
- `warning(message, duration?)`: Show warning toast
- `info(message, duration?)`: Show info toast
- `showToast(message, type, duration?)`: Generic toast method

## Accessibility Features

All components follow WCAG 2.1 Level AA standards:

- **Keyboard Navigation**: All interactive elements are keyboard accessible
- **ARIA Labels**: Proper ARIA attributes for screen readers
- **Focus Indicators**: Visible focus states for keyboard navigation
- **Touch Targets**: Minimum 44x44px touch targets on mobile
- **Color Contrast**: 4.5:1 contrast ratio for text
- **Semantic HTML**: Proper HTML5 semantic elements

## Responsive Design

All components are fully responsive and work across:
- Mobile: 320px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px+

## Design Tokens

### Colors
- Primary Green: `#10B981` (primary-500)
- Primary Blue: `#3B82F6` (secondary-500)
- Success: `#10B981`
- Error: `#EF4444`
- Warning: `#F59E0B`
- Info: `#3B82F6`

### Spacing
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px

### Typography
- Font Family: Inter
- Headings: 700 weight
- Body: 400 weight
- Small: 14px

## Usage Example

```tsx
import { 
  Layout, 
  Card, 
  Button, 
  LoadingSpinner, 
  useToast 
} from './components/common'

function Dashboard() {
  const toast = useToast()
  const [loading, setLoading] = useState(false)
  
  const handleAction = async () => {
    setLoading(true)
    try {
      await someAsyncOperation()
      toast.success('Action completed!')
    } catch (error) {
      toast.error('Action failed')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <Layout>
      <Card>
        <h2>Dashboard</h2>
        {loading ? (
          <LoadingSpinner size="lg" text="Processing..." />
        ) : (
          <Button onClick={handleAction}>
            Perform Action
          </Button>
        )}
      </Card>
    </Layout>
  )
}
```

## Requirements Covered

This implementation satisfies the following requirements:
- **10.1**: Responsive interface (320px to 2560px)
- **10.4**: Touch-friendly elements (44x44px minimum)
- **14.5**: Loading indicators for async operations
- **11.1-11.5**: WCAG 2.1 Level AA accessibility compliance
