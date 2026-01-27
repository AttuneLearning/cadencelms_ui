/**
 * Metadata Section
 * Shared form section for basic activity metadata (title, description, category)
 */

import { useFormContext } from 'react-hook-form';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Switch } from '@/shared/ui/switch';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form';
import type { LearningUnitCategory } from '@/entities/learning-unit';
import type { ActivityFormData } from '../../model/types';

/**
 * Category options for the select
 */
const CATEGORY_OPTIONS: { value: LearningUnitCategory; label: string; description: string }[] = [
  {
    value: 'topic',
    label: 'Topic',
    description: 'Instructional content (videos, documents, presentations)',
  },
  {
    value: 'practice',
    label: 'Practice',
    description: 'Practice exercises and simulations',
  },
  {
    value: 'assignment',
    label: 'Assignment',
    description: 'Ungraded assignments or submissions',
  },
  {
    value: 'graded',
    label: 'Graded',
    description: 'Graded evaluations (quizzes, exams)',
  },
];

export interface MetadataSectionProps {
  /** Whether to show category selector (hidden for some types) */
  showCategory?: boolean;
  /** Whether to show requirement settings */
  showRequirementSettings?: boolean;
}

/**
 * Metadata Section Component
 *
 * Provides form fields for basic activity metadata:
 * - Title (required)
 * - Description (optional)
 * - Category (optional)
 * - Estimated Duration (optional)
 * - Required/Replayable settings
 *
 * @example
 * ```tsx
 * <MetadataSection
 *   register={register}
 *   errors={errors}
 *   setValue={setValue}
 *   category={watchCategory}
 *   showCategory
 *   showRequirementSettings
 * />
 * ```
 */
export function MetadataSection({
  showCategory = true,
  showRequirementSettings = true,
}: MetadataSectionProps) {
  const form = useFormContext<ActivityFormData>();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
        <CardDescription>
          Enter the basic details for this activity
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Title <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="Enter activity title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter a brief description of this activity"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Category */}
        {showCategory && (
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select
                  value={field.value ?? undefined}
                  onValueChange={(val) => field.onChange(val as LearningUnitCategory)}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <div className="flex flex-col">
                          <span>{opt.label}</span>
                          <span className="text-xs text-muted-foreground">
                            {opt.description}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Estimated Duration */}
        <FormField
          control={form.control}
          name="estimatedDuration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estimated Duration (minutes)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  placeholder="e.g., 30"
                  value={field.value ?? ''}
                  onChange={(event) => {
                    const value = event.target.value;
                    field.onChange(value === '' ? undefined : Number(value));
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Requirement Settings */}
        {showRequirementSettings && (
          <div className="space-y-4 pt-4 border-t">
            <FormField
              control={form.control}
              name="isRequired"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between space-y-0">
                  <div className="space-y-0.5">
                    <FormLabel>Required for Completion</FormLabel>
                    <FormDescription>
                      Learners must complete this activity to finish the module
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={!!field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isReplayable"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between space-y-0">
                  <div className="space-y-0.5">
                    <FormLabel>Allow Replay</FormLabel>
                    <FormDescription>
                      Learners can access this activity multiple times
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={!!field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default MetadataSection;
