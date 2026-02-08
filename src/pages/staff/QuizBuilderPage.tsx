/**
 * Staff Quiz Builder Page
 * Create and manage quizzes for learning activities
 *
 * Supports two modes:
 * - Static: Fixed set of questions defined by manual selection
 * - Dynamic: Random selection from a question bank
 */

import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageHeader } from '@/shared/ui/page-header';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Switch } from '@/shared/ui/switch';
import { Badge } from '@/shared/ui/badge';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form';
import { useToast } from '@/shared/ui/use-toast';
import { useDepartmentContext } from '@/shared/hooks/useDepartmentContext';
import { useQuestionBanks, type QuestionBankListItem } from '@/entities/question-bank';
import { useQuestions, type QuestionListItem } from '@/entities/question';
import {
  Loader2,
  FileQuestion,
  Shuffle,
  AlertCircle,
  Save,
  ArrowLeft,
  Clock,
  Target,
  CheckCircle,
} from 'lucide-react';

// Form schema for quiz configuration
const staticQuizSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  type: z.literal('static'),
  questionIds: z.array(z.string()).min(1, 'At least one question is required'),
  timeLimit: z.number().min(0).default(0), // 0 = unlimited
  passingScore: z.number().min(0).max(100).default(70),
  shuffleQuestions: z.boolean().default(true),
  showFeedback: z.boolean().default(true),
  attemptsAllowed: z.number().min(0).default(0), // 0 = unlimited
});

const dynamicQuizSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  type: z.literal('dynamic'),
  questionBankId: z.string().min(1, 'Question bank is required'),
  questionCount: z.number().min(1).max(100).default(10),
  selectionCriteria: z.object({
    difficulty: z.enum(['easy', 'medium', 'hard', 'mixed']).optional(),
    tags: z.array(z.string()).optional(),
  }).optional(),
  timeLimit: z.number().min(0).default(0),
  passingScore: z.number().min(0).max(100).default(70),
  shuffleQuestions: z.boolean().default(true),
  showFeedback: z.boolean().default(true),
  attemptsAllowed: z.number().min(0).default(0),
});

type StaticQuizFormData = z.infer<typeof staticQuizSchema>;
type DynamicQuizFormData = z.infer<typeof dynamicQuizSchema>;

