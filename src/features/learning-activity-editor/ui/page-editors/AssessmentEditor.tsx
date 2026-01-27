/**
 * Assessment Editor
 * Full-page editor for graded assessments/quizzes
 */

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Switch } from '@/shared/ui/switch';
import { Badge } from '@/shared/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Checkbox } from '@/shared/ui/checkbox';
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
  Plus,
  BookOpen,
  GripVertical,
  Pencil,
  Trash2,
  ChevronDown,
  Clock,
  Target,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { assessmentSchema, type AssessmentFormData } from '../../lib/validation';
import { EDITOR_CONFIGS } from '../../model/editor-config';
import type { LearningUnitCategory } from '@/entities/learning-unit';
import { QuestionImportPicker } from '../question-bank/QuestionImportPicker';
import { QuestionEditorModal } from '../question-bank/QuestionEditorModal';
import {
  type Question,
  type QuestionType,
} from '../../model/question-types';

const CATEGORY_OPTIONS: { value: LearningUnitCategory; label: string }[] = [
  { value: 'graded', label: 'Graded' },
  { value: 'practice', label: 'Practice' },
];

const QUESTION_TYPES = [
  { value: 'multiple_choice', label: 'Multiple Choice' },
  { value: 'multiple_select', label: 'Multiple Select' },
  { value: 'true_false', label: 'True/False' },
  { value: 'short_answer', label: 'Short Answer' },
  { value: 'long_answer', label: 'Long Answer' },
  { value: 'matching', label: 'Matching' },
  { value: 'fill_in_blank', label: 'Fill in the Blank' },
];

const SHOW_ANSWERS_OPTIONS = [
  { value: 'never', label: 'Never' },
  { value: 'after_submission', label: 'After Submission' },
  { value: 'after_due_date', label: 'After Due Date' },
];

/**
 * Mock question for assessment display
 * Note: `types` is an array to support multiple presentation formats
 */
interface MockAssessmentQuestion {
  id: string;
  types: string[];
  text: string;
  points: number;
  options?: string[];
  correctAnswer?: string;
}

const MOCK_QUESTIONS: MockAssessmentQuestion[] = [
  {
    id: '1',
    types: ['multiple_choice'],
    text: 'What is the capital of France?',
    points: 20,
    options: ['London', 'Paris', 'Berlin', 'Madrid'],
    correctAnswer: 'Paris',
  },
  {
    id: '2',
    types: ['long_answer'],
    text: 'Explain the process of photosynthesis.',
    points: 30,
  },
  {
    id: '3',
    types: ['true_false'],
    text: 'Water boils at 100 degrees Celsius at sea level.',
    points: 10,
    correctAnswer: 'True',
  },
];

export interface AssessmentEditorProps {
  moduleId: string;
  courseId: string;
  onSubmit: (data: AssessmentFormData) => void | Promise<void>;
  onDirtyChange?: (isDirty: boolean) => void;
  initialData?: Partial<AssessmentFormData>;
  isLoading?: boolean;
}

/**
 * Assessment Question Card Component
 */
