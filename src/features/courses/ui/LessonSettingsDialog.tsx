/**
 * LessonSettingsDialog Component
 * Dialog for configuring lesson settings including completion criteria
 */

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { Switch } from '@/shared/ui/switch';
import { Separator } from '@/shared/ui/separator';
import type {
  LessonListItem,
  LessonSettingsFormData,
  CompletionCriteriaType,
} from '@/entities/course-segment/model/lessonTypes';

interface LessonSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lesson: LessonListItem | null;
  availablePreviousLessons?: Array<{ id: string; title: string }>;
  onSave: (lessonId: string, settings: LessonSettingsFormData) => void;
}

const lessonSettingsSchema = z.object({
  customTitle: z.string().max(200).optional(),
  isRequired: z.boolean(),
  completionCriteriaType: z.enum(['view_time', 'quiz_score', 'manual', 'auto']),
  requiredPercentage: z
    .number()
    .min(0)
    .max(100)
    .optional()
    .or(z.string().transform((val) => (val ? parseInt(val, 10) : undefined))),
  minimumScore: z
    .number()
    .min(0)
    .max(100)
    .optional()
    .or(z.string().transform((val) => (val ? parseInt(val, 10) : undefined))),
  allowEarlyCompletion: z.boolean(),
  previousLessonId: z.string().optional(),
  delayMinutes: z
    .number()
    .min(0)
    .optional()
    .or(z.string().transform((val) => (val ? parseInt(val, 10) : undefined))),
});

