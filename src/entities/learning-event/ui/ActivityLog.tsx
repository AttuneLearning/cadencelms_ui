/**
 * ActivityLog Component
 * Displays user activity log with filtering
 */

import React, { useState } from 'react';
import type { LearningEvent, LearningEventType } from '../model/types';

export interface ActivityLogProps {
  events: LearningEvent[];
  isLoading?: boolean;
  showFilters?: boolean;
  onFilterChange?: (filters: ActivityLogFilters) => void;
  className?: string;
}

export interface ActivityLogFilters {
  type?: LearningEventType;
  dateFrom?: string;
  dateTo?: string;
}

/**
 * Event type options for filtering
 */
const EVENT_TYPE_OPTIONS: Array<{ value: LearningEventType | ''; label: string }> = [
  { value: '', label: 'All Events' },
  { value: 'enrollment', label: 'Enrollments' },
  { value: 'content_started', label: 'Content Started' },
  { value: 'content_completed', label: 'Content Completed' },
  { value: 'assessment_started', label: 'Assessment Started' },
  { value: 'assessment_completed', label: 'Assessment Completed' },
  { value: 'module_completed', label: 'Module Completed' },
  { value: 'course_completed', label: 'Course Completed' },
  { value: 'achievement_earned', label: 'Achievements' },
  { value: 'login', label: 'Logins' },
  { value: 'logout', label: 'Logouts' },
];

/**
 * Format date for display
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Get CSS class for event type
 */
function getEventTypeClass(type: LearningEventType): string {
  const classMap: Record<LearningEventType, string> = {
    enrollment: 'activity-log__event--enrollment',
    content_started: 'activity-log__event--started',
    content_completed: 'activity-log__event--completed',
    assessment_started: 'activity-log__event--assessment',
    assessment_completed: 'activity-log__event--assessment-completed',
    module_completed: 'activity-log__event--milestone',
    course_completed: 'activity-log__event--milestone',
    achievement_earned: 'activity-log__event--achievement',
    login: 'activity-log__event--system',
    logout: 'activity-log__event--system',
  };

  return classMap[type] || '';
}

/**
 * ActivityLog Component
 */
export const ActivityLog: React.FC<ActivityLogProps> = ({
  events,
  isLoading = false,
  showFilters = true,
  onFilterChange,
  className = '',
}) => {
  const [filters, setFilters] = useState<ActivityLogFilters>({});

  const handleFilterChange = (newFilters: Partial<ActivityLogFilters>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFilterChange?.(updated);
  };

  if (isLoading) {
    return (
      <div className={`activity-log activity-log--loading ${className}`}>
        <div className="activity-log__loading" data-testid="activity-log-loading">
          Loading activity...
        </div>
      </div>
    );
  }

  return (
    <div className={`activity-log ${className}`} data-testid="activity-log">
      {showFilters && (
        <div className="activity-log__filters" data-testid="activity-log-filters">
          <div className="activity-log__filter">
            <label htmlFor="event-type-filter" className="activity-log__filter-label">
              Event Type:
            </label>
            <select
              id="event-type-filter"
              className="activity-log__filter-select"
              value={filters.type || ''}
              onChange={e => {
                const value = e.target.value as LearningEventType | '';
                handleFilterChange({ type: value || undefined });
              }}
            >
              {EVENT_TYPE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="activity-log__filter">
            <label htmlFor="date-from-filter" className="activity-log__filter-label">
              From:
            </label>
            <input
              type="date"
              id="date-from-filter"
              className="activity-log__filter-input"
              value={filters.dateFrom || ''}
              onChange={e => handleFilterChange({ dateFrom: e.target.value || undefined })}
            />
          </div>

          <div className="activity-log__filter">
            <label htmlFor="date-to-filter" className="activity-log__filter-label">
              To:
            </label>
            <input
              type="date"
              id="date-to-filter"
              className="activity-log__filter-input"
              value={filters.dateTo || ''}
              onChange={e => handleFilterChange({ dateTo: e.target.value || undefined })}
            />
          </div>
        </div>
      )}

      {events.length === 0 ? (
        <div className="activity-log__empty" data-testid="activity-log-empty">
          No activity to display
        </div>
      ) : (
        <div className="activity-log__list">
          <table className="activity-log__table">
            <thead>
              <tr>
                <th>Date/Time</th>
                <th>Event</th>
                <th>Course</th>
                <th>Content</th>
                <th>Score</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              {events.map(event => (
                <tr
                  key={event.id}
                  className={`activity-log__event ${getEventTypeClass(event.type)}`}
                  data-testid="activity-log-event"
                >
                  <td className="activity-log__cell activity-log__cell--timestamp">
                    {formatDate(event.timestamp)}
                  </td>
                  <td className="activity-log__cell activity-log__cell--type">
                    {event.type.replace(/_/g, ' ')}
                  </td>
                  <td className="activity-log__cell activity-log__cell--course">
                    {event.course ? `${event.course.title} (${event.course.code})` : '-'}
                  </td>
                  <td className="activity-log__cell activity-log__cell--content">
                    {event.content?.title || '-'}
                  </td>
                  <td className="activity-log__cell activity-log__cell--score">
                    {event.score !== null && event.score !== undefined
                      ? `${event.score.toFixed(1)}%`
                      : '-'}
                  </td>
                  <td className="activity-log__cell activity-log__cell--duration">
                    {event.duration ? `${Math.floor(event.duration / 60)} min` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

ActivityLog.displayName = 'ActivityLog';
