/**
 * ClassCard Component
 * Displays class information in grid or list layout
 */

import { format } from 'date-fns';
import type { ClassListItem } from '@/entities/class/model/types';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { Calendar, Users, GraduationCap, BookOpen } from 'lucide-react';

interface ClassCardProps {
  classItem: ClassListItem;
  viewMode: 'grid' | 'list';
  onView: (classId: string) => void;
  onEnroll?: (classId: string) => void;
}

const statusVariants = {
  active: 'default' as const,
  upcoming: 'secondary' as const,
  completed: 'outline' as const,
  cancelled: 'destructive' as const,
};

const statusLabels = {
  active: 'Active',
  upcoming: 'Upcoming',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export function ClassCard({ classItem, viewMode, onView, onEnroll }: ClassCardProps) {
  const isFull = classItem.capacity !== null && classItem.enrolledCount >= classItem.capacity;
  const enrollmentText = classItem.capacity
    ? `${classItem.enrolledCount} / ${classItem.capacity}`
    : `${classItem.enrolledCount} students`;

  const primaryInstructor = classItem.instructors.find((i) => i.role === 'primary');
  const additionalInstructors = classItem.instructors.length - 1;

  const startDate = format(new Date(classItem.startDate), 'MMM dd, yyyy');
  const endDate = format(new Date(classItem.endDate), 'MMM dd, yyyy');

  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-md transition-shadow" data-testid={`class-card-${classItem.id}`}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-6">
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-semibold">{classItem.name}</h3>
                  <Badge variant={statusVariants[classItem.status]}>
                    {statusLabels[classItem.status]}
                  </Badge>
                  {isFull && <Badge variant="outline">Full</Badge>}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    {classItem.course.code}
                  </span>
                  <span className="flex items-center gap-1">
                    <GraduationCap className="h-4 w-4" />
                    {classItem.program.name}
                    {classItem.programLevel && ` - ${classItem.programLevel.name}`}
                  </span>
                  {classItem.academicTerm && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {classItem.academicTerm.name}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm">
              {primaryInstructor && (
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={primaryInstructor.profileImage || undefined} />
                    <AvatarFallback>
                      {primaryInstructor.firstName[0]}
                      {primaryInstructor.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-muted-foreground">
                    {primaryInstructor.firstName} {primaryInstructor.lastName}
                    {additionalInstructors > 0 && ` +${additionalInstructors} more`}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{enrollmentText}</span>
              </div>
              <span className="text-muted-foreground">
                {startDate} - {endDate}
              </span>
            </div>
          </div>

          <div className="flex gap-2 sm:flex-col sm:items-end">
            <Button variant="outline" onClick={() => onView(classItem.id)}>
              View
            </Button>
            {onEnroll && (
              <Button variant="default" onClick={() => onEnroll(classItem.id)}>
                Enroll Students
              </Button>
            )}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow flex flex-col" data-testid={`class-card-${classItem.id}`}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg line-clamp-2">{classItem.name}</CardTitle>
          <Badge variant={statusVariants[classItem.status]}>
            {statusLabels[classItem.status]}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <BookOpen className="h-4 w-4" />
          <span>{classItem.course.code}</span>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {classItem.program.name}
              {classItem.programLevel && ` - ${classItem.programLevel.name}`}
            </span>
          </div>

          {classItem.academicTerm && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{classItem.academicTerm.name}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {enrollmentText}
              {isFull && (
                <Badge variant="outline" className="ml-2">
                  Full
                </Badge>
              )}
            </span>
          </div>
        </div>

        {primaryInstructor && (
          <div className="pt-2 border-t">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={primaryInstructor.profileImage || undefined} />
                <AvatarFallback>
                  {primaryInstructor.firstName[0]}
                  {primaryInstructor.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="text-sm">
                <p className="font-medium">
                  {primaryInstructor.firstName} {primaryInstructor.lastName}
                </p>
                {additionalInstructors > 0 && (
                  <p className="text-xs text-muted-foreground">+{additionalInstructors} more</p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground pt-2">
          <div>{startDate}</div>
          <div>{endDate}</div>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button variant="outline" className="flex-1" onClick={() => onView(classItem.id)}>
          View
        </Button>
        {onEnroll && (
          <Button className="flex-1" onClick={() => onEnroll(classItem.id)}>
            Enroll Students
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
