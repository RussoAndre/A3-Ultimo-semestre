# Troubleshooting Blank Page

## Quick Diagnostic Steps

### 1. Check Browser Console

Open your browser's Developer Tools (F12 or Right-click → Inspect) and check the Console tab for any error messages.

Common errors to look for:
- Module import errors
- TypeScript compilation errors  
- Runtime JavaScript errors
- Network request failures

### 2. Check Network Tab

In Developer Tools, go to the Network tab and refresh the page. Look for:
- Failed requests (red status codes)
- Missing files (404 errors)
- CORS errors

### 3. Clear Browser Cache

Sometimes cached files can cause issues:
```bash
# In your browser:
- Press Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)
- Select "Cached images and files"
- Click "Clear data"
```

### 4. Clear Vite Cache

```bash
# Stop the dev server (Ctrl+C)
rm -rf node_modules/.vite
npm run dev
```

### 5. Check Terminal Output

Look at your terminal where `npm run dev` is running. Check for:
- Compilation errors
- Warning messages
- Port conflicts

## Common Issues and Solutions

### Issue: "Cannot find module" errors

**Solution:**
```bash
npm install
npm run dev
```

### Issue: Port already in use

**Solution:**
The dev server will automatically use the next available port. Check the terminal output for the actual URL.

### Issue: White screen with no errors

**Solution:**
1. Open browser console (F12)
2. Look for JavaScript errors
3. Check if `<div id="root"></div>` exists in the page source
4. Verify the app is actually loading by checking Network tab

### Issue: i18n or translation errors

**Solution:**
Check that both translation files exist:
- `src/i18n/locales/en.json`
- `src/i18n/locales/pt.json`

### Issue: Redux store errors

**Solution:**
Check that the store is properly configured in `src/store/index.ts`

## Manual Testing

If the page is still blank, try this minimal test:

1. **Create a test file** `src/Test.tsx`:
```tsx
export default function Test() {
  return <div>Hello EcoTech!</div>
}
```

2. **Temporarily modify** `src/main.tsx`:
```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import Test from './Test'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Test />
  </React.StrictMode>,
)
```

3. **Refresh the browser**

If you see "Hello EcoTech!", the issue is with one of the app dependencies. Gradually add back components to identify the problem.

## Check These Files

1. **index.html** - Verify `<div id="root"></div>` exists
2. **src/main.tsx** - Check for import errors
3. **src/App.tsx** - Verify component structure
4. **src/i18n/config.ts** - Check i18n initialization
5. **src/store/index.ts** - Verify Redux store setup

## Get Detailed Error Information

Add this to the top of `src/main.tsx` to catch all errors:

```typescript
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error)
  document.body.innerHTML = `
    <div style="padding: 20px; font-family: monospace;">
      <h1>Application Error</h1>
      <pre>${event.error?.stack || event.error}</pre>
    </div>
  `
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason)
})
```

## Still Having Issues?

Please provide:
1. **Browser console errors** (screenshot or copy-paste)
2. **Terminal output** from `npm run dev`
3. **Browser and version** you're using
4. **Operating system**

This will help diagnose the specific issue you're experiencing.
