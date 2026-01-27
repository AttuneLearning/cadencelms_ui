/**
 * Course Depth Settings Page
 * Configure cognitive depth level overrides for a course
 */

import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { RotateCcw } from 'lucide-react';

import { PageHeader } from '@/shared/ui/page-header';
import { ErrorPanel } from '@/shared/ui/error-panel';
import { Skeleton } from '@/shared/ui/skeleton';
import { Button } from '@/shared/ui/button';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/shared/ui/alert';

import {
  useCourseDepthLevels,
  useOverrideCourseDepthLevel,
  useResetCourseDepthOverrides,
  type DepthOverridePayload,
} from '@/entities/cognitive-depth';
import { DepthLevelEditor } from '@/features/course-depth-settings';

export function CourseDepthSettingsPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const [showResetAll, setShowResetAll] = useState(false);

  const { data, isLoading, error, refetch } = useCourseDepthLevels(courseId!);

  const overrideMutation = useOverrideCourseDepthLevel(courseId!);
  const resetMutation = useResetCourseDepthOverrides(courseId!);

  function handleSaveOverride(slug: string, values: DepthOverridePayload) {
    overrideMutation.mutate({ slug, payload: values });
  }

  function handleResetSingle(slug: string) {
    resetMutation.mutate({ depthSlugs: [slug] });
  }

  function handleResetAll() {
    if (data?.levels) {
      const overriddenSlugs = data.levels
        .filter((l) => l.source === 'course')
        .map((l) => l.slug);
      resetMutation.mutate(
        { depthSlugs: overriddenSlugs },
        { onSuccess: () => setShowResetAll(false) }
      );
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorPanel
        error={error}
        onRetry={refetch}
        title="Failed to load depth settings"
      />
    );
  }

  const hasOverrides = data?.hasOverrides ?? false;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cognitive Depth Settings"
        description="Configure learning progression thresholds for this course"
      >
        {hasOverrides && (
          <Button variant="outline" onClick={() => setShowResetAll(true)}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset All Overrides
          </Button>
        )}
      </PageHeader>

      {!data?.canOverride && (
        <Alert>
          <AlertTitle>Read-only mode</AlertTitle>
          <AlertDescription>
            You don't have permission to override depth settings for this course.
            Contact your department administrator for access.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        {data?.levels.map((level) => (
          <DepthLevelEditor
            key={level.slug}
            level={level}
            onSave={handleSaveOverride}
            onReset={data.canOverride ? handleResetSingle : undefined}
            isSaving={overrideMutation.isPending || resetMutation.isPending}
          />
        ))}
      </div>

      <ConfirmDialog
        open={showResetAll}
        onOpenChange={setShowResetAll}
        onConfirm={handleResetAll}
        title="Reset All Overrides"
        description="Are you sure you want to reset all course-specific depth settings? This will restore all levels to department defaults."
        confirmText="Reset All"
        isDestructive={true}
        //isDestructive={true}
      />
    </div>
  );
}
