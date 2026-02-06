/**
 * Flashcard Editor Component
 * Modal editor for creating/editing a single flashcard with front/back content
 */

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
import { Textarea } from '@/shared/ui/textarea';
import { Badge } from '@/shared/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form';
import { X, Plus, Lightbulb, BookOpen } from 'lucide-react';
import type { FlashcardItem, CreateFlashcardRequest } from '../api/flashcardBuilderApi';

// ============================================================================
// Schema
// ============================================================================

const flashcardFormSchema = z.object({
  front: z.object({
    text: z.string().min(1, 'Front text is required'),
    hints: z.array(z.string()).optional(),
  }),
  back: z.object({
    text: z.string().min(1, 'Back text is required'),
    explanation: z.string().optional(),
  }),
  tags: z.array(z.string()).optional(),
});

type FlashcardFormValues = z.infer<typeof flashcardFormSchema>;

// ============================================================================
// Types
// ============================================================================

interface FlashcardEditorProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: CreateFlashcardRequest) => void;
  initialData?: FlashcardItem;
  isLoading?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export function FlashcardEditor({
  open,
  onClose,
  onSave,
  initialData,
  isLoading = false,
}: FlashcardEditorProps) {
  const isEditing = !!initialData;

  const form = useForm<FlashcardFormValues>({
    resolver: zodResolver(flashcardFormSchema),
    defaultValues: {
      front: {
        text: initialData?.front.text || '',
        hints: initialData?.front.hints || [],
      },
      back: {
        text: initialData?.back.text || '',
        explanation: initialData?.back.explanation || '',
      },
      tags: initialData?.tags || [],
    },
  });

  const hints = form.watch('front.hints') || [];
  const tags = form.watch('tags') || [];

  const handleAddHint = () => {
    const currentHints = form.getValues('front.hints') || [];
    form.setValue('front.hints', [...currentHints, '']);
  };

  const handleRemoveHint = (index: number) => {
    const currentHints = form.getValues('front.hints') || [];
    form.setValue(
      'front.hints',
      currentHints.filter((_, i) => i !== index)
    );
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const input = e.currentTarget;
      const value = input.value.trim();
      if (value && !tags.includes(value)) {
        form.setValue('tags', [...tags, value]);
        input.value = '';
      }
    }
  };

  const handleRemoveTag = (tag: string) => {
    form.setValue(
      'tags',
      tags.filter((t) => t !== tag)
    );
  };

  const onSubmit = (values: FlashcardFormValues) => {
    onSave({
      front: {
        text: values.front.text,
        hints: values.front.hints?.filter((h) => h.trim()) || undefined,
      },
      back: {
        text: values.back.text,
        explanation: values.back.explanation || undefined,
      },
      tags: values.tags,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Flashcard' : 'Create Flashcard'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the front and back content of this flashcard.'
              : 'Create a new flashcard with front (question) and back (answer) content.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="front">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="front" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Front (Question)
                </TabsTrigger>
                <TabsTrigger value="back" className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Back (Answer)
                </TabsTrigger>
              </TabsList>

              {/* Front Tab */}
              <TabsContent value="front" className="mt-4 space-y-4">
                <FormField
                  control={form.control}
                  name="front.text"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Question/Prompt <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="What is the question or prompt?"
                          rows={4}
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        This is what the learner sees first when studying.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Hints Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-sm font-medium">Hints (Optional)</FormLabel>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddHint}
                      disabled={isLoading}
                    >
                      <Plus className="mr-1 h-3 w-3" />
                      Add Hint
                    </Button>
                  </div>
                  {hints.map((_, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <FormField
                        control={form.control}
                        name={`front.hints.${index}`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input
                                placeholder={`Hint ${index + 1}`}
                                disabled={isLoading}
                                {...field}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveHint(index)}
                        disabled={isLoading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {hints.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      Add hints to help learners who are struggling.
                    </p>
                  )}
                </div>
              </TabsContent>

              {/* Back Tab */}
              <TabsContent value="back" className="mt-4 space-y-4">
                <FormField
                  control={form.control}
                  name="back.text"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Answer <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="What is the answer?"
                          rows={4}
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        This is revealed when the learner flips the card.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="back.explanation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Explanation (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Provide additional context or explanation..."
                          rows={3}
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Help learners understand why this is the correct answer.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>

            {/* Tags Section */}
            <div className="space-y-3 pt-4 border-t">
              <FormLabel className="text-sm font-medium">Tags</FormLabel>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-destructive"
                      disabled={isLoading}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <Input
                placeholder="Type a tag and press Enter"
                onKeyDown={handleAddTag}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Tags help organize and filter flashcards.
              </p>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : isEditing ? 'Update Card' : 'Create Card'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default FlashcardEditor;
