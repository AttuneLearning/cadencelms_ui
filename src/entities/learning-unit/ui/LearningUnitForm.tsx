/**
 * LearningUnitForm Component
 * Form for creating or editing learning units
 */

import React, { useEffect, useMemo, useState } from 'react';
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
import { Loader2 } from 'lucide-react';
import { useLookupValues } from '@/entities/lookup-value';
import type {
  LearningUnit,
  CreateLearningUnitPayload,
  UpdateLearningUnitPayload,
  LearningUnitType,
  LearningUnitCategory,
} from '../model/types';

interface LearningUnitFormProps {
  learningUnit?: LearningUnit;
  onSubmit: (data: CreateLearningUnitPayload | UpdateLearningUnitPayload) => void;
  onCancel: () => void;
  isLoading?: boolean;
  error?: string;
  availableContent?: { id: string; title: string; type: LearningUnitType }[];
  availableAssessments?: { id: string; title: string }[];
}

export const LearningUnitForm: React.FC<LearningUnitFormProps> = ({
  learningUnit,
  onSubmit,
  onCancel,
  isLoading = false,
  error,
  availableContent: _availableContent = [],
  availableAssessments = [],
}) => {
  const [formData, setFormData] = useState({
    title: learningUnit?.title || '',
    description: learningUnit?.description || '',
    type: (learningUnit?.type || '') as LearningUnitType | '',
    contentId: learningUnit?.contentId || '',
    category: learningUnit?.category ?? null as LearningUnitCategory | null,
    isRequired: learningUnit?.isRequired ?? true,
    isReplayable: learningUnit?.isReplayable ?? false,
    weight: learningUnit?.weight ?? 0,
    estimatedDuration: learningUnit?.estimatedDuration || 0,
    settings: {
      allowMultipleAttempts: learningUnit?.settings?.allowMultipleAttempts ?? true,
      maxAttempts: learningUnit?.settings?.maxAttempts || undefined,
      timeLimit: learningUnit?.settings?.timeLimit || undefined,
      showFeedback: learningUnit?.settings?.showFeedback ?? true,
      shuffleQuestions: learningUnit?.settings?.shuffleQuestions ?? false,
      passingScore: learningUnit?.settings?.passingScore || 70,
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: CreateLearningUnitPayload = {
      title: formData.title,
      description: formData.description || undefined,
      type: (formData.type || 'media') as LearningUnitType,
      contentId: formData.contentId || undefined,
      category: formData.category ?? undefined,
      isRequired: formData.isRequired,
      isReplayable: formData.isReplayable,
      weight: formData.weight,
      estimatedDuration: formData.estimatedDuration || undefined,
      settings: formData.type === 'assessment' ? formData.settings : undefined,
    };

    onSubmit(payload);
  };

  const { data: typeLookupData } = useLookupValues({
    category: 'learning-unit-type',
    isActive: true,
  });

  const { data: categoryLookupData } = useLookupValues({
    category: 'learning-unit-category',
    isActive: true,
  });

  const fallbackTypeOptions: Array<{ value: LearningUnitType; label: string }> = [
    { value: 'media', label: 'Media' },
    { value: 'document', label: 'Document' },
    { value: 'scorm', label: 'SCORM Package' },
    { value: 'custom', label: 'Custom' },
    { value: 'exercise', label: 'Exercise' },
    { value: 'assessment', label: 'Assessment' },
    { value: 'assignment', label: 'Assignment' },
  ];

  const typeOptions = useMemo(() => {
    if (typeLookupData?.values?.length) {
      return typeLookupData.values.map((value) => ({
        value: value.key as LearningUnitType,
        label: value.displayAs,
      }));
    }
    return fallbackTypeOptions;
  }, [typeLookupData, fallbackTypeOptions]);

  const categoryOptions = useMemo(() => {
    if (categoryLookupData?.values?.length) {
      return categoryLookupData.values.map((value) => ({
        value: value.key as LearningUnitCategory,
        label: value.displayAs,
      }));
    }
    return [
      { value: 'topic', label: 'Topic' },
      { value: 'practice', label: 'Practice' },
      { value: 'assignment', label: 'Assignment' },
      { value: 'graded', label: 'Graded' },
    ];
  }, [categoryLookupData]);

  useEffect(() => {
    if (!formData.type && typeOptions.length > 0) {
      setFormData((prev) => ({
        ...prev,
        type: typeOptions[0].value,
      }));
    }
  }, [formData.type, typeOptions]);

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
            {learningUnit ? 'Update the learning activity.' : 'Create a new learning activity.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter learning unit title"
              required
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter description"
              maxLength={2000}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Category (optional)</Label>
            <Select
              value={formData.category ?? 'none'}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  category: value === 'none' ? null : (value as LearningUnitCategory),
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {categoryOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Optional grouping label. Leave blank if this activity does not need a category.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Content Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value: LearningUnitType) =>
                setFormData({ ...formData, type: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a content type" />
              </SelectTrigger>
              <SelectContent>
                {typeOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {formData.type === 'assessment' && availableAssessments.length > 0 && (
            <div className="space-y-2">
              <Label>Select Assessment</Label>
              <Select
                value={formData.contentId}
                onValueChange={(value) => setFormData({ ...formData, contentId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose an assessment" />
                </SelectTrigger>
                <SelectContent>
                  {availableAssessments.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Estimated Duration (minutes)</Label>
            <Input
              type="number"
              min={0}
              value={formData.estimatedDuration || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  estimatedDuration: parseInt(e.target.value) || 0,
                })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Completion Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Completion Settings</CardTitle>
          <CardDescription>Configure how this unit contributes to module completion.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Weight (0-100)</Label>
            <Input
              type="number"
              min={0}
              max={100}
              value={formData.weight}
              onChange={(e) =>
                setFormData({ ...formData, weight: parseInt(e.target.value) || 0 })
              }
            />
            <p className="text-xs text-muted-foreground">
              Weight for percentage-based module completion calculation.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isRequired"
              checked={formData.isRequired}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isRequired: !!checked })
              }
            />
            <Label htmlFor="isRequired">Required for module completion</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isReplayable"
              checked={formData.isReplayable}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isReplayable: !!checked })
              }
            />
            <Label htmlFor="isReplayable">Allow replay after completion</Label>
          </div>
        </CardContent>
      </Card>

      {/* Assessment Settings (only for assessment type) */}
      {formData.type === 'assessment' && (
        <Card>
          <CardHeader>
            <CardTitle>Assessment Settings</CardTitle>
            <CardDescription>Configure assessment behavior for this unit.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Time Limit (minutes)</Label>
                <Input
                  type="number"
                  min={0}
                  value={formData.settings.timeLimit || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      settings: {
                        ...formData.settings,
                        timeLimit: parseInt(e.target.value) || undefined,
                      },
                    })
                  }
                  placeholder="No limit"
                />
              </div>

              <div className="space-y-2">
                <Label>Passing Score (%)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={formData.settings.passingScore || 70}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      settings: {
                        ...formData.settings,
                        passingScore: parseInt(e.target.value) || 70,
                      },
                    })
                  }
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="allowMultipleAttempts"
                checked={formData.settings.allowMultipleAttempts}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    settings: { ...formData.settings, allowMultipleAttempts: !!checked },
                  })
                }
              />
              <Label htmlFor="allowMultipleAttempts">Allow multiple attempts</Label>
            </div>

            {formData.settings.allowMultipleAttempts && (
              <div className="space-y-2">
                <Label>Maximum Attempts</Label>
                <Input
                  type="number"
                  min={1}
                  value={formData.settings.maxAttempts || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      settings: {
                        ...formData.settings,
                        maxAttempts: parseInt(e.target.value) || undefined,
                      },
                    })
                  }
                  placeholder="Unlimited"
                />
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="showFeedback"
                checked={formData.settings.showFeedback}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    settings: { ...formData.settings, showFeedback: !!checked },
                  })
                }
              />
              <Label htmlFor="showFeedback">Show feedback on answers</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="shuffleQuestions"
                checked={formData.settings.shuffleQuestions}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    settings: { ...formData.settings, shuffleQuestions: !!checked },
                  })
                }
              />
              <Label htmlFor="shuffleQuestions">Shuffle questions</Label>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading || !formData.title.trim() || !formData.type}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {learningUnit ? 'Update Learning Activity' : 'Create Learning Activity'}
        </Button>
      </div>
    </form>
  );
};
