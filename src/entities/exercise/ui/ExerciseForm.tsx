/**
 * ExerciseForm Component
 * Comprehensive form for creating or editing exercises
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
import type {
  Exercise,
  CreateExercisePayload,
  UpdateExercisePayload,
  ExerciseType,
  ExerciseDifficulty,
} from '../model/types';
import { Loader2, Info } from 'lucide-react';

interface ExerciseFormProps {
  exercise?: Exercise;
  onSubmit: (data: CreateExercisePayload | UpdateExercisePayload) => void;
  onCancel: () => void;
  isLoading?: boolean;
  error?: string;
}

export const ExerciseForm: React.FC<ExerciseFormProps> = ({
  exercise,
  onSubmit,
  onCancel,
  isLoading = false,
  error,
}) => {
  const [formData, setFormData] = useState({
    title: exercise?.title || '',
    description: exercise?.description || '',
    type: exercise?.type || ('quiz' as ExerciseType),
    department: exercise?.department?.id || '',
    difficulty: exercise?.difficulty || ('medium' as ExerciseDifficulty),
    timeLimit: exercise?.timeLimit || 0,
    passingScore: exercise?.passingScore || 70,
    shuffleQuestions: exercise?.shuffleQuestions ?? false,
    showFeedback: exercise?.showFeedback ?? true,
    allowReview: exercise?.allowReview ?? true,
    instructions: exercise?.instructions || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      title: formData.title,
      description: formData.description || undefined,
      type: formData.type,
      department: formData.department,
      difficulty: formData.difficulty,
      timeLimit: formData.timeLimit,
      passingScore: formData.passingScore,
      shuffleQuestions: formData.shuffleQuestions,
      showFeedback: formData.showFeedback,
      allowReview: formData.allowReview,
      instructions: formData.instructions || undefined,
    };

    onSubmit(payload);
  };

  const formatTimeMinutes = (seconds: number): number => {
    return Math.floor(seconds / 60);
  };

  const handleTimeChange = (minutes: number) => {
    setFormData({ ...formData, timeLimit: minutes * 60 });
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
            {exercise ? 'Update the exercise details below.' : 'Create a new exercise or exam.'}
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
              placeholder="e.g., Module 1 Quiz - Introduction to CBT"
              required
              disabled={isLoading}
              minLength={1}
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what this exercise covers"
              disabled={isLoading}
              maxLength={2000}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="type">
                Type <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value: ExerciseType) =>
                  setFormData({ ...formData, type: value })
                }
                disabled={isLoading}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quiz">Quiz</SelectItem>
                  <SelectItem value="exam">Exam</SelectItem>
                  <SelectItem value="practice">Practice</SelectItem>
                  <SelectItem value="assessment">Assessment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select
                value={formData.difficulty}
                onValueChange={(value: ExerciseDifficulty) =>
                  setFormData({ ...formData, difficulty: value })
                }
                disabled={isLoading}
              >
                <SelectTrigger id="difficulty">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
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
              disabled={isLoading || !!exercise}
            />
            {exercise && (
              <p className="text-xs text-muted-foreground">Department cannot be changed</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructions">Instructions</Label>
            <Textarea
              id="instructions"
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              placeholder="Instructions displayed before starting the exercise"
              disabled={isLoading}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Exercise Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Exercise Settings</CardTitle>
          <CardDescription>Configure time limits, scoring, and behavior options</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
              <Input
                id="timeLimit"
                type="number"
                value={formatTimeMinutes(formData.timeLimit)}
                onChange={(e) => handleTimeChange(Number(e.target.value))}
                min={0}
                disabled={isLoading}
                placeholder="0 for unlimited"
              />
              <p className="text-xs text-muted-foreground">Set to 0 for unlimited time</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="passingScore">Passing Score (%)</Label>
              <Input
                id="passingScore"
                type="number"
                value={formData.passingScore}
                onChange={(e) =>
                  setFormData({ ...formData, passingScore: Number(e.target.value) })
                }
                min={0}
                max={100}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-3 rounded-lg border p-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="shuffleQuestions"
                checked={formData.shuffleQuestions}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, shuffleQuestions: checked as boolean })
                }
                disabled={isLoading}
              />
              <Label htmlFor="shuffleQuestions" className="cursor-pointer">
                Shuffle Questions
              </Label>
            </div>
            <p className="text-xs text-muted-foreground pl-6">
              Randomize question order for each attempt
            </p>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="showFeedback"
                checked={formData.showFeedback}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, showFeedback: checked as boolean })
                }
                disabled={isLoading}
              />
              <Label htmlFor="showFeedback" className="cursor-pointer">
                Show Feedback
              </Label>
            </div>
            <p className="text-xs text-muted-foreground pl-6">
              Display feedback after submission
            </p>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="allowReview"
                checked={formData.allowReview}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, allowReview: checked as boolean })
                }
                disabled={isLoading}
              />
              <Label htmlFor="allowReview" className="cursor-pointer">
                Allow Review
              </Label>
            </div>
            <p className="text-xs text-muted-foreground pl-6">
              Let learners review answers after completion
            </p>
          </div>

          {!exercise && (
            <Alert>
              <Info className="h-4 w-4" />
              <div className="ml-2">
                <p className="text-sm">
                  After creating the exercise, you'll be able to add questions from the question
                  bank.
                </p>
              </div>
            </Alert>
          )}

          {exercise && exercise.questionCount === 0 && (
            <Alert>
              <Info className="h-4 w-4" />
              <div className="ml-2">
                <p className="text-sm">
                  This exercise has no questions yet. Add at least one question before publishing.
                </p>
              </div>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {exercise ? 'Update Exercise' : 'Create Exercise'}
        </Button>
      </div>
    </form>
  );
};
