/**
 * Document Editor
 * Editor for PDF, slides, and document upload
 */

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { Switch } from '@/shared/ui/switch';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form';
import { FileUploadSection } from '../shared/FileUploadSection';
import { documentSchema, type DocumentFormData } from '../../lib/validation';
import { EDITOR_CONFIGS } from '../../model/editor-config';
import type { LearningUnitCategory } from '@/entities/learning-unit';

const CATEGORY_OPTIONS: { value: LearningUnitCategory; label: string }[] = [
  { value: 'topic', label: 'Topic (Instructional)' },
  { value: 'practice', label: 'Practice' },
];

export interface DocumentEditorProps {
  moduleId: string;
  courseId: string;
  onSubmit: (data: DocumentFormData) => void;
  initialData?: Partial<DocumentFormData>;
  isLoading?: boolean;
  formId?: string;
  onDirtyChange?: (isDirty: boolean) => void;
}

/**
 * Document Editor Component
 *
 * Form for creating/editing document learning activities.
 */
export function DocumentEditor({
  moduleId: _moduleId,
  courseId: _courseId,
  onSubmit,
  initialData,
  isLoading = false,
  formId = 'activity-editor-form',
  onDirtyChange,
}: DocumentEditorProps) {
  const config = EDITOR_CONFIGS.document;

  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const form = useForm<DocumentFormData>({
    resolver: zodResolver(documentSchema),
    mode: 'onChange',
    defaultValues: {
      type: 'document',
      title: initialData?.title || '',
      description: initialData?.description || '',
      category: initialData?.category || config.defaultCategory,
      estimatedDuration: initialData?.estimatedDuration,
      isRequired: initialData?.isRequired ?? true,
      isReplayable: initialData?.isReplayable ?? true,
      fileUrl: initialData?.fileUrl || '',
    },
  });

  const { setValue } = form;
  const fileUrl = form.watch('fileUrl');
  const { errors, isDirty } = form.formState;

  if (onDirtyChange && isDirty) {
    onDirtyChange(isDirty);
  }

  const handleFileSelect = useCallback((file: File) => {
    setIsUploading(true);
    setUploadedFileName(file.name);
    setUploadProgress(0);

    // Simulating upload
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setValue('fileUrl', `https://cdn.example.com/docs/${file.name}`, {
            shouldValidate: true,
          });
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  }, [setValue]);

  const handleFileRemove = useCallback(() => {
    setValue('fileUrl', '', { shouldValidate: true });
    setUploadedFileName(null);
    setUploadProgress(0);
  }, [setValue]);

  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
      >
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
                <Input
                  placeholder="Enter document title"
                  disabled={isLoading}
                  {...field}
                />
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
                  placeholder="Enter a brief description"
                  rows={3}
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* File Upload */}
        <FileUploadSection
          title="Document File"
          description="Upload a PDF, PowerPoint, Word document, or spreadsheet"
          accept={config.acceptedFileTypes}
          maxSize={config.maxFileSize}
          required
          value={fileUrl}
          fileName={uploadedFileName}
          progress={uploadProgress}
          isUploading={isUploading}
          onFileSelect={handleFileSelect}
          onRemove={handleFileRemove}
          error={errors.fileUrl?.message}
          disabled={isLoading}
        />

        {/* Category */}
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select
                value={field.value ?? undefined}
                onValueChange={(val) => field.onChange(val as LearningUnitCategory)}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Estimated Duration */}
        <FormField
          control={form.control}
          name="estimatedDuration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estimated Reading Time (minutes)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  placeholder="e.g., 15"
                  disabled={isLoading}
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

        {/* Settings */}
        <div className="space-y-4 pt-4 border-t">
          <FormField
            control={form.control}
            name="isRequired"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between space-y-0">
                <div className="space-y-0.5">
                  <FormLabel>Required for Completion</FormLabel>
                  <FormDescription>
                    Learners must view this to complete the module
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={!!field.value}
                    onCheckedChange={field.onChange}
                    disabled={isLoading}
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
                  <FormLabel>Allow Re-access</FormLabel>
                  <FormDescription>
                    Learners can view this document again
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={!!field.value}
                    onCheckedChange={field.onChange}
                    disabled={isLoading}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );
}

export default DocumentEditor;
