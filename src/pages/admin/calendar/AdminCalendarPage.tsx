/**
 * Admin Calendar Page (ISS-014)
 * System-wide calendar view for administrators
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { PageHeader } from '@/shared/ui/page-header';
import { CalendarDays } from 'lucide-react';

export const AdminCalendarPage: React.FC = () => {
  return (
    <div className="space-y-8 p-8">
      <PageHeader
        title="System Calendar"
        description="System-wide calendar of events, classes, and activities"
      />

      <Card>
        <CardHeader>
          <CardTitle>Calendar View</CardTitle>
          <CardDescription>
            A comprehensive system calendar showing all scheduled events, classes, and activities.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-96 text-muted-foreground">
            <div className="text-center">
              <CalendarDays className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>System Calendar Coming Soon</p>
              <p className="text-sm mt-2">
                Calendar functionality will be implemented in a future update.
              </p>
              <p className="text-xs mt-4 text-muted-foreground/70">
                This will include system-wide events, class schedules, and administrative activities.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
