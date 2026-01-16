/**
 * Report Schedules Page
 * Manages automated report schedules
 */

import React from 'react';
import { PageHeader } from '@/shared/ui/page-header';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Plus, Calendar, PlayCircle, PauseCircle } from 'lucide-react';
import { useToast } from '@/shared/ui/use-toast';
import {
  useReportSchedules,
  useToggleReportSchedule,
  useTriggerReportSchedule,
  useDeleteReportSchedule,
} from '@/entities/report-schedule';
import { SchedulesList, CreateScheduleDialog } from '@/features/report-schedules';
import { cn } from '@/shared/lib/utils';

export const ReportSchedulesPage: React.FC = () => {
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const { toast } = useToast();

  const { data: schedules = [], isLoading, refetch } = useReportSchedules();
  const toggleMutation = useToggleReportSchedule();
  const triggerMutation = useTriggerReportSchedule();
  const deleteMutation = useDeleteReportSchedule();

  const handleTrigger = async (scheduleId: string) => {
    try {
      await triggerMutation.mutateAsync(scheduleId);
      toast({
        title: 'Schedule Triggered',
        description: 'Report job has been queued for execution.',
      });
      refetch();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to trigger schedule',
        variant: 'destructive',
      });
    }
  };

  const handleToggle = async (scheduleId: string, active: boolean) => {
    try {
      await toggleMutation.mutateAsync({ scheduleId, isActive: active });
      toast({
        title: active ? 'Schedule Activated' : 'Schedule Paused',
        description: active
          ? 'The schedule will run at the next scheduled time.'
          : 'The schedule has been paused and will not run.',
      });
      refetch();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update schedule',
        variant: 'destructive',
      });
    }
  };

  const handleView = (scheduleId: string) => {
    window.location.href = `/admin/reports/schedules/${scheduleId}`;
  };

  // Calculate stats
  const totalSchedules = schedules.length;
  const activeSchedules = schedules.filter((s) => s.isActive).length;
  const pausedSchedules = schedules.filter((s) => !s.isActive).length;
  const failedSchedules = schedules.filter((s) => s.consecutiveFailures > 0).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Report Schedules"
        description="Manage automated report generation schedules"
      >
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Schedule
        </Button>
      </PageHeader>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Schedules</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSchedules}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <PlayCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSchedules}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paused</CardTitle>
            <PauseCircle className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pausedSchedules}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Failures</CardTitle>
            <div className="h-4 w-4 rounded-full bg-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{failedSchedules}</div>
          </CardContent>
        </Card>
      </div>

      {/* Schedules List */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading schedules...</p>
        </div>
      ) : (
        <SchedulesList
          schedules={schedules}
          onTrigger={handleTrigger}
          onToggle={handleToggle}
          onView={handleView}
          emptyMessage="No schedules found. Create your first automated report schedule."
        />
      )}

      {/* Create Schedule Dialog */}
      <CreateScheduleDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
    </div>
  );
};
