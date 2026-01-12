/**
 * CourseListView Component
 * List layout for course catalog
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users, BookOpen, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import type { CourseListItem } from '@/entities/course';

interface CourseListViewProps {
  courses: CourseListItem[];
}

export const CourseListView: React.FC<CourseListViewProps> = ({ courses }) => {
  return (
    <div className="space-y-4" data-testid="course-list-view">
      {courses.map((course) => (
        <Card key={course.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-3 mb-2">
                  <div className="flex-1">
                    <Link
                      to={`/learner/catalog/${course.id}`}
                      className="hover:underline"
                    >
                      <h3 className="font-semibold text-lg">{course.title}</h3>
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {course.code}
                    </p>
                  </div>
                  <Badge variant="outline">{course.credits} Credits</Badge>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {course.description}
                </p>

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
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
                  {course.department && (
                    <Badge variant="secondary">{course.department.name}</Badge>
                  )}
                </div>
              </div>

              <Button asChild>
                <Link to={`/learner/catalog/${course.id}`}>
                  View Details
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
