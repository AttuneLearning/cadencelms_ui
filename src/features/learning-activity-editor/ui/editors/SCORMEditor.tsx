/**
 * SCORM Editor
 * Editor for SCORM package upload with validation feedback
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
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert';
import { Switch } from '@/shared/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
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
import { scormSchema, type SCORMFormData } from '../../lib/validation';
import { EDITOR_CONFIGS } from '../../model/editor-config';
import type { LearningUnitCategory } from '@/entities/learning-unit';

const CATEGORY_OPTIONS: { value: LearningUnitCategory; label: string }[] = [
  { value: 'topic', label: 'Topic (Instructional)' },
  { value: 'practice', label: 'Practice' },
  { value: 'graded', label: 'Graded' },
];

/**
 * SCORM package validation status
 */
interface SCORMValidationStatus {
  isValidating: boolean;
  isValid: boolean | null;
  manifestFound: boolean | null;
  scormVersion: string | null;
  title: string | null;
  entryPoint: string | null;
  errors: string[];
  warnings: string[];
}

const initialValidationStatus: SCORMValidationStatus = {
  isValidating: false,
  isValid: null,
  manifestFound: null,
  scormVersion: null,
  title: null,
  entryPoint: null,
  errors: [],
  warnings: [],
};

export interface SCORMEditorProps {
  moduleId: string;
  courseId: string;
  onSubmit: (data: SCORMFormData) => void;
  initialData?: Partial<SCORMFormData>;
  isLoading?: boolean;
  formId?: string;
  onDirtyChange?: (isDirty: boolean) => void;
}

/**
 * SCORM Editor Component
 *
 * Form for creating/editing SCORM learning activities.
 * Includes SCORM package validation feedback.
 */
export function SCORMEditor({
  moduleId: _moduleId,
  courseId: _courseId,
  onSubmit,
  initialData,
  isLoading = false,
  formId = 'activity-editor-form',
  onDirtyChange,
}: SCORMEditorProps) {
  const config = EDITOR_CONFIGS.scorm;

  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [validationStatus, setValidationStatus] = useState<SCORMValidationStatus>(initialValidationStatus);

  const form = useForm<SCORMFormData>({
    resolver: zodResolver(scormSchema),
    mode: 'onChange',
    defaultValues: {
      type: 'scorm',
      title: initialData?.title || '',
      description: initialData?.description || '',
      category: initialData?.category || config.defaultCategory,
      estimatedDuration: initialData?.estimatedDuration,
      isRequired: initialData?.isRequired ?? true,
      isReplayable: initialData?.isReplayable ?? true,
      fileUrl: initialData?.fileUrl || '',
    },
  });

  const { setValue, getValues } = form;
  const fileUrl = form.watch('fileUrl');
  const { errors, isDirty } = form.formState;

  if (onDirtyChange && isDirty) {
    onDirtyChange(isDirty);
  }

  /**
   * Simulate SCORM package validation
   * In production, this would call an API endpoint to validate the package
   */
  const validateSCORMPackage = useCallback(async (fileName: string) => {
    setValidationStatus({
      ...initialValidationStatus,
      isValidating: true,
    });

    // Simulate validation delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Simulated validation result
    // In production, this would be returned from the API
    const mockValidation: SCORMValidationStatus = {
      isValidating: false,
      isValid: true,
      manifestFound: true,
      scormVersion: 'SCORM 1.2',
      title: fileName.replace('.zip', ''),
      entryPoint: 'index.html',
      errors: [],
      warnings: [
        'Package uses SCORM 1.2. Consider upgrading to SCORM 2004 for enhanced tracking.',
      ],
    };

    setValidationStatus(mockValidation);

    // Auto-fill title from package if empty
    if (mockValidation.title && !getValues('title')) {
      setValue('title', mockValidation.title);
    }
  }, [getValues, setValue]);

  const handleFileSelect = useCallback((file: File) => {
    setIsUploading(true);
    setUploadedFileName(file.name);
    setUploadProgress(0);
    setValidationStatus(initialValidationStatus);

    // Simulating upload
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setValue('fileUrl', `https://cdn.example.com/scorm/${file.name}`, {
            shouldValidate: true,
          });
          // Start validation after upload completes
          validateSCORMPackage(file.name);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  }, [setValue, validateSCORMPackage]);

  const handleFileRemove = useCallback(() => {
    setValue('fileUrl', '', { shouldValidate: true });
    setUploadedFileName(null);
    setUploadProgress(0);
    setValidationStatus(initialValidationStatus);
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
                  placeholder="Enter SCORM package title"
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
          title="SCORM Package"
          description="Upload a SCORM 1.2 or 2004 compliant ZIP package"
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

        {/* SCORM Validation Status */}
        {(validationStatus.isValidating || validationStatus.isValid !== null) && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                {validationStatus.isValidating && (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    Validating Package...
                  </>
                )}
                {validationStatus.isValid === true && (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Package Valid
                  </>
                )}
                {validationStatus.isValid === false && (
                  <>
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    Validation Failed
                  </>
                )}
              </CardTitle>
              {validationStatus.scormVersion && (
                <CardDescription>
                  {validationStatus.scormVersion}
                </CardDescription>
              )}
            </CardHeader>
            {!validationStatus.isValidating && (
              <CardContent className="space-y-3">
                {/* Package Details */}
                {validationStatus.manifestFound && (
                  <div className="text-sm space-y-1">
                    {validationStatus.entryPoint && (
                      <p className="text-muted-foreground">
                        Entry Point: <code className="bg-muted px-1 rounded">{validationStatus.entryPoint}</code>
                      </p>
                    )}
                  </div>
                )}

                {/* Warnings */}
                {validationStatus.warnings.length > 0 && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Warnings</AlertTitle>
                    <AlertDescription>
                      <ul className="list-disc list-inside space-y-1 mt-2">
                        {validationStatus.warnings.map((warning, idx) => (
                          <li key={idx} className="text-sm">{warning}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Errors */}
                {validationStatus.errors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Errors</AlertTitle>
                    <AlertDescription>
                      <ul className="list-disc list-inside space-y-1 mt-2">
                        {validationStatus.errors.map((error, idx) => (
                          <li key={idx} className="text-sm">{error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            )}
          </Card>
        )}

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
                  placeholder="e.g., 30"
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
                    Learners must complete this SCORM to finish the module
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
                  <FormLabel>Allow Re-launch</FormLabel>
                  <FormDescription>
                    Learners can launch this SCORM again after completion
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

export default SCORMEditor;
