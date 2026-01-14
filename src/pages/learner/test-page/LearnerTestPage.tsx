/**
 * LearnerTestPage
 * Simple static page to verify routing without API calls.
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

export const LearnerTestPage: React.FC = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Test Page</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This is a static learner test page with no API calls.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
