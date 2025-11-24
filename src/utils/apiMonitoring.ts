/**
 * API Response Time Monitoring
 * Tracks API call performance and response times
 */

import { errorTracker } from './errorTracking';
import { performanceMonitor } from './performanceMonitoring';

interface ApiMetric {
  endpoint: string;
  method: string;
  duration: number;
  status: number;
  timestamp: number;
  success: boolean;
}

interface ApiStats {
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  averageResponseTime: number;
  slowestCall: ApiMetric | null;
  fastestCall: ApiMetric | null;
}

class ApiMonitor {
  private metrics: ApiMetric[] = [];
  private maxMetrics: number = 200;
  private slowRequestThreshold: number = 2000; // 2 seconds

  /**
   * Track an API call
   */
  public trackApiCall(
    endpoint: string,
    method: string,
    duration: number,
    status: number,
    success: boolean
  ): void {
    const metric: ApiMetric = {
      endpoint,
      method,
      duration: Math.round(duration),
      status,
      timestamp: Date.now(),
      success,
    };

    this.metrics.push(metric);

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    // Log slow requests
    if (duration > this.slowRequestThreshold) {
      console.warn(
        `⚠️ Slow API call: ${method} ${endpoint} took ${Math.round(duration)}ms`
      );
      errorTracker.captureWarning('Slow API response', {
        endpoint,
        method,
        duration,
        status,
      });
    }

    // Track in performance monitor
    performanceMonitor.trackCustomMetric(`API:${method}:${endpoint}`, duration);

    // Log in development
    if (import.meta.env.DEV) {
      const emoji = success ? '✅' : '❌';
      console.log(
        `${emoji} API: ${method} ${endpoint} - ${Math.round(duration)}ms (${status})`
      );
    }
  }

  /**
   * Get all API metrics
   */
  public getMetrics(): ApiMetric[] {
    return [...this.metrics];
  }

  /**
   * Get API statistics
   */
  public getStats(): ApiStats {
    if (this.metrics.length === 0) {
      return {
        totalCalls: 0,
        successfulCalls: 0,
        failedCalls: 0,
        averageResponseTime: 0,
        slowestCall: null,
        fastestCall: null,
      };
    }

    const successfulCalls = this.metrics.filter((m) => m.success).length;
    const failedCalls = this.metrics.length - successfulCalls;
    const totalDuration = this.metrics.reduce((sum, m) => sum + m.duration, 0);
    const averageResponseTime = Math.round(totalDuration / this.metrics.length);

    const sortedByDuration = [...this.metrics].sort((a, b) => a.duration - b.duration);
    const slowestCall = sortedByDuration[sortedByDuration.length - 1];
    const fastestCall = sortedByDuration[0];

    return {
      totalCalls: this.metrics.length,
      successfulCalls,
      failedCalls,
      averageResponseTime,
      slowestCall,
      fastestCall,
    };
  }

  /**
   * Get metrics by endpoint
   */
  public getMetricsByEndpoint(endpoint: string): ApiMetric[] {
    return this.metrics.filter((m) => m.endpoint === endpoint);
  }

  /**
   * Get average response time for an endpoint
   */
  public getAverageResponseTime(endpoint: string): number {
    const endpointMetrics = this.getMetricsByEndpoint(endpoint);
    if (endpointMetrics.length === 0) return 0;

    const totalDuration = endpointMetrics.reduce((sum, m) => sum + m.duration, 0);
    return Math.round(totalDuration / endpointMetrics.length);
  }

  /**
   * Clear all metrics
   */
  public clearMetrics(): void {
    this.metrics = [];
  }

  /**
   * Get slow requests (above threshold)
   */
  public getSlowRequests(): ApiMetric[] {
    return this.metrics.filter((m) => m.duration > this.slowRequestThreshold);
  }

  /**
   * Set slow request threshold
   */
  public setSlowRequestThreshold(threshold: number): void {
    this.slowRequestThreshold = threshold;
  }
}

// Singleton instance
export const apiMonitor = new ApiMonitor();

/**
 * Axios interceptor for automatic API monitoring
 */
export function createApiMonitoringInterceptors() {
  return {
    request: (config: any) => {
      // Add start time to request config
      config.metadata = { startTime: performance.now() };
      return config;
    },
    
    response: (response: any) => {
      // Calculate duration
      const duration = performance.now() - response.config.metadata.startTime;
      
      // Track the API call
      apiMonitor.trackApiCall(
        response.config.url || 'unknown',
        response.config.method?.toUpperCase() || 'GET',
        duration,
        response.status,
        true
      );
      
      return response;
    },
    
    error: (error: any) => {
      // Calculate duration
      const duration = error.config?.metadata?.startTime
        ? performance.now() - error.config.metadata.startTime
        : 0;
      
      // Track the failed API call
      apiMonitor.trackApiCall(
        error.config?.url || 'unknown',
        error.config?.method?.toUpperCase() || 'GET',
        duration,
        error.response?.status || 0,
        false
      );
      
      return Promise.reject(error);
    },
  };
}
