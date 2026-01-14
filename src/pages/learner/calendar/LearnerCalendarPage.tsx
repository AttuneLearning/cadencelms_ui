/**
 * Learner Calendar Page (ISS-014)
 * Personal calendar for learners showing their classes and assignments
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { CalendarDays } from 'lucide-react';

export const LearnerCalendarPage: React.FC = () => {
  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Calendar</h1>
        <p className="text-muted-foreground">
          Your class schedule, assignments, and important deadlines
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Calendar View</CardTitle>
          <CardDescription>
            View your class schedule, assignment deadlines, and upcoming events.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-96 text-muted-foreground">
            <div className="text-center">
              <CalendarDays className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>Learner Calendar Coming Soon</p>
              <p className="text-sm mt-2">
                Calendar functionality will be implemented in a future update.
              </p>
              <p className="text-xs mt-4 text-muted-foreground/70">
                This will include your class schedules, assignment deadlines, exams, and course events.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
