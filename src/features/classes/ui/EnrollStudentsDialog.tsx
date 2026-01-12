/**
 * EnrollStudentsDialog Component
 * Dialog for enrolling students in a class with search and filter capabilities
 */

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useEnrollLearners } from '@/entities/class/model/useClass';
import { useClassEnrollments } from '@/entities/class/model/useClass';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { Search, Users, AlertCircle, Loader2 } from 'lucide-react';

interface EnrollStudentsDialogProps {
  open: boolean;
  classId: string;
  className: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function EnrollStudentsDialog({
  open,
  classId,
  className,
  onClose,
  onSuccess,
}: EnrollStudentsDialogProps) {
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [programFilter, setProgramFilter] = useState<string>('all');

  // Fetch learners
  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users', { role: 'learner' }],
    queryFn: () => userApi.list({ filters: { role: 'learner' } }),
    enabled: open,
  });

  // Fetch already enrolled students
  const { data: enrollmentsData } = useClassEnrollments(classId, undefined, {
    enabled: open,
  });

  const enrollMutation = useEnrollLearners();

  const enrolledLearnerIds = useMemo(() => {
    return new Set(
      enrollmentsData?.enrollments
        .filter((e) => e.learner && e.status === 'active')
        .map((e) => e.learner.id) || []
    );
  }, [enrollmentsData]);

  const learners = useMemo(() => {
    if (!usersData?.users) return [];
    return usersData.users.filter((user) => user.roles.includes('learner'));
  }, [usersData]);

  const filteredLearners = useMemo(() => {
    return learners.filter((learner) => {
      const matchesSearch =
        searchTerm === '' ||
        learner.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        learner.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        learner.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDepartment = departmentFilter === 'all';

      const matchesProgram = programFilter === 'all';

      return matchesSearch && matchesDepartment && matchesProgram;
    });
  }, [learners, searchTerm, departmentFilter, programFilter]);

  const availableLearners = useMemo(() => {
    return filteredLearners.filter((learner) => !enrolledLearnerIds.has(learner._id));
  }, [filteredLearners, enrolledLearnerIds]);

  const alreadyEnrolledLearners = useMemo(() => {
    return filteredLearners.filter((learner) => enrolledLearnerIds.has(learner._id));
  }, [filteredLearners, enrolledLearnerIds]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStudents(availableLearners.map((l) => l._id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleSelectStudent = (studentId: string, checked: boolean) => {
    if (checked) {
      setSelectedStudents((prev) => [...prev, studentId]);
    } else {
      setSelectedStudents((prev) => prev.filter((id) => id !== studentId));
    }
  };

  const handleEnroll = async () => {
    try {
      await enrollMutation.mutateAsync({
        id: classId,
        payload: {
          learnerIds: selectedStudents,
        },
      });
      onSuccess();
      handleClose();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleClose = () => {
    setSelectedStudents([]);
    setSearchTerm('');
    setDepartmentFilter('all');
    setProgramFilter('all');
    onClose();
  };

  const allSelected =
    availableLearners.length > 0 &&
    selectedStudents.length === availableLearners.length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Enroll Students</DialogTitle>
          <DialogDescription>
            Select students to enroll in <span className="font-medium">{className}</span>
          </DialogDescription>
        </DialogHeader>

        {enrollMutation.isError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to enroll students. Please try again.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Search and Filters */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2">
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="flex-1" aria-label="Department">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="Computer Science">Computer Science</SelectItem>
                  <SelectItem value="Engineering">Engineering</SelectItem>
                  <SelectItem value="Mathematics">Mathematics</SelectItem>
                </SelectContent>
              </Select>

              <Select value={programFilter} onValueChange={setProgramFilter}>
                <SelectTrigger className="flex-1" aria-label="Program">
                  <SelectValue placeholder="Program" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Programs</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Student List */}
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
                {selectedStudents.length > 0 && (
                  <span>
                    {selectedStudents.length} student{selectedStudents.length !== 1 ? 's' : ''}{' '}
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
                  {/* Available students */}
                  {availableLearners.map((learner) => (
                    <div
                      key={learner._id}
                      className="flex items-center gap-3 p-3 rounded-md hover:bg-muted/50 transition-colors"
                    >
                      <Checkbox
                        id={learner._id}
                        checked={selectedStudents.includes(learner._id)}
                        onCheckedChange={(checked) =>
                          handleSelectStudent(learner._id, checked as boolean)
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

                  {/* Already enrolled students */}
                  {alreadyEnrolledLearners.length > 0 && (
                    <>
                      {availableLearners.length > 0 && <div className="my-2 border-t" />}
                      <div className="px-3 py-2 text-xs font-medium text-muted-foreground">
                        Already Enrolled
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
                      No students found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={enrollMutation.isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleEnroll}
            disabled={selectedStudents.length === 0 || enrollMutation.isPending}
          >
            {enrollMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enrolling...
              </>
            ) : (
              <>
                <Users className="mr-2 h-4 w-4" />
                Enroll {selectedStudents.length} Student
                {selectedStudents.length !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
