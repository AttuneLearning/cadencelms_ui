/**
 * Grade Override Dialog
 * Allows dept-admin to override student grades with mandatory reason
 *
 * Features:
 * - Displays current grade (read-only)
 * - Input for new grade (percentage, letter, or points)
 * - Required reason field (10-1000 chars with counter)
 * - Real-time validation
 * - Confirmation step before submission
 */

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { Card } from '@/shared/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/alert-dialog';
import { useToast } from '@/shared/ui/use-toast';
import { Loader2, Edit, AlertTriangle } from 'lucide-react';
import {
  useOverrideGrade,
  VALID_GRADE_LETTERS,
  GRADE_OVERRIDE_VALIDATION,
  type CurrentGrade,
  type GradeOverrideFormValues,
} from '@/entities/enrollment';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form';

// =====================
// VALIDATION SCHEMA
// =====================

const gradeOverrideSchema = z.object({
  gradeLetter: z.string().optional(),
  gradePercentage: z
    .number()
    .min(GRADE_OVERRIDE_VALIDATION.PERCENTAGE_MIN, 'Percentage must be at least 0')
    .max(GRADE_OVERRIDE_VALIDATION.PERCENTAGE_MAX, 'Percentage must be at most 100')
    .optional()
    .or(z.literal('')),
  gradePoints: z
    .number()
    .min(GRADE_OVERRIDE_VALIDATION.POINTS_MIN, 'Points must be at least 0')
    .max(GRADE_OVERRIDE_VALIDATION.POINTS_MAX, 'Points must be at most 4.0')
    .optional()
    .or(z.literal('')),
  reason: z
    .string()
    .min(
      GRADE_OVERRIDE_VALIDATION.REASON_MIN_LENGTH,
      `Reason must be at least ${GRADE_OVERRIDE_VALIDATION.REASON_MIN_LENGTH} characters`
    )
    .max(
      GRADE_OVERRIDE_VALIDATION.REASON_MAX_LENGTH,
      `Reason must be at most ${GRADE_OVERRIDE_VALIDATION.REASON_MAX_LENGTH} characters`
    ),
}).refine(
  (data) => {
    // At least one grade field must be provided
    return (
      data.gradeLetter ||
      (data.gradePercentage !== undefined && data.gradePercentage !== '') ||
      (data.gradePoints !== undefined && data.gradePoints !== '')
    );
  },
  {
    message: 'At least one grade field (letter, percentage, or points) must be provided',
    path: ['gradeLetter'], // Show error on first field
  }
);

// =====================
// COMPONENT PROPS
// =====================

interface GradeOverrideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  enrollmentId: string;
  currentGrade: CurrentGrade;
  studentName: string;
  onSuccess?: () => void;
}

// =====================
// HELPER FUNCTIONS
// =====================

const formatGradeDisplay = (grade: CurrentGrade): string => {
  const parts: string[] = [];

  if (grade.percentage !== null && grade.percentage !== undefined) {
    parts.push(`${grade.percentage}%`);
  }

  if (grade.letter) {
    parts.push(grade.letter);
  }

  if (grade.points !== null && grade.points !== undefined) {
    parts.push(`${grade.points.toFixed(1)} pts`);
  }

  return parts.length > 0 ? parts.join(' / ') : 'No grade set';
};

// =====================
// MAIN COMPONENT
// =====================

