/**
 * Report Schedule Detail Page
 * Displays schedule details and execution history
 */

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/shared/ui/page-header';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { ArrowLeft, Play, Pause, Trash2, Calendar, Clock, Mail, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/shared/ui/use-toast';
import {
  useReportSchedule,
  useReportScheduleExecutions,
  useToggleReportSchedule,
  useTriggerReportSchedule,
  useDeleteReportSchedule,
} from '@/entities/report-schedule';
import { cn } from '@/shared/lib/utils';

export const ReportScheduleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: schedule, isLoading } = useReportSchedule(id!);
  const { data: executions = [] } = useReportScheduleExecutions(id!);
  const toggleMutation = useToggleReportSchedule();
  const triggerMutation = useTriggerReportSchedule();
  const deleteMutation = useDeleteReportSchedule();

  const handleToggle = async () => {
    if (!schedule) return;

    try {
      await toggleMutation.mutateAsync({
        scheduleId: schedule._id,
        isActive: !schedule.isActive,
      });
      toast({
        title: schedule.isActive ? 'Schedule Paused' : 'Schedule Activated',
        description: schedule.isActive
          ? 'The schedule has been paused and will not run.'
          : 'The schedule will run at the next scheduled time.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update schedule',
        variant: 'destructive',
      });
    }
  };

  const handleTrigger = async () => {
    if (!schedule) return;

    try {
      await triggerMutation.mutateAsync(schedule._id);
      toast({
        title: 'Schedule Triggered',
        description: 'Report job has been queued for execution.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to trigger schedule',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!schedule) return;
    if (!confirm('Are you sure you want to delete this schedule? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(schedule._id);
      toast({
        title: 'Schedule Deleted',
        description: 'The schedule has been deleted successfully.',
      });
      navigate('/admin/reports/schedules');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete schedule',
        variant: 'destructive',
      });
    }
  };

  if (isLoading || !schedule) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={schedule.name}
        description={schedule.description || 'Report schedule details'}
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate('/admin/reports/schedules')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          {schedule.isActive && (
            <Button variant="outline" onClick={handleTrigger}>
              <Play className="mr-2 h-4 w-4" />
              Run Now
            </Button>
          )}
          <Button
            variant={schedule.isActive ? 'outline' : 'default'}
            onClick={handleToggle}
          >
            {schedule.isActive ? (
              <>
                <Pause className="mr-2 h-4 w-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Activate
              </>
            )}
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </PageHeader>

      {/* Status Badge */}
      <div className="flex items-center gap-4">
        <Badge variant={schedule.isActive ? 'default' : 'secondary'}>
          {schedule.isActive ? 'Active' : 'Inactive'}
        </Badge>
        {schedule.consecutiveFailures > 0 && (
          <Badge variant="outline" className="border-red-600 text-red-600 bg-red-50">
            <AlertTriangle className="mr-1 h-3 w-3" />
            {schedule.consecutiveFailures} consecutive failures
          </Badge>
        )}
      </div>

      {/* Schedule Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Schedule Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Frequency
              </p>
              <p className="font-medium capitalize">{schedule.schedule.frequency}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Time
              </p>
              <p className="font-medium">
                {schedule.schedule.time} ({schedule.schedule.timezone})
              </p>
            </div>

            {schedule.schedule.dayOfWeek !== undefined && (
              <div>
                <p className="text-sm text-muted-foreground">Day of Week</p>
                <p className="font-medium">
                  {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][
                    schedule.schedule.dayOfWeek
                  ]}
                </p>
              </div>
            )}

            {schedule.schedule.dayOfMonth !== undefined && (
              <div>
                <p className="text-sm text-muted-foreground">Day of Month</p>
                <p className="font-medium">{schedule.schedule.dayOfMonth}</p>
              </div>
            )}

            <div>
              <p className="text-sm text-muted-foreground">Report Type</p>
              <p className="font-medium capitalize">{schedule.reportType.replace('-', ' ')}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Output Format</p>
              <p className="font-medium uppercase">{schedule.outputFormat}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Delivery Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {schedule.delivery.email && (
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  Email Recipients
                </p>
                <div className="mt-2 space-y-1">
                  {schedule.delivery.email.recipients.map((email, index) => (
                    <p key={index} className="text-sm font-mono">
                      {email}
                    </p>
                  ))}
                </div>
                {schedule.delivery.email.attachReport && (
                  <p className="text-xs text-muted-foreground mt-2">Report attached to email</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Execution Times */}
      {(schedule.nextRunAt || schedule.lastRunAt) && (
        <Card>
          <CardHeader>
            <CardTitle>Execution Times</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {schedule.nextRunAt && (
              <div>
                <p className="text-sm text-muted-foreground">Next Run</p>
                <p className="font-medium">
                  {format(new Date(schedule.nextRunAt), 'PPP p')}
                </p>
              </div>
            )}
            {schedule.lastRunAt && (
              <div>
                <p className="text-sm text-muted-foreground">Last Run</p>
                <p className="font-medium">
                  {format(new Date(schedule.lastRunAt), 'PPP p')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Execution History */}
      <Card>
        <CardHeader>
          <CardTitle>Execution History</CardTitle>
          <CardDescription>Recent executions of this schedule</CardDescription>
        </CardHeader>
        <CardContent>
          {executions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No executions yet. The schedule will run at the scheduled time.
            </p>
          ) : (
            <div className="space-y-3">
              {executions.map((execution) => (
                <div
                  key={execution._id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">
                      {format(new Date(execution.executedAt), 'PPP p')}
                    </p>
                    {execution.jobId && (
                      <p className="text-sm text-muted-foreground">Job ID: {execution.jobId}</p>
                    )}
                  </div>
                  <Badge
                    variant={
                      execution.status === 'success'
                        ? 'outline'
                        : execution.status === 'failed'
                        ? 'destructive'
                        : 'secondary'
                    }
                    className={cn({
                      'border-green-600 text-green-600 bg-green-50':
                        execution.status === 'success',
                    })}
                  >
                    {execution.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
