/**
 * Performance Monitor
 * Track and report performance metrics
 */

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];

  /**
   * Record a performance metric
   */
  record(name: string, value: number, unit: string = 'ms') {
    this.metrics.push({
      name,
      value,
      unit,
      timestamp: Date.now(),
    });

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${name}: ${value}${unit}`);
    }

    // Send to monitoring service in production
    if (process.env.NODE_ENV === 'production' && this.metrics.length >= 20) {
      this.flush();
    }
  }

  /**
   * Measure function execution time
   */
  async measure<T>(name: string, fn: () => Promise<T> | T): Promise<T> {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;
    this.record(name, duration);
    return result;
  }

  /**
   * Record Core Web Vitals
   */
  recordWebVitals() {
    if (typeof window === 'undefined') return;

    // Largest Contentful Paint (LCP)
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.record('LCP', lastEntry.startTime);
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay (FID)
    new PerformanceObserver((list) => {
      const firstInput = list.getEntries()[0] as PerformanceEventTiming;
      if (firstInput) {
        const fid = firstInput.processingStart - firstInput.startTime;
        this.record('FID', fid);
      }
    }).observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as LayoutShift).hadRecentInput) {
          clsValue += (entry as LayoutShift).value;
        }
      }
      this.record('CLS', clsValue, 'score');
    }).observe({ entryTypes: ['layout-shift'] });
  }

  /**
   * Flush metrics to server
   */
  private async flush() {
    if (this.metrics.length === 0) return;

    const metricsToSend = [...this.metrics];
    this.metrics = [];

    try {
      await fetch('/api/v2/monitoring/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metrics: metricsToSend }),
      });
    } catch (error) {
      console.error('Failed to send performance metrics:', error);
    }
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Types for PerformanceEntry extensions
interface LayoutShift extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}
