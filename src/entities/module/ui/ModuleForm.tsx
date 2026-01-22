/**
 * ModuleForm Component
 * Form for creating or editing modules
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
import { Loader2, Plus, X } from 'lucide-react';
import type {
  Module,
  CreateModulePayload,
  UpdateModulePayload,
  CompletionCriteriaType,
  PresentationMode,
  RepetitionMode,
} from '../model/types';

interface ModuleFormProps {
  module?: Module;
  onSubmit: (data: CreateModulePayload | UpdateModulePayload) => void;
  onCancel: () => void;
  isLoading?: boolean;
  error?: string;
  availableModules?: { id: string; title: string }[];
}

export const ModuleForm: React.FC<ModuleFormProps> = ({
  module,
  onSubmit,
  onCancel,
  isLoading = false,
  error,
  availableModules = [],
}) => {
  const [formData, setFormData] = useState({
    title: module?.title || '',
    description: module?.description || '',
    prerequisites: (module?.prerequisites as string[]) || [],
    estimatedDuration: module?.estimatedDuration || 0,
    objectives: module?.objectives || [],
    isPublished: module?.isPublished ?? false,
    completionCriteria: {
      type: module?.completionCriteria?.type || 'all_required' as CompletionCriteriaType,
      percentageRequired: module?.completionCriteria?.percentageRequired || 80,
      pointsRequired: module?.completionCriteria?.pointsRequired || 100,
      gateLearningUnitScore: module?.completionCriteria?.gateLearningUnitScore || 70,
      requireAllExpositions: module?.completionCriteria?.requireAllExpositions ?? false,
    },
    presentationRules: {
      presentationMode: module?.presentationRules?.presentationMode || 'learner_choice' as PresentationMode,
      repetitionMode: module?.presentationRules?.repetitionMode || 'none' as RepetitionMode,
      masteryThreshold: module?.presentationRules?.masteryThreshold || 80,
      maxRepetitions: module?.presentationRules?.maxRepetitions || 3,
      showAllAvailable: module?.presentationRules?.showAllAvailable ?? true,
      allowSkip: module?.presentationRules?.allowSkip ?? false,
    },
  });

  const [newObjective, setNewObjective] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: CreateModulePayload | UpdateModulePayload = {
      title: formData.title,
      description: formData.description || undefined,
      prerequisites: formData.prerequisites.length > 0 ? formData.prerequisites : undefined,
      estimatedDuration: formData.estimatedDuration || undefined,
      objectives: formData.objectives.length > 0 ? formData.objectives : undefined,
      isPublished: formData.isPublished,
      completionCriteria: formData.completionCriteria,
      presentationRules: formData.presentationRules,
    };

    onSubmit(payload);
  };

  const addObjective = () => {
    if (newObjective.trim()) {
      setFormData({
        ...formData,
        objectives: [...formData.objectives, newObjective.trim()],
      });
      setNewObjective('');
    }
  };

  const removeObjective = (index: number) => {
    setFormData({
      ...formData,
      objectives: formData.objectives.filter((_, i) => i !== index),
    });
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
            {module ? 'Update the module details.' : 'Create a new module.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              Module Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter module title"
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
              placeholder="Enter module description"
              maxLength={2000}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Estimated Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              min={0}
              value={formData.estimatedDuration}
              onChange={(e) => setFormData({ ...formData, estimatedDuration: parseInt(e.target.value) || 0 })}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isPublished"
              checked={formData.isPublished}
              onCheckedChange={(checked) => setFormData({ ...formData, isPublished: !!checked })}
            />
            <Label htmlFor="isPublished">Published</Label>
          </div>
        </CardContent>
      </Card>

      {/* Learning Objectives */}
      <Card>
        <CardHeader>
          <CardTitle>Learning Objectives</CardTitle>
          <CardDescription>Define what learners will achieve.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newObjective}
              onChange={(e) => setNewObjective(e.target.value)}
              placeholder="Add a learning objective"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addObjective();
                }
              }}
            />
            <Button type="button" variant="outline" onClick={addObjective}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {formData.objectives.length > 0 && (
            <ul className="space-y-2">
              {formData.objectives.map((obj, idx) => (
                <li key={idx} className="flex items-center justify-between rounded-md border p-2">
                  <span className="text-sm">{obj}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeObjective(idx)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Completion Criteria */}
      <Card>
        <CardHeader>
          <CardTitle>Completion Criteria</CardTitle>
          <CardDescription>Define how module completion is determined.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Completion Type</Label>
            <Select
              value={formData.completionCriteria.type}
              onValueChange={(value: CompletionCriteriaType) =>
                setFormData({
                  ...formData,
                  completionCriteria: { ...formData.completionCriteria, type: value },
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_required">Complete All Required Units</SelectItem>
                <SelectItem value="percentage">Percentage of Units</SelectItem>
                <SelectItem value="gate_learning_unit">Pass Gate Assessment</SelectItem>
                <SelectItem value="points">Earn Points Threshold</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.completionCriteria.type === 'percentage' && (
            <div className="space-y-2">
              <Label>Required Percentage</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={formData.completionCriteria.percentageRequired || 80}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    completionCriteria: {
                      ...formData.completionCriteria,
                      percentageRequired: parseInt(e.target.value) || 80,
                    },
                  })
                }
              />
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Checkbox
              id="requireAllExpositions"
              checked={formData.completionCriteria.requireAllExpositions}
              onCheckedChange={(checked) =>
                setFormData({
                  ...formData,
                  completionCriteria: {
                    ...formData.completionCriteria,
                    requireAllExpositions: !!checked,
                  },
                })
              }
            />
            <Label htmlFor="requireAllExpositions">Require all exposition content</Label>
          </div>
        </CardContent>
      </Card>

      {/* Presentation Rules */}
      <Card>
        <CardHeader>
          <CardTitle>Presentation Rules</CardTitle>
          <CardDescription>Control how content is presented to learners.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Presentation Mode</Label>
            <Select
              value={formData.presentationRules.presentationMode}
              onValueChange={(value: PresentationMode) =>
                setFormData({
                  ...formData,
                  presentationRules: { ...formData.presentationRules, presentationMode: value },
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="learner_choice">Learner Choice</SelectItem>
                <SelectItem value="prescribed">Prescribed Order</SelectItem>
                <SelectItem value="random">Random Order</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Repetition Mode</Label>
            <Select
              value={formData.presentationRules.repetitionMode}
              onValueChange={(value: RepetitionMode) =>
                setFormData({
                  ...formData,
                  presentationRules: { ...formData.presentationRules, repetitionMode: value },
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Repetition</SelectItem>
                <SelectItem value="until_passed">Until Passed</SelectItem>
                <SelectItem value="until_mastery">Until Mastery</SelectItem>
                <SelectItem value="spaced">Spaced Repetition</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.presentationRules.repetitionMode === 'until_mastery' && (
            <div className="space-y-2">
              <Label>Mastery Threshold (%)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={formData.presentationRules.masteryThreshold || 80}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    presentationRules: {
                      ...formData.presentationRules,
                      masteryThreshold: parseInt(e.target.value) || 80,
                    },
                  })
                }
              />
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Checkbox
              id="showAllAvailable"
              checked={formData.presentationRules.showAllAvailable}
              onCheckedChange={(checked) =>
                setFormData({
                  ...formData,
                  presentationRules: {
                    ...formData.presentationRules,
                    showAllAvailable: !!checked,
                  },
                })
              }
            />
            <Label htmlFor="showAllAvailable">Show all available units</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="allowSkip"
              checked={formData.presentationRules.allowSkip}
              onCheckedChange={(checked) =>
                setFormData({
                  ...formData,
                  presentationRules: {
                    ...formData.presentationRules,
                    allowSkip: !!checked,
                  },
                })
              }
            />
            <Label htmlFor="allowSkip">Allow learners to skip content</Label>
          </div>
        </CardContent>
      </Card>

      {/* Prerequisites */}
      {availableModules.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Prerequisites</CardTitle>
            <CardDescription>Select modules that must be completed first.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {availableModules.map((m) => (
                <div key={m.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`prereq-${m.id}`}
                    checked={formData.prerequisites.includes(m.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setFormData({
                          ...formData,
                          prerequisites: [...formData.prerequisites, m.id],
                        });
                      } else {
                        setFormData({
                          ...formData,
                          prerequisites: formData.prerequisites.filter((id) => id !== m.id),
                        });
                      }
                    }}
                  />
                  <Label htmlFor={`prereq-${m.id}`}>{m.title}</Label>
                </div>
              ))}
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
          {module ? 'Update Module' : 'Create Module'}
        </Button>
      </div>
    </form>
  );
};
