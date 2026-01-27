/**
 * CreateLearningActivityPage
 * Staff page for creating learning activities (learning units)
 */

import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/shared/ui/page-header';
import { Button } from '@/shared/ui/button';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { useToast } from '@/shared/ui/use-toast';
import {
  LearningUnitForm,
  useCreateLearningUnit,
  type CreateLearningUnitPayload,
  type UpdateLearningUnitPayload,
} from '@/entities/learning-unit';

interface CreateLearningActivityPageParams {
  courseId: string;
  moduleId: string;
}

export const CreateLearningActivityPage: React.FC = () => {
  const { courseId, moduleId } = useParams<Record<keyof CreateLearningActivityPageParams, string>>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const createLearningUnit = useCreateLearningUnit();

  if (!courseId || !moduleId) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertDescription>Missing required parameters</AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleCancel = () => {
    navigate(`/staff/courses/${courseId}/modules/${moduleId}/edit`);
  };

  const handleSubmit = async (
    payload: CreateLearningUnitPayload | UpdateLearningUnitPayload
  ) => {
    if (!payload.type) {
      toast({
        title: 'Content type required',
        description: 'Please select a learning activity content type.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createLearningUnit.mutateAsync({
        moduleId,
        payload: payload as CreateLearningUnitPayload,
      });

      toast({
        title: 'Learning activity created',
        description: 'Your learning activity has been added to the module.',
      });

      navigate(`/staff/courses/${courseId}/modules/${moduleId}/edit`);
    } catch (error: any) {
      toast({
        title: 'Failed to create learning activity',
        description: error?.message || 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <PageHeader
        title="Create Learning Activity"
        description="Add a learning activity to this module"
        className="mb-6"
        backButton={
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Module
          </Button>
        }
      />

      <LearningUnitForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={createLearningUnit.isPending}
        error={createLearningUnit.error ? createLearningUnit.error.message : undefined}
      />
    </div>
  );
};
