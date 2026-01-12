/**
 * AcademicYearForm Component
 * Form for creating or editing academic years
 * Note: Terms are managed separately via their own endpoints
 */

import React, { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Checkbox } from '@/shared/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card';
import { Alert } from '@/shared/ui/alert';
import type { AcademicYear, CreateYearPayload, UpdateYearPayload } from '../model/types';
import { Loader2 } from 'lucide-react';

interface AcademicYearFormProps {
  academicYear?: AcademicYear;
  onSubmit: (data: CreateYearPayload | UpdateYearPayload) => void;
  onCancel: () => void;
  isLoading?: boolean;
  error?: string;
}

export const AcademicYearForm: React.FC<AcademicYearFormProps> = ({
  academicYear,
  onSubmit,
  onCancel,
  isLoading = false,
  error,
}) => {
  const [formData, setFormData] = useState({
    name: academicYear?.name || '',
    startDate: academicYear?.startDate
      ? new Date(academicYear.startDate).toISOString().split('T')[0]
      : '',
    endDate: academicYear?.endDate
      ? new Date(academicYear.endDate).toISOString().split('T')[0]
      : '',
    isCurrent: academicYear?.isCurrent ?? false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Convert dates to ISO 8601 format
    const payload = {
      name: formData.name,
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString(),
      isCurrent: formData.isCurrent,
    };

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <p>{error}</p>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Academic Year Information</CardTitle>
          <CardDescription>
            {academicYear
              ? 'Update the academic year details below.'
              : 'Create a new academic year. Terms can be added after creation.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., 2025-2026 Academic Year"
              required
              disabled={isLoading}
              minLength={1}
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground">
              A descriptive name for the academic year
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startDate">
                Start Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">
                End Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
                disabled={isLoading}
                min={formData.startDate}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isCurrent"
              checked={formData.isCurrent}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isCurrent: checked as boolean })
              }
              disabled={isLoading}
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="isCurrent" className="cursor-pointer">
                Set as Current Academic Year
              </Label>
              <p className="text-xs text-muted-foreground">
                Only one academic year can be current at a time. Setting this will automatically unset the previous current year.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {academicYear && (
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="font-medium text-foreground capitalize">{academicYear.status}</span>
            </div>
            <div className="flex justify-between">
              <span>Terms:</span>
              <span className="font-medium text-foreground">{academicYear.termCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Created:</span>
              <span className="font-medium text-foreground">
                {new Date(academicYear.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Last Updated:</span>
              <span className="font-medium text-foreground">
                {new Date(academicYear.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {academicYear ? 'Update' : 'Create'} Academic Year
        </Button>
      </div>
    </form>
  );
};
