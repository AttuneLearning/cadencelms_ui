/**
 * Exercise Editor
 * Full-page editor for practice exercises (ungraded quizzes)
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
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { exerciseSchema, type ExerciseFormData } from '../../lib/validation';
import { EDITOR_CONFIGS } from '../../model/editor-config';
import type { LearningUnitCategory } from '@/entities/learning-unit';
import { QuestionImportPicker } from '../question-bank/QuestionImportPicker';
import { QuestionEditorModal } from '../question-bank/QuestionEditorModal';
import {
  type Question,
  type QuestionType,
} from '../../model/question-types';

const CATEGORY_OPTIONS: { value: LearningUnitCategory; label: string }[] = [
  { value: 'practice', label: 'Practice' },
  { value: 'topic', label: 'Topic (Instructional)' },
];

const QUESTION_TYPES = [
  { value: 'multiple_choice', label: 'Multiple Choice' },
  { value: 'true_false', label: 'True/False' },
  { value: 'short_answer', label: 'Short Answer' },
  { value: 'matching', label: 'Matching' },
  { value: 'flashcard', label: 'Flashcard' },
];

/**
 * Mock question for display
 * Note: `types` is an array to support multiple presentation formats
 */
interface MockQuestion {
  id: string;
  types: string[];
  text: string;
  options?: string[];
  correctAnswer?: string;
}

const MOCK_QUESTIONS: MockQuestion[] = [
  {
    id: '1',
    types: ['multiple_choice'],
    text: 'What is the capital of France?',
    options: ['London', 'Paris', 'Berlin', 'Madrid'],
    correctAnswer: 'Paris',
  },
  {
    id: '2',
    types: ['true_false'],
    text: 'The Earth is flat.',
    correctAnswer: 'False',
  },
];

export interface ExerciseEditorProps {
  moduleId: string;
  courseId: string;
  onSubmit: (data: ExerciseFormData) => void | Promise<void>;
  onDirtyChange?: (isDirty: boolean) => void;
  initialData?: Partial<ExerciseFormData>;
  isLoading?: boolean;
}

/**
 * Question Card Component
 */
function QuestionCard({
  question,
  index,
  onEdit,
  onDelete,
}: {
  question: MockQuestion;
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
              <span className="text-xs text-muted-foreground">Practice (no points)</span>
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
            {question.types.includes('true_false') && (
              <div className="mt-2 text-xs text-muted-foreground">
                Answer: {question.correctAnswer}
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
 * Exercise Editor Component
 *
 * Provides tabbed editing for practice exercises:
 * - Details: Basic metadata
 * - Questions: Question list with add/import
 * - Settings: Feedback and randomization options
 */
export function ExerciseEditor({
  moduleId: _moduleId,
  courseId: _courseId,
  onSubmit,
  onDirtyChange,
  initialData,
  isLoading = false,
}: ExerciseEditorProps) {
  const config = EDITOR_CONFIGS.exercise;
  const [activeTab, setActiveTab] = useState('details');
  const [questions, setQuestions] = useState<MockQuestion[]>(MOCK_QUESTIONS);

  // Question Bank modal state
  const [importPickerOpen, setImportPickerOpen] = useState(false);
  const [questionEditorOpen, setQuestionEditorOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | undefined>();
  const [newQuestionType, setNewQuestionType] = useState<QuestionType>('multiple_choice');

  const form = useForm<ExerciseFormData>({
    resolver: zodResolver(exerciseSchema),
    mode: 'onChange',
    defaultValues: {
      type: 'exercise',
      title: initialData?.title || '',
      description: initialData?.description || '',
      category: initialData?.category || config.defaultCategory,
      estimatedDuration: initialData?.estimatedDuration,
      isRequired: initialData?.isRequired ?? true,
      isReplayable: initialData?.isReplayable ?? true,
      settings: {
        showFeedback: initialData?.settings?.showFeedback ?? true,
        shuffleQuestions: initialData?.settings?.shuffleQuestions ?? false,
      },
    },
  });

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
      // Convert MockQuestion to Question format for editing
      const fullQuestion: Question = {
        id: question.id,
        departmentId: 'dept1',
        bankId: null,
        bankName: null,
        types: question.types as QuestionType[],
        text: question.text,
        difficulty: 'medium',
        tags: [],
        points: 0, // Practice exercises don't use points
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
    // Convert Question format to MockQuestion for display
    const newQuestions: MockQuestion[] = imported.map((q) => ({
      id: q.id,
      types: q.types,
      text: q.text,
      options: q.options?.map((o) => o.text),
      correctAnswer: q.options?.find((o) => o.isCorrect)?.text || q.correctAnswer,
    }));
    setQuestions((prev) => [...prev, ...newQuestions]);
  }, []);

  const handleSaveQuestion = useCallback((question: Partial<Question>) => {
    const mockQuestion: MockQuestion = {
      id: question.id || `q-${Date.now()}`,
      types: question.types || ['multiple_choice'],
      text: question.text || '',
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

  const onFormSubmit = (data: ExerciseFormData) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form id="activity-editor-form" onSubmit={form.handleSubmit(onFormSubmit)}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

        {/* Details Tab */}
        <TabsContent value="details" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Exercise Details</CardTitle>
              <CardDescription>
                Basic information about this practice exercise
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
                        placeholder="Enter exercise title"
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
                        placeholder="Describe what learners will practice"
                        rows={3}
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category */}
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

              {/* Estimated Duration */}
              <FormField
                control={form.control}
                name="estimatedDuration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        placeholder="e.g., 15"
                        disabled={isLoading}
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

              {/* Required/Replayable Settings */}
              <div className="space-y-4 pt-4 border-t">
                <FormField
                  control={form.control}
                  name="isRequired"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between space-y-0">
                      <div className="space-y-0.5">
                        <FormLabel>Required for Completion</FormLabel>
                        <FormDescription>
                          Learners must complete this to finish the module
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
                  name="isReplayable"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between space-y-0">
                      <div className="space-y-0.5">
                        <FormLabel>Allow Retry</FormLabel>
                        <FormDescription>
                          Learners can retake this exercise
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
                  <CardTitle>Questions ({questions.length})</CardTitle>
                  <CardDescription>
                    Add practice questions (no points awarded)
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
                    <QuestionCard
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

        {/* Settings Tab */}
        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Exercise Settings</CardTitle>
              <CardDescription>
                Configure how learners experience this exercise
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="settings.showFeedback"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between space-y-0">
                    <div className="space-y-0.5">
                      <FormLabel>Show Immediate Feedback</FormLabel>
                      <FormDescription>
                        Show correct/incorrect feedback after each answer
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
                        Randomize question order for each attempt
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
        isGraded={false}
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
        isGraded={false}
      />
      </form>
    </Form>
  );
}

export default ExerciseEditor;
