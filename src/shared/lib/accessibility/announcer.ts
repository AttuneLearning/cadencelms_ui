/**
 * Screen Reader Announcer
 * Accessibility utility for announcing dynamic content to screen readers
 */

let announcer: HTMLDivElement | null = null;

/**
 * Initialize the screen reader announcer
 */
function initAnnouncer() {
  if (typeof document === 'undefined') return;
  if (announcer) return;

  announcer = document.createElement('div');
  announcer.setAttribute('role', 'status');
  announcer.setAttribute('aria-live', 'polite');
  announcer.setAttribute('aria-atomic', 'true');
  announcer.style.position = 'absolute';
  announcer.style.left = '-10000px';
  announcer.style.width = '1px';
  announcer.style.height = '1px';
  announcer.style.overflow = 'hidden';

  document.body.appendChild(announcer);
}

/**
 * Announce a message to screen readers
 */
export function announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
  if (!announcer) {
    initAnnouncer();
  }

  if (announcer) {
    announcer.setAttribute('aria-live', priority);
    announcer.textContent = message;

    // Clear after announcement
    setTimeout(() => {
      if (announcer) {
        announcer.textContent = '';
      }
    }, 1000);
  }
}

/**
 * Announce navigation change
 */
export function announceNavigation(pageName: string) {
  announce(`Navigated to ${pageName}`);
}

/**
 * Announce action result
 */
export function announceAction(action: string, success: boolean) {
  const message = success
    ? `${action} completed successfully`
    : `${action} failed`;
  announce(message, success ? 'polite' : 'assertive');
}