export const GradeOverrideDialog: React.FC<GradeOverrideDialogProps> = ({
  open,
  onOpenChange,
  enrollmentId,
  currentGrade,
  studentName,
  onSuccess,
}) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [formData, setFormData] = useState<GradeOverrideFormValues | null>(null);
  const { toast } = useToast();

  const overrideMutation = useOverrideGrade();

  const form = useForm<GradeOverrideFormValues>({
    resolver: zodResolver(gradeOverrideSchema),
    mode: 'onChange',
    defaultValues: {
      gradeLetter: '',
      gradePercentage: undefined,
      gradePoints: undefined,
      reason: '',
    },
  });

  const reason = form.watch('reason');
  const reasonLength = reason?.length || 0;

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      form.reset();
      setShowConfirmation(false);
      setFormData(null);
    }
  }, [open, form]);

  // Handle form submission (show confirmation first)
  const onSubmit = (data: GradeOverrideFormValues) => {
    setFormData(data);
    setShowConfirmation(true);
  };

  // Handle confirmed grade override
  const handleConfirmedOverride = async () => {
    if (!formData) return;

    try {
      // Prepare payload (remove empty values)
      const payload: any = {
        reason: formData.reason,
      };

      if (formData.gradeLetter) {
        payload.gradeLetter = formData.gradeLetter;
      }

      if (formData.gradePercentage !== undefined && formData.gradePercentage !== '') {
        payload.gradePercentage = formData.gradePercentage;
      }

      if (formData.gradePoints !== undefined && formData.gradePoints !== '') {
        payload.gradePoints = formData.gradePoints;
      }

      // Execute mutation
      const result = await overrideMutation.mutateAsync({
        enrollmentId,
        payload,
      });

      // Success toast with change summary
      const changes: string[] = [];

      if (result.gradeChanges.gradePercentage) {
        changes.push(
          `Percentage: ${result.gradeChanges.gradePercentage.previous}% → ${result.gradeChanges.gradePercentage.new}%`
        );
      }

      if (result.gradeChanges.gradeLetter) {
        changes.push(
          `Letter: ${result.gradeChanges.gradeLetter.previous || 'None'} → ${result.gradeChanges.gradeLetter.new}`
        );
      }

      if (result.gradeChanges.gradePoints) {
        changes.push(
          `Points: ${result.gradeChanges.gradePoints.previous} → ${result.gradeChanges.gradePoints.new}`
        );
      }

      toast({
        title: 'Grade overridden successfully',
        description: (
          <div className="space-y-1">
            <p className="font-medium">{studentName}</p>
            {changes.map((change, idx) => (
              <p key={idx} className="text-sm">
                {change}
              </p>
            ))}
            <p className="text-xs text-muted-foreground mt-2">
              Override by {result.overrideByName} at {new Date(result.overrideAt).toLocaleString()}
            </p>
          </div>
        ),
      });

      // Close dialogs and trigger success callback
      setShowConfirmation(false);
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to override grade',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Override Grade for {studentName}</DialogTitle>
            <DialogDescription>
              Override the student's grade with a mandatory explanation. This action will be logged
              in the audit trail.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Current Grade Display */}
              <Card className="p-4 bg-muted/50">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Current Grade</p>
                  <p className="text-2xl font-bold">{formatGradeDisplay(currentGrade)}</p>
                  {currentGrade.gradedAt && (
                    <p className="text-xs text-muted-foreground">
                      Graded on {new Date(currentGrade.gradedAt).toLocaleDateString()}
                      {currentGrade.gradedBy &&
                        ` by ${currentGrade.gradedBy.firstName} ${currentGrade.gradedBy.lastName}`}
                    </p>
                  )}
                </div>
              </Card>

              {/* New Grade Inputs */}
              <div className="space-y-4">
                <div>
                  <p className="text-base font-semibold">New Grade</p>
                  <p className="text-sm text-muted-foreground">
                    Provide at least one grade field (percentage, letter, or points)
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  {/* Grade Percentage */}
                  <FormField
                    control={form.control}
                    name="gradePercentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Percentage (0-100)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={GRADE_OVERRIDE_VALIDATION.PERCENTAGE_MIN}
                            max={GRADE_OVERRIDE_VALIDATION.PERCENTAGE_MAX}
                            step="0.01"
                            placeholder="85"
                            value={field.value ?? ''}
                            onChange={(event) => {
                              const value = event.target.value;
                              field.onChange(value === '' ? '' : Number(value));
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Grade Letter */}
                  <FormField
                    control={form.control}
                    name="gradeLetter"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Letter Grade</FormLabel>
                        <Select value={field.value || ''} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select grade" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {VALID_GRADE_LETTERS.map((letter) => (
                              <SelectItem key={letter} value={letter}>
                                {letter}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Grade Points */}
                  <FormField
                    control={form.control}
                    name="gradePoints"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Points (0-4.0)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={GRADE_OVERRIDE_VALIDATION.POINTS_MIN}
                            max={GRADE_OVERRIDE_VALIDATION.POINTS_MAX}
                            step="0.1"
                            placeholder="4.0"
                            value={field.value ?? ''}
                            onChange={(event) => {
                              const value = event.target.value;
                              field.onChange(value === '' ? '' : Number(value));
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Reason Field */}
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>
                        Reason for Override <span className="text-destructive">*</span>
                      </FormLabel>
                      <span
                        className={`text-xs ${
                          reasonLength < GRADE_OVERRIDE_VALIDATION.REASON_MIN_LENGTH
                            ? 'text-destructive'
                            : reasonLength > GRADE_OVERRIDE_VALIDATION.REASON_MAX_LENGTH
                              ? 'text-destructive'
                              : 'text-muted-foreground'
                        }`}
                      >
                        {reasonLength} / {GRADE_OVERRIDE_VALIDATION.REASON_MAX_LENGTH}
                      </span>
                    </div>
                    <FormControl>
                      <Textarea
                        rows={4}
                        placeholder="Explain the reason for this grade override (e.g., 'Grade appeal approved by academic committee after review of exam 2.')..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Minimum {GRADE_OVERRIDE_VALIDATION.REASON_MIN_LENGTH} characters required. This
                      reason will be permanently logged in the audit trail.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Actions */}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!form.formState.isValid || overrideMutation.isPending}>
                  {overrideMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Edit className="mr-2 h-4 w-4" />
                      Override Grade
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Confirm Grade Override
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to override this grade? This action will be permanently logged
              in the audit trail and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {formData && (
            <div className="space-y-2 rounded-md bg-muted p-4">
              <p className="text-sm font-medium">Student: {studentName}</p>

              <div className="text-sm">
                <p className="font-medium">Changes:</p>
                <ul className="ml-4 list-disc space-y-1">
                  {formData.gradePercentage && <li>Percentage: {formData.gradePercentage}%</li>}
                  {formData.gradeLetter && <li>Letter: {formData.gradeLetter}</li>}
                  {formData.gradePoints && <li>Points: {formData.gradePoints}</li>}
                </ul>
              </div>

              <div className="text-sm">
                <p className="font-medium">Reason:</p>
                <p className="mt-1 text-muted-foreground italic">"{formData.reason}"</p>
              </div>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmedOverride}
              disabled={overrideMutation.isPending}
            >
              {overrideMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Confirm Override'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
