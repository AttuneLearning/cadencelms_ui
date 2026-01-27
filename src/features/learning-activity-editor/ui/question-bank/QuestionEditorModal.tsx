/**
 * Question Editor Modal
 * Dialog for creating and editing individual questions
 */

import { useState, useEffect } from 'react';
import { useForm, useFieldArray, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { TagInput } from '@/shared/ui/tag-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { Checkbox } from '@/shared/ui/checkbox';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Plus, Trash2, GripVertical, AlertCircle } from 'lucide-react';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form';
import {
  type Question,
  type QuestionType,
  type QuestionDifficulty,
  QUESTION_TYPE_CONFIGS,
  getRequiredFieldsForTypes,
} from '../../model/question-types';

const QUESTION_TYPE_VALUES = [
  'multiple_choice',
  'multiple_select',
  'true_false',
  'short_answer',
  'long_answer',
  'matching',
  'flashcard',
  'fill_in_blank',
] as const;

/**
 * Question form schema
 * Note: `types` is now an array to support multiple presentation formats
 */
const questionSchema = z.object({
  types: z.array(z.enum(QUESTION_TYPE_VALUES)).min(1, 'Select at least one question type'),
  text: z.string().min(1, 'Question text is required').max(5000),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  points: z.number().min(1, 'Points must be at least 1').max(1000),
  explanation: z.string().max(2000).optional(),
  tags: z.array(z.string()).optional(),
  // For choice-based questions (multiple_choice, multiple_select, true_false)
  options: z.array(z.object({
    text: z.string().min(1, 'Option text is required'),
    isCorrect: z.boolean(),
  })).optional(),
  // For true/false
  correctAnswer: z.string().optional(),
  // For short_answer
  acceptedAnswers: z.array(z.string()).optional(),
  // For long_answer
  sampleAnswer: z.string().optional(),
  // For matching
  matchingPairs: z.array(z.object({
    left: z.string().min(1),
    right: z.string().min(1),
  })).optional(),
  // For flashcard
  flashcardFront: z.string().optional(),
  flashcardBack: z.string().optional(),
});

type QuestionFormData = z.infer<typeof questionSchema>;

export interface QuestionEditorModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Callback when modal closes */
  onClose: () => void;
  /** Callback when question is saved */
  onSave: (question: Partial<Question>) => void;
  /** Existing question for edit mode */
  initialData?: Question;
  /** Default question types when creating new (array) */
  defaultTypes?: QuestionType[];
  /** Whether this is for a graded assessment */
  isGraded?: boolean;
}

/**
 * Option editor for multiple choice/select
 */
