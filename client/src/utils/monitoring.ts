import { useEffect } from 'react';

interface PerformanceMetrics {
  pageLoadTime: number;
  domContentLoaded: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  firstInputDelay?: number;
}

// Define interface for first input entry since TypeScript doesn't include it by default
interface FirstInputEntry extends PerformanceEntry {
  processingStart: number;
  startTime: number;
}

/**
 * Collects and reports web vital metrics to the server
 */
export function usePerformanceMonitoring(): void {
  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') return;

    // Set up performance observer for LCP
    const lcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      const lcp = lastEntry.startTime;
      reportMetric('largest_contentful_paint', lcp);
    });

    // Set up performance observer for FID
    const fidObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const firstEntry = entries[0] as FirstInputEntry;
      const fid = firstEntry.processingStart - firstEntry.startTime;
      reportMetric('first_input_delay', fid);
    });

    // Try to observe LCP and FID
    try {
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      fidObserver.observe({ type: 'first-input', buffered: true });
    } catch (e) {
      console.error('Performance observer not supported', e);
    }

    // Calculate basic metrics when page loads
    window.addEventListener('load', () => {
      // Use performance API if available
      if (window.performance) {
        const navigationEntries = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigationEntries) {
          const pageLoadTime = navigationEntries.loadEventEnd - navigationEntries.startTime;
          const domContentLoaded = navigationEntries.domContentLoadedEventEnd - navigationEntries.startTime;
          
          // Report basic metrics
          reportMetric('page_load_time', pageLoadTime);
          reportMetric('dom_content_loaded', domContentLoaded);
        }
      }
    });

    // Cleanup
    return () => {
      try {
        lcpObserver.disconnect();
        fidObserver.disconnect();
      } catch (e) {
        console.error('Error disconnecting observers', e);
      }
    };
  }, []);
}

/**
 * Reports a metric to the server
 */
function reportMetric(name: string, value: number): void {
  try {
    // Don't send metrics in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Metric] ${name}: ${value}`);
      return;
    }

    // Send metric to the server
    const payload = {
      name,
      value,
      timestamp: Date.now(),
      url: window.location.pathname,
    };

    // Use sendBeacon if available (doesn't block page navigation)
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/metrics/client', JSON.stringify(payload));
    } else {
      // Fallback to fetch
      fetch('/api/metrics/client', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(e => console.error('Error sending metric', e));
    }
  } catch (e) {
    console.error('Error reporting metric', e);
  }
} 