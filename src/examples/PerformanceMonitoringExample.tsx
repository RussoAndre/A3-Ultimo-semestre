/**
 * Example: Using Performance Monitoring
 * This file demonstrates how to use the performance monitoring utilities
 */

import { useState } from 'react';
import { useLoadingIndicator } from '../hooks/useLoadingIndicator';
import { InlineLoadingIndicator, ButtonLoadingIndicator } from '../components/common';
import { measureAsync } from '../utils/performanceMonitoring';
import { errorTracker } from '../utils/errorTracking';

export function PerformanceMonitoringExample() {
  const [data, setData] = useState<any>(null);
  const { showLoading, withLoading } = useLoadingIndicator({
    threshold: 1000, // Show loading after 1 second
    minDisplayTime: 500, // Show for at least 500ms
  });

  // Example 1: Using withLoading for automatic loading state
  const handleFetchData = async () => {
    try {
      await withLoading(
        measureAsync('fetchExampleData', async () => {
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 2000));
          return { message: 'Data loaded successfully' };
        })
      ).then(setData);
    } catch (error) {
      errorTracker.captureError(
        error instanceof Error ? error : new Error(String(error)),
        { component: 'PerformanceMonitoringExample', action: 'fetchData' }
      );
    }
  };

  // Example 2: Manual loading state with ButtonLoadingIndicator
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await measureAsync('submitExampleForm', async () => {
        // Simulate form submission
        await new Promise((resolve) => setTimeout(resolve, 1500));
      });
    } catch (error) {
      errorTracker.captureError(
        error instanceof Error ? error : new Error(String(error)),
        { component: 'PerformanceMonitoringExample', action: 'submit' }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Performance Monitoring Examples</h2>

      {/* Example 1: Automatic loading with threshold */}
      <section className="border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2">
          Example 1: Loading Indicator with Threshold
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Loading indicator only shows if operation takes longer than 1 second
        </p>
        
        {showLoading ? (
          <InlineLoadingIndicator message="Loading data..." size="md" />
        ) : (
          <div>
            <button
              onClick={handleFetchData}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Fetch Data (2s delay)
            </button>
            {data && (
              <div className="mt-4 p-3 bg-green-50 rounded">
                {data.message}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Example 2: Button with loading state */}
      <section className="border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2">
          Example 2: Button Loading Indicator
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Button shows loading state during submission
        </p>
        
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          <ButtonLoadingIndicator isLoading={isSubmitting} loadingText="Submitting...">
            Submit Form
          </ButtonLoadingIndicator>
        </button>
      </section>

      {/* Example 3: Performance Dashboard */}
      <section className="border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2">
          Example 3: Performance Dashboard
        </h3>
        <p className="text-sm text-gray-600">
          Click the "📊 Performance" button in the bottom-right corner to view
          real-time performance metrics (development only).
        </p>
      </section>

      {/* Example 4: Error Tracking */}
      <section className="border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2">
          Example 4: Error Tracking
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Errors are automatically tracked and logged
        </p>
        
        <button
          onClick={() => {
            try {
              throw new Error('Example error for testing');
            } catch (error) {
              errorTracker.captureError(
                error instanceof Error ? error : new Error(String(error)),
                { component: 'Example', intentional: true }
              );
            }
          }}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Trigger Test Error
        </button>
      </section>
    </div>
  );
}
