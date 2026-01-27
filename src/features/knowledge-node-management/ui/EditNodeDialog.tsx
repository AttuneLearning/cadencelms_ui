/**
 * Edit Knowledge Node Dialog
 * Dialog for editing an existing knowledge node
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
import { Skeleton } from '@/shared/ui/skeleton';
import { ErrorPanel } from '@/shared/ui/error-panel';

import {
  useKnowledgeNode,
  useUpdateKnowledgeNode,
} from '@/entities/knowledge-node';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface EditNodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departmentId: string;
  nodeId: string;
}

export function EditNodeDialog({
  open,
  onOpenChange,
  departmentId,
  nodeId,
}: EditNodeDialogProps) {
  const { data: node, isLoading, error } = useKnowledgeNode(departmentId, nodeId);

  const updateMutation = useUpdateKnowledgeNode(departmentId, {
    onSuccess: () => {
      onOpenChange(false);
    },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  useEffect(() => {
    if (node) {
      form.reset({
        name: node.name,
        description: node.description || '',
      });
    }
  }, [node, form]);

  function onSubmit(values: FormValues) {
    updateMutation.mutate({ nodeId, payload: values });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Knowledge Node</DialogTitle>
          <DialogDescription>Update knowledge node details.</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : error ? (
          <ErrorPanel error={error} title="Failed to load knowledge node" />
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
                      Help learners understand what this knowledge node covers
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
