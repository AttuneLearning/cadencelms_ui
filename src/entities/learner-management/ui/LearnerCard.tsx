/**
 * Learner Card Component
 * Displays learner summary information in a card format
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Avatar, AvatarFallback } from '@/shared/ui/avatar';
import { User, Mail, Calendar, BookOpen, GraduationCap } from 'lucide-react';
import type { LearnerSummary } from '../model/types';

interface LearnerCardProps {
  learner: LearnerSummary;
  onClick?: () => void;
  showDetails?: boolean;
}

export function LearnerCard({ learner, onClick, showDetails = true }: LearnerCardProps) {
  const initials = `${learner.firstName[0]}${learner.lastName[0]}`.toUpperCase();
  const fullName = `${learner.firstName} ${learner.lastName}`;

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-500';
      case 'suspended':
        return 'bg-red-500/10 text-red-500';
      case 'completed':
        return 'bg-blue-500/10 text-blue-500';
      case 'withdrawn':
        return 'bg-gray-500/10 text-gray-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  const completionPercentage = Math.round(learner.completionRate * 100);

  return (
    <Card
      className={onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="text-base">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <CardTitle className="flex items-center gap-2 flex-wrap">
              <span className="truncate">{fullName}</span>
              <Badge variant="outline" className={getStatusBadgeColor(learner.status)}>
                {learner.status}
              </Badge>
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <Mail className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{learner.email}</span>
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      {showDetails && (
        <CardContent className="space-y-3">
          {learner.studentId && (
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>Student ID: {learner.studentId}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm">
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
            <span>{learner.department.name}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-medium">{learner.programEnrollments}</div>
                <div className="text-xs text-muted-foreground">Programs</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-medium">{learner.courseEnrollments}</div>
                <div className="text-xs text-muted-foreground">Courses</div>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Completion Rate</span>
              <span className="font-medium">{completionPercentage}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-primary rounded-full h-2 transition-all"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
            <Calendar className="h-3 w-3" />
            {learner.lastLogin ? (
              <span>Last login: {new Date(learner.lastLogin).toLocaleDateString()}</span>
            ) : (
              <span>Never logged in</span>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
