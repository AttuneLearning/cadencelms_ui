/**
 * Course Form Validation Schema
 */

import { z } from 'zod';

export const courseFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  description: z.string().min(1, 'Description is required'),
  shortDescription: z.string().max(500, 'Short description is too long').optional(),
  thumbnail: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  prerequisites: z.array(z.string()).optional(),
  learningObjectives: z.array(z.string()).optional(),
});

export type CourseFormValues = z.infer<typeof courseFormSchema>;
