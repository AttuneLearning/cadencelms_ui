/**
 * Program Level Form Component
 * Form for creating and editing program levels
 */

import { useState, useEffect } from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { AlertCircle } from 'lucide-react';
import type { ProgramLevelFormData } from '../model/types';

interface ProgramLevelFormProps {
  initialData?: Partial<ProgramLevelFormData>;
  onSubmit: (data: ProgramLevelFormData) => void;
  onCancel?: () => void;
  loading?: boolean;
  error?: string | null;
  mode?: 'create' | 'edit';
}

export function ProgramLevelForm({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
  error = null,
  mode = 'create',
}: ProgramLevelFormProps) {
  const [formData, setFormData] = useState<ProgramLevelFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    requiredCredits: initialData?.requiredCredits,
    courses: initialData?.courses || [],
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        requiredCredits: initialData.requiredCredits,
        courses: initialData.courses || [],
      });
    }
  }, [initialData]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Name validation (required, 1-200 characters)
    if (!formData.name.trim()) {
      errors.name = 'Level name is required';
    } else if (formData.name.length > 200) {
      errors.name = 'Level name must be 200 characters or less';
    }

    // Description validation (optional, max 2000 characters)
    if (formData.description && formData.description.length > 2000) {
      errors.description = 'Description must be 2000 characters or less';
    }

    // Required credits validation (optional, must be >= 0)
    if (formData.requiredCredits !== undefined && formData.requiredCredits !== null) {
      if (formData.requiredCredits < 0) {
        errors.requiredCredits = 'Required credits must be 0 or greater';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Prepare payload - remove empty strings and undefined values
    const payload: ProgramLevelFormData = {
      name: formData.name.trim(),
    };

    if (formData.description?.trim()) {
      payload.description = formData.description.trim();
    }

    if (formData.requiredCredits !== undefined && formData.requiredCredits !== null) {
      payload.requiredCredits = formData.requiredCredits;
    }

    if (formData.courses && formData.courses.length > 0) {
      payload.courses = formData.courses;
    }

    onSubmit(payload);
  };

  const handleChange = (field: keyof ProgramLevelFormData, value: string | number | string[]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">
          Level Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="e.g., Level 1: Foundation, Year 1, Beginner Level"
          maxLength={200}
          disabled={loading}
          className={validationErrors.name ? 'border-destructive' : ''}
        />
        {validationErrors.name && (
          <p className="text-sm text-destructive">{validationErrors.name}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Descriptive name for this level within the program (1-200 characters)
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Describe what learners will accomplish in this level..."
          rows={4}
          maxLength={2000}
          disabled={loading}
          className={validationErrors.description ? 'border-destructive' : ''}
        />
        {validationErrors.description && (
          <p className="text-sm text-destructive">{validationErrors.description}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Optional description of this level (max 2000 characters)
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="requiredCredits">Required Credits</Label>
        <Input
          id="requiredCredits"
          type="number"
          min={0}
          step={1}
          value={formData.requiredCredits !== undefined && formData.requiredCredits !== null ? formData.requiredCredits : ''}
          onChange={(e) => {
            const value = e.target.value === '' ? undefined : parseInt(e.target.value, 10);
            handleChange('requiredCredits', value as number);
          }}
          placeholder="e.g., 15, 18, 24"
          disabled={loading}
          className={validationErrors.requiredCredits ? 'border-destructive' : ''}
        />
        {validationErrors.requiredCredits && (
          <p className="text-sm text-destructive">{validationErrors.requiredCredits}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Optional number of credits required to complete this level
        </p>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : mode === 'create' ? 'Create Level' : 'Update Level'}
        </Button>
      </div>
    </form>
  );
}
