# Accessibility Testing Checklist

Use this checklist to verify WCAG 2.1 Level AA compliance for the EcoTech application.

## Automated Testing

### Tools to Use

- [ ] **axe DevTools** - Browser extension for automated accessibility testing
- [ ] **Lighthouse** - Chrome DevTools accessibility audit (target score: 90+)
- [ ] **WAVE** - Web Accessibility Evaluation Tool
- [ ] **Pa11y** - Command-line accessibility testing tool

### Run Tests

```bash
# Install Pa11y (if not already installed)
npm install -g pa11y

# Run Pa11y on local development server
pa11y http://localhost:5173

# Run Lighthouse
lighthouse http://localhost:5173 --only-categories=accessibility --view
```

## Manual Keyboard Testing

### Navigation

- [ ] Tab through all interactive elements in logical order
- [ ] Shift+Tab moves focus backward correctly
- [ ] Focus indicators are clearly visible on all elements
- [ ] No keyboard traps (can always escape from any element)
- [ ] Skip links appear and work when focused
- [ ] Enter/Space activates buttons and links
- [ ] Escape closes modals, dropdowns, and mobile menu

### Specific Components

#### Header
- [ ] Tab to menu button (mobile)
- [ ] Tab to language selector
- [ ] Tab to user menu button
- [ ] Arrow keys navigate user menu items
- [ ] Escape closes user menu

#### Sidebar
- [ ] Tab through all navigation links
- [ ] Enter activates navigation links
- [ ] Escape closes mobile sidebar
- [ ] Focus moves to close button when sidebar opens

#### Forms
- [ ] Tab through all form fields
- [ ] Labels are announced by screen readers
- [ ] Error messages are announced
- [ ] Required fields are indicated
- [ ] Form submission works with Enter key

#### Device Cards
- [ ] Tab to Edit button
- [ ] Tab to Dispose button
- [ ] Tab to Delete button
- [ ] All buttons are activatable with Enter/Space

## Screen Reader Testing

### Screen Readers to Test

- [ ] **NVDA** (Windows) - Free
- [ ] **JAWS** (Windows) - Commercial
- [ ] **VoiceOver** (macOS/iOS) - Built-in
- [ ] **TalkBack** (Android) - Built-in

### VoiceOver Testing (macOS)

```
Enable: Cmd + F5
Navigate: Control + Option + Arrow Keys
Interact: Control + Option + Space
Rotor: Control + Option + U
```

#### Test Cases

- [ ] Page title is announced
- [ ] Headings are properly announced
- [ ] Landmarks are identified (banner, navigation, main)
- [ ] Skip links are announced and functional
- [ ] Form labels are associated with inputs
- [ ] Error messages are announced
- [ ] Button purposes are clear
- [ ] Images have appropriate alt text or aria-hidden
- [ ] Loading states are announced
- [ ] Toast notifications are announced
- [ ] Status changes are announced

### NVDA Testing (Windows)

```
Enable: Ctrl + Alt + N
Navigate: Arrow Keys
Headings List: Insert + F7
Elements List: Insert + F7
Forms Mode: Insert + Space
```

#### Test Cases

- [ ] All interactive elements are reachable
- [ ] Form mode activates automatically in forms
- [ ] ARIA labels are announced correctly
- [ ] Dynamic content updates are announced
- [ ] Tables are navigable (if applicable)

## Visual Testing

### Color Contrast

- [ ] Text contrast ratio ≥ 4.5:1 (normal text)
- [ ] Text contrast ratio ≥ 3:1 (large text 18pt+)
- [ ] UI component contrast ratio ≥ 3:1
- [ ] Focus indicators have sufficient contrast
- [ ] Error messages have sufficient contrast

**Tools:**
- Chrome DevTools Contrast Checker
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/

### Color Blindness

Test with color blindness simulators:

- [ ] Protanopia (red-blind)
- [ ] Deuteranopia (green-blind)
- [ ] Tritanopia (blue-blind)
- [ ] Achromatopsia (total color blindness)

**Tools:**
- Chrome DevTools Vision Deficiency Emulator
- Colorblind Web Page Filter: https://www.toptal.com/designers/colorfilter

### Zoom and Magnification

- [ ] Page is usable at 200% zoom
- [ ] No horizontal scrolling at 200% zoom
- [ ] Text reflows properly
- [ ] No content is cut off
- [ ] Touch targets remain accessible
- [ ] Test at 400% zoom for WCAG AAA

### Focus Indicators

- [ ] All interactive elements have visible focus indicators
- [ ] Focus indicators have 3:1 contrast ratio with background
- [ ] Focus indicators are not obscured by other elements
- [ ] Focus order is logical and predictable

## Mobile Accessibility

### Touch Targets

- [ ] All touch targets are at least 44x44 CSS pixels
- [ ] Adequate spacing between touch targets
- [ ] Buttons are easy to tap on small screens

### Screen Reader (Mobile)

#### iOS VoiceOver
- [ ] Swipe right/left to navigate
- [ ] Double-tap to activate
- [ ] All elements are reachable
- [ ] Proper reading order

#### Android TalkBack
- [ ] Swipe right/left to navigate
- [ ] Double-tap to activate
- [ ] All elements are reachable
- [ ] Proper reading order

