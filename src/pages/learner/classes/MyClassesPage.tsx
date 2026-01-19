/**
 * MyClassesPage
 * Display learner's enrolled classes (scheduled course instances)
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { PageHeader } from '@/shared/ui/page-header';
import { Calendar, BookOpen, Users, Clock, ArrowRight } from 'lucide-react';

export const MyClassesPage: React.FC = () => {
  // TODO: Replace with actual class data from useMyClasses hook
  const classes: Array<{
    id: string;
    name: string;
    courseCode: string;
    courseName: string;
    instructor: string;
    schedule: string;
    startDate: string;
    endDate: string;
    enrolledCount: number;
    progress: number;
  }> = [];

  return (
    <div className="container mx-auto py-8 px-4">
      <PageHeader
        title="My Classes"
        description="View your enrolled class schedules and sessions"
      />

      {classes.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Active Classes</h3>
              <p className="text-muted-foreground mb-4">
                You are not currently enrolled in any scheduled classes.
                Browse the course catalog to find available courses.
              </p>
              <div className="flex justify-center gap-4">
                <Button asChild>
                  <Link to="/learner/catalog">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Browse Catalog
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/learner/courses">
                    <ArrowRight className="h-4 w-4 mr-2" />
                    My Courses
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => (
            <Card key={cls.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{cls.name}</CardTitle>
                <CardDescription>
                  {cls.courseCode} - {cls.courseName}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>Instructor: {cls.instructor}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{cls.schedule}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{cls.startDate} - {cls.endDate}</span>
                </div>
                <div className="pt-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>{cls.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${cls.progress}%` }}
                    />
                  </div>
                </div>
                <Button className="w-full mt-2" asChild>
                  <Link to={`/learner/classes/${cls.id}`}>
                    View Class
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
