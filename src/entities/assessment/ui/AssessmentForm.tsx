/**
 * AssessmentForm Component
 * Form for creating or editing assessments (quizzes and exams)
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
  Assessment,
  CreateAssessmentPayload,
  UpdateAssessmentPayload,
  AssessmentStyle,
  SelectionMode,
  RetakePolicy,
  ShowCorrectAnswersPolicy,
  FeedbackTiming,
} from '../model/types';

interface AssessmentFormProps {
  assessment?: Assessment;
  onSubmit: (data: CreateAssessmentPayload | UpdateAssessmentPayload) => void;
  onCancel: () => void;
  isLoading?: boolean;
  error?: string;
  departmentId: string;
  availableQuestionBanks?: { id: string; name: string; questionCount: number }[];
}

export const AssessmentForm: React.FC<AssessmentFormProps> = ({
  assessment,
  onSubmit,
  onCancel,
  isLoading = false,
  error,
  departmentId,
  availableQuestionBanks = [],
}) => {
  const [formData, setFormData] = useState({
    title: assessment?.title || '',
    description: assessment?.description || '',
    style: assessment?.style || 'quiz' as AssessmentStyle,
    questionSelection: {
      questionBankIds: assessment?.questionSelection?.questionBankIds || [],
      questionCount: assessment?.questionSelection?.questionCount || 10,
      selectionMode: assessment?.questionSelection?.selectionMode || 'random' as SelectionMode,
    },
    timing: {
      timeLimit: assessment?.timing?.timeLimit || null,
      showTimer: assessment?.timing?.showTimer ?? true,
      autoSubmitOnExpiry: assessment?.timing?.autoSubmitOnExpiry ?? true,
    },
    attempts: {
      maxAttempts: assessment?.attempts?.maxAttempts || null,
      cooldownMinutes: assessment?.attempts?.cooldownMinutes || null,
      retakePolicy: assessment?.attempts?.retakePolicy || 'anytime' as RetakePolicy,
    },
    scoring: {
      passingScore: assessment?.scoring?.passingScore ?? 70,
      showScore: assessment?.scoring?.showScore ?? true,
      showCorrectAnswers: assessment?.scoring?.showCorrectAnswers || 'after_submit' as ShowCorrectAnswersPolicy,
      partialCredit: assessment?.scoring?.partialCredit ?? false,
    },
    feedback: {
      showFeedback: assessment?.feedback?.showFeedback ?? true,
      feedbackTiming: assessment?.feedback?.feedbackTiming || 'after_submit' as FeedbackTiming,
      showExplanations: assessment?.feedback?.showExplanations ?? true,
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: CreateAssessmentPayload = {
      departmentId,
      title: formData.title,
      description: formData.description || undefined,
      style: formData.style,
      questionSelection: {
        questionBankIds: formData.questionSelection.questionBankIds,
        questionCount: formData.questionSelection.questionCount,
        selectionMode: formData.questionSelection.selectionMode,
      },
      timing: formData.timing,
      attempts: formData.attempts,
      scoring: formData.scoring,
      feedback: formData.feedback,
    };

    onSubmit(payload);
  };

  const toggleQuestionBank = (bankId: string) => {
    const current = formData.questionSelection.questionBankIds;
    const updated = current.includes(bankId)
      ? current.filter((id) => id !== bankId)
      : [...current, bankId];
    setFormData({
      ...formData,
      questionSelection: { ...formData.questionSelection, questionBankIds: updated },
    });
  };

  const applyPreset = (style: AssessmentStyle) => {
    if (style === 'quiz') {
      setFormData({
        ...formData,
        style: 'quiz',
        timing: { timeLimit: 30, showTimer: true, autoSubmitOnExpiry: true },
        attempts: { maxAttempts: 3, cooldownMinutes: 60, retakePolicy: 'after_cooldown' },
        scoring: { passingScore: 70, showScore: true, showCorrectAnswers: 'after_submit', partialCredit: false },
        feedback: { showFeedback: true, feedbackTiming: 'after_submit', showExplanations: true },
      });
    } else {
      setFormData({
        ...formData,
        style: 'exam',
        timing: { timeLimit: 120, showTimer: true, autoSubmitOnExpiry: true },
        attempts: { maxAttempts: 1, cooldownMinutes: null, retakePolicy: 'instructor_unlock' },
        scoring: { passingScore: 60, showScore: true, showCorrectAnswers: 'after_all_attempts', partialCredit: true },
        feedback: { showFeedback: true, feedbackTiming: 'after_grading', showExplanations: true },
      });
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
            {assessment ? 'Update the assessment.' : 'Create a new assessment.'}
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
              placeholder="Enter assessment title"
              required
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description / Instructions</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter instructions for learners"
              maxLength={2000}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Assessment Style</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={formData.style === 'quiz' ? 'default' : 'outline'}
                onClick={() => applyPreset('quiz')}
              >
                Quiz
              </Button>
              <Button
                type="button"
                variant={formData.style === 'exam' ? 'default' : 'outline'}
                onClick={() => applyPreset('exam')}
              >
                Exam
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {formData.style === 'quiz'
                ? 'Quizzes are lighter assessments with more attempts allowed.'
                : 'Exams are formal assessments with stricter settings.'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Question Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Question Selection</CardTitle>
          <CardDescription>Choose question banks and selection rules.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Question Banks</Label>
            {availableQuestionBanks.length > 0 ? (
              <div className="space-y-2">
                {availableQuestionBanks.map((bank) => (
                  <div key={bank.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`bank-${bank.id}`}
                      checked={formData.questionSelection.questionBankIds.includes(bank.id)}
                      onCheckedChange={() => toggleQuestionBank(bank.id)}
                    />
                    <Label htmlFor={`bank-${bank.id}`} className="flex-1">
                      {bank.name}
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({bank.questionCount} questions)
                      </span>
                    </Label>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No question banks available. Create question banks first.
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Number of Questions</Label>
              <Input
                type="number"
                min={1}
                value={formData.questionSelection.questionCount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    questionSelection: {
                      ...formData.questionSelection,
                      questionCount: parseInt(e.target.value) || 10,
                    },
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Selection Mode</Label>
              <Select
                value={formData.questionSelection.selectionMode}
                onValueChange={(value: SelectionMode) =>
                  setFormData({
                    ...formData,
                    questionSelection: { ...formData.questionSelection, selectionMode: value },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="random">Random</SelectItem>
                  <SelectItem value="sequential">Sequential</SelectItem>
                  <SelectItem value="weighted">Weighted by Difficulty</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timing */}
      <Card>
        <CardHeader>
          <CardTitle>Timing</CardTitle>
          <CardDescription>Set time limits and timer behavior.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Time Limit (minutes)</Label>
            <Input
              type="number"
              min={0}
              value={formData.timing.timeLimit || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  timing: {
                    ...formData.timing,
                    timeLimit: e.target.value ? parseInt(e.target.value) : null,
                  },
                })
              }
              placeholder="No limit"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="showTimer"
              checked={formData.timing.showTimer}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, timing: { ...formData.timing, showTimer: !!checked } })
              }
            />
            <Label htmlFor="showTimer">Show countdown timer</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="autoSubmit"
              checked={formData.timing.autoSubmitOnExpiry}
              onCheckedChange={(checked) =>
                setFormData({
                  ...formData,
                  timing: { ...formData.timing, autoSubmitOnExpiry: !!checked },
                })
              }
            />
            <Label htmlFor="autoSubmit">Auto-submit when time expires</Label>
          </div>
        </CardContent>
      </Card>

      {/* Attempts */}
      <Card>
        <CardHeader>
          <CardTitle>Attempts</CardTitle>
          <CardDescription>Configure attempt limits and retake policy.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Maximum Attempts</Label>
              <Input
                type="number"
                min={0}
                value={formData.attempts.maxAttempts || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    attempts: {
                      ...formData.attempts,
                      maxAttempts: e.target.value ? parseInt(e.target.value) : null,
                    },
                  })
                }
                placeholder="Unlimited"
              />
            </div>

            <div className="space-y-2">
              <Label>Cooldown (minutes)</Label>
              <Input
                type="number"
                min={0}
                value={formData.attempts.cooldownMinutes || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    attempts: {
                      ...formData.attempts,
                      cooldownMinutes: e.target.value ? parseInt(e.target.value) : null,
                    },
                  })
                }
                placeholder="No cooldown"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Retake Policy</Label>
            <Select
              value={formData.attempts.retakePolicy}
              onValueChange={(value: RetakePolicy) =>
                setFormData({
                  ...formData,
                  attempts: { ...formData.attempts, retakePolicy: value },
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="anytime">Anytime</SelectItem>
                <SelectItem value="after_cooldown">After Cooldown</SelectItem>
                <SelectItem value="instructor_unlock">Instructor Unlock Required</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Scoring */}
      <Card>
        <CardHeader>
          <CardTitle>Scoring</CardTitle>
          <CardDescription>Configure scoring and results display.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Passing Score (%)</Label>
            <Input
              type="number"
              min={0}
              max={100}
              value={formData.scoring.passingScore}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  scoring: { ...formData.scoring, passingScore: parseInt(e.target.value) || 70 },
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Show Correct Answers</Label>
            <Select
              value={formData.scoring.showCorrectAnswers}
              onValueChange={(value: ShowCorrectAnswersPolicy) =>
                setFormData({
                  ...formData,
                  scoring: { ...formData.scoring, showCorrectAnswers: value },
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="never">Never</SelectItem>
                <SelectItem value="after_submit">After Submission</SelectItem>
                <SelectItem value="after_all_attempts">After All Attempts Used</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="showScore"
              checked={formData.scoring.showScore}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, scoring: { ...formData.scoring, showScore: !!checked } })
              }
            />
            <Label htmlFor="showScore">Show score to learner</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="partialCredit"
              checked={formData.scoring.partialCredit}
              onCheckedChange={(checked) =>
                setFormData({
                  ...formData,
                  scoring: { ...formData.scoring, partialCredit: !!checked },
                })
              }
            />
            <Label htmlFor="partialCredit">Allow partial credit for multi-select</Label>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={
            isLoading ||
            !formData.title.trim() ||
            formData.questionSelection.questionBankIds.length === 0
          }
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {assessment ? 'Update Assessment' : 'Create Assessment'}
        </Button>
      </div>
    </form>
  );
};
