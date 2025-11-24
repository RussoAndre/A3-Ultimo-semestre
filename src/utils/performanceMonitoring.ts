/**
 * Performance Monitoring Utility
 * Tracks Web Vitals and custom performance metrics
 */

interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
}

interface PerformanceThresholds {
  good: number;
  needsImprovement: number;
}

// Web Vitals thresholds based on Google recommendations
const THRESHOLDS: Record<string, PerformanceThresholds> = {
  FCP: { good: 1800, needsImprovement: 3000 },
  LCP: { good: 2500, needsImprovement: 4000 },
  FID: { good: 100, needsImprovement: 300 },
  CLS: { good: 0.1, needsImprovement: 0.25 },
  TTI: { good: 3800, needsImprovement: 7300 },
  TTFB: { good: 800, needsImprovement: 1800 },
};

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private observers: PerformanceObserver[] = [];
  private isEnabled: boolean = true;

  constructor() {
    if (typeof window === 'undefined') {
      this.isEnabled = false;
      return;
    }

    this.initializeObservers();
    this.trackNavigationTiming();
  }

  /**
   * Initialize Performance Observers for various metrics
   */
  private initializeObservers(): void {
    try {
      // Observe paint timing (FCP)
      if ('PerformanceObserver' in window) {
        const paintObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'first-contentful-paint') {
              this.recordMetric('FCP', entry.startTime);
            }
          }
        });
        paintObserver.observe({ entryTypes: ['paint'] });
        this.observers.push(paintObserver);

        // Observe Largest Contentful Paint (LCP)
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.recordMetric('LCP', lastEntry.startTime);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);

        // Observe First Input Delay (FID)
        const fidObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const fidEntry = entry as PerformanceEventTiming;
            const fid = fidEntry.processingStart - fidEntry.startTime;
            this.recordMetric('FID', fid);
          }
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);

        // Observe Layout Shift (CLS)
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const layoutShiftEntry = entry as LayoutShift;
            if (!layoutShiftEntry.hadRecentInput) {
              clsValue += layoutShiftEntry.value;
            }
          }
          this.recordMetric('CLS', clsValue);
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(clsObserver);
      }
    } catch (error) {
      console.error('Error initializing performance observers:', error);
    }
  }

  /**
   * Track navigation timing metrics
   */
  private trackNavigationTiming(): void {
    if (typeof window === 'undefined' || !window.performance) return;

    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        if (navigation) {
          // Time to First Byte
          const ttfb = navigation.responseStart - navigation.requestStart;
          this.recordMetric('TTFB', ttfb);

          // Time to Interactive (approximation)
          const tti = navigation.domInteractive - navigation.fetchStart;
          this.recordMetric('TTI', tti);

          // DOM Content Loaded
          const dcl = navigation.domContentLoadedEventEnd - navigation.fetchStart;
          this.recordMetric('DCL', dcl);

          // Full Page Load
          const loadComplete = navigation.loadEventEnd - navigation.fetchStart;
          this.recordMetric('Load', loadComplete);
        }
      }, 0);
    });
  }

  /**
   * Record a performance metric
   */
  private recordMetric(name: string, value: number): void {
    if (!this.isEnabled) return;

    const rating = this.getRating(name, value);
    const metric: PerformanceMetric = {
      name,
      value: Math.round(value),
      rating,
      timestamp: Date.now(),
    };

    this.metrics.push(metric);
    this.logMetric(metric);
    this.sendMetricToAnalytics(metric);
  }

  /**
   * Get rating for a metric based on thresholds
   */
  private getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const threshold = THRESHOLDS[name];
    if (!threshold) return 'good';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.needsImprovement) return 'needs-improvement';
    return 'poor';
  }

  /**
   * Log metric to console in development
   */
  private logMetric(metric: PerformanceMetric): void {
    if (import.meta.env.DEV) {
      const emoji = metric.rating === 'good' ? '✅' : metric.rating === 'needs-improvement' ? '⚠️' : '❌';
      console.log(
        `${emoji} Performance: ${metric.name} = ${metric.value}ms (${metric.rating})`
      );
    }
  }

  /**
   * Send metric to analytics service
   */
  private sendMetricToAnalytics(metric: PerformanceMetric): void {
    // In production, send to analytics service
    if (import.meta.env.PROD) {
      // Example: Send to Google Analytics, custom analytics, etc.
      // gtag('event', 'web_vitals', {
      //   event_category: 'Performance',
      //   event_label: metric.name,
      //   value: metric.value,
      //   metric_rating: metric.rating,
      // });
    }
  }

  /**
   * Track custom performance metric
   */
  public trackCustomMetric(name: string, value: number): void {
    this.recordMetric(name, value);
  }

  /**
   * Get all recorded metrics
   */
  public getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Get metrics summary
   */
  public getMetricsSummary(): Record<string, PerformanceMetric | undefined> {
    const summary: Record<string, PerformanceMetric | undefined> = {};
    
    // Get the latest value for each metric
    this.metrics.forEach((metric) => {
      if (!summary[metric.name] || metric.timestamp > summary[metric.name]!.timestamp) {
        summary[metric.name] = metric;
      }
    });

    return summary;
  }

  /**
   * Clear all metrics
   */
  public clearMetrics(): void {
    this.metrics = [];
  }

  /**
   * Disconnect all observers
   */
  public disconnect(): void {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers = [];
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Helper function to measure async operations
export function measureAsync<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const startTime = performance.now();
  
  return fn().finally(() => {
    const duration = performance.now() - startTime;
    performanceMonitor.trackCustomMetric(name, duration);
  });
}

// Helper function to measure sync operations
export function measureSync<T>(name: string, fn: () => T): T {
  const startTime = performance.now();
  const result = fn();
  const duration = performance.now() - startTime;
  performanceMonitor.trackCustomMetric(name, duration);
  return result;
}

// Type definitions for Performance API
interface PerformanceEventTiming extends PerformanceEntry {
  processingStart: number;
}

interface LayoutShift extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}
