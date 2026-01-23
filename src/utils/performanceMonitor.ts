/**
 * Performance Monitoring Utility
 * Measures Core Web Vitals and sends to analytics
 */

interface PerformanceMetric {
  metric: string;
  value: number;
  rating?: 'good' | 'needs-improvement' | 'poor';
  url: string;
  timestamp: number;
}

/**
 * Send performance metrics to backend analytics
 */
const sendToAnalytics = (metric: PerformanceMetric): void => {
  if (import.meta.env.MODE !== 'production') {
    console.log('[Performance]', metric);
    return;
  }

  // Send to backend analytics endpoint
  try {
    fetch('/api/analytics/webvitals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metric),
    }).catch((err) => {
      console.error('Failed to send analytics:', err);
    });
  } catch (error) {
    console.error('Analytics error:', error);
  }
};

/**
 * Calculate rating based on metric thresholds
 */
const getRating = (metricName: string, value: number): 'good' | 'needs-improvement' | 'poor' => {
  const thresholds: Record<string, { good: number; needsImprovement: number }> = {
    LCP: { good: 2500, needsImprovement: 4000 },
    FID: { good: 100, needsImprovement: 300 },
    CLS: { good: 0.1, needsImprovement: 0.25 },
    FCP: { good: 1800, needsImprovement: 3000 },
    TTFB: { good: 800, needsImprovement: 1800 },
  };

  const threshold = thresholds[metricName];
  if (!threshold) return 'good';

  if (value <= threshold.good) return 'good';
  if (value <= threshold.needsImprovement) return 'needs-improvement';
  return 'poor';
};

/**
 * Measure and report Core Web Vitals
 */
export const measurePerformance = (): void => {
  if (typeof window === 'undefined') return;

  // Measure LCP (Largest Contentful Paint)
  try {
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];

      const metric: PerformanceMetric = {
        metric: 'LCP',
        value: lastEntry.startTime,
        rating: getRating('LCP', lastEntry.startTime),
        url: window.location.pathname,
        timestamp: Date.now(),
      };

      sendToAnalytics(metric);
    });

    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
  } catch (error) {
    console.error('LCP measurement error:', error);
  }

  // Measure FID (First Input Delay)
  try {
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        const metric: PerformanceMetric = {
          metric: 'FID',
          value: entry.processingStart - entry.startTime,
          rating: getRating('FID', entry.processingStart - entry.startTime),
          url: window.location.pathname,
          timestamp: Date.now(),
        };

        sendToAnalytics(metric);
      });
    });

    fidObserver.observe({ type: 'first-input', buffered: true });
  } catch (error) {
    console.error('FID measurement error:', error);
  }

  // Measure CLS (Cumulative Layout Shift)
  try {
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });

      const metric: PerformanceMetric = {
        metric: 'CLS',
        value: clsValue,
        rating: getRating('CLS', clsValue),
        url: window.location.pathname,
        timestamp: Date.now(),
      };

      sendToAnalytics(metric);
    });

    clsObserver.observe({ type: 'layout-shift', buffered: true });
  } catch (error) {
    console.error('CLS measurement error:', error);
  }

  // Measure Navigation Timing
  if ('PerformanceNavigationTiming' in window) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

        if (navTiming) {
          // Time to Interactive
          const tti = navTiming.domInteractive - navTiming.fetchStart;
          sendToAnalytics({
            metric: 'TTI',
            value: tti,
            url: window.location.pathname,
            timestamp: Date.now(),
          });

          // Time to First Byte
          const ttfb = navTiming.responseStart - navTiming.requestStart;
          sendToAnalytics({
            metric: 'TTFB',
            value: ttfb,
            rating: getRating('TTFB', ttfb),
            url: window.location.pathname,
            timestamp: Date.now(),
          });

          // DOM Content Loaded
          const dcl = navTiming.domContentLoadedEventEnd - navTiming.domContentLoadedEventStart;
          sendToAnalytics({
            metric: 'DCL',
            value: dcl,
            url: window.location.pathname,
            timestamp: Date.now(),
          });
        }
      }, 0);
    });
  }
};

/**
 * Measure resource loading performance
 */
export const measureResourceTiming = (): void => {
  if (typeof window === 'undefined') return;

  window.addEventListener('load', () => {
    setTimeout(() => {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

      const resourceMetrics = {
        scripts: 0,
        styles: 0,
        images: 0,
        total: resources.length,
      };

      resources.forEach((resource) => {
        if (resource.initiatorType === 'script') resourceMetrics.scripts++;
        if (resource.initiatorType === 'css') resourceMetrics.styles++;
        if (resource.initiatorType === 'img') resourceMetrics.images++;
      });

      console.log('[Resource Timing]', resourceMetrics);
    }, 0);
  });
};

/**
 * Initialize performance monitoring
 */
export const initPerformanceMonitoring = (): void => {
  measurePerformance();
  measureResourceTiming();
};

/**
 * Track custom page load time (for SPA navigation)
 */
export function trackPageLoad(pageName: string): void {
  const startMark = `page-${pageName}-start`;
  const endMark = `page-${pageName}-end`;
  const measureName = `page-${pageName}-load`;

  try {
    // Start timing
    performance.mark(startMark);

    // End timing when page is interactive
    requestIdleCallback(() => {
      performance.mark(endMark);
      performance.measure(measureName, startMark, endMark);

      const measure = performance.getEntriesByName(measureName)[0];

      sendToAnalytics({
        metric: `PageLoad-${pageName}`,
        value: measure.duration,
        rating: measure.duration < 1000 ? 'good' : measure.duration < 3000 ? 'needs-improvement' : 'poor',
        url: window.location.pathname,
        timestamp: Date.now(),
      });

      // Cleanup
      performance.clearMarks(startMark);
      performance.clearMarks(endMark);
      performance.clearMeasures(measureName);
    });
  } catch (error) {
    console.warn('Page load tracking failed:', error);
  }
}
