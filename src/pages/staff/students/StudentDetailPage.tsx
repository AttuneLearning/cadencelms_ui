/**
 * Student Detail Page
 * Comprehensive view of a single student's progress and performance
 */

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLearnerProgress } from '@/entities/progress/hooks/useProgress';
import { AppLayout } from '@/widgets/layout';
import { Button } from '@/shared/ui/button';
import { useToast } from '@/shared/ui/use-toast';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/shared/ui/page-header';
import {
  StudentDetailView,
  StudentProgressChart,
  InterventionTools,
  ActivityTimeline,
} from '@/features/progress/ui';
import type { ProgressDataPoint } from '@/features/progress/ui';
import {
  useSendMessageToStudent,
  useResetExamAttempt,
  useExtendEnrollmentDeadline,
  useManualCompleteEnrollment,
} from '@/entities/student';

export const StudentDetailPage: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: studentData, isLoading, error } = useLearnerProgress(studentId || '');

  // Mutation hooks
  const sendMessage = useSendMessageToStudent();
  const resetQuiz = useResetExamAttempt();
  const extendDeadline = useExtendEnrollmentDeadline();
  const manualComplete = useManualCompleteEnrollment();

  // Transform data for progress chart
  const progressChartData: ProgressDataPoint[] = React.useMemo(() => {
    if (!studentData?.recentActivity) return [];

    // Group activities by date and calculate progress
    const activityMap = new Map<string, { progress: number; timeSpent: number }>();

    studentData.recentActivity.forEach((activity) => {
      const date = new Date(activity.timestamp).toISOString().split('T')[0];
      if (!activityMap.has(date)) {
        activityMap.set(date, { progress: 0, timeSpent: 0 });
      }
    });

    // Convert courses to progress data points
    const progressPoints: ProgressDataPoint[] = [];
    studentData.courseProgress.forEach((course) => {
      if (course.lastAccessedAt) {
        const date = new Date(course.lastAccessedAt).toISOString().split('T')[0];
        progressPoints.push({
          date,
          progress: course.completionPercent,
          timeSpent: 0, // Would need to be calculated from actual time spent data
        });
      }
    });

    // Sort by date
    return progressPoints.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [studentData]);

  // Transform recent activity for timeline
  const timelineActivities = React.useMemo(() => {
    if (!studentData?.recentActivity) return [];

    return studentData.recentActivity.map((activity) => ({
      id: activity.timestamp,
      timestamp: activity.timestamp,
      eventType: activity.activityType,
      resourceTitle: activity.resourceTitle,
      details: activity.details,
    }));
  }, [studentData]);

  const handleBack = () => {
    navigate('/staff/students');
  };

  // Handler functions for intervention tools
  const handleSendMessage = async (currentStudentId: string, message: string) => {
    sendMessage.mutate(
      {
        studentId: currentStudentId,
        subject: 'Message from Staff',
        message,
      },
      {
        onSuccess: () => {
          toast({
            title: 'Message sent',
            description: 'Your message has been sent to the student successfully.',
          });
        },
        onError: (error: any) => {
          toast({
            title: 'Failed to send message',
            description: error.message || 'An error occurred while sending the message.',
            variant: 'destructive',
          });
        },
      }
    );
  };

  const handleResetQuiz = async (attemptId: string) => {
    const enrollmentId = studentData?.courseProgress[0]?.courseId || '';
    const examId = attemptId;

    resetQuiz.mutate(
      {
        enrollmentId,
        examId,
        reason: 'Reset by staff member',
      },
      {
        onSuccess: () => {
          toast({
            title: 'Quiz reset',
            description: 'The quiz attempt has been reset successfully.',
          });
        },
        onError: (error: any) => {
          toast({
            title: 'Failed to reset quiz',
            description: error.message || 'An error occurred while resetting the quiz.',
            variant: 'destructive',
          });
        },
      }
    );
  };

  const handleExtendDeadline = async (enrollmentId: string, days: number) => {
    const newDeadline = new Date();
    newDeadline.setDate(newDeadline.getDate() + days);

    extendDeadline.mutate(
      {
        enrollmentId,
        newDeadline: newDeadline.toISOString(),
        reason: `Extended by ${days} days`,
      },
      {
        onSuccess: () => {
          toast({
            title: 'Deadline extended',
            description: `The deadline has been extended by ${days} days.`,
          });
        },
        onError: (error: any) => {
          toast({
            title: 'Failed to extend deadline',
            description: error.message || 'An error occurred while extending the deadline.',
            variant: 'destructive',
          });
        },
      }
    );
  };

  const handleManualOverride = async (enrollmentId: string, reason: string) => {
    manualComplete.mutate(
      {
        enrollmentId,
        reason,
      },
      {
        onSuccess: () => {
          toast({
            title: 'Enrollment completed',
            description: 'The enrollment has been manually marked as complete.',
          });
        },
        onError: (error: any) => {
          toast({
            title: 'Failed to complete enrollment',
            description: error.message || 'An error occurred while completing the enrollment.',
            variant: 'destructive',
          });
        },
      }
    );
  };

  return (
    <AppLayout>
      <div className="container mx-auto p-6 space-y-6">
        <PageHeader
          title="Student Details"
          description="Comprehensive progress and performance overview"
          backButton={
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          }
        />

        {error && (
          <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md">
            Failed to load student data. Please try again.
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Student Detail View */}
            <StudentDetailView studentId={studentId || ''} data={studentData} isLoading={isLoading} />

            {/* Progress Chart */}
            {progressChartData.length > 0 && (
              <StudentProgressChart
                data={progressChartData}
                title="Progress Trend"
                showTimeSpent={false}
              />
            )}

            {/* Activity Timeline */}
            <ActivityTimeline
              activities={timelineActivities}
              showFilters={true}
              showExport={true}
            />
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-6">
            {/* Intervention Tools */}
            <InterventionTools
              studentId={studentId || ''}
              enrollmentId={studentData?.courseProgress[0]?.courseId || ''}
              onSendMessage={handleSendMessage}
              onResetQuiz={handleResetQuiz}
              onExtendDeadline={handleExtendDeadline}
              onManualOverride={handleManualOverride}
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
