/**
 * Activity Editor Page
 * Full-page editor for complex activity types (exercise, assessment, assignment)
 */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/shared/ui/page-header';
import { Button } from '@/shared/ui/button';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import { useToast } from '@/shared/ui/use-toast';
import { ArrowLeft, Save, Eye, AlertCircle } from 'lucide-react';
import { EDITOR_CONFIGS } from '../model/editor-config';
import { ExerciseEditor } from './page-editors/ExerciseEditor';
import { AssessmentEditor } from './page-editors/AssessmentEditor';
import { AssignmentEditor } from './page-editors/AssignmentEditor';
import type { LearningUnitType } from '@/entities/learning-unit';
import type { ActivityFormData } from '../model/types';
import type {
  ExerciseFormData,
  AssessmentFormData,
  AssignmentFormData,
} from '../lib/validation';

/**
 * Route params for the activity editor page
 */
interface ActivityEditorParams {
  courseId: string;
  moduleId: string;
  type: LearningUnitType;
  activityId?: string;
}

/**
 * Activity Editor Page Component
 *
 * A full-page editor for complex activity types.
 * Each type has its own tabbed editor component that manages its own internal tabs.
 *
 * Features:
 * - PageHeader with back navigation
 * - Type-specific editor with internal tabs
 * - Save and Preview actions
 * - Unsaved changes confirmation
 *
 * Routes:
 * - Create: /staff/courses/:courseId/modules/:moduleId/activities/new/:type
 * - Edit: /staff/courses/:courseId/modules/:moduleId/activities/:activityId/edit
 *
 * @example
 * ```tsx
 * // In router configuration
 * <Route
 *   path="/staff/courses/:courseId/modules/:moduleId/activities/new/:type"
 *   element={<ActivityEditorPage />}
 * />
 * ```
 */
export function ActivityEditorPage() {
  const params = useParams<Record<string, string>>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { courseId, moduleId, type, activityId } = params as unknown as ActivityEditorParams;

  // Validate type
  const validTypes: LearningUnitType[] = ['exercise', 'assessment', 'assignment'];
  const isValidType = type && validTypes.includes(type);

  const config = isValidType ? EDITOR_CONFIGS[type] : null;
  const isEditMode = !!activityId;

  // Editor state
  const [isDirty, setIsDirty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);

  const handleBack = () => {
    if (isDirty) {
      setShowUnsavedDialog(true);
    } else {
      navigate(`/staff/courses/${courseId}/modules/${moduleId}`);
    }
  };

  const handleConfirmLeave = () => {
    setShowUnsavedDialog(false);
    navigate(`/staff/courses/${courseId}/modules/${moduleId}`);
  };

  const handleSubmit = async (data: ActivityFormData) => {
    setIsSubmitting(true);

    try {
      // TODO: Replace with actual API call
      console.log('Submitting activity data:', data);
      await new Promise((resolve) => setTimeout(resolve, 500));

      toast({
        title: isEditMode ? 'Activity updated' : 'Activity created',
        description: `Your ${config?.label.toLowerCase()} has been saved successfully.`,
      });

      setIsDirty(false);
      navigate(`/staff/courses/${courseId}/modules/${moduleId}`);
    } catch (err) {
      toast({
        title: 'Failed to save',
        description: err instanceof Error ? err.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreview = () => {
    toast({
      title: 'Preview',
      description: 'Preview functionality will be available in a future update.',
    });
  };

  // Invalid type guard
  if (!isValidType || !config) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Invalid activity type. Please select a valid type from the module editor.
          </AlertDescription>
        </Alert>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    );
  }

  /**
   * Renders the appropriate editor component based on activity type
   */
  const renderEditor = () => {
    const commonProps = {
      moduleId,
      courseId,
      isLoading: isSubmitting,
      onDirtyChange: setIsDirty,
    };

    switch (type) {
      case 'exercise':
        return (
          <ExerciseEditor
            {...commonProps}
            onSubmit={(data: ExerciseFormData) => handleSubmit(data as ActivityFormData)}
          />
        );
      case 'assessment':
        return (
          <AssessmentEditor
            {...commonProps}
            onSubmit={(data: AssessmentFormData) => handleSubmit(data as ActivityFormData)}
          />
        );
      case 'assignment':
        return (
          <AssignmentEditor
            {...commonProps}
            onSubmit={(data: AssignmentFormData) => handleSubmit(data as ActivityFormData)}
          />
        );
      default:
        return (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Editor for {type} is not available.
            </AlertDescription>
          </Alert>
        );
    }
  };

  return (
    <div className="container mx-auto py-6">
      <PageHeader
        title={`${isEditMode ? 'Edit' : 'New'} ${config.label}`}
        description={config.description}
        backButton={
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Module
          </Button>
        }
      >
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePreview}>
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button
            type="submit"
            form="activity-editor-form"
            disabled={isSubmitting}
          >
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </PageHeader>

      <div className="mt-6">
        {renderEditor()}
      </div>

      <ConfirmDialog
        open={showUnsavedDialog}
        onOpenChange={setShowUnsavedDialog}
        onConfirm={handleConfirmLeave}
        title="Unsaved Changes"
        description="You have unsaved changes. Are you sure you want to leave without saving?"
        confirmText="Leave"
        isDestructive
      />
    </div>
  );
}

export default ActivityEditorPage;
