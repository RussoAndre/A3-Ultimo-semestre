/**
 * Performance Dashboard (Development Only)
 * Displays performance metrics and monitoring data
 */

import { useState, useEffect } from 'react';
import { performanceMonitor } from '../../utils/performanceMonitoring';
import { apiMonitor } from '../../utils/apiMonitoring';
import { errorTracker } from '../../utils/errorTracking';

export function PerformanceDashboard() {
  const [isOpen, setIsOpen] = useState(false);
  const [metrics, setMetrics] = useState<any>({});
  const [apiStats, setApiStats] = useState<any>({});
  const [errorStats, setErrorStats] = useState<any>({});

  useEffect(() => {
    if (!isOpen) return;

    const updateStats = () => {
      setMetrics(performanceMonitor.getMetricsSummary());
      setApiStats(apiMonitor.getStats());
      setErrorStats(errorTracker.getErrorStats());
    };

    updateStats();
    const interval = setInterval(updateStats, 2000);

    return () => clearInterval(interval);
  }, [isOpen]);

  // Only show in development
  if (import.meta.env.PROD) return null;

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-gray-700 transition-colors"
        aria-label="Toggle Performance Dashboard"
      >
        📊 Performance
      </button>

      {/* Dashboard Panel */}
      {isOpen && (
        <div className="fixed bottom-16 right-4 z-50 w-96 max-h-[600px] overflow-y-auto bg-white rounded-lg shadow-2xl border border-gray-200">
          <div className="sticky top-0 bg-gray-800 text-white px-4 py-3 flex justify-between items-center">
            <h3 className="font-semibold">Performance Monitor</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-300"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div className="p-4 space-y-4">
            {/* Web Vitals */}
            <section>
              <h4 className="font-semibold text-gray-900 mb-2">Web Vitals</h4>
              <div className="space-y-2">
                {Object.entries(metrics).map(([name, metric]: [string, any]) => (
                  <MetricRow key={name} name={name} metric={metric} />
                ))}
              </div>
            </section>

            {/* API Stats */}
            <section>
              <h4 className="font-semibold text-gray-900 mb-2">API Performance</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Calls:</span>
                  <span className="font-medium">{apiStats.totalCalls || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Successful:</span>
                  <span className="font-medium text-green-600">
                    {apiStats.successfulCalls || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Failed:</span>
                  <span className="font-medium text-red-600">
                    {apiStats.failedCalls || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg Response:</span>
                  <span className="font-medium">
                    {apiStats.averageResponseTime || 0}ms
                  </span>
                </div>
              </div>
            </section>

            {/* Error Stats */}
            <section>
              <h4 className="font-semibold text-gray-900 mb-2">Error Tracking</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Errors:</span>
                  <span className="font-medium text-red-600">
                    {errorStats.error || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Warnings:</span>
                  <span className="font-medium text-yellow-600">
                    {errorStats.warning || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Info:</span>
                  <span className="font-medium text-blue-600">
                    {errorStats.info || 0}
                  </span>
                </div>
              </div>
            </section>

            {/* Actions */}
            <section className="pt-2 border-t border-gray-200">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    performanceMonitor.clearMetrics();
                    apiMonitor.clearMetrics();
                    errorTracker.clearErrors();
                    setMetrics({});
                    setApiStats({});
                    setErrorStats({});
                  }}
                  className="flex-1 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                >
                  Clear All
                </button>
                <button
                  onClick={() => {
                    console.log('Performance Metrics:', performanceMonitor.getMetrics());
                    console.log('API Metrics:', apiMonitor.getMetrics());
                    console.log('Errors:', errorTracker.getErrors());
                  }}
                  className="flex-1 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                >
                  Log to Console
                </button>
              </div>
            </section>
          </div>
        </div>
      )}
    </>
  );
}

function MetricRow({ name, metric }: { name: string; metric: any }) {
  if (!metric) return null;

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'good':
        return 'text-green-600';
      case 'needs-improvement':
        return 'text-yellow-600';
      case 'poor':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getRatingEmoji = (rating: string) => {
    switch (rating) {
      case 'good':
        return '✅';
      case 'needs-improvement':
        return '⚠️';
      case 'poor':
        return '❌';
      default:
        return '•';
    }
  };

  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-gray-600">
        {getRatingEmoji(metric.rating)} {name}:
      </span>
      <span className={`font-medium ${getRatingColor(metric.rating)}`}>
        {metric.value}ms
      </span>
    </div>
  );
}
