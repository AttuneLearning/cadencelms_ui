/**
 * Class Details Page
 * Detailed view of a class with students, progress, and management actions
 */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useClass, useClassRoster, useClassProgress, useDropLearner } from '@/entities/class/model/useClass';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Skeleton } from '@/shared/ui/skeleton';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { Separator } from '@/shared/ui/separator';
import {
  ArrowLeft,
  Users,
  BookOpen,
  Calendar,
  GraduationCap,
  Mail,
  AlertCircle,
  UserPlus,
} from 'lucide-react';
import { PageHeader } from '@/shared/ui/page-header';
import { StudentList } from '@/features/classes/ui/StudentList';
import { EnrollStudentsDialog } from '@/features/classes/ui/EnrollStudentsDialog';
import { SendAnnouncementDialog } from '@/features/classes/ui/SendAnnouncementDialog';
import { useToast } from '@/shared/ui/use-toast';

const statusVariants = {
  active: 'default' as const,
  upcoming: 'secondary' as const,
  completed: 'outline' as const,
  cancelled: 'destructive' as const,
};

const statusLabels = {
  active: 'Active',
  upcoming: 'Upcoming',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export function ClassDetailsPage() {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [announcementDialogOpen, setAnnouncementDialogOpen] = useState(false);

  const { data: classData, isLoading: isLoadingClass, error: classError } = useClass(classId || '');
  const { data: rosterData, isLoading: isLoadingRoster, refetch: refetchRoster } = useClassRoster(
    classId || '',
    { includeProgress: true }
  );
  const { data: progressData, isLoading: isLoadingProgress } = useClassProgress(classId || '');
  const dropLearnerMutation = useDropLearner();

  const handleBack = () => {
    navigate('/staff/classes');
  };

  const handleEnrollSuccess = () => {
    toast({
      title: 'Students enrolled',
      description: 'Students have been successfully enrolled in the class.',
    });
    refetchRoster();
  };

  const handleRemoveStudent = async (enrollmentId: string) => {
    try {
      await dropLearnerMutation.mutateAsync({
        id: classId || '',
        enrollmentId,
        reason: 'Removed by instructor',
      });
      toast({
        title: 'Student removed',
        description: 'Student has been removed from the class.',
      });
      refetchRoster();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove student from class.',
        variant: 'destructive',
      });
    }
  };

  const handleExportStudents = () => {
    if (!rosterData) return;

    const csv = [
      ['Name', 'Email', 'Student ID', 'Status', 'Progress', 'Score', 'Attendance'].join(','),
      ...rosterData.roster.map((student) => [
        `${student.learner.firstName} ${student.learner.lastName}`,
        student.learner.email,
        student.learner.studentId || '',
        student.status,
        `${student.progress?.completionPercent || 0}%`,
        student.progress?.currentScore || '',
        `${student.attendance?.attendanceRate || 0}%`,
      ].join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${classData?.name}-students.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (classError) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load class details. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoadingClass) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="container mx-auto py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Class not found.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <PageHeader
        title={classData.name}
        description={
          <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              {classData.course.code} - {classData.course.title}
            </span>
            <span className="flex items-center gap-1">
              <GraduationCap className="h-4 w-4" />
              {classData.program.name}
              {classData.programLevel && ` - ${classData.programLevel.name}`}
            </span>
          </div>
        }
        backButton={
          <Button variant="ghost" className="w-fit" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Classes
          </Button>
        }
      >
        <Badge variant={statusVariants[classData.status]}>
          {statusLabels[classData.status]}
        </Badge>
        <Button variant="outline" onClick={() => setAnnouncementDialogOpen(true)}>
          <Mail className="mr-2 h-4 w-4" />
          Send Announcement
        </Button>
        <Button onClick={() => setEnrollDialogOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Enroll Students
        </Button>
      </PageHeader>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enrolled</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {classData.enrolledCount}
              {classData.capacity && ` / ${classData.capacity}`}
            </div>
            <p className="text-xs text-muted-foreground">
              {classData.capacity
                ? `${classData.capacity - classData.enrolledCount} seats available`
                : 'No capacity limit'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {progressData?.averageProgress.toFixed(1) || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {progressData?.completedCount || 0} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {progressData?.averageScore?.toFixed(1) || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">Class average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Duration</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classData.duration} weeks</div>
            <p className="text-xs text-muted-foreground">
              {format(new Date(classData.startDate), 'MMM dd')} -{' '}
              {format(new Date(classData.endDate), 'MMM dd, yyyy')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="students" className="space-y-4">
        <TabsList>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="space-y-4">
          {isLoadingRoster ? (
            <div className="text-center py-8">
              <p>Loading students...</p>
            </div>
          ) : rosterData ? (
            <StudentList
              students={rosterData.roster}
              onRemove={handleRemoveStudent}
              onExport={handleExportStudents}
            />
          ) : null}
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          {isLoadingProgress ? (
            <div className="text-center py-8">
              <p>Loading progress data...</p>
            </div>
          ) : progressData ? (
            <Card>
              <CardHeader>
                <CardTitle>Class Progress Summary</CardTitle>
                <CardDescription>Overview of student progress and performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold">{progressData.completedCount}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                    <p className="text-2xl font-bold">{progressData.inProgressCount}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Not Started</p>
                    <p className="text-2xl font-bold">{progressData.notStartedCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Class Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Course</h3>
                <p className="font-medium">{classData.course.title}</p>
                <p className="text-sm text-muted-foreground">{classData.course.description}</p>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Instructors</h3>
                <div className="space-y-3">
                  {classData.instructors.map((instructor) => (
                    <div key={instructor.id} className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={instructor.profileImage || undefined} />
                        <AvatarFallback>
                          {instructor.firstName[0]}
                          {instructor.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {instructor.firstName} {instructor.lastName}
                          {instructor.role === 'primary' && (
                            <Badge variant="outline" className="ml-2">
                              Primary
                            </Badge>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">{instructor.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Schedule</h3>
                <div className="space-y-1">
                  <p className="text-sm">
                    <span className="font-medium">Start:</span>{' '}
                    {format(new Date(classData.startDate), 'MMMM dd, yyyy')}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">End:</span>{' '}
                    {format(new Date(classData.endDate), 'MMMM dd, yyyy')}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Duration:</span> {classData.duration} weeks
                  </p>
                  {classData.academicTerm && (
                    <p className="text-sm">
                      <span className="font-medium">Term:</span> {classData.academicTerm.name}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <EnrollStudentsDialog
        open={enrollDialogOpen}
        classId={classId || ''}
        className={classData.name}
        onClose={() => setEnrollDialogOpen(false)}
        onSuccess={handleEnrollSuccess}
      />

      <SendAnnouncementDialog
        open={announcementDialogOpen}
        classId={classId || ''}
        className={classData.name}
        studentCount={classData.enrolledCount}
        onClose={() => setAnnouncementDialogOpen(false)}
        onSuccess={() => {
          toast({
            title: 'Announcement sent',
            description: 'Your announcement has been sent to all students.',
          });
        }}
      />
    </div>
  );
}