export const QuizBuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const { quizId, moduleId } = useParams<{ quizId?: string; moduleId?: string }>();
  const { toast } = useToast();
  const { currentDepartmentId, currentDepartmentName } = useDepartmentContext();

  const [quizType, setQuizType] = React.useState<'static' | 'dynamic'>('static');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [selectedQuestionIds, setSelectedQuestionIds] = React.useState<string[]>([]);

  // Fetch question banks for dynamic mode
  const { data: questionBanksData, isLoading: isLoadingBanks } = useQuestionBanks(
    currentDepartmentId || '',
    { limit: 100 },
    { enabled: !!currentDepartmentId }
  );

  // Fetch questions for static mode (from current department's question banks)
  const { data: questionsData, isLoading: isLoadingQuestions } = useQuestions(
    currentDepartmentId || '',
    { limit: 200 },
    { enabled: !!currentDepartmentId }
  );

  const questionBanks: QuestionBankListItem[] = questionBanksData?.questionBanks || [];
  const questions: QuestionListItem[] = questionsData?.questions || [];
  const isEditMode = !!quizId;

  // Form for static quiz
  const staticForm = useForm<StaticQuizFormData>({
    resolver: zodResolver(staticQuizSchema),
    defaultValues: {
      title: '',
      description: '',
      type: 'static',
      questionIds: [],
      timeLimit: 0,
      passingScore: 70,
      shuffleQuestions: true,
      showFeedback: true,
      attemptsAllowed: 0,
    },
  });

  // Form for dynamic quiz
  const dynamicForm = useForm<DynamicQuizFormData>({
    resolver: zodResolver(dynamicQuizSchema),
    defaultValues: {
      title: '',
      description: '',
      type: 'dynamic',
      questionBankId: '',
      questionCount: 10,
      selectionCriteria: { difficulty: 'mixed' },
      timeLimit: 0,
      passingScore: 70,
      shuffleQuestions: true,
      showFeedback: true,
      attemptsAllowed: 0,
    },
  });

  // Handle question selection for static quiz
  const toggleQuestionSelection = (questionId: string) => {
    setSelectedQuestionIds(prev => {
      const newIds = prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId];
      staticForm.setValue('questionIds', newIds);
      return newIds;
    });
  };

  // Submit handler for static quiz
  const handleStaticSubmit = async (data: StaticQuizFormData) => {
    setIsSubmitting(true);
    try {
      // TODO: Call API to create/update quiz

      toast({
        title: isEditMode ? 'Quiz Updated' : 'Quiz Created',
        description: `${data.title} has been ${isEditMode ? 'updated' : 'created'} successfully.`,
      });

      // Navigate back
      if (moduleId) {
        navigate(`/staff/modules/${moduleId}`);
      } else {
        navigate('/staff/quizzes');
      }
    } catch (error) {
      console.error('Failed to save quiz:', error);
      toast({
        title: 'Error',
        description: 'Failed to save quiz. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit handler for dynamic quiz
  const handleDynamicSubmit = async (data: DynamicQuizFormData) => {
    setIsSubmitting(true);
    try {
      // TODO: Call API to create/update quiz

      toast({
        title: isEditMode ? 'Quiz Updated' : 'Quiz Created',
        description: `${data.title} has been ${isEditMode ? 'updated' : 'created'} successfully.`,
      });

      // Navigate back
      if (moduleId) {
        navigate(`/staff/modules/${moduleId}`);
      } else {
        navigate('/staff/quizzes');
      }
    } catch (error) {
      console.error('Failed to save quiz:', error);
      toast({
        title: 'Error',
        description: 'Failed to save quiz. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show department selection prompt if no department selected
  if (!currentDepartmentId) {
    return (
      <div className="container py-6 max-w-4xl">
        <PageHeader
          title="Quiz Builder"
          description="Create quizzes for assessments"
        />
        <Alert className="mt-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please select a department from the sidebar to create a quiz.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container py-6 max-w-4xl">
      <PageHeader
        title={isEditMode ? 'Edit Quiz' : 'Create Quiz'}
        description={`${isEditMode ? 'Edit' : 'Create'} a quiz for ${currentDepartmentName || 'your department'}`}
      />

      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate(-1)}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      {/* Quiz Type Tabs */}
      <Tabs value={quizType} onValueChange={(v) => setQuizType(v as 'static' | 'dynamic')}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="static" className="flex items-center gap-2">
            <FileQuestion className="h-4 w-4" />
            Static Quiz
          </TabsTrigger>
          <TabsTrigger value="dynamic" className="flex items-center gap-2">
            <Shuffle className="h-4 w-4" />
            Dynamic Quiz
          </TabsTrigger>
        </TabsList>

        {/* Static Quiz Form */}
        <TabsContent value="static">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileQuestion className="h-5 w-5" />
                Static Quiz
              </CardTitle>
              <CardDescription>
                Select specific questions to include in this quiz. The same questions
                will be shown to all learners.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...staticForm}>
                <form onSubmit={staticForm.handleSubmit(handleStaticSubmit)} className="space-y-6">
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <FormField
                      control={staticForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quiz Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter quiz title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={staticForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter quiz description"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Question Selection */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium">Select Questions</h3>
                      <Badge variant="secondary">
                        {selectedQuestionIds.length} selected
                      </Badge>
                    </div>

                    {isLoadingQuestions ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : questions.length === 0 ? (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          No questions available. Create questions in the Question Bank first.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <div className="border rounded-md max-h-[400px] overflow-y-auto">
                        {questions.map((question) => (
                          <div
                            key={question.id}
                            className={`flex items-center gap-3 p-3 border-b last:border-b-0 cursor-pointer hover:bg-muted/50 ${
                              selectedQuestionIds.includes(question.id) ? 'bg-primary/5' : ''
                            }`}
                            onClick={() => toggleQuestionSelection(question.id)}
                          >
                            <div className={`h-5 w-5 rounded border flex items-center justify-center ${
                              selectedQuestionIds.includes(question.id)
                                ? 'bg-primary border-primary text-primary-foreground'
                                : 'border-input'
                            }`}>
                              {selectedQuestionIds.includes(question.id) && (
                                <CheckCircle className="h-4 w-4" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {question.questionText}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {question.questionTypes?.[0] || 'unknown'}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {question.points || 1} pts
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {staticForm.formState.errors.questionIds && (
                      <p className="text-sm text-destructive">
                        {staticForm.formState.errors.questionIds.message}
                      </p>
                    )}
                  </div>

                  {/* Quiz Settings */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Quiz Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={staticForm.control}
                          name="timeLimit"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Time Limit (minutes)
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={0}
                                  placeholder="0 = unlimited"
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormDescription>Set to 0 for unlimited time</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={staticForm.control}
                          name="passingScore"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <Target className="h-4 w-4" />
                                Passing Score (%)
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={0}
                                  max={100}
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={staticForm.control}
                          name="attemptsAllowed"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Attempts Allowed</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={0}
                                  placeholder="0 = unlimited"
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormDescription>Set to 0 for unlimited attempts</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex items-center gap-6">
                        <FormField
                          control={staticForm.control}
                          name="shuffleQuestions"
                          render={({ field }) => (
                            <FormItem className="flex items-center gap-2">
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel className="!mt-0">Shuffle Questions</FormLabel>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={staticForm.control}
                          name="showFeedback"
                          render={({ field }) => (
                            <FormItem className="flex items-center gap-2">
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel className="!mt-0">Show Feedback</FormLabel>
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Submit Button */}
                  <div className="flex justify-end gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate(-1)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      <Save className="h-4 w-4 mr-2" />
                      {isEditMode ? 'Update Quiz' : 'Create Quiz'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dynamic Quiz Form */}
        <TabsContent value="dynamic">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shuffle className="h-5 w-5" />
                Dynamic Quiz
              </CardTitle>
              <CardDescription>
                Randomly select questions from a question bank. Each learner
                may receive different questions based on selection criteria.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...dynamicForm}>
                <form onSubmit={dynamicForm.handleSubmit(handleDynamicSubmit)} className="space-y-6">
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <FormField
                      control={dynamicForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quiz Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter quiz title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={dynamicForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter quiz description"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Question Bank Selection */}
                  <div className="space-y-4">
                    <FormField
                      control={dynamicForm.control}
                      name="questionBankId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Question Bank</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a question bank" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {isLoadingBanks ? (
                                <div className="flex items-center justify-center p-4">
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                </div>
                              ) : questionBanks.length === 0 ? (
                                <div className="p-4 text-center text-muted-foreground text-sm">
                                  No question banks available
                                </div>
                              ) : (
                                questionBanks.map((bank) => (
                                  <SelectItem key={bank.id} value={bank.id}>
                                    {bank.name}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={dynamicForm.control}
                        name="questionCount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Number of Questions</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={1}
                                max={100}
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormDescription>
                              How many questions to randomly select
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={dynamicForm.control}
                        name="selectionCriteria.difficulty"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Difficulty Filter</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select difficulty" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="mixed">Mixed</SelectItem>
                                <SelectItem value="easy">Easy</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="hard">Hard</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Quiz Settings */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Quiz Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={dynamicForm.control}
                          name="timeLimit"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Time Limit (minutes)
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={0}
                                  placeholder="0 = unlimited"
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormDescription>Set to 0 for unlimited time</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={dynamicForm.control}
                          name="passingScore"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <Target className="h-4 w-4" />
                                Passing Score (%)
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={0}
                                  max={100}
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={dynamicForm.control}
                          name="attemptsAllowed"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Attempts Allowed</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={0}
                                  placeholder="0 = unlimited"
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormDescription>Set to 0 for unlimited attempts</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex items-center gap-6">
                        <FormField
                          control={dynamicForm.control}
                          name="shuffleQuestions"
                          render={({ field }) => (
                            <FormItem className="flex items-center gap-2">
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel className="!mt-0">Shuffle Questions</FormLabel>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={dynamicForm.control}
                          name="showFeedback"
                          render={({ field }) => (
                            <FormItem className="flex items-center gap-2">
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel className="!mt-0">Show Feedback</FormLabel>
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Submit Button */}
                  <div className="flex justify-end gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate(-1)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      <Save className="h-4 w-4 mr-2" />
                      {isEditMode ? 'Update Quiz' : 'Create Quiz'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
