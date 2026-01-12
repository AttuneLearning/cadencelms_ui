/**
 * ActivityTimeline Component
 * Shows student activity timeline with filtering and export options
 */

import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import {
  BookOpen,
  FileText,
  Award,
  TrendingUp,
  Download,
  Calendar,
  CheckCircle,
} from 'lucide-react';

export type ActivityEventType =
  | 'course_started'
  | 'module_completed'
  | 'assessment_submitted'
  | 'program_completed';

export interface Activity {
  id: string;
  timestamp: string;
  eventType: ActivityEventType;
  resourceTitle: string;
  details: string;
}

export interface ActivityTimelineProps {
  activities: Activity[];
  showFilters?: boolean;
  showExport?: boolean;
  limit?: number;
  onExport?: (activities: Activity[]) => void;
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  activities,
  showFilters = false,
  showExport = false,
  limit,
  onExport,
}) => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all');
  const [displayLimit, setDisplayLimit] = useState(limit || activities.length);

  const getEventIcon = (eventType: ActivityEventType) => {
    switch (eventType) {
      case 'course_started':
        return <BookOpen className="h-4 w-4" />;
      case 'module_completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'assessment_submitted':
        return <FileText className="h-4 w-4" />;
      case 'program_completed':
        return <Award className="h-4 w-4" />;
      default:
        return <TrendingUp className="h-4 w-4" />;
    }
  };

  const getEventColor = (eventType: ActivityEventType) => {
    switch (eventType) {
      case 'course_started':
        return 'bg-blue-500/10 text-blue-500';
      case 'module_completed':
        return 'bg-green-500/10 text-green-500';
      case 'assessment_submitted':
        return 'bg-purple-500/10 text-purple-500';
      case 'program_completed':
        return 'bg-yellow-500/10 text-yellow-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  const filteredActivities = useMemo(() => {
    let filtered = [...activities];

    // Filter by date range
    if (fromDate) {
      filtered = filtered.filter(
        (activity) => new Date(activity.timestamp) >= new Date(fromDate)
      );
    }
    if (toDate) {
      filtered = filtered.filter(
        (activity) => new Date(activity.timestamp) <= new Date(toDate)
      );
    }

    // Filter by event type
    if (eventTypeFilter !== 'all') {
      filtered = filtered.filter((activity) => activity.eventType === eventTypeFilter);
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return filtered;
  }, [activities, fromDate, toDate, eventTypeFilter]);

  const displayedActivities = filteredActivities.slice(0, displayLimit);

  const handleExport = () => {
    if (onExport) {
      onExport(filteredActivities);
    }
  };

  const handleLoadMore = () => {
    setDisplayLimit((prev) => prev + (limit || 10));
  };

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No activity recorded yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Activity Timeline</CardTitle>
          {showExport && (
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        {showFilters && (
          <div className="grid gap-4 md:grid-cols-3 pb-4 border-b">
            <div className="space-y-2">
              <Label htmlFor="from-date">From Date</Label>
              <Input
                id="from-date"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="to-date">To Date</Label>
              <Input
                id="to-date"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="event-type">Event Type</Label>
              <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
                <SelectTrigger id="event-type">
                  <SelectValue placeholder="All events" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  <SelectItem value="course_started">Course Started</SelectItem>
                  <SelectItem value="module_completed">Module Completed</SelectItem>
                  <SelectItem value="assessment_submitted">Assessment Submitted</SelectItem>
                  <SelectItem value="program_completed">Program Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="space-y-4">
          {displayedActivities.map((activity, index) => (
            <div key={activity.id} className="flex gap-4">
              {/* Timeline line and icon */}
              <div className="flex flex-col items-center">
                <div
                  className={`rounded-full p-2 ${getEventColor(activity.eventType)}`}
                >
                  {getEventIcon(activity.eventType)}
                </div>
                {index < displayedActivities.length - 1 && (
                  <div className="flex-1 w-0.5 bg-border my-2 min-h-[40px]"></div>
                )}
              </div>

              {/* Activity content */}
              <div className="flex-1 pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium">{activity.resourceTitle}</h4>
                    <p className="text-sm text-muted-foreground">{activity.details}</p>
                  </div>
                  <time className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                    {format(new Date(activity.timestamp), 'MMM d, yyyy HH:mm')}
                  </time>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        {filteredActivities.length > displayedActivities.length && (
          <div className="text-center pt-4">
            <Button variant="outline" onClick={handleLoadMore}>
              Load More
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Showing {displayedActivities.length} of {filteredActivities.length} activities
            </p>
          </div>
        )}

        {filteredActivities.length === 0 && activities.length > 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No activities match your filters</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
