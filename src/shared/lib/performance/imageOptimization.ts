/**
 * Image Optimization Utilities
 * Performance helpers for lazy loading and optimizing images
 */

/**
 * Generate srcset for responsive images
 */
export function generateSrcSet(baseUrl: string, sizes: number[]): string {
  return sizes.map((size) => `${baseUrl}?w=${size} ${size}w`).join(', ');
}

/**
 * Lazy load image with IntersectionObserver
 */
export function lazyLoadImage(img: HTMLImageElement) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const lazyImage = entry.target as HTMLImageElement;
          const src = lazyImage.dataset.src;
          const srcset = lazyImage.dataset.srcset;

          if (src) {
            lazyImage.src = src;
          }
          if (srcset) {
            lazyImage.srcset = srcset;
          }

          lazyImage.classList.remove('lazy');
          observer.unobserve(lazyImage);
        }
      });
    },
    {
      rootMargin: '50px 0px',
      threshold: 0.01,
    }
  );

  observer.observe(img);
}

/**
 * Preload critical images
 */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}
