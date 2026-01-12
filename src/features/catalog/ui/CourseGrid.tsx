/**
 * CourseGrid Component
 * Grid layout for course catalog
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users, BookOpen } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import type { CourseListItem } from '@/entities/course';

interface CourseGridProps {
  courses: CourseListItem[];
}

export const CourseGrid: React.FC<CourseGridProps> = ({ courses }) => {
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      data-testid="course-grid"
    >
      {courses.map((course) => (
        <Card
          key={course.id}
          className="flex flex-col hover:shadow-lg transition-shadow"
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <Link
                  to={`/learner/catalog/${course.id}`}
                  className="hover:underline"
                >
                  <h3 className="font-semibold text-lg line-clamp-2">
                    {course.title}
                  </h3>
                </Link>
                <p className="text-sm text-muted-foreground mt-1">
                  {course.code}
                </p>
              </div>
              <Badge variant="outline">{course.credits} Credits</Badge>
            </div>
          </CardHeader>

          <CardContent className="flex-1">
            <p className="text-sm text-muted-foreground line-clamp-3">
              {course.description}
            </p>

            <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{course.duration} hours</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{course.enrollmentCount} enrolled</span>
              </div>
              <div className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                <span>{course.moduleCount} modules</span>
              </div>
            </div>

            {course.department && (
              <div className="mt-3">
                <Badge variant="secondary">{course.department.name}</Badge>
              </div>
            )}
          </CardContent>

          <CardFooter>
            <Button asChild className="w-full">
              <Link to={`/learner/catalog/${course.id}`}>View Details</Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};
