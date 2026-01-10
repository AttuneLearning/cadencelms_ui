/**
 * GradeHistory Component
 * Displays history of grade changes and overrides
 */

import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Separator } from '@/shared/ui/separator';
import { Clock, User, Edit } from 'lucide-react';

interface GradeChange {
  id: string;
  changedBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  changedAt: string;
  previousScore: number;
  newScore: number;
  previousPercentage: number;
  newPercentage: number;
  previousGrade?: string;
  newGrade?: string;
  reason?: string;
  feedback?: string;
}

interface GradeHistoryProps {
  changes: GradeChange[];
  currentScore: number;
  currentPercentage: number;
  currentGrade?: string;
}

export function GradeHistory({
  changes,
  currentScore,
  currentPercentage,
  currentGrade,
}: GradeHistoryProps) {
  if (changes.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>No grade history available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Grade History</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Grade */}
        <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <Badge variant="default">Current Grade</Badge>
              <div className="mt-2 text-2xl font-bold">
                {currentPercentage}% ({currentScore} points)
              </div>
              {currentGrade && (
                <Badge variant="outline" className="mt-2">
                  Grade: {currentGrade}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* Change History */}
        <div className="space-y-4">
          <div className="text-sm font-medium text-muted-foreground">Previous Changes</div>

          {changes.map((change, index) => (
            <div key={change.id}>
              {index > 0 && <Separator className="my-4" />}

              <div className="space-y-3">
                {/* Change Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Edit className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Grade Updated</div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(change.changedAt), 'MMM d, yyyy h:mm a')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Changed By */}
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {change.changedBy.firstName} {change.changedBy.lastName}
                  </span>
                </div>

                {/* Score Change */}
                <div className="grid grid-cols-2 gap-4 p-3 bg-muted rounded-lg">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Previous</div>
                    <div className="font-medium">
                      {change.previousPercentage}% ({change.previousScore} pts)
                    </div>
                    {change.previousGrade && (
                      <Badge variant="outline" className="mt-1">
                        {change.previousGrade}
                      </Badge>
                    )}
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">New</div>
                    <div className="font-medium">
                      {change.newPercentage}% ({change.newScore} pts)
                    </div>
                    {change.newGrade && (
                      <Badge variant="outline" className="mt-1">
                        {change.newGrade}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Reason */}
                {change.reason && (
                  <div className="text-sm p-3 bg-muted/50 rounded-lg">
                    <div className="font-medium mb-1">Reason:</div>
                    <div className="text-muted-foreground">{change.reason}</div>
                  </div>
                )}

                {/* Feedback */}
                {change.feedback && (
                  <div className="text-sm p-3 bg-muted/50 rounded-lg">
                    <div className="font-medium mb-1">Feedback:</div>
                    <div className="text-muted-foreground">{change.feedback}</div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
