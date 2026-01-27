/**
 * Grade Override History Component
 * Displays audit trail of grade overrides with dept-admin actions
 *
 * Features:
 * - Distinguishes override entries with orange badge
 * - Shows override reason prominently
 * - Displays admin name, role, and timestamp
 * - Supports date range filtering
 */

import React from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Separator } from '@/shared/ui/separator';
import { Clock, User, AlertCircle, Loader2 } from 'lucide-react';
import { useGradeHistory, type GradeHistoryEntry } from '@/entities/enrollment';

interface GradeOverrideHistoryProps {
  enrollmentId: string;
  className?: string;
}

/**
 * Format grade change for display
 */
const formatGradeChange = (
  entry: GradeHistoryEntry
): { field: string; previous: string; new: string }[] => {
  const changes: { field: string; previous: string; new: string }[] = [];

  if (entry.fieldChanged === 'gradePercentage' || entry.fieldChanged === 'all') {
    if (
      entry.previousGradePercentage !== undefined &&
      entry.newGradePercentage !== undefined
    ) {
      changes.push({
        field: 'Percentage',
        previous: `${entry.previousGradePercentage}%`,
        new: `${entry.newGradePercentage}%`,
      });
    }
  }

  if (entry.fieldChanged === 'gradeLetter' || entry.fieldChanged === 'all') {
    if (entry.previousGradeLetter !== undefined && entry.newGradeLetter !== undefined) {
      changes.push({
        field: 'Letter Grade',
        previous: entry.previousGradeLetter || 'None',
        new: entry.newGradeLetter || 'None',
      });
    }
  }

  if (entry.fieldChanged === 'gradePoints' || entry.fieldChanged === 'all') {
    if (entry.previousGradePoints !== undefined && entry.newGradePoints !== undefined) {
      changes.push({
        field: 'Grade Points',
        previous: `${entry.previousGradePoints}`,
        new: `${entry.newGradePoints}`,
      });
    }
  }

  return changes;
};

/**
 * Format admin role for display
 */
const formatRole = (role: string): string => {
  return role
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const GradeOverrideHistory: React.FC<GradeOverrideHistoryProps> = ({
  enrollmentId,
  className,
}) => {
  const {
    data: history = [],
    isLoading,
    error,
  } = useGradeHistory(enrollmentId, {});

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <p>Loading grade history...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center text-destructive">
            <AlertCircle className="h-8 w-8 mb-4" />
            <p>Failed to load grade history</p>
            <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (history.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Grade Override History</CardTitle>
          <CardDescription>Audit trail of all grade overrides</CardDescription>
        </CardHeader>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>No grade overrides found</p>
            <p className="text-sm mt-2">All grade changes will be logged here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Grade Override History</CardTitle>
            <CardDescription>
              {history.length} {history.length === 1 ? 'override' : 'overrides'} logged
            </CardDescription>
          </div>
          {/* Optional: Add date range filter button */}
          {/* <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Filter by Date
          </Button> */}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {history.map((entry, index) => {
          const changes = formatGradeChange(entry);

          return (
            <div key={entry.id}>
              {index > 0 && <Separator className="my-4" />}

              <div className="space-y-3">
                {/* Override Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Grade Override</span>
                        <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                          Override
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {format(new Date(entry.changedAt), 'MMM d, yyyy h:mm a')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Changed By */}
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Administrator: <span className="font-medium">{entry.changedBy}</span>
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {formatRole(entry.changedByRole)}
                  </Badge>
                </div>

                {/* Grade Changes */}
                <div className="space-y-2">
                  {changes.map((change, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-[1fr,auto,1fr] gap-4 p-3 bg-muted rounded-lg items-center"
                    >
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Previous</div>
                        <div className="font-medium">{change.previous}</div>
                      </div>

                      <div className="text-muted-foreground">→</div>

                      <div>
                        <div className="text-xs text-muted-foreground mb-1">New</div>
                        <div className="font-medium text-primary">{change.new}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Override Reason */}
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-amber-900 mb-1">Override Reason</div>
                      <div className="text-sm text-amber-800 italic">"{entry.reason}"</div>
                    </div>
                  </div>
                </div>

                {/* Metadata */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Entry ID: {entry.id.slice(0, 8)}...</span>
                  {entry.departmentId && <span>Department: {entry.departmentId.slice(0, 8)}...</span>}
                  {entry.termId && <span>Term: {entry.termId.slice(0, 8)}...</span>}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