function OptionsEditor({
  isMultiSelect,
}: {
  isMultiSelect: boolean;
}) {
  const { control, formState } = useFormContext<QuestionFormData>();
  const { errors } = formState;
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'options',
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">Answer Options</div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ text: '', isCorrect: false })}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Option
        </Button>
      </div>

      {fields.length === 0 && (
        <p className="text-sm text-muted-foreground">Add at least 2 options</p>
      )}

      <div className="space-y-2">
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-center gap-2">
            <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
            <div className="flex-1">
              <FormField
                control={control}
                name={`options.${index}.text`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder={`Option ${index + 1}`}
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={control}
              name={`options.${index}.isCorrect`}
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0 whitespace-nowrap">
                  <FormControl>
                    <Checkbox
                      checked={!!field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <span className="text-sm">
                    {isMultiSelect ? 'Correct' : 'Correct'}
                  </span>
                </FormItem>
              )}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => remove(index)}
              disabled={fields.length <= 2}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      {errors.options && (
        <Alert variant="destructive" className="py-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Please add at least 2 options with one correct answer</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

/**
 * Matching pairs editor
 */
function MatchingPairsEditor() {
  const { control } = useFormContext<QuestionFormData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'matchingPairs',
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">Matching Pairs</div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ left: '', right: '' })}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Pair
        </Button>
      </div>

      {fields.length === 0 && (
        <p className="text-sm text-muted-foreground">Add matching pairs</p>
      )}

      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-4 text-sm font-medium text-muted-foreground">
          <span>Left Side</span>
          <span>Right Side</span>
        </div>
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-center gap-2">
            <div className="grid grid-cols-2 gap-2 flex-1">
              <FormField
                control={control}
                name={`matchingPairs.${index}.left`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="Item"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={`matchingPairs.${index}.right`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="Match"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => remove(index)}
              disabled={fields.length <= 2}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Question Editor Modal
 *
 * Provides a form for creating/editing questions with type-specific fields.
 * Supports multiple question types per question for adaptive presentation.
 */
export function QuestionEditorModal({
  open,
  onClose,
  onSave,
  initialData,
  defaultTypes = ['multiple_choice'],
  isGraded = true,
}: QuestionEditorModalProps) {
  const isEditMode = !!initialData;
  const [acceptedAnswersInput, setAcceptedAnswersInput] = useState('');

  const form = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      types: initialData?.types || defaultTypes,
      text: initialData?.text || '',
      difficulty: initialData?.difficulty || 'medium',
      points: initialData?.points || 10,
      explanation: initialData?.explanation || '',
      tags: initialData?.tags || [],
      options: initialData?.options?.map((o) => ({ text: o.text, isCorrect: o.isCorrect })) || [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ],
      correctAnswer: initialData?.correctAnswer || '',
      acceptedAnswers: initialData?.acceptedAnswers || [],
      sampleAnswer: initialData?.sampleAnswer || '',
      matchingPairs: initialData?.matchingPairs?.map((p) => ({ left: p.left, right: p.right })) || [
        { left: '', right: '' },
        { left: '', right: '' },
      ],
      flashcardFront: initialData?.flashcard?.front || '',
      flashcardBack: initialData?.flashcard?.back || '',
    },
  });

  const { reset } = form;
  const { isSubmitting } = form.formState;
  const selectedTypes = form.watch('types') || [];
  const requiredFields = getRequiredFieldsForTypes(selectedTypes);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      if (initialData) {
        reset({
          types: initialData.types,
          text: initialData.text,
          difficulty: initialData.difficulty,
          points: initialData.points,
          explanation: initialData.explanation || '',
          tags: initialData.tags,
          options: initialData.options?.map((o) => ({ text: o.text, isCorrect: o.isCorrect })),
          correctAnswer: initialData.correctAnswer,
          acceptedAnswers: initialData.acceptedAnswers || [],
          sampleAnswer: initialData.sampleAnswer || '',
          matchingPairs: initialData.matchingPairs?.map((p) => ({ left: p.left, right: p.right })),
          flashcardFront: initialData.flashcard?.front,
          flashcardBack: initialData.flashcard?.back,
        });
        setAcceptedAnswersInput(initialData.acceptedAnswers?.join(', ') || '');
      } else {
        reset({
          types: defaultTypes,
          text: '',
          difficulty: 'medium',
          points: 10,
          explanation: '',
          tags: [],
          options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }],
          correctAnswer: '',
          acceptedAnswers: [],
          sampleAnswer: '',
          matchingPairs: [{ left: '', right: '' }, { left: '', right: '' }],
          flashcardFront: '',
          flashcardBack: '',
        });
        setAcceptedAnswersInput('');
      }
    }
  }, [open, initialData, defaultTypes, reset]);

  const onFormSubmit = (data: QuestionFormData) => {
    const question: Partial<Question> = {
      id: initialData?.id,
      types: data.types,
      text: data.text,
      difficulty: data.difficulty,
      points: data.points,
      explanation: data.explanation || null,
      tags: data.tags || [],
    };

    // Add type-specific data based on selected types
    const fields = getRequiredFieldsForTypes(data.types);

    if (fields.needsOptions && data.options) {
      question.options = data.options.map((o, i) => ({
        id: `opt-${i}`,
        text: o.text,
        isCorrect: o.isCorrect,
      }));
    }

    if (fields.needsCorrectAnswer && data.correctAnswer) {
      question.correctAnswer = data.correctAnswer;
    }

    if (fields.needsAcceptedAnswers && data.acceptedAnswers) {
      question.acceptedAnswers = data.acceptedAnswers;
    }

    if (fields.needsSampleAnswer && data.sampleAnswer) {
      question.sampleAnswer = data.sampleAnswer;
    }

    if (fields.needsMatchingPairs && data.matchingPairs) {
      question.matchingPairs = data.matchingPairs.map((p, i) => ({
        id: `pair-${i}`,
        left: p.left,
        right: p.right,
      }));
    }

    if (fields.needsFlashcard && data.flashcardFront && data.flashcardBack) {
      question.flashcard = {
        front: data.flashcardFront,
        back: data.flashcardBack,
      };
    }

    onSave(question);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Edit Question' : 'Create Question'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Update the question details' : 'Add a new question to your activity'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto -mx-6 px-6">
          <Form {...form}>
            <form id="question-editor-form" onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-6 py-4">
            {/* Question Types (Multi-select) */}
            <FormField
              control={form.control}
              name="types"
              render={({ field }) => {
                const selected = field.value ?? [];
                const toggleType = (type: QuestionType, checked: boolean) => {
                  if (checked) {
                    field.onChange([...selected, type]);
                  } else {
                    field.onChange(selected.filter((t) => t !== type));
                  }
                };

                return (
                  <FormItem className="space-y-3">
                    <div className="space-y-1">
                      <FormLabel>
                        Question Types <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormDescription className="text-xs">
                        Select one or more presentation formats for this question
                      </FormDescription>
                    </div>
                    <FormControl>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.values(QUESTION_TYPE_CONFIGS).map((config) => (
                          <label
                            key={config.type}
                            className={`
                              flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors
                              ${selected.includes(config.type)
                                ? 'border-primary bg-primary/5'
                                : 'hover:bg-muted/50'}
                            `}
                          >
                            <Checkbox
                              checked={selected.includes(config.type)}
                              onCheckedChange={(checked) => toggleType(config.type, !!checked)}
                            />
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <span className="text-lg">{config.icon}</span>
                              <div className="min-w-0">
                                <p className="text-sm font-medium">{config.label}</p>
                                <p className="text-xs text-muted-foreground truncate">{config.description}</p>
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            {/* Question Text */}
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Question Text <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter your question..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Type-specific fields - shown based on selected types */}
            {requiredFields.needsOptions && (
              <OptionsEditor
                isMultiSelect={selectedTypes.includes('multiple_select')}
              />
            )}

            {requiredFields.needsCorrectAnswer && (
              <FormField
                control={form.control}
                name="correctAnswer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correct Answer (True/False)</FormLabel>
                    <Select
                      value={field.value || 'true'}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="true">True</SelectItem>
                        <SelectItem value="false">False</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {requiredFields.needsAcceptedAnswers && (
              <FormField
                control={form.control}
                name="acceptedAnswers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Accepted Answers (Short Answer)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="paris, Paris, PARIS"
                        value={acceptedAnswersInput}
                        onChange={(event) => {
                          const value = event.target.value;
                          setAcceptedAnswersInput(value);
                          field.onChange(value.split(',').map((item) => item.trim()).filter(Boolean));
                        }}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Comma-separated list of accepted answers (case-sensitive matching)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {requiredFields.needsSampleAnswer && (
              <FormField
                control={form.control}
                name="sampleAnswer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sample Answer (Long Answer)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter a sample answer for grading reference..."
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      This answer guides manual grading - learners won&apos;t see it
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {requiredFields.needsMatchingPairs && (
              <MatchingPairsEditor />
            )}

            {requiredFields.needsFlashcard && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="flashcardFront"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Front (Question)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="What appears on the front of the card"
                          rows={2}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="flashcardBack"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Back (Answer)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="What appears on the back of the card"
                          rows={2}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Difficulty & Points */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(value) => field.onChange(value as QuestionDifficulty)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isGraded && (
                <FormField
                  control={form.control}
                  name="points"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Points</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={1000}
                          value={field.value ?? ''}
                          onChange={(event) => {
                            const value = event.target.value;
                            field.onChange(value === '' ? undefined : Number(value));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Explanation */}
            <FormField
              control={form.control}
              name="explanation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Explanation (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Explanation shown after answering"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tags */}
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags (optional)</FormLabel>
                  <FormControl>
                    <TagInput
                      placeholder="Add tags..."
                      value={field.value ?? []}
                      onChange={field.onChange}
                      maxTagLength={50}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Press Enter or comma to add a tag
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            </form>
          </Form>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="question-editor-form" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isEditMode ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default QuestionEditorModal;