function AssessmentQuestionCard({
  question,
  index,
  onEdit,
  onDelete,
}: {
  question: MockAssessmentQuestion;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const typeLabels = question.types.map(t =>
    QUESTION_TYPES.find((qt) => qt.value === t)?.label || t
  ).join(', ');

  return (
    <Card className="mb-3">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <button type="button" className="mt-1 cursor-grab text-muted-foreground hover:text-foreground">
            <GripVertical className="h-5 w-5" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium">{index + 1}.</span>
              <span className="text-sm">{question.text}</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary">{typeLabels}</Badge>
              <Badge variant="outline">
                <Target className="mr-1 h-3 w-3" />
                {question.points} points
              </Badge>
            </div>
            {question.options && (
              <div className="mt-2 text-xs text-muted-foreground">
                {question.options.map((opt, i) => (
                  <span key={i} className={opt === question.correctAnswer ? 'font-semibold' : ''}>
                    {String.fromCharCode(65 + i)}. {opt}
                    {opt === question.correctAnswer && ' ✓'}
                    {i < question.options!.length - 1 && '  '}
                  </span>
                ))}
              </div>
            )}
            {question.types.includes('true_false') && question.correctAnswer && (
              <div className="mt-2 text-xs text-muted-foreground">
                Answer: {question.correctAnswer}
              </div>
            )}
            {question.types.includes('long_answer') && (
              <div className="mt-2 text-xs text-muted-foreground italic">
                Requires manual grading
              </div>
            )}
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Assessment Editor Component
 *
 * Provides tabbed editing for graded assessments:
 * - Details: Basic metadata
 * - Questions: Question list with points
 * - Scoring: Passing score, grading method
 * - Settings: Time limit, attempts, feedback options
 */
export function AssessmentEditor({
  moduleId: _moduleId,
  courseId: _courseId,
  onSubmit,
  onDirtyChange,
  initialData,
  isLoading = false,
}: AssessmentEditorProps) {
  const config = EDITOR_CONFIGS.assessment;
  const [activeTab, setActiveTab] = useState('details');
  const [questions, setQuestions] = useState<MockAssessmentQuestion[]>(MOCK_QUESTIONS);
  const [noTimeLimit, setNoTimeLimit] = useState(true);
  const [unlimitedAttempts, setUnlimitedAttempts] = useState(false);

  // Question Bank modal state
  const [importPickerOpen, setImportPickerOpen] = useState(false);
  const [questionEditorOpen, setQuestionEditorOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | undefined>();
  const [newQuestionType, setNewQuestionType] = useState<QuestionType>('multiple_choice');

  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

  const form = useForm<AssessmentFormData>({
    resolver: zodResolver(assessmentSchema),
    mode: 'onChange',
    defaultValues: {
      type: 'assessment',
      title: initialData?.title || '',
      description: initialData?.description || '',
      category: initialData?.category || config.defaultCategory,
      estimatedDuration: initialData?.estimatedDuration,
      isRequired: initialData?.isRequired ?? true,
      isReplayable: initialData?.isReplayable ?? true,
      weight: initialData?.weight || 100,
      settings: {
        timeLimit: initialData?.settings?.timeLimit,
        attemptLimit: initialData?.settings?.attemptLimit ?? 3,
        passingScore: initialData?.settings?.passingScore ?? 70,
        showFeedback: initialData?.settings?.showFeedback ?? true,
        shuffleQuestions: initialData?.settings?.shuffleQuestions ?? false,
        shuffleOptions: initialData?.settings?.shuffleOptions ?? false,
        allowBackNavigation: initialData?.settings?.allowBackNavigation ?? true,
        showCorrectAnswers: initialData?.settings?.showCorrectAnswers ?? 'after_submission',
      },
    },
  });

  const passingScore = form.watch('settings.passingScore') ?? 0;
  const { isDirty } = form.formState;

  // Notify parent of dirty state
  if (onDirtyChange && isDirty) {
    onDirtyChange(isDirty);
  }

  const handleAddQuestion = useCallback((type: string) => {
    setNewQuestionType(type as QuestionType);
    setEditingQuestion(undefined);
    setQuestionEditorOpen(true);
  }, []);

  const handleImportFromBank = useCallback(() => {
    setImportPickerOpen(true);
  }, []);

  const handleEditQuestion = useCallback((id: string) => {
    const question = questions.find((q) => q.id === id);
    if (question) {
      // Convert MockAssessmentQuestion to Question format for editing
      const fullQuestion: Question = {
        id: question.id,
        departmentId: 'dept1',
        bankId: null,
        bankName: null,
        types: question.types as QuestionType[],
        text: question.text,
        difficulty: 'medium',
        tags: [],
        points: question.points,
        explanation: null,
        options: question.options?.map((text, i) => ({
          id: `opt-${i}`,
          text,
          isCorrect: text === question.correctAnswer,
        })) || null,
        correctAnswer: question.correctAnswer,
        hierarchy: { parentQuestionId: null, relatedQuestionIds: [], prerequisiteQuestionIds: [], conceptTag: null, difficultyProgression: null },
        usageCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setEditingQuestion(fullQuestion);
      setQuestionEditorOpen(true);
    }
  }, [questions]);

  const handleDeleteQuestion = useCallback((id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  }, []);

  const handleImportQuestions = useCallback((imported: Question[]) => {
    // Convert Question format to MockAssessmentQuestion for display
    const newQuestions: MockAssessmentQuestion[] = imported.map((q) => ({
      id: q.id,
      types: q.types,
      text: q.text,
      points: q.points,
      options: q.options?.map((o) => o.text),
      correctAnswer: q.options?.find((o) => o.isCorrect)?.text || q.correctAnswer,
    }));
    setQuestions((prev) => [...prev, ...newQuestions]);
  }, []);

  const handleSaveQuestion = useCallback((question: Partial<Question>) => {
    const mockQuestion: MockAssessmentQuestion = {
      id: question.id || `q-${Date.now()}`,
      types: question.types || ['multiple_choice'],
      text: question.text || '',
      points: question.points || 10,
      options: question.options?.map((o) => o.text),
      correctAnswer: question.options?.find((o) => o.isCorrect)?.text || question.correctAnswer,
    };

    if (editingQuestion) {
      // Update existing question
      setQuestions((prev) => prev.map((q) => q.id === mockQuestion.id ? mockQuestion : q));
    } else {
      // Add new question
      setQuestions((prev) => [...prev, mockQuestion]);
    }
  }, [editingQuestion]);

  const onFormSubmit = (data: AssessmentFormData) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form id="activity-editor-form" onSubmit={form.handleSubmit(onFormSubmit)}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="scoring">Scoring</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Assessment Details</CardTitle>
              <CardDescription>
                Basic information about this graded assessment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Title <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter assessment title"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe what this assessment covers"
                        rows={3}
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category & Weight */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        value={field.value ?? undefined}
                        onValueChange={(val) => field.onChange(val as LearningUnitCategory)}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CATEGORY_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          disabled={isLoading}
                          value={field.value ?? ''}
                          onChange={(event) => {
                            const value = event.target.value;
                            field.onChange(value === '' ? undefined : Number(value));
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Contribution to final grade
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Required Setting */}
              <div className="pt-4 border-t">
                <FormField
                  control={form.control}
                  name="isRequired"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between space-y-0">
                      <div className="space-y-0.5">
                        <FormLabel>Required for Completion</FormLabel>
                        <FormDescription>
                          Learners must pass this to complete the module
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={!!field.value}
                          onCheckedChange={field.onChange}
                          disabled={isLoading}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Questions Tab */}
        <TabsContent value="questions" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-3">
                    Questions ({questions.length})
                    <Badge variant="outline" className="ml-2">
                      <Target className="mr-1 h-3 w-3" />
                      Total: {totalPoints} points
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Add graded questions with point values
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Question
                        <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {QUESTION_TYPES.map((type) => (
                        <DropdownMenuItem
                          key={type.value}
                          onClick={() => handleAddQuestion(type.value)}
                        >
                          {type.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button variant="outline" onClick={handleImportFromBank}>
                    <BookOpen className="mr-2 h-4 w-4" />
                    Import from Bank
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {questions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No questions yet</p>
                  <p className="text-sm">Add questions or import from the Question Bank</p>
                </div>
              ) : (
                <div>
                  {questions.map((question, index) => (
                    <AssessmentQuestionCard
                      key={question.id}
                      question={question}
                      index={index}
                      onEdit={() => handleEditQuestion(question.id)}
                      onDelete={() => handleDeleteQuestion(question.id)}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scoring Tab */}
        <TabsContent value="scoring" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Scoring Configuration</CardTitle>
              <CardDescription>
                Set passing criteria and grading rules
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Passing Score */}
              <FormField
                control={form.control}
                name="settings.passingScore"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Passing Score (%)</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          className="w-24"
                          disabled={isLoading}
                          value={field.value ?? ''}
                          onChange={(event) => {
                            const value = event.target.value;
                            field.onChange(value === '' ? undefined : Number(value));
                          }}
                        />
                        <span className="text-muted-foreground">%</span>
                      </div>
                    </FormControl>
                    <FormDescription className="text-xs">
                      Minimum score required to pass ({Math.round((passingScore || 0) * totalPoints / 100)} / {totalPoints} points)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Grading Method */}
              <div className="space-y-2">
                <div className="text-sm font-medium">Grading Method</div>
                <div className="space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="gradingMethod"
                      value="highest"
                      defaultChecked
                      className="h-4 w-4"
                    />
                    <span className="text-sm">Highest Attempt</span>
                    <span className="text-xs text-muted-foreground">- Best score counts</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="gradingMethod"
                      value="latest"
                      className="h-4 w-4"
                    />
                    <span className="text-sm">Latest Attempt</span>
                    <span className="text-xs text-muted-foreground">- Most recent score counts</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="gradingMethod"
                      value="average"
                      className="h-4 w-4"
                    />
                    <span className="text-sm">Average of Attempts</span>
                    <span className="text-xs text-muted-foreground">- Mean score counts</span>
                  </label>
                </div>
              </div>

              {/* Point Summary */}
              <div className="pt-4 border-t">
                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Point Summary</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Total Questions:</span>
                      <span className="ml-2 font-medium">{questions.length}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total Points:</span>
                      <span className="ml-2 font-medium">{totalPoints}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Passing Score:</span>
                      <span className="ml-2 font-medium">{passingScore}%</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Points to Pass:</span>
                      <span className="ml-2 font-medium">{Math.round((passingScore || 0) * totalPoints / 100)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Assessment Settings</CardTitle>
              <CardDescription>
                Configure time limits, attempts, and display options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Time Limit */}
              <FormField
                control={form.control}
                name="settings.timeLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time Limit</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <Input
                            type="number"
                            min={1}
                            className="w-24"
                            disabled={isLoading || noTimeLimit}
                            value={field.value ?? ''}
                            onChange={(event) => {
                              const value = event.target.value;
                              field.onChange(value === '' ? undefined : Number(value));
                            }}
                          />
                          <span className="text-muted-foreground">minutes</span>
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={noTimeLimit}
                            onCheckedChange={(checked) => {
                              setNoTimeLimit(!!checked);
                              if (checked) field.onChange(undefined);
                            }}
                          />
                          <span className="text-sm">No time limit</span>
                        </label>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Attempts */}
              <FormField
                control={form.control}
                name="settings.attemptLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Attempts Allowed</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-4">
                        <Input
                          type="number"
                          min={1}
                          className="w-24"
                          disabled={isLoading || unlimitedAttempts}
                          value={field.value ?? ''}
                          onChange={(event) => {
                            const value = event.target.value;
                            field.onChange(value === '' ? undefined : Number(value));
                          }}
                        />
                        <label className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={unlimitedAttempts}
                            onCheckedChange={(checked) => {
                              setUnlimitedAttempts(!!checked);
                              if (checked) field.onChange(undefined);
                            }}
                          />
                          <span className="text-sm">Unlimited attempts</span>
                        </label>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Show Correct Answers */}
              <FormField
                control={form.control}
                name="settings.showCorrectAnswers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Show Correct Answers</FormLabel>
                    <Select
                      value={field.value ?? 'after_submission'}
                      onValueChange={(val) => field.onChange(val as 'never' | 'after_submission' | 'after_due_date')}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SHOW_ANSWERS_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Toggle Settings */}
              <div className="space-y-4 pt-4 border-t">
                <FormField
                  control={form.control}
                  name="settings.showFeedback"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between space-y-0">
                      <div className="space-y-0.5">
                        <FormLabel>Show Immediate Feedback</FormLabel>
                        <FormDescription>
                          Show correct/incorrect after each answer
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={!!field.value}
                          onCheckedChange={field.onChange}
                          disabled={isLoading}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="settings.shuffleQuestions"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between space-y-0">
                      <div className="space-y-0.5">
                        <FormLabel>Shuffle Questions</FormLabel>
                        <FormDescription>
                          Randomize question order
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={!!field.value}
                          onCheckedChange={field.onChange}
                          disabled={isLoading}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="settings.shuffleOptions"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between space-y-0">
                      <div className="space-y-0.5">
                        <FormLabel>Shuffle Answer Options</FormLabel>
                        <FormDescription>
                          Randomize answer choices
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={!!field.value}
                          onCheckedChange={field.onChange}
                          disabled={isLoading}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="settings.allowBackNavigation"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between space-y-0">
                      <div className="space-y-0.5">
                        <FormLabel>Allow Back Navigation</FormLabel>
                        <FormDescription>
                          Let learners return to previous questions
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={!!field.value}
                          onCheckedChange={field.onChange}
                          disabled={isLoading}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Question Bank Modals */}
      <QuestionImportPicker
        open={importPickerOpen}
        onClose={() => setImportPickerOpen(false)}
        departmentId="dept1"
        onImport={handleImportQuestions}
        excludeQuestionIds={questions.map((q) => q.id)}
        isGraded={true}
      />

      <QuestionEditorModal
        open={questionEditorOpen}
        onClose={() => {
          setQuestionEditorOpen(false);
          setEditingQuestion(undefined);
        }}
        onSave={handleSaveQuestion}
        initialData={editingQuestion}
        defaultTypes={[newQuestionType]}
        isGraded={true}
      />
      </form>
    </Form>
  );
}

export default AssessmentEditor;
