/**
 * EventTimeline Component
 * Displays a timeline of learning events
 */

import React from 'react';
import type { LearningEvent } from '../model/types';

export interface EventTimelineProps {
  events: LearningEvent[];
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
}

/**
 * Format event type for display
 */
function formatEventType(type: string): string {
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Format timestamp for display
 */
function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Get event icon based on type
 */
function getEventIcon(type: string): string {
  const iconMap: Record<string, string> = {
    enrollment: '📝',
    content_started: '▶️',
    content_completed: '✅',
    assessment_started: '📋',
    assessment_completed: '🎯',
    module_completed: '📦',
    course_completed: '🎓',
    achievement_earned: '🏆',
    login: '🔑',
    logout: '👋',
  };

  return iconMap[type] || '📌';
}

/**
 * EventTimeline Component
 */
export const EventTimeline: React.FC<EventTimelineProps> = ({
  events,
  isLoading = false,
  emptyMessage = 'No events to display',
  className = '',
}) => {
  if (isLoading) {
    return (
      <div className={`event-timeline event-timeline--loading ${className}`}>
        <div className="event-timeline__loading">Loading events...</div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className={`event-timeline event-timeline--empty ${className}`}>
        <div className="event-timeline__empty">{emptyMessage}</div>
      </div>
    );
  }

  return (
    <div className={`event-timeline ${className}`} data-testid="event-timeline">
      <div className="event-timeline__list">
        {events.map((event, index) => (
          <div
            key={event.id}
            className="event-timeline__item"
            data-testid={`event-item-${index}`}
          >
            <div className="event-timeline__marker">
              <span className="event-timeline__icon">{getEventIcon(event.type)}</span>
            </div>

            <div className="event-timeline__content">
              <div className="event-timeline__header">
                <h4 className="event-timeline__type">{formatEventType(event.type)}</h4>
                <time className="event-timeline__timestamp">
                  {formatTimestamp(event.timestamp)}
                </time>
              </div>

              <div className="event-timeline__details">
                {event.learner && (
                  <div className="event-timeline__learner">
                    <strong>Learner:</strong> {event.learner.firstName} {event.learner.lastName}
                  </div>
                )}

                {event.course && (
                  <div className="event-timeline__course">
                    <strong>Course:</strong> {event.course.title} ({event.course.code})
                  </div>
                )}

                {event.content && (
                  <div className="event-timeline__content-info">
                    <strong>Content:</strong> {event.content.title}
                  </div>
                )}

                {event.module && (
                  <div className="event-timeline__module">
                    <strong>Module:</strong> {event.module.title}
                  </div>
                )}

                {event.score !== null && event.score !== undefined && (
                  <div className="event-timeline__score">
                    <strong>Score:</strong> {event.score.toFixed(1)}%
                  </div>
                )}

                {event.duration !== null && event.duration !== undefined && (
                  <div className="event-timeline__duration">
                    <strong>Duration:</strong> {Math.floor(event.duration / 60)} min
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

EventTimeline.displayName = 'EventTimeline';
