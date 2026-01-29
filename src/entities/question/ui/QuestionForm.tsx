/**
 * Question Form Component
 * Create/edit form with type-specific fields
 * Updated for monolithic Question design per API v1.2.0
 *
 * Supports:
 * - Multiple question types (array) for multi-presentation questions
 * - Flashcard editor section (when 'flashcard' type selected)
 * - Matching editor section (when 'matching' type selected)
 * - Multiple correct answers (multiple_select mode)
 */

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { Label } from '@/shared/ui/label';
import { TagInput } from '@/shared/ui/tag-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card';
import { Checkbox } from '@/shared/ui/checkbox';
import { Badge } from '@/shared/ui/badge';
import { Plus, Trash2, X, Layers, CreditCard, GitCompare, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import type {
  QuestionFormData,
  QuestionType,
  QuestionDifficulty,
  AnswerOption,
  Question,
  FlashcardData,
} from '../model/types';

// Question type display labels
const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  multiple_choice: 'Multiple Choice',
  multiple_select: 'Multiple Select',
  true_false: 'True/False',
  short_answer: 'Short Answer',
  long_answer: 'Essay',
  matching: 'Matching',
  flashcard: 'Flashcard',
  fill_in_blank: 'Fill in the Blank',
  essay: 'Essay',
  fill_blank: 'Fill in the Blank',
};

// Types that can be combined (monolithic design)
const COMBINABLE_TYPES: QuestionType[] = [
  'multiple_choice',
  'multiple_select',
  'true_false',
  'short_answer',
  'flashcard',
  'matching',
];

// Types that require answer options
const OPTION_BASED_TYPES: QuestionType[] = ['multiple_choice', 'multiple_select', 'true_false'];

