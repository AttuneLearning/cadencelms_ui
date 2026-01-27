/**
 * Edit Question Bank Dialog
 * Dialog for editing an existing question bank
 */

import { useEffect } from 'react';
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
import { TagInput } from '@/shared/ui/tag-input';

import { useQuestionBank, useUpdateQuestionBank } from '@/entities/question-bank';
import { Skeleton } from '@/shared/ui/skeleton';
import { ErrorPanel } from '@/shared/ui/error-panel';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface EditBankDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departmentId: string;
  bankId: string;
}

export function EditBankDialog({
  open,
  onOpenChange,
  departmentId,
  bankId,
}: EditBankDialogProps) {
  const { data: bank, isLoading, error } = useQuestionBank(departmentId, bankId);

  const updateMutation = useUpdateQuestionBank(departmentId, {
    onSuccess: () => {
      onOpenChange(false);
    },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      tags: [],
    },
  });

  useEffect(() => {
    if (bank) {
      form.reset({
        name: bank.name,
        description: bank.description || '',
        tags: bank.tags,
      });
    }
  }, [bank, form]);

  function onSubmit(values: FormValues) {
    updateMutation.mutate({ bankId, payload: values });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Question Bank</DialogTitle>
          <DialogDescription>
            Update question bank details.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : error ? (
          <ErrorPanel
            error={error}
            title="Failed to load question bank"
          />
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
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
                      <Textarea rows={3} {...field} />
                    </FormControl>
                    <FormDescription>
                      Help others understand what this bank is used for
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags (Optional)</FormLabel>
                    <FormControl>
                      <TagInput
                        value={field.value ?? []}
                        onChange={field.onChange}
                        placeholder="Add tags..."
                        maxTagLength={50}
                      />
                    </FormControl>
                    <FormDescription>
                      Add tags to help organize and filter question banks. Press
                      Enter or comma to add a tag.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
