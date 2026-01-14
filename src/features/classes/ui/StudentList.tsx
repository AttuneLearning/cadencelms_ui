/**
 * StudentList Component
 * Displays enrolled students with progress and actions
 */

import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import type { RosterItem } from '@/entities/class/model/types';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Badge } from '@/shared/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table';
import { Progress } from '@/shared/ui/progress';
import { Search, Download, Trash2, ArrowUpDown, MoreVertical, Edit } from 'lucide-react';
import { useFeatureAccess } from '@/shared/hooks/useFeatureAccess';
import { useEnrollment } from '@/entities/enrollment';
import { GradeOverrideDialog } from '@/features/grading/ui/GradeOverrideDialog';
import { Skeleton } from '@/shared/ui/skeleton';
import type { CurrentGrade } from '@/entities/enrollment';

interface StudentListProps {
  students: RosterItem[];
  onRemove: (enrollmentId: string) => void;
  onExport: () => void;
}

type SortField = 'name' | 'progress' | 'score' | 'attendance';
type SortDirection = 'asc' | 'desc';

const statusVariants = {
  active: 'default' as const,
  withdrawn: 'secondary' as const,
  completed: 'outline' as const,
};

const statusLabels = {
  active: 'Active',
  withdrawn: 'Withdrawn',
  completed: 'Completed',
};

export function StudentList({ students, onRemove, onExport }: StudentListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [overrideDialogOpen, setOverrideDialogOpen] = useState(false);
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<string | null>(null);

  const { canOverrideGrades } = useFeatureAccess();

  // Fetch full enrollment details when override dialog is opened
  const { data: selectedEnrollment, isLoading: isLoadingEnrollment } = useEnrollment(
    selectedEnrollmentId || '',
    {
      enabled: !!selectedEnrollmentId && overrideDialogOpen,
    }
  );

  const handleOverrideGrade = (enrollmentId: string) => {
    setSelectedEnrollmentId(enrollmentId);
    setOverrideDialogOpen(true);
  };

  const handleOverrideSuccess = () => {
    // Dialog will close automatically, enrollment query will be invalidated by mutation
    setSelectedEnrollmentId(null);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedStudents = useMemo(() => {
    let filtered = students.filter((student) => {
      const matchesSearch =
        searchTerm === '' ||
        student.learner.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.learner.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.learner.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.learner.studentId?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || student.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    filtered.sort((a, b) => {
      let compareValue = 0;

      switch (sortField) {
        case 'name':
          compareValue = `${a.learner.lastName} ${a.learner.firstName}`.localeCompare(
            `${b.learner.lastName} ${b.learner.firstName}`
          );
          break;
        case 'progress':
          compareValue =
            (a.progress?.completionPercent || 0) - (b.progress?.completionPercent || 0);
          break;
        case 'score':
          compareValue = (a.progress?.currentScore || 0) - (b.progress?.currentScore || 0);
          break;
        case 'attendance':
          compareValue =
            (a.attendance?.attendanceRate || 0) - (b.attendance?.attendanceRate || 0);
          break;
      }

      return sortDirection === 'asc' ? compareValue : -compareValue;
    });

    return filtered;
  }, [students, searchTerm, statusFilter, sortField, sortDirection]);

  if (students.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No students enrolled in this class yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters and Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]" aria-label="Filter by status">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="withdrawn">Withdrawn</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Export Button */}
        <Button variant="outline" onClick={onExport}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Students Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('name')}
                  className="h-8 -ml-3"
                >
                  Name
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('progress')}
                  className="h-8 -ml-3"
                >
                  Progress
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('score')}
                  className="h-8 -ml-3"
                >
                  Score
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('attendance')}
                  className="h-8 -ml-3"
                >
                  Attendance
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Last Access</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedStudents.map((student) => (
              <TableRow key={student.enrollmentId}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={student.learner.profileImage || undefined} />
                      <AvatarFallback>
                        {student.learner.firstName[0]}
                        {student.learner.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {student.learner.firstName} {student.learner.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {student.learner.email}
                      </p>
                      {student.learner.studentId && (
                        <p className="text-xs text-muted-foreground">
                          {student.learner.studentId}
                        </p>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariants[student.status]}>
                    {statusLabels[student.status]}
                  </Badge>
                </TableCell>
                <TableCell>
                  {student.progress ? (
                    <div className="space-y-1 min-w-[120px]">
                      <div className="flex items-center justify-between text-sm">
                        <span>{student.progress.completionPercent}%</span>
                        <span className="text-xs text-muted-foreground">
                          {student.progress.modulesCompleted} / {student.progress.modulesTotal}
                        </span>
                      </div>
                      <Progress value={student.progress.completionPercent} className="h-2" />
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {student.progress?.currentScore !== null &&
                  student.progress?.currentScore !== undefined ? (
                    <span className="font-medium">{student.progress.currentScore}</span>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {student.attendance ? (
                    <div className="text-sm">
                      <div className="font-medium">{student.attendance.attendanceRate}%</div>
                      <div className="text-xs text-muted-foreground">
                        {student.attendance.sessionsAttended} / {student.attendance.totalSessions}
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {student.progress?.lastAccessedAt ? (
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(student.progress.lastAccessedAt), 'MMM dd, yyyy')}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">Never</span>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label="Actions">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {canOverrideGrades && (
                        <DropdownMenuItem onClick={() => handleOverrideGrade(student.enrollmentId)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Override Grade
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => onRemove(student.enrollmentId)}
                        disabled={student.status === 'withdrawn'}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove Student
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>
          Showing {filteredAndSortedStudents.length} of {students.length} students
        </p>
      </div>

      {/* Grade Override Dialog */}
      {selectedEnrollment && (
        <GradeOverrideDialog
          open={overrideDialogOpen}
          onOpenChange={setOverrideDialogOpen}
          enrollmentId={selectedEnrollment.id}
          currentGrade={{
            letter: selectedEnrollment.grade?.letter || null,
            percentage: selectedEnrollment.grade?.score || null,
            points: null, // Not available in current enrollment type
            gradedAt: selectedEnrollment.grade?.gradedAt || null,
            gradedBy: selectedEnrollment.grade?.gradedBy || null,
          }}
          studentName={`${selectedEnrollment.learner.firstName} ${selectedEnrollment.learner.lastName}`}
          onSuccess={handleOverrideSuccess}
        />
      )}
    </div>
  );
}
