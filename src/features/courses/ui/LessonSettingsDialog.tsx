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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { Switch } from '@/shared/ui/switch';
import { Separator } from '@/shared/ui/separator';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form';
import type {
  LessonListItem,
  LessonSettingsFormData,
  CompletionCriteriaType,
} from '@/entities/course-module/model/lessonTypes';

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
  const form = useForm<LessonSettingsFormData>({
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
      form.reset({
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
  }, [lesson, form]);

  const completionType = form.watch('completionCriteriaType');

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

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Basic Settings */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="customTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custom Title (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={`Default: ${lesson.title}`}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Override the content's default title for this lesson
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isRequired"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4 space-y-0">
                    <div className="space-y-0.5">
                      <FormLabel>Required Lesson</FormLabel>
                      <FormDescription>
                        Learners must complete this lesson to finish the module
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Completion Criteria */}
            <div className="space-y-4">
              <h4 className="font-medium">Completion Criteria</h4>

              <FormField
                control={form.control}
                name="completionCriteriaType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Criteria Type</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="view_time">View Time Percentage</SelectItem>
                        <SelectItem value="quiz_score">Quiz/Assessment Score</SelectItem>
                        <SelectItem value="manual">Manual Completion</SelectItem>
                        <SelectItem value="auto">Auto-Complete on Launch</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              {completionType === 'view_time' && (
                <FormField
                  control={form.control}
                  name="requiredPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Required View Percentage (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          placeholder="80"
                          value={field.value ?? ''}
                          onChange={(event) => {
                            const value = event.target.value;
                            field.onChange(value === '' ? undefined : Number(value));
                          }}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Learner must view this percentage of the content to complete
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {completionType === 'quiz_score' && (
                <FormField
                  control={form.control}
                  name="minimumScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Passing Score (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          placeholder="70"
                          value={field.value ?? ''}
                          onChange={(event) => {
                            const value = event.target.value;
                            field.onChange(value === '' ? undefined : Number(value));
                          }}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Learner must achieve this score to complete the lesson
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {(completionType === 'view_time' || completionType === 'quiz_score') && (
                <FormField
                  control={form.control}
                  name="allowEarlyCompletion"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4 space-y-0">
                      <div className="space-y-0.5">
                        <FormLabel>Allow Early Completion</FormLabel>
                        <FormDescription>
                          Let learners mark as complete before meeting criteria
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}
            </div>

            <Separator />

            {/* Unlock Conditions */}
            <div className="space-y-4">
              <h4 className="font-medium">Unlock Conditions</h4>

              <FormField
                control={form.control}
                name="previousLessonId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Previous Lesson Required</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="None - Always unlocked" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">None - Always unlocked</SelectItem>
                        {availablePreviousLessons.map((prevLesson) => (
                          <SelectItem key={prevLesson.id} value={prevLesson.id}>
                            {prevLesson.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-xs">
                      Learner must complete this lesson before accessing this one
                    </FormDescription>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="delayMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delay After Enrollment (minutes)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={field.value ?? ''}
                        onChange={(event) => {
                          const value = event.target.value;
                          field.onChange(value === '' ? undefined : Number(value));
                        }}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Optional delay before this lesson becomes available (0 = immediately)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={form.formState.isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Saving...' : 'Save Settings'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
