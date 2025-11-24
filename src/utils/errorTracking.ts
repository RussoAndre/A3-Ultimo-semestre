/**
 * Error Tracking and Monitoring Service
 * Captures and logs errors for monitoring and debugging
 */

interface ErrorContext {
  userId?: string;
  userEmail?: string;
  url?: string;
  userAgent?: string;
  timestamp: number;
  [key: string]: any;
}

interface ErrorReport {
  message: string;
  stack?: string;
  type: 'error' | 'warning' | 'info';
  context: ErrorContext;
  fingerprint: string;
}

class ErrorTracker {
  private errors: ErrorReport[] = [];
  private maxErrors: number = 100;
  private isEnabled: boolean = true;

  constructor() {
    if (typeof window === 'undefined') {
      this.isEnabled = false;
      return;
    }

    this.initializeErrorHandlers();
  }

  /**
   * Initialize global error handlers
   */
  private initializeErrorHandlers(): void {
    // Handle uncaught errors
    window.addEventListener('error', (event) => {
      this.captureError(event.error || new Error(event.message), {
        type: 'uncaught_error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError(
        event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
        {
          type: 'unhandled_rejection',
        }
      );
    });

    // Handle console errors in development
    if (import.meta.env.DEV) {
      const originalConsoleError = console.error;
      console.error = (...args: any[]) => {
        this.captureError(new Error(args.join(' ')), {
          type: 'console_error',
        });
        originalConsoleError.apply(console, args);
      };
    }
  }

  /**
   * Capture an error with context
   */
  public captureError(error: Error, additionalContext: Record<string, any> = {}): void {
    if (!this.isEnabled) return;

    const context = this.buildContext(additionalContext);
    const fingerprint = this.generateFingerprint(error);

    const errorReport: ErrorReport = {
      message: error.message,
      stack: error.stack,
      type: 'error',
      context,
      fingerprint,
    };

    this.storeError(errorReport);
    this.logError(errorReport);
    this.sendErrorToService(errorReport);
  }

  /**
   * Capture a warning
   */
  public captureWarning(message: string, context: Record<string, any> = {}): void {
    if (!this.isEnabled) return;

    const errorReport: ErrorReport = {
      message,
      type: 'warning',
      context: this.buildContext(context),
      fingerprint: this.generateFingerprint(new Error(message)),
    };

    this.storeError(errorReport);
    this.logError(errorReport);
  }

  /**
   * Capture informational message
   */
  public captureInfo(message: string, context: Record<string, any> = {}): void {
    if (!this.isEnabled || !import.meta.env.DEV) return;

    const errorReport: ErrorReport = {
      message,
      type: 'info',
      context: this.buildContext(context),
      fingerprint: this.generateFingerprint(new Error(message)),
    };

    this.storeError(errorReport);
  }

  /**
   * Build error context
   */
  private buildContext(additionalContext: Record<string, any>): ErrorContext {
    const context: ErrorContext = {
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
      ...additionalContext,
    };

    // Add user info if available (from localStorage or Redux)
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        context.userId = user.id;
        context.userEmail = user.email;
      }
    } catch (e) {
      // Ignore errors reading user info
    }

    return context;
  }

  /**
   * Generate a fingerprint for error deduplication
   */
  private generateFingerprint(error: Error): string {
    const message = error.message || 'unknown';
    const stack = error.stack || '';
    
    // Extract the first line of the stack trace for fingerprinting
    const stackLine = stack.split('\n')[1] || '';
    
    return `${message}:${stackLine}`.substring(0, 100);
  }

  /**
   * Store error in memory
   */
  private storeError(errorReport: ErrorReport): void {
    this.errors.push(errorReport);

    // Keep only the most recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }
  }

  /**
   * Log error to console
   */
  private logError(errorReport: ErrorReport): void {
    if (import.meta.env.DEV) {
      const emoji = errorReport.type === 'error' ? '❌' : errorReport.type === 'warning' ? '⚠️' : 'ℹ️';
      console.group(`${emoji} ${errorReport.type.toUpperCase()}: ${errorReport.message}`);
      console.log('Context:', errorReport.context);
      if (errorReport.stack) {
        console.log('Stack:', errorReport.stack);
      }
      console.groupEnd();
    }
  }

  /**
   * Send error to monitoring service
   */
  private sendErrorToService(errorReport: ErrorReport): void {
    if (!import.meta.env.PROD) return;

    // In production, send to error tracking service
    // Example: Sentry, LogRocket, Rollbar, etc.
    try {
      // Sentry example:
      // Sentry.captureException(new Error(errorReport.message), {
      //   contexts: { custom: errorReport.context },
      //   fingerprint: [errorReport.fingerprint],
      // });

      // Custom API example:
      // fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorReport),
      // }).catch(() => {
      //   // Silently fail if error reporting fails
      // });
    } catch (e) {
      // Silently fail if error reporting fails
    }
  }

  /**
   * Get all captured errors
   */
  public getErrors(): ErrorReport[] {
    return [...this.errors];
  }

  /**
   * Get error count by type
   */
  public getErrorStats(): Record<string, number> {
    const stats: Record<string, number> = {
      error: 0,
      warning: 0,
      info: 0,
    };

    this.errors.forEach((error) => {
      stats[error.type]++;
    });

    return stats;
  }

  /**
   * Clear all errors
   */
  public clearErrors(): void {
    this.errors = [];
  }

  /**
   * Set user context for error tracking
   */
  public setUserContext(userId: string, userEmail?: string): void {
    // Store in a way that can be accessed by buildContext
    try {
      const user = { id: userId, email: userEmail };
      localStorage.setItem('user', JSON.stringify(user));
    } catch (e) {
      // Ignore storage errors
    }
  }

  /**
   * Clear user context
   */
  public clearUserContext(): void {
    try {
      localStorage.removeItem('user');
    } catch (e) {
      // Ignore storage errors
    }
  }
}

// Singleton instance
export const errorTracker = new ErrorTracker();

// Helper function to wrap async functions with error tracking
export function withErrorTracking<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context?: Record<string, any>
): T {
  return (async (...args: any[]) => {
    try {
      return await fn(...args);
    } catch (error) {
      errorTracker.captureError(
        error instanceof Error ? error : new Error(String(error)),
        context
      );
      throw error;
    }
  }) as T;
}

// Helper function to wrap sync functions with error tracking
export function withErrorTrackingSync<T extends (...args: any[]) => any>(
  fn: T,
  context?: Record<string, any>
): T {
  return ((...args: any[]) => {
    try {
      return fn(...args);
    } catch (error) {
      errorTracker.captureError(
        error instanceof Error ? error : new Error(String(error)),
        context
      );
      throw error;
    }
  }) as T;
}
