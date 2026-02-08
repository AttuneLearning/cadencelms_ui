/**
 * MyClassesPage (UI-ISS-133)
 * Display learner's enrolled classes (scheduled course instances)
 */

import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { PageHeader } from '@/shared/ui/page-header';
import { Calendar, BookOpen, Users, Clock, MapPin, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MyClass {
  id: string;
  name: string;
  courseCode: string;
  courseName: string;
  instructor: string;
  schedule: string;
  location: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  nextSession: string; // ISO date string
  enrolledCount: number;
  progress: number;
  status: 'active' | 'upcoming' | 'completed';
}

// ---------------------------------------------------------------------------
// Hook — placeholder data until a real API is available
// ---------------------------------------------------------------------------

function useMyClasses(): { data: MyClass[]; isLoading: boolean } {
  const data = useMemo<MyClass[]>(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();

    return [
      {
        id: 'cls-1',
        name: 'Safety Fundamentals - Section A',
        courseCode: 'SAF-101',
        courseName: 'Safety Fundamentals',
        instructor: 'Dr. Sarah Chen',
        schedule: 'Mon, Wed 9:00 AM - 10:30 AM',
        location: 'Room 201, Building A',
        startDate: new Date(y, m, 1).toISOString(),
        endDate: new Date(y, m + 2, 15).toISOString(),
        nextSession: new Date(y, m, now.getDate() + 1).toISOString(),
        enrolledCount: 24,
        progress: 45,
        status: 'active',
      },
      {
        id: 'cls-2',
        name: 'Compliance 101 - Section B',
        courseCode: 'CMP-101',
        courseName: 'Compliance Essentials',
        instructor: 'Prof. James Wilson',
        schedule: 'Tue, Thu 1:00 PM - 2:30 PM',
        location: 'Room 305, Building B',
        startDate: new Date(y, m, 1).toISOString(),
        endDate: new Date(y, m + 3, 1).toISOString(),
        nextSession: new Date(y, m, now.getDate() + 2).toISOString(),
        enrolledCount: 18,
        progress: 30,
        status: 'active',
      },
      {
        id: 'cls-3',
        name: 'Leadership Workshop',
        courseCode: 'LDR-200',
        courseName: 'Leadership Development',
        instructor: 'Maria Rodriguez',
        schedule: 'Fri 2:00 PM - 4:00 PM',
        location: 'Conference Room C',
        startDate: new Date(y, m + 1, 1).toISOString(),
        endDate: new Date(y, m + 3, 30).toISOString(),
        nextSession: new Date(y, m + 1, 3).toISOString(),
        enrolledCount: 12,
        progress: 0,
        status: 'upcoming',
      },
    ];
  }, []);

  return { data, isLoading: false };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STATUS_VARIANTS: Record<MyClass['status'], 'default' | 'secondary' | 'outline'> = {
  active: 'default',
  upcoming: 'secondary',
  completed: 'outline',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const MyClassesPage: React.FC = () => {
  const { data: classes, isLoading } = useMyClasses();

  return (
    <div className="container mx-auto py-8 px-4">
      <PageHeader
        title="My Classes"
        description="View your enrolled class schedules and sessions"
      />

      {isLoading ? (
        <div className="flex h-64 items-center justify-center text-muted-foreground">
          Loading...
        </div>
      ) : classes.length === 0 ? (
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
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg">{cls.name}</CardTitle>
                  <Badge variant={STATUS_VARIANTS[cls.status]}>
                    {cls.status}
                  </Badge>
                </div>
                <CardDescription>
                  {cls.courseCode} - {cls.courseName}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>Instructor: {cls.instructor}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>{cls.schedule}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>{cls.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>
                    {format(new Date(cls.startDate), 'MMM d')} - {format(new Date(cls.endDate), 'MMM d, yyyy')}
                  </span>
                </div>
                <div className="rounded-md bg-muted/50 px-3 py-2 text-sm">
                  <span className="text-muted-foreground">Next session:</span>{' '}
                  <span className="font-medium">
                    {format(new Date(cls.nextSession), 'EEE, MMM d')}
                  </span>
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
