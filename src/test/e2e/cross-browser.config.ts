/**
 * Cross-Browser Testing Configuration
 * 
 * This configuration enables running E2E tests across multiple browsers
 * to ensure compatibility with Chrome, Firefox, and Safari.
 * 
 * Requirements: 1.1, 2.1, 8.1, 9.5, 13.1
 */

export interface BrowserConfig {
  name: string;
  userAgent: string;
  viewport: {
    width: number;
    height: number;
  };
}

export const browsers: BrowserConfig[] = [
  {
    name: 'Chrome',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: {
      width: 1920,
      height: 1080,
    },
  },
  {
    name: 'Firefox',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    viewport: {
      width: 1920,
      height: 1080,
    },
  },
  {
    name: 'Safari',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
    viewport: {
      width: 1920,
      height: 1080,
    },
  },
];

export const mobileViewports = [
  {
    name: 'iPhone 12',
    width: 390,
    height: 844,
  },
  {
    name: 'iPad',
    width: 768,
    height: 1024,
  },
  {
    name: 'Android Phone',
    width: 360,
    height: 640,
  },
];

/**
 * Test configuration for different environments
 */
export const testConfig = {
  timeout: 30000, // 30 seconds for E2E tests
  retries: 2, // Retry failed tests twice
  slowTestThreshold: 5000, // Warn if test takes more than 5 seconds
};

/**
 * Helper function to simulate browser-specific behavior
 */
export function setupBrowserEnvironment(browser: BrowserConfig) {
  // Set user agent
  Object.defineProperty(window.navigator, 'userAgent', {
    value: browser.userAgent,
    configurable: true,
  });

  // Set viewport
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: browser.viewport.width,
  });

  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: browser.viewport.height,
  });

  // Trigger resize event
  window.dispatchEvent(new Event('resize'));
}

/**
 * Helper function to test responsive behavior
 */
export function setupMobileViewport(viewport: { width: number; height: number }) {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: viewport.width,
  });

  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: viewport.height,
  });

  window.dispatchEvent(new Event('resize'));
}
