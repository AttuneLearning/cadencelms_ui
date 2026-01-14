/**
 * Staff Calendar Page (ISS-014)
 * Personal calendar for staff members showing their classes and events
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { CalendarDays } from 'lucide-react';

export const StaffCalendarPage: React.FC = () => {
  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Calendar</h1>
        <p className="text-muted-foreground">
          Your teaching schedule, meetings, and important dates
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Calendar View</CardTitle>
          <CardDescription>
            View your teaching schedule, meetings, and upcoming events.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-96 text-muted-foreground">
            <div className="text-center">
              <CalendarDays className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>Staff Calendar Coming Soon</p>
              <p className="text-sm mt-2">
                Calendar functionality will be implemented in a future update.
              </p>
              <p className="text-xs mt-4 text-muted-foreground/70">
                This will include your class schedules, meetings, office hours, and departmental events.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
