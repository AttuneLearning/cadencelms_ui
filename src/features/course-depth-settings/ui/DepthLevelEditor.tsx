/**
 * Depth Level Editor Component
 * Edit cognitive depth level settings for a course
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';

import type { CognitiveDepthLevel } from '@/entities/cognitive-depth';

const formSchema = z.object({
  advanceThreshold: z
    .number()
    .min(0, 'Must be between 0 and 1')
    .max(1, 'Must be between 0 and 1'),
  minAttempts: z.number().min(1, 'Must be at least 1'),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface DepthLevelEditorProps {
  level: CognitiveDepthLevel;
  onSave: (slug: string, values: FormValues) => void;
  onReset?: (slug: string) => void;
  isSaving?: boolean;
}

export function DepthLevelEditor({
  level,
  onSave,
  onReset,
  isSaving,
}: DepthLevelEditorProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      advanceThreshold: level.advanceThreshold,
      minAttempts: level.minAttempts,
      description: level.description,
    },
  });

  const isModified = form.formState.isDirty;
  const isCourseOverride = level.source === 'course';

  function handleSubmit(values: FormValues) {
    onSave(level.slug, values);
    form.reset(values);
  }

  function handleReset() {
    if (onReset) {
      onReset(level.slug);
      form.reset({
        advanceThreshold: level.advanceThreshold,
        minAttempts: level.minAttempts,
        description: level.description,
      });
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{level.name}</CardTitle>
            <CardDescription>
              Order: {level.order} • Slug: {level.slug}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge
              variant={
                level.source === 'system'
                  ? 'outline'
                  : level.source === 'department'
                  ? 'secondary'
                  : 'default'
              }
            >
              {level.source === 'system' && '🌐 System'}
              {level.source === 'department' && '🏢 Department'}
              {level.source === 'course' && '📚 Course Override'}
            </Badge>
            {!level.isActive && <Badge variant="destructive">Inactive</Badge>}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="advanceThreshold"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Advance Threshold</FormLabel>
                  <div className="flex items-center gap-2">
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="1"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <span className="text-sm text-muted-foreground">
                      {(field.value * 100).toFixed(0)}%
                    </span>
                  </div>
                  <FormDescription>
                    Mastery score needed to advance (0.0 - 1.0)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="minAttempts"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Attempts</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                    />
                  </FormControl>
                  <FormDescription>
                    Minimum questions before advancement
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea rows={2} {...field} />
                  </FormControl>
                  <FormDescription>
                    Customize the description for this course
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2">
              <Button type="submit" disabled={!isModified || isSaving}>
                {isSaving ? 'Saving...' : 'Save Override'}
              </Button>
              {isCourseOverride && onReset && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  disabled={isSaving}
                >
                  Reset to Default
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
