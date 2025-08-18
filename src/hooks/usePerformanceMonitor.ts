import { useCallback, useRef } from 'react';

export interface PerformanceMetric {
  operation: string;
  duration: number;
  cacheHit?: boolean;
  error?: boolean;
}

export interface PerformanceSummary {
  averageLoadTime: number;
  cacheHitRate: number;
  totalOperations: number;
  errorRate: number;
}

export interface PerformanceMonitor {
  getMetrics: () => Record<string, PerformanceMetric>;
  getSummary: () => PerformanceSummary;
  recordMetric: (metric: PerformanceMetric) => void;
  clearMetrics: () => void;
}

/**
 * Hook for monitoring performance metrics in development
 * Provides functionality to track operation timings, cache hits, and errors
 */
export function usePerformanceMonitor(): PerformanceMonitor {
  const metricsRef = useRef<Record<string, PerformanceMetric>>({});

  const getMetrics = useCallback(() => {
    return { ...metricsRef.current };
  }, []);

  const getSummary = useCallback((): PerformanceSummary => {
    const metrics = Object.values(metricsRef.current);
    
    if (metrics.length === 0) {
      return {
        averageLoadTime: 0,
        cacheHitRate: 0,
        totalOperations: 0,
        errorRate: 0,
      };
    }

    const totalDuration = metrics.reduce((sum, metric) => sum + metric.duration, 0);
    const cacheHits = metrics.filter(metric => metric.cacheHit === true).length;
    const errors = metrics.filter(metric => metric.error === true).length;

    return {
      averageLoadTime: Math.round(totalDuration / metrics.length),
      cacheHitRate: Math.round((cacheHits / metrics.length) * 100),
      totalOperations: metrics.length,
      errorRate: Math.round((errors / metrics.length) * 100),
    };
  }, []);

  const recordMetric = useCallback((metric: PerformanceMetric) => {
    const id = `${Date.now()}-${Math.random()}`;
    metricsRef.current[id] = metric;
    
    // Keep only last 100 metrics to prevent memory leaks
    const keys = Object.keys(metricsRef.current);
    if (keys.length > 100) {
      const oldestKey = keys[0];
      delete metricsRef.current[oldestKey];
    }
  }, []);

  const clearMetrics = useCallback(() => {
    metricsRef.current = {};
  }, []);

  return {
    getMetrics,
    getSummary,
    recordMetric,
    clearMetrics,
  };
}