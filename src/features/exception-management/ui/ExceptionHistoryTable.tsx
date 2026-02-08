/**
 * ExceptionHistoryTable
 * Table listing all exceptions for an enrollment
 */

import React from 'react';
import { useEnrollmentExceptions } from '@/entities/exception';
import type { LearnerExceptionListItem } from '@/entities/exception';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table';
import { Badge } from '@/shared/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { format } from 'date-fns';

export interface ExceptionHistoryTableProps {
  enrollmentId: string;
}

const getExceptionTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    extra_attempts: 'Extra Attempts',
    extended_access: 'Extended Access',
    module_unlock: 'Module Unlock',
    grade_override: 'Grade Override',
    excused_content: 'Excused Content',
  };
  return labels[type] || type;
};

const formatExceptionDetails = (exception: LearnerExceptionListItem): string => {
  const { type, details } = exception;

  switch (type) {
    case 'extra_attempts':
      return `+${(details as any).additionalAttempts} attempts for ${(details as any).contentType}`;
    case 'extended_access':
      return `Extended to ${format(new Date((details as any).newExpirationDate), 'PP')}`;
    case 'module_unlock':
      return `Unlocked: ${(details as any).moduleName}`;
    case 'grade_override':
      return `New grade: ${(details as any).newGrade} for ${(details as any).contentType}`;
    case 'excused_content':
      return `Excused: ${(details as any).contentName}`;
    default:
      return 'N/A';
  }
};

export const ExceptionHistoryTable: React.FC<ExceptionHistoryTableProps> = ({
  enrollmentId,
}) => {
  const { data, isLoading, error } = useEnrollmentExceptions(enrollmentId);

  const exceptions = data?.exceptions || [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Exception History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle>Exception History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-destructive">
            <p className="font-semibold">Error loading exceptions</p>
            <p className="text-sm mt-1">
              {error instanceof Error ? error.message : 'An error occurred'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Exception History ({exceptions.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {exceptions.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No exceptions granted yet
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Granted By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exceptions.map((exception) => (
                  <TableRow key={exception.id}>
                    <TableCell>
                      <Badge variant="outline">{getExceptionTypeLabel(exception.type)}</Badge>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="text-sm truncate">{formatExceptionDetails(exception)}</div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="text-sm truncate">{exception.reason}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {exception.grantedBy.firstName} {exception.grantedBy.lastName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {format(new Date(exception.grantedAt), 'PP')}
                      </div>
                      {exception.expiresAt && (
                        <div className="text-xs text-muted-foreground">
                          Expires: {format(new Date(exception.expiresAt), 'PP')}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {exception.isActive ? (
                        <Badge variant="default">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Expired</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
