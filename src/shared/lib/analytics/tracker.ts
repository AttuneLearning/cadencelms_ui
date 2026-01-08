/**
 * Analytics Tracker
 * Privacy-focused analytics for user behavior and learning patterns
 */

export interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
  userId?: string;
}

class AnalyticsTracker {
  private enabled: boolean = true;
  private queue: AnalyticsEvent[] = [];

  /**
   * Track an event
   */
  track(event: AnalyticsEvent) {
    if (!this.enabled) return;

    const enrichedEvent = {
      ...event,
      timestamp: new Date().toISOString(),
      sessionId: this.getSessionId(),
    };

    this.queue.push(enrichedEvent);

    // Send batch if queue is large enough
    if (this.queue.length >= 10) {
      this.flush();
    }
  }

  /**
   * Track page view
   */
  trackPageView(pageName: string, userId?: string) {
    this.track({
      category: 'navigation',
      action: 'page_view',
      label: pageName,
      userId,
    });
  }

  /**
   * Track course interaction
   */
  trackCourseInteraction(action: 'enroll' | 'start' | 'complete', courseId: string) {
    this.track({
      category: 'course',
      action,
      label: courseId,
    });
  }

  /**
   * Track lesson progress
   */
  trackLessonProgress(lessonId: string, progress: number) {
    this.track({
      category: 'lesson',
      action: 'progress_update',
      label: lessonId,
      value: progress,
    });
  }

  /**
   * Flush queued events
   */
  async flush() {
    if (this.queue.length === 0) return;

    const events = [...this.queue];
    this.queue = [];

    try {
      await fetch('/api/v2/analytics/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events }),
      });
    } catch (error) {
      console.error('Analytics flush failed:', error);
      // Re-queue events
      this.queue.unshift(...events);
    }
  }

  /**
   * Get or create session ID
   */
  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }

  /**
   * Enable/disable tracking
   */
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }
}

export const analytics = new AnalyticsTracker();