// Types that require a text-based correct answer
const TEXT_ANSWER_TYPES: QuestionType[] = ['short_answer', 'long_answer', 'fill_in_blank', 'fill_blank', 'essay'];

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
    questionTypes: initialData?.questionTypes || ['multiple_choice'],
    options: initialData?.options || [
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
    ],
    correctAnswers: initialData?.correctAnswers || [],
    distractors: initialData?.distractors || [],
    points: initialData?.points || 1,
    difficulty: initialData?.difficulty || 'medium',
    tags: initialData?.tags || [],
    explanation: initialData?.explanation || '',
    flashcardData: initialData?.flashcardData || { prompts: [] },
    matchingData: initialData?.matchingData || {},
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newDistractor, setNewDistractor] = useState('');

  // Derived state for UI logic
  const hasFlashcardType = formData.questionTypes.includes('flashcard');
  const hasMatchingType = formData.questionTypes.includes('matching');
  const hasMultipleSelectType = formData.questionTypes.includes('multiple_select');
  const requiresOptions = formData.questionTypes.some(t => OPTION_BASED_TYPES.includes(t));
  const requiresTextAnswer = formData.questionTypes.some(t => TEXT_ANSWER_TYPES.includes(t));
  const hasTrueFalseType = formData.questionTypes.includes('true_false');

  // Update options when true_false is added/removed
  useEffect(() => {
    if (hasTrueFalseType && !formData.options.some(o => o.text === 'True' || o.text === 'False')) {
      setFormData((prev) => ({
        ...prev,
        options: [
          { text: 'True', isCorrect: false },
          { text: 'False', isCorrect: false },
        ],
      }));
    }
  }, [hasTrueFalseType, formData.options]);

  const handleChange = useCallback((
    field: keyof QuestionFormData,
    value: unknown
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  // Question Types Management
  const handleToggleQuestionType = (type: QuestionType) => {
    setFormData((prev) => {
      const types = [...prev.questionTypes];
      const index = types.indexOf(type);

      if (index > -1) {
        // Removing type - ensure at least one type remains
        if (types.length === 1) return prev;
        types.splice(index, 1);
      } else {
        // Adding type
        types.push(type);
      }

      return {
        ...prev,
        questionTypes: types,
      };
    });

    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.questionTypes;
      return newErrors;
    });
  };

  // Options Management
  const handleAddOption = () => {
    if (hasTrueFalseType) return;

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
    setFormData((prev) => {
      const newOptions = prev.options.map((option, i) => {
        if (i !== index) {
          // For single-select modes (not multiple_select), uncheck other options
          if (field === 'isCorrect' && value === true && !hasMultipleSelectType) {
            return { ...option, isCorrect: false };
          }
          return option;
        }
        return { ...option, [field]: value };
      });

      // Update correctAnswers based on isCorrect flags
      const correctAnswers = newOptions
        .filter(opt => opt.isCorrect)
        .map(opt => opt.text);

      return {
        ...prev,
        options: newOptions,
        correctAnswers,
      };
    });
  };

  // Distractors Management (for Matching type)
  const handleAddDistractor = () => {
    if (!newDistractor.trim()) return;

    setFormData((prev) => ({
      ...prev,
      distractors: [...prev.distractors, newDistractor.trim()],
    }));
    setNewDistractor('');
  };

  const handleRemoveDistractor = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      distractors: prev.distractors.filter((_, i) => i !== index),
    }));
  };

  // Flashcard Data Management
  const handleAddFlashcardPrompt = () => {
    setFormData((prev) => ({
      ...prev,
      flashcardData: {
        ...prev.flashcardData,
        prompts: [...(prev.flashcardData?.prompts || []), ''],
      } as FlashcardData,
    }));
  };

  const handleUpdateFlashcardPrompt = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      flashcardData: {
        ...prev.flashcardData,
        prompts: (prev.flashcardData?.prompts || []).map((p, i) => i === index ? value : p),
      } as FlashcardData,
    }));
  };

  const handleRemoveFlashcardPrompt = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      flashcardData: {
        ...prev.flashcardData,
        prompts: (prev.flashcardData?.prompts || []).filter((_, i) => i !== index),
      } as FlashcardData,
    }));
  };

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Question text validation
    if (!formData.questionText.trim()) {
      newErrors.questionText = 'Question text is required';
    } else if (formData.questionText.length > 2000) {
      newErrors.questionText = 'Question text must be 2000 characters or less';
    }

    // Question types validation
    if (formData.questionTypes.length === 0) {
      newErrors.questionTypes = 'At least one question type is required';
    }

    // Explanation validation
    if (formData.explanation.length > 1000) {
      newErrors.explanation = 'Explanation must be 1000 characters or less';
    }

    // Points validation
    if (isNaN(formData.points) || formData.points < 0.1) {
      newErrors.points = 'Points must be at least 0.1';
    }

    // Options validation for option-based types
    if (requiresOptions) {
      if (formData.options.length < 2) {
        newErrors.options = 'At least 2 options are required';
      } else if (formData.options.some((opt) => !opt.text.trim())) {
        newErrors.options = 'All options must have text';
      } else if (!formData.options.some((opt) => opt.isCorrect)) {
        newErrors.options = 'At least one option must be marked as correct';
      }

      // For multiple_select, validate at least 2 correct answers
      if (hasMultipleSelectType) {
        const correctCount = formData.options.filter(opt => opt.isCorrect).length;
        if (correctCount < 2) {
          newErrors.options = 'Multiple select requires at least 2 correct answers';
        }
      }
    }

    // Text answer validation for text-based types
    if (requiresTextAnswer && !formData.questionTypes.includes('long_answer') && !formData.questionTypes.includes('essay')) {
      if (formData.correctAnswers.length === 0) {
        newErrors.correctAnswer = 'Correct answer is required';
      }
    }

    // Flashcard validation
    if (hasFlashcardType) {
      // Flashcard uses questionText as front and first correct answer as back
      // Validation is implicit - question text is required, correct answer for display
      if (!formData.options.some(opt => opt.isCorrect) && formData.correctAnswers.length === 0) {
        newErrors.flashcard = 'Flashcard requires at least one correct answer for the back of the card';
      }
    }

    // Matching validation
    if (hasMatchingType) {
      // Matching uses questionText as Column A and correct answer as Column B
      // Distractors are optional but encouraged
      if (formData.distractors.length === 0) {
        // Warning, not error - just informational
      }
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
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
          {hasFlashcardType && ' (This will be the front of the flashcard)'}
        </p>
      </div>

      {/* Question Types - Multi-select */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Question Types <span className="text-destructive">*</span>
          </CardTitle>
          <CardDescription>
            Select one or more types. A question can be used in multiple contexts (e.g., as a quiz question and flashcard).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {COMBINABLE_TYPES.map((type) => {
              const isSelected = formData.questionTypes.includes(type);
              return (
                <Badge
                  key={type}
                  variant={isSelected ? 'default' : 'outline'}
                  className={`cursor-pointer transition-colors ${
                    isSelected ? '' : 'hover:bg-muted'
                  }`}
                  onClick={() => handleToggleQuestionType(type)}
                >
                  {QUESTION_TYPE_LABELS[type]}
                  {isSelected && (
                    <X className="h-3 w-3 ml-1" />
                  )}
                </Badge>
              );
            })}
          </div>
          {errors.questionTypes && (
            <p className="text-sm text-destructive mt-2">{errors.questionTypes}</p>
          )}

          {/* Type combination hints */}
          {formData.questionTypes.length > 1 && (
            <Alert className="mt-3">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This question will be usable as: {formData.questionTypes.map(t => QUESTION_TYPE_LABELS[t]).join(', ')}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Points and Difficulty */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="points">
            Points <span className="text-destructive">*</span>
          </Label>
          <Input
            id="points"
            type="number"
            step="0.1"
            min="0.1"
            value={Number.isNaN(formData.points) ? '' : formData.points}
            onChange={(e) => handleChange('points', parseFloat(e.target.value))}
            className={errors.points ? 'border-destructive' : ''}
          />
          {errors.points && <p className="text-sm text-destructive">{errors.points}</p>}
        </div>

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
      </div>

      {/* Answer Options (Multiple Choice / True-False / Multiple Select) */}
      {requiresOptions && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Answer Options <span className="text-destructive">*</span>
            </CardTitle>
            {hasMultipleSelectType && (
              <CardDescription>
                Multiple Select mode: Check all correct answers (minimum 2 required)
              </CardDescription>
            )}
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
                  disabled={hasTrueFalseType}
                  maxLength={500}
                />
                {!hasTrueFalseType && formData.options.length > 2 && (
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

            {!hasTrueFalseType && (
              <Button type="button" variant="outline" onClick={handleAddOption} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Option
              </Button>
            )}

            <p className="text-xs text-muted-foreground">
              {hasMultipleSelectType
                ? 'Check all boxes for correct answers (learners must select all to get full points)'
                : 'Check the box to mark the correct answer'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Correct Answer (Short Answer / Long Answer / Fill Blank) */}
      {requiresTextAnswer && (
        <div className="space-y-2">
          <Label htmlFor="correctAnswer">
            Correct Answer {!formData.questionTypes.includes('long_answer') && !formData.questionTypes.includes('essay') && <span className="text-destructive">*</span>}
          </Label>
          <Textarea
            id="correctAnswer"
            value={formData.correctAnswers.join(', ')}
            onChange={(e) => {
              const value = e.target.value;
              const answers = value.split(',').map(a => a.trim()).filter(Boolean);
              handleChange('correctAnswers', answers);
            }}
            placeholder={
              formData.questionTypes.includes('long_answer') || formData.questionTypes.includes('essay')
                ? 'Optional - Add model answer or grading rubric'
                : 'Enter the correct answer (separate multiple accepted answers with commas)'
            }
            rows={2}
            className={errors.correctAnswer ? 'border-destructive' : ''}
          />
          {errors.correctAnswer && (
            <p className="text-sm text-destructive">{errors.correctAnswer}</p>
          )}
          {(formData.questionTypes.includes('long_answer') || formData.questionTypes.includes('essay')) && (
            <p className="text-xs text-muted-foreground">
              Essays are graded manually. This field is optional.
            </p>
          )}
          {hasFlashcardType && (
            <p className="text-xs text-muted-foreground">
              This will be shown on the back of the flashcard.
            </p>
          )}
        </div>
      )}

      {/* Flashcard Section */}
      {hasFlashcardType && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-blue-600" />
              Flashcard Settings
            </CardTitle>
            <CardDescription>
              Configure how this question appears as a flashcard. The question text is the front, and the correct answer is the back.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Front Preview */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Front of Card</Label>
              <div className="p-3 bg-white rounded-md border text-sm">
                {formData.questionText || <span className="text-muted-foreground italic">Question text will appear here</span>}
              </div>
            </div>

            {/* Back Preview */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Back of Card</Label>
              <div className="p-3 bg-white rounded-md border text-sm">
                {formData.correctAnswers.length > 0
                  ? formData.correctAnswers[0]
                  : formData.options.find(o => o.isCorrect)?.text
                    || <span className="text-muted-foreground italic">Correct answer will appear here</span>
                }
              </div>
            </div>

            {/* Additional Prompts */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Additional Prompts/Hints</Label>
              <p className="text-xs text-muted-foreground">
                Optional hints or prompts shown on the front of the card
              </p>
              {(formData.flashcardData?.prompts || []).map((prompt, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={prompt}
                    onChange={(e) => handleUpdateFlashcardPrompt(index, e.target.value)}
                    placeholder={`Hint ${index + 1}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveFlashcardPrompt(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddFlashcardPrompt}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Prompt
              </Button>
            </div>

            {errors.flashcard && (
              <p className="text-sm text-destructive">{errors.flashcard}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Matching Section */}
      {hasMatchingType && (
        <Card className="border-purple-200 bg-purple-50/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <GitCompare className="h-4 w-4 text-purple-600" />
              Matching Settings
            </CardTitle>
            <CardDescription>
              Configure matching exercise. The question text is Column A (prompt), and the correct answer is Column B (match).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Column A Preview */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Column A (Prompt)</Label>
              <div className="p-3 bg-white rounded-md border text-sm">
                {formData.questionText || <span className="text-muted-foreground italic">Question text will appear here</span>}
              </div>
            </div>

            {/* Column B Preview */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Column B (Match)</Label>
              <div className="p-3 bg-white rounded-md border text-sm">
                {formData.correctAnswers.length > 0
                  ? formData.correctAnswers[0]
                  : formData.options.find(o => o.isCorrect)?.text
                    || <span className="text-muted-foreground italic">Correct answer will appear here</span>
                }
              </div>
            </div>

            {/* Distractors */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Distractors (Wrong Answers)</Label>
              <p className="text-xs text-muted-foreground">
                Add wrong answers that will appear in Column B to make matching more challenging
              </p>

              <div className="flex flex-wrap gap-2 mb-2">
                {formData.distractors.map((distractor, index) => (
                  <Badge key={index} variant="secondary" className="pr-1">
                    {distractor}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                      onClick={() => handleRemoveDistractor(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  value={newDistractor}
                  onChange={(e) => setNewDistractor(e.target.value)}
                  placeholder="Add a distractor..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddDistractor();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddDistractor}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {formData.distractors.length === 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Consider adding distractors to increase matching difficulty. Without distractors, learners can easily match by elimination.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tags */}
      <div className="space-y-2">
        <Label htmlFor="tags">Tags</Label>
        <TagInput
          id="tags"
          value={formData.tags}
          onChange={(tags) => handleChange('tags', tags)}
          placeholder="Add tags for categorization"
          maxTagLength={50}
          addButton
        />
        <p className="text-xs text-muted-foreground">
          Press Enter or comma to add a tag
        </p>
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
          className={errors.explanation ? 'border-destructive' : ''}
        />
        {errors.explanation && (
          <p className="text-sm text-destructive">{errors.explanation}</p>
        )}
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
