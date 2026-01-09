/**
 * ExerciseCard Component
 * Displays an exercise/exam as a card with metadata matching the contract
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { ClipboardList, Clock, Target, CheckCircle2, Eye } from 'lucide-react';
import type { ExerciseListItem } from '../model/types';
import { cn } from '@/shared/lib/utils';

interface ExerciseCardProps {
  exercise: ExerciseListItem;
  className?: string;
  showDepartment?: boolean;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  className,
  showDepartment = true,
}) => {
  const statusColor = getStatusColor(exercise.status);
  const difficultyColor = getDifficultyColor(exercise.difficulty);
  const typeColor = getTypeColor(exercise.type);

  return (
    <Link to={`/exercises/${exercise.id}`} className="block">
      <Card className={cn('h-full transition-shadow hover:shadow-lg', className)}>
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <Badge variant={typeColor}>{exercise.type}</Badge>
                <Badge variant={statusColor}>{exercise.status}</Badge>
                <Badge variant={difficultyColor}>{exercise.difficulty}</Badge>
              </div>
              <CardTitle className="line-clamp-2">{exercise.title}</CardTitle>
            </div>
          </div>
          {exercise.description && (
            <CardDescription className="line-clamp-2">{exercise.description}</CardDescription>
          )}
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <ClipboardList className="h-4 w-4 shrink-0" />
              <span>
                {exercise.questionCount}{' '}
                {exercise.questionCount === 1 ? 'Question' : 'Questions'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Target className="h-4 w-4 shrink-0" />
              <span>{exercise.totalPoints} Points</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4 shrink-0" />
              <span>{formatTimeLimit(exercise.timeLimit)}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{exercise.passingScore}% Pass</span>
            </div>
          </div>

          {/* Department (if shown) */}
          {showDepartment && (
            <div className="pt-2 text-sm text-muted-foreground border-t">
              <span className="font-medium">Department:</span> {exercise.department}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-wrap gap-2">
          {exercise.shuffleQuestions && (
            <Badge variant="outline" className="text-xs">
              Shuffle
            </Badge>
          )}
          {exercise.showFeedback && (
            <Badge variant="outline" className="text-xs">
              Feedback
            </Badge>
          )}
          {exercise.allowReview && (
            <Badge variant="outline" className="text-xs">
              <Eye className="mr-1 h-3 w-3" />
              Review
            </Badge>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
};

// Helper functions
function getStatusColor(
  status: string
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'published':
      return 'default';
    case 'draft':
      return 'secondary';
    case 'archived':
      return 'outline';
    default:
      return 'default';
  }
}

function getDifficultyColor(
  difficulty: string
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (difficulty) {
    case 'easy':
      return 'secondary';
    case 'medium':
      return 'default';
    case 'hard':
      return 'destructive';
    default:
      return 'default';
  }
}

function getTypeColor(type: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (type) {
    case 'quiz':
      return 'default';
    case 'exam':
      return 'destructive';
    case 'practice':
      return 'secondary';
    case 'assessment':
      return 'outline';
    default:
      return 'default';
  }
}

function formatTimeLimit(seconds: number): string {
  if (seconds === 0) return 'Unlimited';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}
