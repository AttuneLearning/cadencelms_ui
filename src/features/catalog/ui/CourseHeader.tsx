/**
 * CourseHeader Component
 * Header section for course details page
 */

import React from 'react';
import { Badge } from '@/shared/ui/badge';
import { Clock, Award, BookOpen, Users } from 'lucide-react';
import type { Course } from '@/entities/course';

interface CourseHeaderProps {
  course: Course;
}

export const CourseHeader: React.FC<CourseHeaderProps> = ({ course }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
          <p className="text-lg text-muted-foreground">{course.code}</p>
        </div>
        <Badge
          variant={course.status === 'published' ? 'default' : 'secondary'}
          className="text-sm"
        >
          {course.status}
        </Badge>
      </div>

      {course.department && (
        <div>
          <Badge variant="outline" className="text-sm">
            {course.department.name}
          </Badge>
          {course.program && (
            <Badge variant="outline" className="ml-2 text-sm">
              {course.program.name}
            </Badge>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-6 text-sm">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>{course.duration} hours</span>
        </div>
        <div className="flex items-center gap-2">
          <Award className="h-4 w-4 text-muted-foreground" />
          <span>{course.credits} credits</span>
        </div>
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-muted-foreground" />
          <span>Passing: {course.settings.passingScore}%</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span>{course.enrollmentCount} enrolled</span>
        </div>
      </div>
    </div>
  );
};