export const LessonSettingsDialog: React.FC<LessonSettingsDialogProps> = ({
  open,
  onOpenChange,
  lesson,
  availablePreviousLessons = [],
  onSave,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LessonSettingsFormData>({
    resolver: zodResolver(lessonSettingsSchema),
    defaultValues: {
      customTitle: lesson?.settings.customTitle || '',
      isRequired: lesson?.settings.isRequired ?? true,
      completionCriteriaType: lesson?.settings.completionCriteria.type || 'view_time',
      requiredPercentage: lesson?.settings.completionCriteria.requiredPercentage || 80,
      minimumScore: lesson?.settings.completionCriteria.minimumScore || 70,
      allowEarlyCompletion:
        lesson?.settings.completionCriteria.allowEarlyCompletion ?? false,
      previousLessonId: lesson?.settings.unlockConditions?.previousLessonId || '',
      delayMinutes: lesson?.settings.unlockConditions?.delayMinutes || 0,
    },
  });

  React.useEffect(() => {
    if (lesson) {
      reset({
        customTitle: lesson.settings.customTitle || '',
        isRequired: lesson.settings.isRequired,
        completionCriteriaType: lesson.settings.completionCriteria.type,
        requiredPercentage: lesson.settings.completionCriteria.requiredPercentage || 80,
        minimumScore: lesson.settings.completionCriteria.minimumScore || 70,
        allowEarlyCompletion: lesson.settings.completionCriteria.allowEarlyCompletion ?? false,
        previousLessonId: lesson.settings.unlockConditions?.previousLessonId || '',
        delayMinutes: lesson.settings.unlockConditions?.delayMinutes || 0,
      });
    }
  }, [lesson, reset]);

  const completionType = watch('completionCriteriaType');

  const handleFormSubmit = (data: LessonSettingsFormData) => {
    if (!lesson) return;
    onSave(lesson.id, data);
    onOpenChange(false);
  };

  if (!lesson) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Lesson Settings</DialogTitle>
          <DialogDescription>
            Configure completion criteria and unlock conditions for: {lesson.title}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Basic Settings */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customTitle">Custom Title (Optional)</Label>
              <Input
                id="customTitle"
                {...register('customTitle')}
                placeholder={`Default: ${lesson.title}`}
              />
              <p className="text-xs text-muted-foreground">
                Override the content's default title for this lesson
              </p>
              {errors.customTitle && (
                <p className="text-sm text-destructive">{errors.customTitle.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="isRequired">Required Lesson</Label>
                <p className="text-sm text-muted-foreground">
                  Learners must complete this lesson to finish the module
                </p>
              </div>
              <Switch
                id="isRequired"
                checked={watch('isRequired')}
                onCheckedChange={(checked) => setValue('isRequired', checked)}
              />
            </div>
          </div>

          <Separator />

          {/* Completion Criteria */}
          <div className="space-y-4">
            <h4 className="font-medium">Completion Criteria</h4>

            <div className="space-y-2">
              <Label htmlFor="completionCriteriaType">Criteria Type</Label>
              <Select
                value={completionType}
                onValueChange={(value) =>
                  setValue('completionCriteriaType', value as CompletionCriteriaType)
                }
              >
                <SelectTrigger id="completionCriteriaType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view_time">View Time Percentage</SelectItem>
                  <SelectItem value="quiz_score">Quiz/Assessment Score</SelectItem>
                  <SelectItem value="manual">Manual Completion</SelectItem>
                  <SelectItem value="auto">Auto-Complete on Launch</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {completionType === 'view_time' && (
              <div className="space-y-2">
                <Label htmlFor="requiredPercentage">Required View Percentage (%)</Label>
                <Input
                  id="requiredPercentage"
                  type="number"
                  min="0"
                  max="100"
                  {...register('requiredPercentage')}
                  placeholder="80"
                />
                <p className="text-xs text-muted-foreground">
                  Learner must view this percentage of the content to complete
                </p>
                {errors.requiredPercentage && (
                  <p className="text-sm text-destructive">
                    {errors.requiredPercentage.message}
                  </p>
                )}
              </div>
            )}

            {completionType === 'quiz_score' && (
              <div className="space-y-2">
                <Label htmlFor="minimumScore">Minimum Passing Score (%)</Label>
                <Input
                  id="minimumScore"
                  type="number"
                  min="0"
                  max="100"
                  {...register('minimumScore')}
                  placeholder="70"
                />
                <p className="text-xs text-muted-foreground">
                  Learner must achieve this score to complete the lesson
                </p>
                {errors.minimumScore && (
                  <p className="text-sm text-destructive">{errors.minimumScore.message}</p>
                )}
              </div>
            )}

            {(completionType === 'view_time' || completionType === 'quiz_score') && (
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="allowEarlyCompletion">Allow Early Completion</Label>
                  <p className="text-sm text-muted-foreground">
                    Let learners mark as complete before meeting criteria
                  </p>
                </div>
                <Switch
                  id="allowEarlyCompletion"
                  checked={watch('allowEarlyCompletion')}
                  onCheckedChange={(checked) => setValue('allowEarlyCompletion', checked)}
                />
              </div>
            )}
          </div>

          <Separator />

          {/* Unlock Conditions */}
          <div className="space-y-4">
            <h4 className="font-medium">Unlock Conditions</h4>

            <div className="space-y-2">
              <Label htmlFor="previousLessonId">Previous Lesson Required</Label>
              <Select
                value={watch('previousLessonId')}
                onValueChange={(value) => setValue('previousLessonId', value)}
              >
                <SelectTrigger id="previousLessonId">
                  <SelectValue placeholder="None - Always unlocked" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None - Always unlocked</SelectItem>
                  {availablePreviousLessons.map((prevLesson) => (
                    <SelectItem key={prevLesson.id} value={prevLesson.id}>
                      {prevLesson.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Learner must complete this lesson before accessing this one
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="delayMinutes">Delay After Enrollment (minutes)</Label>
              <Input
                id="delayMinutes"
                type="number"
                min="0"
                {...register('delayMinutes')}
                placeholder="0"
              />
              <p className="text-xs text-muted-foreground">
                Optional delay before this lesson becomes available (0 = immediately)
              </p>
              {errors.delayMinutes && (
                <p className="text-sm text-destructive">{errors.delayMinutes.message}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Settings'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
