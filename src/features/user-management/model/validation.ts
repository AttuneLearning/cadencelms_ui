/**
 * User Form Validation Schema
 */

import { z } from 'zod';

export const userFormSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(1, 'First name is required').max(50, 'First name is too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name is too long'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .optional()
    .or(z.literal('')),
  roles: z.array(z.enum(['learner', 'staff', 'global-admin'])).min(1, 'At least one role is required'),
  status: z.enum(['active', 'inactive', 'suspended']),
  phoneNumber: z.string().optional(),
  department: z.string().optional(),
  jobTitle: z.string().optional(),
});

export type UserFormValues = z.infer<typeof userFormSchema>;
