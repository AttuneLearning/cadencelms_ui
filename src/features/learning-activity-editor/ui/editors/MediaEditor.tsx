/**
 * Media Editor
 * Editor for video/audio content upload
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
import { FileUploadSection } from '../shared/FileUploadSection';
import { mediaSchema, type MediaFormData } from '../../lib/validation';
import { EDITOR_CONFIGS } from '../../model/editor-config';
import type { LearningUnitCategory } from '@/entities/learning-unit';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form';

/**
 * Category options
 */
const CATEGORY_OPTIONS: { value: LearningUnitCategory; label: string }[] = [
  { value: 'topic', label: 'Topic (Instructional)' },
  { value: 'practice', label: 'Practice' },
];

export interface MediaEditorProps {
  /** Module ID */
  moduleId: string;
  /** Course ID */
  courseId: string;
  /** Form submission handler */
  onSubmit: (data: MediaFormData) => void | Promise<void>;
  /** Initial data for edit mode */
  initialData?: Partial<MediaFormData>;
  /** Loading state */
  isLoading?: boolean;
  /** Form ID for external submit button */
  formId?: string;
  /** Callback when form becomes dirty */
  onDirtyChange?: (isDirty: boolean) => void;
}

/**
 * Media Editor Component
 *
 * Form for creating/editing media (video/audio) learning activities.
 *
 * Features:
 * - Drag-and-drop file upload
 * - Auto-detection of media duration (TODO: implement in Phase 2)
 * - Category selection
 * - Required/Replayable toggles
 *
 * @example
 * ```tsx
 * <MediaEditor
 *   moduleId={moduleId}
 *   courseId={courseId}
 *   onSubmit={handleSubmit}
 *   formId="activity-editor-form"
 * />
 * ```
 */
export function MediaEditor({
  moduleId: _moduleId,
  courseId: _courseId,
  onSubmit,
  initialData,
  isLoading = false,
  formId = 'activity-editor-form',
  onDirtyChange,
}: MediaEditorProps) {
  const config = EDITOR_CONFIGS.media;

  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const form = useForm<MediaFormData>({
    resolver: zodResolver(mediaSchema),
    mode: 'onChange',
    defaultValues: {
      type: 'media',
      title: initialData?.title || '',
      description: initialData?.description || '',
      category: initialData?.category || config.defaultCategory,
      estimatedDuration: initialData?.estimatedDuration,
      isRequired: initialData?.isRequired ?? true,
      isReplayable: initialData?.isReplayable ?? true,
      fileUrl: initialData?.fileUrl || '',
    },
  });

  // Watch form values
  const fileUrl = form.watch('fileUrl');

  // Notify parent of dirty state changes
  if (onDirtyChange && form.formState.isDirty) {
    onDirtyChange(form.formState.isDirty);
  }

  const handleFileSelect = useCallback((file: File) => {
    setIsUploading(true);
    setUploadedFileName(file.name);
    setUploadProgress(0);

    // TODO: Implement actual S3 upload in integration phase
    // Simulating upload progress for now
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          // Simulated URL - replace with actual S3 URL
          form.setValue('fileUrl', `https://cdn.example.com/media/${file.name}`, {
            shouldValidate: true,
          });
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  }, [form]);

  const handleFileRemove = useCallback(() => {
    form.setValue('fileUrl', '', { shouldValidate: true });
    setUploadedFileName(null);
    setUploadProgress(0);
  }, [form]);

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
                  placeholder="Enter media title"
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
            </FormItem>
          )}
        />

      {/* File Upload */}
      <FileUploadSection
        title="Media File"
        description="Upload a video or audio file"
        accept={config.acceptedFileTypes}
        maxSize={config.maxFileSize}
        required
        value={fileUrl}
        fileName={uploadedFileName}
        progress={uploadProgress}
        isUploading={isUploading}
        onFileSelect={handleFileSelect}
        onRemove={handleFileRemove}
        error={form.formState.errors.fileUrl?.message}
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
          </FormItem>
        )}
      />

      {/* Estimated Duration */}
      <FormField
        control={form.control}
        name="estimatedDuration"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Duration (minutes)
              <span className="text-xs text-muted-foreground ml-2">
                Auto-detected from media
              </span>
            </FormLabel>
            <FormControl>
              <Input
                type="number"
                min={1}
                placeholder="Auto-detected"
                disabled={isLoading}
                value={field.value ?? ''}
                onChange={(event) => {
                  const value = event.target.value;
                  field.onChange(value === '' ? undefined : Number(value));
                }}
              />
            </FormControl>
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
                  Learners must watch this to complete the module
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
                <FormLabel>Allow Replay</FormLabel>
                <FormDescription>
                  Learners can re-watch this content
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

export default MediaEditor;
