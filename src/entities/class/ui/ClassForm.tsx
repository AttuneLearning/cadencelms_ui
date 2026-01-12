/**
 * ClassForm Component (Simplified)
 * Basic form for creating and editing classes
 * TODO: Implement full form with date pickers and validation
 */

import React, { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Alert } from '@/shared/ui/alert';
import { Loader2, Save, X } from 'lucide-react';
import type { Class, CreateClassPayload } from '../model/types';

interface ClassFormProps {
  initialClass?: Class;
  onSubmit: (data: CreateClassPayload) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  error?: Error | null;
}

export function ClassForm({
  initialClass,
  onSubmit,
  onCancel,
  isLoading = false,
  error = null,
}: ClassFormProps) {
  const [formData, setFormData] = useState({
    name: initialClass?.name || '',
    course: initialClass?.course?.id || '',
    program: initialClass?.program?.id || '',
    instructors: initialClass?.instructors || [],
    startDate: initialClass?.startDate || new Date(),
    endDate: initialClass?.endDate || new Date(),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData as any);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <p>{error.message || 'Failed to save class'}</p>
        </Alert>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">
            Class Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter class name"
            required
            disabled={isLoading}
          />
        </div>

        {/* TODO: Add more fields */}
        <div className="text-sm text-muted-foreground">
          Additional fields (course, program, dates, etc.) coming soon...
        </div>
      </div>

      <div className="flex gap-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          <Save className="h-4 w-4 mr-2" />
          {initialClass ? 'Update' : 'Create'} Class
        </Button>
      </div>
    </form>
  );
}
