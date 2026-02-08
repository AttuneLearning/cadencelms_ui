/**
 * CourseCompletionScreen
 * Celebration screen shown when a learner completes all course content.
 */

import { Trophy, ArrowLeft, RotateCcw, Award, Clock, BookOpen } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
import type { CourseProgress } from '@/entities/progress/model/types';

export interface CourseCompletionScreenProps {
  courseTitle: string;
  courseProgress?: CourseProgress | null;
  enrollment?: { id: string; status?: string } | null;
  onBackToDashboard: () => void;
  onReviewCourse: () => void;
  onViewCertificate?: () => void;
}

export function CourseCompletionScreen({
  courseTitle,
  courseProgress,
  onBackToDashboard,
  onReviewCourse,
  onViewCertificate,
}: CourseCompletionScreenProps) {
  const progress = courseProgress?.overallProgress;
  const modulesCompleted = progress?.modulesCompleted ?? 0;
  const modulesTotal = progress?.modulesTotal ?? 0;
  const timeSpent = progress?.timeSpent ?? 0;
  const score = progress?.score;

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div className="flex h-full items-center justify-center bg-gradient-to-b from-green-50 to-background p-8">
      <div className="max-w-lg w-full space-y-6 text-center">
        {/* Trophy Icon */}
        <div className="flex justify-center">
          <div className="rounded-full bg-green-100 p-6">
            <Trophy className="h-16 w-16 text-green-600" />
          </div>
        </div>

        {/* Congratulations */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Congratulations!</h1>
          <p className="text-lg text-muted-foreground">
            You have completed <span className="font-semibold text-foreground">{courseTitle}</span>
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="flex flex-col items-center p-4">
              <BookOpen className="h-5 w-5 text-primary mb-1" />
              <p className="text-2xl font-bold">{modulesCompleted}/{modulesTotal}</p>
              <p className="text-xs text-muted-foreground">Modules</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center p-4">
              <Clock className="h-5 w-5 text-primary mb-1" />
              <p className="text-2xl font-bold">{formatTime(timeSpent)}</p>
              <p className="text-xs text-muted-foreground">Time Spent</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center p-4">
              <Award className="h-5 w-5 text-primary mb-1" />
              <p className="text-2xl font-bold">{score != null ? `${score}%` : '--'}</p>
              <p className="text-xs text-muted-foreground">Score</p>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 pt-2">
          {onViewCertificate && (
            <Button onClick={onViewCertificate} size="lg" className="w-full">
              <Award className="mr-2 h-4 w-4" />
              View Your Certificate
            </Button>
          )}
          <Button onClick={onBackToDashboard} variant="default" size="lg" className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <Button onClick={onReviewCourse} variant="outline" size="lg" className="w-full">
            <RotateCcw className="mr-2 h-4 w-4" />
            Review Course Content
          </Button>
        </div>
      </div>
    </div>
  );
}
