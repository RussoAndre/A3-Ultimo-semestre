# Accessibility Quick Reference Guide

Quick reference for developers working on the EcoTech application.

## Key Accessibility Features

### 1. Skip Links
```tsx
import { SkipLink } from '../components/common'

<SkipLink href="#main-content">Skip to main content</SkipLink>
```

### 2. Focus Indicators
All interactive elements automatically get focus indicators via CSS:
```css
*:focus-visible {
  outline: 3px solid #10B981;
  outline-offset: 2px;
}
```

### 3. ARIA Labels
```tsx
// Navigation
<nav aria-label="Main navigation">

// Buttons
<button aria-label="Close menu">

// Decorative icons
<svg aria-hidden="true">

// Status
<span role="status">Active</span>

// Alerts
<div role="alert" aria-live="assertive">
```

### 4. Semantic HTML
```tsx
// Use semantic elements
<header role="banner">
<nav role="navigation">
<main role="main" id="main-content">
<article>
<section>

// Use description lists for key-value pairs
<dl>
  <dt>Label</dt>
  <dd>Value</dd>
</dl>
```

### 5. Form Accessibility
```tsx
// Always associate labels with inputs
<label htmlFor="email">Email</label>
<input id="email" type="email" />

// Error messages
<input
  id="email"
  aria-describedby="email-error"
  aria-invalid={hasError}
/>
{hasError && (
  <p id="email-error" role="alert">
    Error message
  </p>
)}
```

### 6. Keyboard Navigation
```tsx
// Handle Escape key
useEffect(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }
  document.addEventListener('keydown', handleEscape)
  return () => document.removeEventListener('keydown', handleEscape)
}, [onClose])

// Focus management
const buttonRef = useRef<HTMLButtonElement>(null)
useEffect(() => {
  if (isOpen) {
    buttonRef.current?.focus()
  }
}, [isOpen])
```

### 7. Screen Reader Only Content
```tsx
<span className="sr-only">Loading...</span>
```

### 8. Touch Targets
```tsx
// Minimum 44x44px
<button className="min-w-[44px] min-h-[44px]">
```

### 9. Loading States
```tsx
<div role="status" aria-live="polite">
  <LoadingSpinner />
  <span className="sr-only">Loading...</span>
</div>
```

### 10. Notifications
```tsx
// Critical notifications
<div role="alert" aria-live="assertive">
  Critical error!
</div>

// Non-critical notifications
<div role="status" aria-live="polite">
  Success!
</div>
```

## Common Patterns

### Modal Dialog
```tsx
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="dialog-title"
>
  <h2 id="dialog-title">Dialog Title</h2>
  {/* Content */}
</div>
```

### Dropdown Menu
```tsx
<button
  aria-expanded={isOpen}
  aria-haspopup="true"
  aria-controls="menu"
>
  Menu
</button>
{isOpen && (
  <div id="menu" role="menu">
    <button role="menuitem">Item 1</button>
    <button role="menuitem">Item 2</button>
  </div>
)}
```

### Tabs
```tsx
<div role="tablist">
  <button
    role="tab"
    aria-selected={isActive}
    aria-controls="panel-1"
  >
    Tab 1
  </button>
</div>
<div id="panel-1" role="tabpanel">
  Content
</div>
```

### Accordion
```tsx
<button
  aria-expanded={isOpen}
  aria-controls="section-1"
>
  Section Title
</button>
<div id="section-1" hidden={!isOpen}>
  Content
</div>
```

## Translation Keys

Use these keys for accessibility features:

```tsx
const { t } = useTranslation()

t('accessibility.skipToMain')
t('accessibility.skipToNav')
t('accessibility.closeMenu')
t('accessibility.userMenu')
t('accessibility.loading')
t('accessibility.closeNotification')
```

## Testing Checklist

### Quick Tests
- [ ] Tab through page - all elements reachable?
- [ ] Focus indicators visible?
- [ ] Escape closes modals/menus?
- [ ] Screen reader announces content?
- [ ] Color contrast sufficient?
- [ ] Works at 200% zoom?

### Tools
- **axe DevTools**: Browser extension
- **Lighthouse**: Chrome DevTools
- **WAVE**: Web accessibility tool
- **Screen Reader**: NVDA, JAWS, VoiceOver

## Common Mistakes to Avoid

❌ **Don't:**
- Use `<div>` or `<span>` as buttons
- Forget to associate labels with inputs
- Use color alone to convey information
- Create keyboard traps
- Use `tabindex` > 0
- Forget alt text on images
- Use `aria-label` on non-interactive elements
- Override focus styles without replacement

✅ **Do:**
- Use semantic HTML elements
- Provide text alternatives
- Ensure keyboard accessibility
- Test with screen readers
- Maintain logical heading hierarchy
- Use ARIA appropriately
- Provide clear error messages
- Test with real users

## Resources

- **Full Documentation**: `src/docs/ACCESSIBILITY_IMPLEMENTATION.md`
- **Testing Checklist**: `src/docs/ACCESSIBILITY_TESTING_CHECKLIST.md`
- **WCAG Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/
- **ARIA Practices**: https://www.w3.org/WAI/ARIA/apg/

## Need Help?

1. Check the full documentation in `src/docs/`
2. Review WCAG 2.1 guidelines
3. Test with screen readers
4. Consult ARIA Authoring Practices Guide
5. Ask for accessibility review

---

**Remember**: Accessibility is not optional - it's a requirement!
