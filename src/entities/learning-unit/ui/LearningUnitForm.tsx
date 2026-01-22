/**
 * LearningUnitForm Component
 * Form for creating or editing learning units
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
import { Loader2 } from 'lucide-react';
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
    type: learningUnit?.type || 'video' as LearningUnitType,
    contentId: learningUnit?.contentId || '',
    category: learningUnit?.category || 'exposition' as LearningUnitCategory,
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
      type: formData.type,
      contentId: formData.contentId || undefined,
      category: formData.category,
      isRequired: formData.isRequired,
      isReplayable: formData.isReplayable,
      weight: formData.weight,
      estimatedDuration: formData.estimatedDuration || undefined,
      settings: formData.category === 'assessment' ? formData.settings : undefined,
    };

    onSubmit(payload);
  };

  const getTypeOptions = (): { value: LearningUnitType; label: string }[] => {
    switch (formData.category) {
      case 'exposition':
        return [
          { value: 'video', label: 'Video' },
          { value: 'document', label: 'Document' },
          { value: 'scorm', label: 'SCORM Package' },
          { value: 'custom', label: 'Custom Content' },
        ];
      case 'practice':
        return [
          { value: 'exercise', label: 'Exercise' },
          { value: 'custom', label: 'Custom Practice' },
        ];
      case 'assessment':
        return [
          { value: 'assessment', label: 'Quiz/Exam' },
          { value: 'exercise', label: 'Graded Exercise' },
        ];
      default:
        return [];
    }
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
            {learningUnit ? 'Update the learning unit.' : 'Create a new learning unit.'}
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
            <Label>Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value: LearningUnitCategory) => {
                const newType = value === 'assessment' ? 'assessment' : value === 'practice' ? 'exercise' : 'video';
                setFormData({
                  ...formData,
                  category: value,
                  type: newType as LearningUnitType,
                });
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="exposition">Exposition (Instructional Content)</SelectItem>
                <SelectItem value="practice">Practice (Exercises)</SelectItem>
                <SelectItem value="assessment">Assessment (Quizzes/Exams)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {formData.category === 'exposition' && 'Instructional content like videos, documents, presentations.'}
              {formData.category === 'practice' && 'Practice exercises for skill building.'}
              {formData.category === 'assessment' && 'Evaluations to measure learner knowledge.'}
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
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {getTypeOptions().map((opt) => (
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

      {/* Assessment Settings (only for assessment category) */}
      {formData.category === 'assessment' && (
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
        <Button type="submit" disabled={isLoading || !formData.title.trim()}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {learningUnit ? 'Update Learning Unit' : 'Create Learning Unit'}
        </Button>
      </div>
    </form>
  );
};
