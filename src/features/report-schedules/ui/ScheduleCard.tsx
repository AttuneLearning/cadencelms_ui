/**
 * Schedule Card Component
 * Displays a report schedule in card format
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Calendar, Clock, Mail, Play, Pause } from 'lucide-react';
import { format } from 'date-fns';
import type { ReportSchedule } from '@/entities/report-schedule';
import { cn } from '@/shared/lib/utils';

interface ScheduleCardProps {
  schedule: ReportSchedule;
  onTrigger?: (scheduleId: string) => void;
  onToggle?: (scheduleId: string, active: boolean) => void;
  onView?: (scheduleId: string) => void;
  className?: string;
}

export const ScheduleCard: React.FC<ScheduleCardProps> = ({
  schedule,
  onTrigger,
  onToggle,
  onView,
  className,
}) => {
  return (
    <Card className={cn('hover:shadow-md transition-shadow', className)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{schedule.name}</CardTitle>
            {schedule.description && (
              <CardDescription>{schedule.description}</CardDescription>
            )}
          </div>
          <Badge variant={schedule.isActive ? 'default' : 'secondary'}>
            {schedule.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Schedule Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Frequency
            </p>
            <p className="font-medium capitalize">{schedule.schedule.frequency}</p>
          </div>
          <div>
            <p className="text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Time
            </p>
            <p className="font-medium">{schedule.schedule.time}</p>
          </div>
        </div>

        {/* Next Run */}
        {schedule.nextRunAt && (
          <div className="text-sm">
            <p className="text-muted-foreground">Next Run</p>
            <p className="font-medium">
              {format(new Date(schedule.nextRunAt), 'MMM d, yyyy HH:mm')}
            </p>
          </div>
        )}

        {/* Last Run */}
        {schedule.lastRunAt && (
          <div className="text-sm">
            <p className="text-muted-foreground">Last Run</p>
            <p className="font-medium">
              {format(new Date(schedule.lastRunAt), 'MMM d, yyyy HH:mm')}
            </p>
          </div>
        )}

        {/* Delivery */}
        {schedule.delivery.email && (
          <div className="text-sm">
            <p className="text-muted-foreground flex items-center gap-1">
              <Mail className="h-3 w-3" />
              Recipients
            </p>
            <p className="font-medium">{schedule.delivery.email.recipients.length} email(s)</p>
          </div>
        )}

        {/* Failure Warning */}
        {schedule.consecutiveFailures > 0 && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            <p className="font-medium">
              {schedule.consecutiveFailures} consecutive failure(s)
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="gap-2">
        {onView && (
          <Button variant="outline" size="sm" onClick={() => onView(schedule._id)} className="flex-1">
            View Details
          </Button>
        )}
        {onTrigger && schedule.isActive && (
          <Button variant="outline" size="sm" onClick={() => onTrigger(schedule._id)}>
            <Play className="h-4 w-4 mr-1" />
            Run Now
          </Button>
        )}
        {onToggle && (
          <Button
            variant={schedule.isActive ? 'outline' : 'default'}
            size="sm"
            onClick={() => onToggle(schedule._id, !schedule.isActive)}
          >
            {schedule.isActive ? (
              <>
                <Pause className="h-4 w-4 mr-1" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-1" />
                Activate
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
