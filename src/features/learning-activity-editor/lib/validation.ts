/**
 * Form Validation Schemas
 * Zod schemas for activity editor forms
 */

import * as z from 'zod';

/**
 * Base metadata schema - common to all activity types
 */
export const baseMetadataSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be 200 characters or less'),
  description: z.string().max(2000, 'Description must be 2000 characters or less').optional(),
  category: z.enum(['topic', 'practice', 'assignment', 'graded']).optional().nullable(),
  estimatedDuration: z.number().min(1, 'Duration must be at least 1 minute').optional(),
  isRequired: z.boolean().optional(),
  isReplayable: z.boolean().optional(),
  weight: z.number().min(0).max(100).optional(),
});

/**
 * Media activity schema
 */
export const mediaSchema = baseMetadataSchema.extend({
  type: z.literal('media'),
  fileUrl: z.string().url('Please upload a valid media file').min(1, 'Media file is required'),
});

/**
 * Document activity schema
 */
export const documentSchema = baseMetadataSchema.extend({
  type: z.literal('document'),
  fileUrl: z.string().url('Please upload a valid document').min(1, 'Document is required'),
});

/**
 * SCORM activity schema
 */
export const scormSchema = baseMetadataSchema.extend({
  type: z.literal('scorm'),
  fileUrl: z.string().url('Please upload a valid SCORM package').min(1, 'SCORM package is required'),
});

/**
 * Custom embed activity schema (base - used in discriminated union)
 */
export const customSchemaBase = baseMetadataSchema.extend({
  type: z.literal('custom'),
  embedUrl: z.string().url('Please enter a valid URL').optional(),
  embedCode: z.string().max(10000, 'Embed code too long').optional(),
});

/**
 * Custom embed activity schema (with refinement for form validation)
 */
export const customSchema = customSchemaBase.refine(
  (data) => data.embedUrl || data.embedCode,
  { message: 'Either URL or embed code is required', path: ['embedUrl'] }
);

/**
 * Exercise activity schema
 */
export const exerciseSchema = baseMetadataSchema.extend({
  type: z.literal('exercise'),
  settings: z.object({
    showFeedback: z.boolean().optional(),
    shuffleQuestions: z.boolean().optional(),
  }).optional(),
});

/**
 * Assessment activity schema
 */
export const assessmentSchema = baseMetadataSchema.extend({
  type: z.literal('assessment'),
  settings: z.object({
    timeLimit: z.number().min(1).optional(),
    attemptLimit: z.number().min(1).optional(),
    passingScore: z.number().min(0).max(100).optional(),
    showFeedback: z.boolean().optional(),
    shuffleQuestions: z.boolean().optional(),
    shuffleOptions: z.boolean().optional(),
    allowBackNavigation: z.boolean().optional(),
    showCorrectAnswers: z.enum(['never', 'after_submission', 'after_due_date']).optional(),
  }).optional(),
});

/**
 * Assignment activity schema
 */
export const assignmentSchema = baseMetadataSchema.extend({
  type: z.literal('assignment'),
  settings: z.object({
    allowMultipleAttempts: z.boolean().optional(),
    maxAttempts: z.number().min(1).optional(),
  }).optional(),
});

/**
 * Combined activity schema - validates any activity type
 * Note: Uses customSchemaBase (without refine) for discriminated union compatibility
 */
export const activitySchema = z.discriminatedUnion('type', [
  mediaSchema,
  documentSchema,
  scormSchema,
  customSchemaBase,
  exerciseSchema,
  assessmentSchema,
  assignmentSchema,
]);

/**
 * Type exports for form data
 */
export type BaseMetadataFormData = z.infer<typeof baseMetadataSchema>;
export type MediaFormData = z.infer<typeof mediaSchema>;
export type DocumentFormData = z.infer<typeof documentSchema>;
export type SCORMFormData = z.infer<typeof scormSchema>;
export type CustomFormData = z.infer<typeof customSchema>;
export type ExerciseFormData = z.infer<typeof exerciseSchema>;
export type AssessmentFormData = z.infer<typeof assessmentSchema>;
export type AssignmentFormData = z.infer<typeof assignmentSchema>;
export type ActivityFormDataValidated = z.infer<typeof activitySchema>;

/**
 * Get schema for a specific activity type
 */
export function getSchemaForType(type: string) {
  switch (type) {
    case 'media':
      return mediaSchema;
    case 'document':
      return documentSchema;
    case 'scorm':
      return scormSchema;
    case 'custom':
      return customSchema;
    case 'exercise':
      return exerciseSchema;
    case 'assessment':
      return assessmentSchema;
    case 'assignment':
      return assignmentSchema;
    default:
      return baseMetadataSchema;
  }
}
