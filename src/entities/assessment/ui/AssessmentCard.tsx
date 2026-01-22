/**
 * AssessmentCard Component
 * Displays an assessment as a card
 */

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Clock, HelpCircle, Target, RotateCcw } from 'lucide-react';
import type { AssessmentListItem } from '../model/types';
import { cn } from '@/shared/lib/utils';

interface AssessmentCardProps {
  assessment: AssessmentListItem;
  className?: string;
  onClick?: () => void;
}

export const AssessmentCard: React.FC<AssessmentCardProps> = ({
  assessment,
  className,
  onClick,
}) => {
  return (
    <Card
      className={cn(
        'transition-shadow',
        onClick && 'cursor-pointer hover:shadow-lg',
        className
      )}
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="mb-1 flex items-center gap-2">
              <Badge variant={assessment.style === 'quiz' ? 'secondary' : 'default'}>
                {assessment.style === 'quiz' ? 'Quiz' : 'Exam'}
              </Badge>
              {assessment.isPublished ? (
                <Badge variant="outline" className="text-green-600">Published</Badge>
              ) : (
                <Badge variant="outline">Draft</Badge>
              )}
              {assessment.isArchived && (
                <Badge variant="outline" className="text-muted-foreground">Archived</Badge>
              )}
            </div>
            <CardTitle className="line-clamp-2">{assessment.title}</CardTitle>
          </div>
        </div>
        {assessment.description && (
          <CardDescription className="line-clamp-2">{assessment.description}</CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Metadata */}
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <HelpCircle className="h-4 w-4" />
            <span>{assessment.questionSelection.questionCount} Questions</span>
          </div>
          {assessment.timing.timeLimit && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{assessment.timing.timeLimit} min</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Target className="h-4 w-4" />
            <span>{assessment.scoring.passingScore}% to pass</span>
          </div>
          {assessment.attempts.maxAttempts && (
            <div className="flex items-center gap-1">
              <RotateCcw className="h-4 w-4" />
              <span>{assessment.attempts.maxAttempts} attempts</span>
            </div>
          )}
        </div>

        {/* Department */}
        <div className="text-sm text-muted-foreground">
          <span className="font-medium">Department:</span> {assessment.departmentName}
        </div>

        {/* Question Banks */}
        <div className="flex flex-wrap gap-1">
          {assessment.questionSelection.questionBankIds.slice(0, 3).map((bankId, idx) => (
            <Badge key={idx} variant="outline" className="text-xs">
              {bankId}
            </Badge>
          ))}
          {assessment.questionSelection.questionBankIds.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{assessment.questionSelection.questionBankIds.length - 3} more
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
