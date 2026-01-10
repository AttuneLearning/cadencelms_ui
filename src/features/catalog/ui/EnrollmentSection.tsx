/**
 * EnrollmentSection Component
 * Enrollment controls and status for course details page
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { useEnrollInCourse } from '@/entities/enrollment';
import { AlertCircle, CheckCircle, PlayCircle, UserPlus } from 'lucide-react';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import type { Course } from '@/entities/course';
import { useAuth } from '@/features/auth/model/useAuth';

interface EnrollmentSectionProps {
  course: Course;
  isEnrolled: boolean;
}

export const EnrollmentSection: React.FC<EnrollmentSectionProps> = ({
  course,
  isEnrolled,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { mutate: enrollInCourse, isPending: isEnrolling } = useEnrollInCourse();

  const handleEnroll = () => {
    if (!user?._id) return;
    enrollInCourse({
      learnerId: user._id,
      courseId: course.id,
    });
  };

  const handleContinueLearning = () => {
    navigate(`/learner/courses/${course.id}/player`);
  };

  // Check if course is published
  if (course.status !== 'published') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Enrollment</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This course is not available for enrollment yet.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enrollment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEnrolled ? (
          <>
            <Alert>
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>
                You are enrolled in this course
              </AlertDescription>
            </Alert>
            <Button
              onClick={handleContinueLearning}
              className="w-full"
              size="lg"
            >
              <PlayCircle className="h-5 w-5 mr-2" />
              Continue Learning
            </Button>
          </>
        ) : (
          <>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>Ready to start learning?</p>
              <ul className="list-disc list-inside space-y-1">
                <li>{course.duration} hours of content</li>
                <li>{course.credits} credits upon completion</li>
                <li>Pass with {course.settings.passingScore}% or higher</li>
              </ul>
            </div>
            <Button
              onClick={handleEnroll}
              disabled={isEnrolling}
              size="lg"
              className="w-full"
            >
              <UserPlus className="h-5 w-5 mr-2" />
              {isEnrolling ? 'Enrolling...' : 'Enroll Now'}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};
