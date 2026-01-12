/**
 * TemplateForm Component
 * Form for creating and editing templates
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import { Switch } from '@/shared/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card';
import { Alert } from '@/shared/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import type { Template, CreateTemplatePayload, UpdateTemplatePayload, TemplateType, TemplateStatus } from '../model/types';
import { Loader2 } from 'lucide-react';

interface TemplateFormProps {
  template?: Template;
  onSubmit: (data: CreateTemplatePayload | UpdateTemplatePayload) => void;
  onCancel: () => void;
  isLoading?: boolean;
  error?: string;
  departments?: Array<{ id: string; name: string }>;
}

export const TemplateForm: React.FC<TemplateFormProps> = ({
  template,
  onSubmit,
  onCancel,
  isLoading = false,
  error,
  departments = [],
}) => {
  const [formData, setFormData] = useState({
    name: template?.name || '',
    type: (template?.type || 'custom') as TemplateType,
    css: template?.css || '',
    html: template?.html || '',
    department: template?.department || '',
    isGlobal: template?.isGlobal || false,
    status: (template?.status || 'draft') as TemplateStatus,
  });

  const isDepartmentType = formData.type === 'department';
  const isMasterType = formData.type === 'master';
  const isEditing = !!template;

  // Reset department field when type changes from department to something else
  useEffect(() => {
    if (!isDepartmentType) {
      setFormData((prev) => ({ ...prev, department: '' }));
    }
    if (!isMasterType) {
      setFormData((prev) => ({ ...prev, isGlobal: false }));
    }
  }, [isDepartmentType, isMasterType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: CreateTemplatePayload | UpdateTemplatePayload = {
      name: formData.name,
      css: formData.css || undefined,
      html: formData.html || undefined,
      status: formData.status,
    };

    if (!isEditing) {
      // Create payload
      (payload as CreateTemplatePayload).type = formData.type;
      if (isDepartmentType && formData.department) {
        (payload as CreateTemplatePayload).department = formData.department;
      }
      if (isMasterType) {
        (payload as CreateTemplatePayload).isGlobal = formData.isGlobal;
      }
    } else {
      // Update payload
      if (isMasterType) {
        (payload as UpdateTemplatePayload).isGlobal = formData.isGlobal;
      }
    }

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <p>{error}</p>
        </Alert>
      )}

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            {isEditing ? 'Update the template details below.' : 'Create a new template.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Template Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Computer Science Department Template"
              required
              disabled={isLoading}
              minLength={1}
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground">
              A descriptive name for your template (max 200 characters)
            </p>
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label htmlFor="type">
              Template Type <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.type}
              onValueChange={(value: TemplateType) => setFormData({ ...formData, type: value })}
              disabled={isEditing || isLoading}
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="Select template type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="custom">Custom</SelectItem>
                <SelectItem value="department">Department</SelectItem>
                <SelectItem value="master">Master</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {formData.type === 'master' &&
                'Global templates (admin only, applies across institution)'}
              {formData.type === 'department' &&
                'Department-specific templates (department admins)'}
              {formData.type === 'custom' && 'Individual instructor templates'}
            </p>
            {isEditing && (
              <p className="text-xs text-amber-600">
                Template type cannot be changed after creation
              </p>
            )}
          </div>

          {/* Department (only for department type) */}
          {isDepartmentType && (
            <div className="space-y-2">
              <Label htmlFor="department">
                Department <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.department}
                onValueChange={(value) => setFormData({ ...formData, department: value })}
                disabled={isEditing || isLoading}
              >
                <SelectTrigger id="department">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Required for department templates
              </p>
              {isEditing && (
                <p className="text-xs text-amber-600">
                  Department cannot be changed after creation
                </p>
              )}
            </div>
          )}

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: TemplateStatus) => setFormData({ ...formData, status: value })}
              disabled={isLoading}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Draft templates are not visible to other users
            </p>
          </div>

          {/* Global (only for master type) */}
          {isMasterType && (
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="isGlobal" className="text-base">
                  Global Visibility
                </Label>
                <p className="text-xs text-muted-foreground">
                  Make this template visible across the entire institution
                </p>
              </div>
              <Switch
                id="isGlobal"
                checked={formData.isGlobal}
                onCheckedChange={(checked) => setFormData({ ...formData, isGlobal: checked })}
                disabled={isLoading}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* CSS & HTML */}
      <Card>
        <CardHeader>
          <CardTitle>Template Content</CardTitle>
          <CardDescription>
            Define the CSS styles and HTML structure for your template
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* CSS */}
          <div className="space-y-2">
            <Label htmlFor="css">CSS Styles</Label>
            <Textarea
              id="css"
              value={formData.css}
              onChange={(e) => setFormData({ ...formData, css: e.target.value })}
              placeholder="Enter CSS stylesheet content..."
              className="min-h-[200px] font-mono text-sm"
              disabled={isLoading}
              maxLength={50000}
            />
            <p className="text-xs text-muted-foreground">
              CSS styles for your template (max 50,000 characters)
            </p>
          </div>

          {/* HTML */}
          <div className="space-y-2">
            <Label htmlFor="html">HTML Structure</Label>
            <Textarea
              id="html"
              value={formData.html}
              onChange={(e) => setFormData({ ...formData, html: e.target.value })}
              placeholder="Enter HTML structure with placeholders..."
              className="min-h-[300px] font-mono text-sm"
              disabled={isLoading}
              maxLength={100000}
            />
            <p className="text-xs text-muted-foreground">
              HTML structure with placeholders: {'{{'}courseTitle{'}}'},
              {' '}{'{{'}courseCode{'}}'},
              {' '}{'{{'}content{'}}'},
              {' '}{'{{'}instructorName{'}}'},
              {' '}{'{{'}departmentName{'}}'} (max 100,000 characters)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? 'Update Template' : 'Create Template'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
      </div>
    </form>
  );
};
