/**
 * Global Loading Indicator
 * Displays a loading bar at the top of the page for long-running operations
 */

import { useEffect, useState } from 'react';

interface GlobalLoadingIndicatorProps {
  isLoading: boolean;
  color?: string;
}

export function GlobalLoadingIndicator({
  isLoading,
  color = '#10B981',
}: GlobalLoadingIndicatorProps) {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setVisible(true);
      setProgress(0);

      // Simulate progress
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 10;
        });
      }, 300);

      return () => clearInterval(interval);
    } else {
      // Complete the progress bar
      setProgress(100);
      
      // Hide after animation completes
      const timeout = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 300);

      return () => clearTimeout(timeout);
    }
  }, [isLoading]);

  if (!visible) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 h-1"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress)}
      aria-label="Loading"
    >
      <div
        className="h-full transition-all duration-300 ease-out"
        style={{
          width: `${progress}%`,
          backgroundColor: color,
          boxShadow: `0 0 10px ${color}`,
        }}
      />
    </div>
  );
}

/**
 * Inline Loading Indicator
 * Shows a spinner for component-level loading states
 */
interface InlineLoadingIndicatorProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function InlineLoadingIndicator({
  message,
  size = 'md',
  className = '',
}: InlineLoadingIndicatorProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 ${className}`}
      role="status"
      aria-live="polite"
      aria-label={message || 'Loading'}
    >
      <div
        className={`${sizeClasses[size]} border-4 border-gray-200 border-t-green-500 rounded-full animate-spin`}
        aria-hidden="true"
      />
      {message && (
        <p className="text-sm text-gray-600">{message}</p>
      )}
    </div>
  );
}

/**
 * Button Loading Indicator
 * Shows loading state within a button
 */
interface ButtonLoadingIndicatorProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
}

export function ButtonLoadingIndicator({
  isLoading,
  children,
  loadingText = 'Loading...',
}: ButtonLoadingIndicatorProps) {
  return (
    <>
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {loadingText}
        </span>
      ) : (
        children
      )}
    </>
  );
}
