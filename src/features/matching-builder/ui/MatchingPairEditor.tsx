/**
 * MatchingPairEditor - Modal for editing a single matching pair with hints support
 */

import { useEffect, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, Loader2, Lightbulb } from 'lucide-react';
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
import { Textarea } from '@/shared/ui/textarea';
import { Label } from '@/shared/ui/label';
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
import type { MatchingPairItem } from '../api/matchingBuilderApi';

// ============================================================================
// Schema
// ============================================================================

const matchingPairSchema = z.object({
  left: z.object({
    text: z.string().min(1, 'Left side text is required'),
    hints: z.array(z.string()).optional(),
  }),
  right: z.object({
    text: z.string().min(1, 'Right side text is required'),
    explanation: z.string().optional(),
  }),
});

type MatchingPairFormData = z.infer<typeof matchingPairSchema>;

// ============================================================================
// Types
// ============================================================================

export interface MatchingPairEditorProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: MatchingPairFormData) => void;
  initialData?: MatchingPairItem;
  isLoading?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export function MatchingPairEditor({
  open,
  onClose,
  onSave,
  initialData,
  isLoading = false,
}: MatchingPairEditorProps) {
  const form = useForm<MatchingPairFormData>({
    resolver: zodResolver(matchingPairSchema),
    defaultValues: {
      left: {
        text: '',
        hints: [],
      },
      right: {
        text: '',
        explanation: '',
      },
    },
  });

  const {
    fields: hintFields,
    append: appendHint,
    remove: removeHint,
  } = useFieldArray({
    control: form.control,
    name: 'left.hints' as never,
  });

  // Reset form when initialData changes or modal opens
  useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset({
          left: {
            text: initialData.left.text,
            hints: initialData.left.hints || [],
          },
          right: {
            text: initialData.right.text,
            explanation: initialData.right.explanation || '',
          },
        });
      } else {
        form.reset({
          left: { text: '', hints: [] },
          right: { text: '', explanation: '' },
        });
      }
    }
  }, [open, initialData, form]);

  const handleSubmit = useCallback(
    (data: MatchingPairFormData) => {
      // Filter out empty hints
      const cleanedData = {
        ...data,
        left: {
          ...data.left,
          hints: data.left.hints?.filter((h) => h.trim() !== '') || [],
        },
      };
      onSave(cleanedData);
    },
    [onSave]
  );

  const isEditing = !!initialData;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Matching Pair' : 'Add Matching Pair'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the left and right sides of this matching pair'
              : 'Create a new matching pair with left and right sides'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Left Side (Column A) */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Label className="text-base font-semibold">
                  Left Side (Column A)
                </Label>
              </div>

              <FormField
                control={form.control}
                name="left.text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Text</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter the prompt or question..."
                        className="resize-none"
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Hints Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Hints (optional)
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendHint('')}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Hint
                  </Button>
                </div>

                {hintFields.length > 0 ? (
                  <div className="space-y-2">
                    {hintFields.map((field, index) => (
                      <div key={field.id} className="flex items-center gap-2">
                        <Input
                          placeholder={`Hint ${index + 1}`}
                          {...form.register(`left.hints.${index}` as const)}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeHint(index)}
                          className="h-9 w-9 flex-shrink-0"
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No hints added. Hints help learners when they are stuck.
                  </p>
                )}
              </div>
            </div>

            <Separator />

            {/* Right Side (Column B) */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Label className="text-base font-semibold">
                  Right Side (Column B)
                </Label>
              </div>

              <FormField
                control={form.control}
                name="right.text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Text</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter the matching answer..."
                        className="resize-none"
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="right.explanation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Explanation (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Explain why this is the correct match..."
                        className="resize-none"
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Shown to learners after they complete the exercise
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? 'Save Changes' : 'Add Pair'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
