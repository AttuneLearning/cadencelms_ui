/**
 * Custom Embed Editor
 * Editor for external links or embed code with live preview
 */

import { useState, useEffect, useCallback } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Link, Code, ExternalLink, Eye } from 'lucide-react';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form';
import { customSchema, type CustomFormData } from '../../lib/validation';
import { EDITOR_CONFIGS } from '../../model/editor-config';
import type { LearningUnitCategory } from '@/entities/learning-unit';

const CATEGORY_OPTIONS: { value: LearningUnitCategory; label: string }[] = [
  { value: 'topic', label: 'Topic (Instructional)' },
  { value: 'practice', label: 'Practice' },
];

type EmbedMode = 'url' | 'code';

export interface CustomEmbedEditorProps {
  moduleId: string;
  courseId: string;
  onSubmit: (data: CustomFormData) => void;
  initialData?: Partial<CustomFormData>;
  isLoading?: boolean;
  formId?: string;
  onDirtyChange?: (isDirty: boolean) => void;
}

/**
 * Custom Embed Editor Component
 *
 * Form for creating/editing custom embed learning activities.
 * Supports both URL and embed code with live preview.
 */
export function CustomEmbedEditor({
  moduleId: _moduleId,
  courseId: _courseId,
  onSubmit,
  initialData,
  isLoading = false,
  formId = 'activity-editor-form',
  onDirtyChange,
}: CustomEmbedEditorProps) {
  const config = EDITOR_CONFIGS.custom;

  // Determine initial mode based on initialData
  const initialMode: EmbedMode = initialData?.embedCode ? 'code' : 'url';
  const [embedMode, setEmbedMode] = useState<EmbedMode>(initialMode);
  const [showPreview, setShowPreview] = useState(false);

  const form = useForm<CustomFormData>({
    resolver: zodResolver(customSchema),
    mode: 'onChange',
    defaultValues: {
      type: 'custom',
      title: initialData?.title || '',
      description: initialData?.description || '',
      category: initialData?.category || config.defaultCategory,
      estimatedDuration: initialData?.estimatedDuration,
      isRequired: initialData?.isRequired ?? true,
      isReplayable: initialData?.isReplayable ?? true,
      embedUrl: initialData?.embedUrl || '',
      embedCode: initialData?.embedCode || '',
    },
  });

  const { setValue, clearErrors } = form;
  const embedUrl = form.watch('embedUrl');
  const embedCode = form.watch('embedCode');
  const { isDirty } = form.formState;

  useEffect(() => {
    if (onDirtyChange && isDirty) {
      onDirtyChange(isDirty);
    }
  }, [onDirtyChange, isDirty]);

  // Clear the other field when switching modes
  const handleModeChange = useCallback((mode: EmbedMode) => {
    setEmbedMode(mode);
    setShowPreview(false);
    if (mode === 'url') {
      setValue('embedCode', '');
      clearErrors('embedCode');
    } else {
      setValue('embedUrl', '');
      clearErrors('embedUrl');
    }
  }, [setValue, clearErrors]);

  /**
   * Convert URL to embeddable iframe
   */
  const getEmbedPreview = useCallback(() => {
    if (embedMode === 'code' && embedCode) {
      return embedCode;
    }

    if (embedMode === 'url' && embedUrl) {
      // Check for common video platforms and convert to embed URL
      let src = embedUrl;

      // YouTube conversion
      const youtubeMatch = embedUrl.match(
        /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
      );
      if (youtubeMatch) {
        src = `https://www.youtube.com/embed/${youtubeMatch[1]}`;
      }

      // Vimeo conversion
      const vimeoMatch = embedUrl.match(/vimeo\.com\/(\d+)/);
      if (vimeoMatch) {
        src = `https://player.vimeo.com/video/${vimeoMatch[1]}`;
      }

      return `<iframe src="${src}" width="100%" height="400" frameborder="0" allowfullscreen></iframe>`;
    }

    return null;
  }, [embedMode, embedUrl, embedCode]);

  const previewHtml = getEmbedPreview();

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
                  placeholder="Enter embed title"
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

        {/* Embed Mode Tabs */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              Embed Content <span className="text-destructive">*</span>
            </CardTitle>
            <CardDescription>
              Provide either a URL or custom embed code
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs value={embedMode} onValueChange={(v) => handleModeChange(v as EmbedMode)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="url" className="flex items-center gap-2">
                  <Link className="h-4 w-4" />
                  URL
                </TabsTrigger>
                <TabsTrigger value="code" className="flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  Embed Code
                </TabsTrigger>
              </TabsList>

              <TabsContent value="url" className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="embedUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>External URL</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <ExternalLink className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="https://example.com/content"
                            className="pl-10"
                            disabled={isLoading}
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormDescription className="text-xs">
                        Supports YouTube, Vimeo, and other embeddable URLs
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="code" className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="embedCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>HTML Embed Code</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="<iframe src='...' />"
                          rows={5}
                          className="font-mono text-sm"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Paste the embed code from the external service (iframe, script, etc.)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>

            {/* Preview Toggle */}
            {previewHtml && (
              <div className="pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  {showPreview ? 'Hide Preview' : 'Show Preview'}
                </button>

                {showPreview && (
                  <div className="mt-4 border rounded-lg p-4 bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                    <div
                      className="w-full overflow-hidden rounded"
                      dangerouslySetInnerHTML={{ __html: previewHtml }}
                    />
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

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
              <FormLabel>Estimated Duration (minutes)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  placeholder="e.g., 20"
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
                    Learners can view this content again
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

export default CustomEmbedEditor;
