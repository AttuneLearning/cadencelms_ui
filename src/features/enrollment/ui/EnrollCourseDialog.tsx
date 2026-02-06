/**
 * EnrollCourseDialog Component
 * Dialog for bulk enrolling learners directly in a course (not via class)
 * Uses POST /api/v2/enrollments/course/bulk
 */

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useBulkEnrollInCourse, useCourseEnrollments } from '@/entities/enrollment';
import { userApi } from '@/entities/user/api/userApi';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Checkbox } from '@/shared/ui/checkbox';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { Badge } from '@/shared/ui/badge';
import { Search, Users, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import type { BulkCourseEnrollmentResponse } from '@/entities/enrollment/model/types';

interface EnrollCourseDialogProps {
  open: boolean;
  courseId: string;
  courseName: string;
  departmentId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function EnrollCourseDialog({
  open,
  courseId,
  courseName,
  departmentId,
  onClose,
  onSuccess,
}: EnrollCourseDialogProps) {
  const [selectedLearners, setSelectedLearners] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [enrollmentResult, setEnrollmentResult] = useState<BulkCourseEnrollmentResponse | null>(null);

  // Fetch learners (optionally filtered by department)
  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users', { role: 'learner', department: departmentId }],
    queryFn: () => userApi.list({
      filters: {
        role: 'learner',
        ...(departmentId && { department: departmentId }),
      }
    }),
    enabled: open,
  });

  // Fetch already enrolled learners for this course
  const { data: enrollmentsData } = useCourseEnrollments(courseId, undefined, {
    enabled: open,
  });

  const bulkEnrollMutation = useBulkEnrollInCourse();

  const enrolledLearnerIds = useMemo(() => {
    return new Set(
      enrollmentsData?.enrollments
        .filter((e) => e.learner && e.status === 'active')
        .map((e) => e.learner.id) || []
    );
  }, [enrollmentsData]);

  const learners = useMemo(() => {
    if (!usersData?.users) return [];
    return usersData.users.filter((user) => user.roles?.includes('learner'));
  }, [usersData]);

  const filteredLearners = useMemo(() => {
    return learners.filter((learner) => {
      const matchesSearch =
        searchTerm === '' ||
        learner.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        learner.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        learner.email.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [learners, searchTerm]);

  const availableLearners = useMemo(() => {
    return filteredLearners.filter((learner) => !enrolledLearnerIds.has(learner._id));
  }, [filteredLearners, enrolledLearnerIds]);

  const alreadyEnrolledLearners = useMemo(() => {
    return filteredLearners.filter((learner) => enrolledLearnerIds.has(learner._id));
  }, [filteredLearners, enrolledLearnerIds]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLearners(availableLearners.map((l) => l._id));
    } else {
      setSelectedLearners([]);
    }
  };

  const handleSelectLearner = (learnerId: string, checked: boolean) => {
    if (checked) {
      setSelectedLearners((prev) => [...prev, learnerId]);
    } else {
      setSelectedLearners((prev) => prev.filter((id) => id !== learnerId));
    }
  };

  const handleEnroll = async () => {
    try {
      const result = await bulkEnrollMutation.mutateAsync({
        courseId,
        learnerIds: selectedLearners,
        options: {
          sendNotification: true,
        },
      });
      setEnrollmentResult(result);
      if (result.summary.successful > 0) {
        onSuccess();
      }
    } catch {
      // Error handled by mutation
    }
  };

  const handleClose = () => {
    setSelectedLearners([]);
    setSearchTerm('');
    setEnrollmentResult(null);
    onClose();
  };

  const allSelected =
    availableLearners.length > 0 &&
    selectedLearners.length === availableLearners.length;

  // Show result summary after enrollment
  if (enrollmentResult) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Enrollment Complete</DialogTitle>
            <DialogDescription>
              Bulk enrollment to <span className="font-medium">{courseName}</span> has completed.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-950/20">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
              <div>
                <p className="font-medium text-green-800 dark:text-green-200">
                  {enrollmentResult.summary.successful} learner{enrollmentResult.summary.successful !== 1 ? 's' : ''} enrolled
                </p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Successfully added to the course
                </p>
              </div>
            </div>

            {enrollmentResult.summary.failed > 0 && (
              <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
                <p className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                  {enrollmentResult.summary.failed} learner{enrollmentResult.summary.failed !== 1 ? 's' : ''} skipped
                </p>
                <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                  {enrollmentResult.failed.map((f) => (
                    <li key={f.learnerId}>
                      {f.learnerId}: {f.reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button onClick={handleClose}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Enroll Learners in Course</DialogTitle>
          <DialogDescription>
            Select learners to enroll directly in{' '}
            <span className="font-medium">{courseName}</span>
            {departmentId && (
              <Badge variant="outline" className="ml-2">Department Scoped</Badge>
            )}
          </DialogDescription>
        </DialogHeader>

        {bulkEnrollMutation.isError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to enroll learners. Please try again.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search learners by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Learner List */}
          <div className="flex-1 overflow-hidden flex flex-col border rounded-md">
            <div className="p-3 border-b bg-muted/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="select-all"
                  checked={allSelected}
                  onCheckedChange={handleSelectAll}
                  disabled={availableLearners.length === 0}
                  aria-label="Select all"
                />
                <label
                  htmlFor="select-all"
                  className="text-sm font-medium cursor-pointer"
                >
                  Select All
                </label>
              </div>
              <div className="text-sm text-muted-foreground">
                {selectedLearners.length > 0 && (
                  <span>
                    {selectedLearners.length} learner{selectedLearners.length !== 1 ? 's' : ''}{' '}
                    selected
                  </span>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {isLoadingUsers ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {/* Available learners */}
                  {availableLearners.map((learner) => (
                    <div
                      key={learner._id}
                      className="flex items-center gap-3 p-3 rounded-md hover:bg-muted/50 transition-colors"
                    >
                      <Checkbox
                        id={learner._id}
                        checked={selectedLearners.includes(learner._id)}
                        onCheckedChange={(checked) =>
                          handleSelectLearner(learner._id, checked as boolean)
                        }
                      />
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={undefined} />
                        <AvatarFallback>
                          {learner.firstName[0]}
                          {learner.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">
                          {learner.firstName} {learner.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {learner.email}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Already enrolled learners */}
                  {alreadyEnrolledLearners.length > 0 && (
                    <>
                      {availableLearners.length > 0 && <div className="my-2 border-t" />}
                      <div className="px-3 py-2 text-xs font-medium text-muted-foreground">
                        Already Enrolled ({alreadyEnrolledLearners.length})
                      </div>
                      {alreadyEnrolledLearners.map((learner) => (
                        <div
                          key={learner._id}
                          className="flex items-center gap-3 p-3 rounded-md opacity-50"
                        >
                          <Checkbox disabled checked />
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={undefined} />
                            <AvatarFallback>
                              {learner.firstName[0]}
                              {learner.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">
                              {learner.firstName} {learner.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {learner.email}
                            </p>
                          </div>
                        </div>
                      ))}
                    </>
                  )}

                  {filteredLearners.length === 0 && (
                    <div className="text-center py-8 text-sm text-muted-foreground">
                      No learners found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={bulkEnrollMutation.isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleEnroll}
            disabled={selectedLearners.length === 0 || bulkEnrollMutation.isPending}
          >
            {bulkEnrollMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enrolling...
              </>
            ) : (
              <>
                <Users className="mr-2 h-4 w-4" />
                Enroll {selectedLearners.length} Learner
                {selectedLearners.length !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
