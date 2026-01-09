/**
 * Question Form Component
 * Create/edit form with type-specific fields
 */

import { useState, useEffect } from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { Label } from '@/shared/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { Badge } from '@/shared/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Checkbox } from '@/shared/ui/checkbox';
import { Plus, X, Trash2 } from 'lucide-react';
import type {
  QuestionFormData,
  QuestionType,
  QuestionDifficulty,
  AnswerOption,
  Question,
} from '../model/types';

interface QuestionFormProps {
  initialData?: Partial<Question>;
  onSubmit: (data: QuestionFormData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  mode?: 'create' | 'edit';
}

export function QuestionForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  mode = 'create',
}: QuestionFormProps) {
  const [formData, setFormData] = useState<QuestionFormData>({
    questionText: initialData?.questionText || '',
    questionType: initialData?.questionType || 'multiple_choice',
    options: initialData?.options || [
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
    ],
    correctAnswer: initialData?.correctAnswer || '',
    points: initialData?.points || 1,
    difficulty: initialData?.difficulty || 'medium',
    tags: initialData?.tags || [],
    explanation: initialData?.explanation || '',
    department: initialData?.department || undefined,
  });

  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update options when question type changes
  useEffect(() => {
    if (formData.questionType === 'true_false') {
      setFormData((prev) => ({
        ...prev,
        options: [
          { text: 'True', isCorrect: false },
          { text: 'False', isCorrect: false },
        ],
      }));
    } else if (formData.questionType !== 'multiple_choice') {
      setFormData((prev) => ({
        ...prev,
        options: [],
      }));
    }
  }, [formData.questionType]);

  const handleChange = (
    field: keyof QuestionFormData,
    value: string | number | QuestionType | QuestionDifficulty | AnswerOption[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const handleAddOption = () => {
    if (formData.questionType === 'true_false') return;

    setFormData((prev) => ({
      ...prev,
      options: [...prev.options, { text: '', isCorrect: false }],
    }));
  };

  const handleRemoveOption = (index: number) => {
    if (formData.options.length <= 2) return;

    setFormData((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  const handleOptionChange = (index: number, field: keyof AnswerOption, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.map((option, i) =>
        i === index ? { ...option, [field]: value } : option
      ),
    }));
  };

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, trimmedTag],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Question text validation
    if (!formData.questionText.trim()) {
      newErrors.questionText = 'Question text is required';
    } else if (formData.questionText.length > 2000) {
      newErrors.questionText = 'Question text must be 2000 characters or less';
    }

    // Points validation
    if (formData.points < 0.1) {
      newErrors.points = 'Points must be at least 0.1';
    }

    // Options validation for multiple choice and true/false
    if (
      formData.questionType === 'multiple_choice' ||
      formData.questionType === 'true_false'
    ) {
      if (formData.options.length < 2) {
        newErrors.options = 'At least 2 options are required';
      } else if (formData.options.some((opt) => !opt.text.trim())) {
        newErrors.options = 'All options must have text';
      } else if (!formData.options.some((opt) => opt.isCorrect)) {
        newErrors.options = 'At least one option must be marked as correct';
      }
    }

    // Correct answer validation for other types
    if (
      (formData.questionType === 'short_answer' || formData.questionType === 'fill_blank') &&
      !formData.correctAnswer
    ) {
      newErrors.correctAnswer = 'Correct answer is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSubmit(formData);
  };

  const requiresOptions =
    formData.questionType === 'multiple_choice' || formData.questionType === 'true_false';
  const requiresCorrectAnswer =
    formData.questionType === 'short_answer' ||
    formData.questionType === 'essay' ||
    formData.questionType === 'fill_blank';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Question Text */}
      <div className="space-y-2">
        <Label htmlFor="questionText">
          Question Text <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="questionText"
          value={formData.questionText}
          onChange={(e) => handleChange('questionText', e.target.value)}
          placeholder="Enter your question..."
          rows={3}
          className={errors.questionText ? 'border-destructive' : ''}
        />
        {errors.questionText && (
          <p className="text-sm text-destructive">{errors.questionText}</p>
        )}
        <p className="text-xs text-muted-foreground">
          {formData.questionText.length}/2000 characters
        </p>
      </div>

      {/* Question Type and Points */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="questionType">
            Question Type <span className="text-destructive">*</span>
          </Label>
          <Select
            value={formData.questionType}
            onValueChange={(value: QuestionType) => handleChange('questionType', value)}
          >
            <SelectTrigger id="questionType">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
              <SelectItem value="true_false">True/False</SelectItem>
              <SelectItem value="short_answer">Short Answer</SelectItem>
              <SelectItem value="essay">Essay</SelectItem>
              <SelectItem value="fill_blank">Fill in the Blank</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="points">
            Points <span className="text-destructive">*</span>
          </Label>
          <Input
            id="points"
            type="number"
            step="0.1"
            min="0.1"
            value={formData.points}
            onChange={(e) => handleChange('points', parseFloat(e.target.value))}
            className={errors.points ? 'border-destructive' : ''}
          />
          {errors.points && <p className="text-sm text-destructive">{errors.points}</p>}
        </div>
      </div>

      {/* Difficulty */}
      <div className="space-y-2">
        <Label htmlFor="difficulty">Difficulty</Label>
        <Select
          value={formData.difficulty}
          onValueChange={(value: QuestionDifficulty) => handleChange('difficulty', value)}
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

      {/* Answer Options (Multiple Choice / True-False) */}
      {requiresOptions && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Answer Options <span className="text-destructive">*</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {formData.options.map((option, index) => (
              <div key={index} className="flex gap-2 items-start">
                <Checkbox
                  checked={option.isCorrect}
                  onCheckedChange={(checked) =>
                    handleOptionChange(index, 'isCorrect', checked === true)
                  }
                  className="mt-3"
                />
                <Input
                  value={option.text}
                  onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  disabled={formData.questionType === 'true_false'}
                  maxLength={500}
                />
                {formData.questionType !== 'true_false' && formData.options.length > 2 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveOption(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            {errors.options && <p className="text-sm text-destructive">{errors.options}</p>}

            {formData.questionType === 'multiple_choice' && (
              <Button type="button" variant="outline" onClick={handleAddOption} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Option
              </Button>
            )}

            <p className="text-xs text-muted-foreground">
              Check the box(es) to mark correct answer(s)
            </p>
          </CardContent>
        </Card>
      )}

      {/* Correct Answer (Short Answer / Essay / Fill Blank) */}
      {requiresCorrectAnswer && (
        <div className="space-y-2">
          <Label htmlFor="correctAnswer">
            Correct Answer {formData.questionType !== 'essay' && <span className="text-destructive">*</span>}
          </Label>
          <Textarea
            id="correctAnswer"
            value={Array.isArray(formData.correctAnswer) ? formData.correctAnswer.join(', ') : formData.correctAnswer}
            onChange={(e) => handleChange('correctAnswer', e.target.value)}
            placeholder={
              formData.questionType === 'essay'
                ? 'Optional - Add model answer or grading rubric'
                : 'Enter the correct answer'
            }
            rows={2}
            className={errors.correctAnswer ? 'border-destructive' : ''}
          />
          {errors.correctAnswer && (
            <p className="text-sm text-destructive">{errors.correctAnswer}</p>
          )}
          {formData.questionType === 'essay' && (
            <p className="text-xs text-muted-foreground">
              Essays are graded manually. This field is optional.
            </p>
          )}
        </div>
      )}

      {/* Tags */}
      <div className="space-y-2">
        <Label htmlFor="tags">Tags</Label>
        <div className="flex gap-2">
          <Input
            id="tags"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
            placeholder="Add tags for categorization"
            maxLength={50}
          />
          <Button type="button" onClick={handleAddTag} variant="outline">
            Add
          </Button>
        </div>
        {formData.tags.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {formData.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1">
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Explanation */}
      <div className="space-y-2">
        <Label htmlFor="explanation">Explanation</Label>
        <Textarea
          id="explanation"
          value={formData.explanation}
          onChange={(e) => handleChange('explanation', e.target.value)}
          placeholder="Explanation shown after answering (optional)"
          rows={3}
          maxLength={1000}
        />
        <p className="text-xs text-muted-foreground">
          {formData.explanation.length}/1000 characters
        </p>
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 justify-end pt-4 border-t">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : mode === 'create' ? 'Create Question' : 'Update Question'}
        </Button>
      </div>
    </form>
  );
}
