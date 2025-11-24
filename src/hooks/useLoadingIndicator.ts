/**
 * Hook for managing loading indicators with automatic timeout
 * Shows loading indicator for actions exceeding 1 second
 */

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseLoadingIndicatorOptions {
  threshold?: number; // Time in ms before showing indicator (default: 1000ms)
  minDisplayTime?: number; // Minimum time to show indicator (default: 500ms)
}

interface UseLoadingIndicatorReturn {
  isLoading: boolean;
  showLoading: boolean; // Only true after threshold
  startLoading: () => void;
  stopLoading: () => void;
  withLoading: <T>(promise: Promise<T>) => Promise<T>;
}

export function useLoadingIndicator(
  options: UseLoadingIndicatorOptions = {}
): UseLoadingIndicatorReturn {
  const { threshold = 1000, minDisplayTime = 500 } = options;
  
  const [isLoading, setIsLoading] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  
  const thresholdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const minDisplayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const loadingStartTimeRef = useRef<number | null>(null);

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (thresholdTimerRef.current) {
        clearTimeout(thresholdTimerRef.current);
      }
      if (minDisplayTimerRef.current) {
        clearTimeout(minDisplayTimerRef.current);
      }
    };
  }, []);

  const startLoading = useCallback(() => {
    setIsLoading(true);
    loadingStartTimeRef.current = Date.now();

    // Start timer to show loading indicator after threshold
    thresholdTimerRef.current = setTimeout(() => {
      setShowLoading(true);
    }, threshold);
  }, [threshold]);

  const stopLoading = useCallback(() => {
    setIsLoading(false);

    // Clear threshold timer if it hasn't fired yet
    if (thresholdTimerRef.current) {
      clearTimeout(thresholdTimerRef.current);
      thresholdTimerRef.current = null;
    }

    // If loading indicator is showing, ensure it displays for minimum time
    if (showLoading) {
      const elapsedTime = loadingStartTimeRef.current
        ? Date.now() - loadingStartTimeRef.current
        : 0;
      
      const remainingTime = Math.max(0, minDisplayTime - elapsedTime);

      if (remainingTime > 0) {
        minDisplayTimerRef.current = setTimeout(() => {
          setShowLoading(false);
          loadingStartTimeRef.current = null;
        }, remainingTime);
      } else {
        setShowLoading(false);
        loadingStartTimeRef.current = null;
      }
    } else {
      setShowLoading(false);
      loadingStartTimeRef.current = null;
    }
  }, [showLoading, minDisplayTime]);

  const withLoading = useCallback(
    async <T,>(promise: Promise<T>): Promise<T> => {
      startLoading();
      try {
        const result = await promise;
        stopLoading();
        return result;
      } catch (error) {
        stopLoading();
        throw error;
      }
    },
    [startLoading, stopLoading]
  );

  return {
    isLoading,
    showLoading,
    startLoading,
    stopLoading,
    withLoading,
  };
}

/**
 * Hook for tracking multiple loading states
 */
export function useMultipleLoadingStates() {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const setLoading = useCallback((key: string, loading: boolean) => {
    setLoadingStates((prev) => ({
      ...prev,
      [key]: loading,
    }));
  }, []);

  const isAnyLoading = Object.values(loadingStates).some((loading) => loading);

  const withLoading = useCallback(
    async <T,>(key: string, promise: Promise<T>): Promise<T> => {
      setLoading(key, true);
      try {
        const result = await promise;
        setLoading(key, false);
        return result;
      } catch (error) {
        setLoading(key, false);
        throw error;
      }
    },
    [setLoading]
  );

  return {
    loadingStates,
    isAnyLoading,
    setLoading,
    withLoading,
  };
}
