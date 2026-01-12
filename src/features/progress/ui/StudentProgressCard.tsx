/**
 * StudentProgressCard Component
 * Displays a summary of student progress with quick actions
 */

import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardHeader } from '@/shared/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/shared/ui/avatar';
import { Progress } from '@/shared/ui/progress';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Mail, Eye, AlertTriangle } from 'lucide-react';

export interface StudentProgressCardProps {
  student: {
    id: string;
    name: string;
    email: string;
    photo: string | null;
    progress: number;
    coursesCompleted: number;
    coursesTotal: number;
    lastActivity: string;
    isAtRisk: boolean;
  };
  onClick?: (student: StudentProgressCardProps['student']) => void;
  onViewDetails?: (studentId: string) => void;
  onSendMessage?: (studentId: string) => void;
}

export const StudentProgressCard: React.FC<StudentProgressCardProps> = ({
  student,
  onClick,
  onViewDetails,
  onSendMessage,
}) => {
  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick(student);
    }
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onViewDetails) {
      onViewDetails(student.id);
    }
  };

  const handleSendMessage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSendMessage) {
      onSendMessage(student.id);
    }
  };

  const formatLastActivity = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return 'Unknown';
    }
  };

  return (
    <Card
      className={onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}
      onClick={handleCardClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              {student.photo && (
                <AvatarImage src={student.photo} alt={student.name} />
              )}
              <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg">{student.name}</h3>
              <p className="text-sm text-muted-foreground">{student.email}</p>
            </div>
          </div>
          {student.isAtRisk && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              At Risk
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="font-semibold">{student.progress}%</span>
          </div>
          <Progress value={student.progress} className="h-2" />
        </div>

        {/* Course Completion */}
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Courses</span>
          <span className="font-medium">
            {student.coursesCompleted} / {student.coursesTotal} courses completed
          </span>
        </div>

        {/* Last Activity */}
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Last Activity</span>
          <span className="font-medium">{formatLastActivity(student.lastActivity)}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {onViewDetails && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={handleViewDetails}
              aria-label="View details"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>
          )}
          {onSendMessage && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={handleSendMessage}
              aria-label="Send message"
            >
              <Mail className="h-4 w-4 mr-2" />
              Send Message
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
