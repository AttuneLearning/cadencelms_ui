/**
 * SubmissionList Component
 * Displays a list of student submissions with selection and grading actions
 */

import { useEffect, useRef } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Checkbox } from '@/shared/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table';
import { Card, CardContent } from '@/shared/ui/card';
import { Clock, Calendar, User } from 'lucide-react';
import type { ExamAttemptListItem, AttemptStatus } from '@/entities/exam-attempt/model/types';

interface SubmissionListProps {
  attempts: ExamAttemptListItem[];
  selectedIds: string[];
  onSelect: (attemptId: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onViewSubmission: (attemptId: string) => void;
}

export function SubmissionList({
  attempts,
  selectedIds,
  onSelect,
  onSelectAll,
  onViewSubmission,
}: SubmissionListProps) {
  const selectAllRef = useRef<any>(null);

  // Calculate select all state
  const allSelected = attempts.length > 0 && selectedIds.length === attempts.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < attempts.length;

  // Update indeterminate state
  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  const handleSelectAllChange = (checked: boolean) => {
    onSelectAll(checked);
  };

  const handleSelectChange = (attemptId: string, checked: boolean) => {
    onSelect(attemptId, checked);
  };

  const formatTimeSpent = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${minutes}m`;
  };

  const getStatusBadge = (status: AttemptStatus) => {
    const statusConfig = {
      submitted: { label: 'Submitted', variant: 'secondary' as const },
      grading: { label: 'Grading', variant: 'default' as const },
      graded: { label: 'Graded', variant: 'default' as const },
      started: { label: 'Started', variant: 'outline' as const },
      in_progress: { label: 'In Progress', variant: 'outline' as const },
    };

    const config = statusConfig[status] || statusConfig.submitted;

    return (
      <Badge variant={config.variant} className="capitalize">
        {config.label}
      </Badge>
    );
  };

  if (attempts.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            <p>No submissions available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  ref={selectAllRef}
                  checked={allSelected}
                  onCheckedChange={handleSelectAllChange}
                  aria-label="Select all submissions"
                />
              </TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Exam</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Time Spent</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attempts.map((attempt) => {
              const isSelected = selectedIds.includes(attempt.id);
              const projectedPendingReviewCount = attempt.projectedPendingReviewCount ?? 0;
              const hasProjectedPendingReview =
                attempt.hasProjectedPendingReview ?? projectedPendingReviewCount > 0;

              return (
                <TableRow key={attempt.id} className={isSelected ? 'bg-muted/50' : ''}>
                  <TableCell>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) =>
                        handleSelectChange(attempt.id, checked as boolean)
                      }
                      aria-label={`Select submission from ${attempt.learnerName}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{attempt.learnerName}</div>
                        <div className="text-sm text-muted-foreground">
                          Attempt #{attempt.attemptNumber}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[250px] truncate" title={attempt.examTitle}>
                      {attempt.examTitle}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div>{getStatusBadge(attempt.status)}</div>
                      {hasProjectedPendingReview && (
                        <Badge variant="outline" className="w-fit">
                          Projected review pending
                          {projectedPendingReviewCount > 0 ? ` (${projectedPendingReviewCount})` : ''}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {attempt.status === 'graded' ? (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{attempt.percentage}%</span>
                        {attempt.gradeLetter && (
                          <Badge variant="outline">{attempt.gradeLetter}</Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Pending</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {attempt.submittedAt ? (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-sm">
                            {formatDistanceToNow(new Date(attempt.submittedAt), {
                              addSuffix: true,
                            })}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(attempt.submittedAt), 'MMM d, yyyy')}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{formatTimeSpent(attempt.timeSpent)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant={attempt.status === 'graded' ? 'outline' : 'default'}
                      onClick={() => onViewSubmission(attempt.id)}
                    >
                      {attempt.status === 'graded' ? 'View' : 'Grade'}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