### Orientation

- [ ] App works in portrait mode
- [ ] App works in landscape mode
- [ ] Content reflows appropriately
- [ ] No loss of functionality

## Content Testing

### Headings

- [ ] Heading hierarchy is logical (H1 → H2 → H3)
- [ ] No skipped heading levels
- [ ] Headings accurately describe content
- [ ] Only one H1 per page

### Links

- [ ] Link text is descriptive (not "click here")
- [ ] Links are distinguishable from regular text
- [ ] External links are indicated
- [ ] Links have :focus and :hover states

### Images

- [ ] Decorative images have `aria-hidden="true"` or empty alt
- [ ] Informative images have descriptive alt text
- [ ] Complex images have long descriptions
- [ ] Icons have appropriate labels

### Forms

- [ ] All inputs have associated labels
- [ ] Required fields are indicated
- [ ] Error messages are clear and helpful
- [ ] Success messages are announced
- [ ] Fieldsets group related inputs
- [ ] Legends describe fieldset purpose

### Tables (if applicable)

- [ ] Tables have `<caption>` or `aria-label`
- [ ] Header cells use `<th>` with `scope` attribute
- [ ] Data cells use `<td>`
- [ ] Complex tables have proper markup

## Dynamic Content

### Loading States

- [ ] Loading indicators have `role="status"`
- [ ] Loading text is available to screen readers
- [ ] Loading states don't trap focus

### Modals/Dialogs

- [ ] Focus moves to modal when opened
- [ ] Focus is trapped within modal
- [ ] Escape key closes modal
- [ ] Focus returns to trigger element when closed
- [ ] Background content is inert (aria-hidden)

### Notifications/Toasts

- [ ] Notifications have `role="alert"` or `role="status"`
- [ ] Important notifications use `aria-live="assertive"`
- [ ] Non-critical notifications use `aria-live="polite"`
- [ ] Notifications are dismissible
- [ ] Notifications don't auto-dismiss too quickly

### Form Validation

- [ ] Errors are announced to screen readers
- [ ] Error messages are associated with inputs
- [ ] Errors are visually distinct (not just color)
- [ ] Success states are announced

## Reduced Motion

- [ ] Test with `prefers-reduced-motion: reduce`
- [ ] Animations are disabled or reduced
- [ ] Transitions are minimal
- [ ] Auto-playing content is paused
- [ ] Parallax effects are disabled

**Test in browser:**
```css
/* Add to DevTools or browser settings */
@media (prefers-reduced-motion: reduce) {
  /* Verify animations are disabled */
}
```

## Language and Internationalization

- [ ] `lang` attribute is set on `<html>` element
- [ ] Language changes are indicated with `lang` attribute
- [ ] Text direction is correct (LTR/RTL)
- [ ] All UI text is translatable
- [ ] Date/time formats respect locale

## ARIA Usage

### Landmarks

- [ ] `<header>` or `role="banner"`
- [ ] `<nav>` or `role="navigation"`
- [ ] `<main>` or `role="main"`
- [ ] `<footer>` or `role="contentinfo"`
- [ ] `<aside>` or `role="complementary"`

### ARIA Attributes

- [ ] `aria-label` provides accessible names
- [ ] `aria-labelledby` references correct elements
- [ ] `aria-describedby` provides additional context
- [ ] `aria-hidden="true"` on decorative elements
- [ ] `aria-live` for dynamic content
- [ ] `aria-expanded` for expandable elements
- [ ] `aria-current` for current page/step

### ARIA Roles

- [ ] Roles are used appropriately
- [ ] Native HTML elements are preferred
- [ ] Custom widgets have proper roles
- [ ] Role changes are announced

## Browser Testing

Test in multiple browsers:

- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

## Compliance Verification

### WCAG 2.1 Level A

- [ ] All Level A criteria are met
- [ ] No critical accessibility issues

### WCAG 2.1 Level AA

- [ ] All Level AA criteria are met
- [ ] Color contrast meets requirements
- [ ] Resize text up to 200%
- [ ] Multiple ways to find pages
- [ ] Consistent navigation
- [ ] Consistent identification

## Documentation

- [ ] Accessibility features are documented
- [ ] Known issues are documented
- [ ] Remediation plans are in place
- [ ] Testing results are recorded
- [ ] Compliance statement is accurate

## Continuous Testing

- [ ] Accessibility tests in CI/CD pipeline
- [ ] Regular manual testing schedule
- [ ] User testing with people with disabilities
- [ ] Accessibility reviews for new features
- [ ] Team training on accessibility

## Resources

- **WCAG 2.1 Quick Reference**: https://www.w3.org/WAI/WCAG21/quickref/
- **WebAIM Checklist**: https://webaim.org/standards/wcag/checklist
- **A11y Project Checklist**: https://www.a11yproject.com/checklist/
- **ARIA Authoring Practices**: https://www.w3.org/WAI/ARIA/apg/

## Notes

- Document any issues found during testing
- Prioritize issues by severity (Critical, High, Medium, Low)
- Create tickets for remediation
- Retest after fixes are implemented
- Update this checklist as needed

---

**Last Updated**: November 10, 2025
**Tested By**: _____________
**Test Date**: _____________
**Results**: _____________
