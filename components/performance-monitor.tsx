'use client';

import { useEffect } from 'react';

export function PerformanceMonitor() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Monitor page load performance
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            console.log('🚀 Performance Metrics:', {
              'DNS Lookup': `${navEntry.domainLookupEnd - navEntry.domainLookupStart}ms`,
              'TCP Connection': `${navEntry.connectEnd - navEntry.connectStart}ms`,
              'Server Response': `${navEntry.responseEnd - navEntry.requestStart}ms`,
              'DOM Content Loaded': `${navEntry.domContentLoadedEventEnd - navEntry.fetchStart}ms`,
              'Page Load Complete': `${navEntry.loadEventEnd - navEntry.fetchStart}ms`,
            });
          }
        });
      });

      observer.observe({ entryTypes: ['navigation'] });

      // Monitor largest contentful paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log('🎯 Largest Contentful Paint:', `${lastEntry.startTime}ms`);
      });

      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      return () => {
        observer.disconnect();
        lcpObserver.disconnect();
      };
    }
  }, []);

  return null;
}
