/**
 * Lazy Loading Utilities
 * Performance optimization through code splitting and lazy loading
 */

import { lazy, Suspense, ComponentType } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Lazy load a component with a loading fallback
 */
export function lazyLoad<T extends ComponentType<unknown>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(importFn);

  return (props: React.ComponentProps<T>) => (
    <Suspense
      fallback={
        fallback || (
          <div className="flex min-h-[400px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )
      }
    >
      <LazyComponent {...props} />
    </Suspense>
  );
}

/**
 * Preload a lazy component
 */
export function preloadComponent<T extends ComponentType<unknown>>(
  importFn: () => Promise<{ default: T }>
) {
  importFn();
}
