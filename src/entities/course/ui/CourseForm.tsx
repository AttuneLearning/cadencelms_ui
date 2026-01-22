/**
 * CourseForm Component
 * Comprehensive form for creating or editing courses
 */

import React, { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import { Checkbox } from '@/shared/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card';
import { Alert } from '@/shared/ui/alert';
import type { Course, CreateCoursePayload, UpdateCoursePayload } from '../model/types';
import { Loader2 } from 'lucide-react';

interface CourseFormProps {
  course?: Course;
  onSubmit: (data: CreateCoursePayload | UpdateCoursePayload) => void;
  onCancel: () => void;
  isLoading?: boolean;
  error?: string;
  availablePrograms?: { id: string; name: string; code: string }[];
  programsLoading?: boolean;
}

export const CourseForm: React.FC<CourseFormProps> = ({
  course,
  onSubmit,
  onCancel,
  isLoading = false,
  error,
  availablePrograms = [],
  programsLoading = false,
}) => {
  const [formData, setFormData] = useState({
    title: course?.title || '',
    code: course?.code || '',
    description: course?.description || '',
    department: course?.department?.id || '',
    program: course?.program?.id || '',
    credits: course?.credits || 0,
    duration: course?.duration || 0,
    instructors: course?.instructors?.map((i) => i.id) || [],
    settings: {
      allowSelfEnrollment: course?.settings?.allowSelfEnrollment ?? false,
      passingScore: course?.settings?.passingScore ?? 70,
      maxAttempts: course?.settings?.maxAttempts ?? 3,
      certificateEnabled: course?.settings?.certificateEnabled ?? false,
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      title: formData.title,
      code: formData.code,
      description: formData.description || undefined,
      department: formData.department,
      program: formData.program || undefined,
      credits: formData.credits,
      duration: formData.duration,
      instructors: formData.instructors.length > 0 ? formData.instructors : undefined,
      settings: formData.settings,
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

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            {course ? 'Update the course details below.' : 'Create a new course.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              Course Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Introduction to Web Development"
              required
              disabled={isLoading}
              minLength={1}
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="code">
              Course Code <span className="text-destructive">*</span>
            </Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="e.g., WEB101"
              required
              disabled={isLoading}
              maxLength={35}
              title="Up to 35 letters and numbers"
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Up to 35 letters and numbers
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what students will learn in this course"
              disabled={isLoading}
              maxLength={2000}
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="credits">Credits</Label>
              <Input
                id="credits"
                type="number"
                value={formData.credits}
                onChange={(e) =>
                  setFormData({ ...formData, credits: Number(e.target.value) })
                }
                min={0}
                max={10}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (hours)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) =>
                  setFormData({ ...formData, duration: Number(e.target.value) })
                }
                min={0}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">
              Department <span className="text-destructive">*</span>
            </Label>
            <Input
              id="department"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              placeholder="Department ID"
              required
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Enter the department ID this course belongs to
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="program">Program</Label>
            <Select
              value={formData.program || 'none'}
              onValueChange={(value) =>
                setFormData({ ...formData, program: value === 'none' ? '' : value })
              }
              disabled={isLoading || programsLoading}
            >
              <SelectTrigger id="program">
                <SelectValue placeholder={programsLoading ? 'Loading programs...' : 'Select a program (optional)'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None (No Program)</SelectItem>
                {availablePrograms.map((program) => (
                  <SelectItem key={program.id} value={program.id}>
                    {program.name} ({program.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Optionally assign this course to a program
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Course Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Course Settings</CardTitle>
          <CardDescription>
            Configure enrollment and completion requirements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="allowSelfEnrollment"
              checked={formData.settings.allowSelfEnrollment}
              onCheckedChange={(checked) =>
                setFormData({
                  ...formData,
                  settings: { ...formData.settings, allowSelfEnrollment: checked as boolean },
                })
              }
              disabled={isLoading}
            />
            <Label htmlFor="allowSelfEnrollment" className="cursor-pointer">
              Allow Self-Enrollment
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="passingScore">Passing Score (%)</Label>
            <Input
              id="passingScore"
              type="number"
              value={formData.settings.passingScore}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  settings: { ...formData.settings, passingScore: Number(e.target.value) },
                })
              }
              min={0}
              max={100}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxAttempts">Maximum Attempts</Label>
            <Input
              id="maxAttempts"
              type="number"
              value={formData.settings.maxAttempts}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  settings: { ...formData.settings, maxAttempts: Number(e.target.value) },
                })
              }
              min={1}
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="certificateEnabled"
              checked={formData.settings.certificateEnabled}
              onCheckedChange={(checked) =>
                setFormData({
                  ...formData,
                  settings: { ...formData.settings, certificateEnabled: checked as boolean },
                })
              }
              disabled={isLoading}
            />
            <Label htmlFor="certificateEnabled" className="cursor-pointer">
              Enable Certificate on Completion
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {course ? 'Update Course' : 'Create Course'}
        </Button>
      </div>
    </form>
  );
};
