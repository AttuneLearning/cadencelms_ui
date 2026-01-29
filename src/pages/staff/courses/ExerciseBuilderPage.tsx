/**
 * Exercise Builder Page
 * Staff interface for creating and editing quizzes/assessments
 */

import React, { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Badge } from '@/shared/ui/badge';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { useToast } from '@/shared/ui/use-toast';
import {
  useExercise,
  useCreateExercise,
  useUpdateExercise,
  useExerciseQuestions,
  useBulkAddExerciseQuestions,
  type ExerciseType,
  type ExerciseDifficulty,
  type CreateExercisePayload,
  type UpdateExercisePayload,
  type QuestionReference,
} from '@/entities/exercise';
import { useDepartments } from '@/entities/department';
import { QuestionBankSelector } from '@/features/exercises/ui/QuestionBankSelector';
import { ExercisePreview } from '@/features/exercises/ui/ExercisePreview';
import {
  ArrowLeft,
  Save,
  Eye,
  Loader2,
  Plus,
  Settings as SettingsIcon,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { PageHeader } from '@/shared/ui/page-header';

export const ExerciseBuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const { exerciseId } = useParams<{ exerciseId: string }>();
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('courseId');
  const { toast } = useToast();

  // State
  const [activeTab, setActiveTab] = useState<'settings' | 'questions' | 'preview'>('settings');
  const [showQuestionBank, setShowQuestionBank] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState<QuestionReference[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'quiz' as ExerciseType,
    department: '',
    difficulty: 'medium' as ExerciseDifficulty,
    timeLimit: 0,
    passingScore: 70,
    shuffleQuestions: false,
    showFeedback: true,
    allowReview: true,
    instructions: '',
    attemptsAllowed: 0, // 0 = unlimited
  });

  // Queries
  const { data: departmentsData } = useDepartments({ limit: 1000 });
  const { data: exercise, isLoading: isLoadingExercise } = useExercise(
    exerciseId || '',
    { enabled: !!exerciseId }
  );
  const { data: questionsData } = useExerciseQuestions(
    exerciseId || '',
    { includeAnswers: true },
    { enabled: !!exerciseId }
  );

  // Mutations
  const createExercise = useCreateExercise();
  const updateExercise = useUpdateExercise();
  const bulkAddQuestions = useBulkAddExerciseQuestions();

  // Load exercise data when editing
  React.useEffect(() => {
    if (exercise) {
      setFormData({
        title: exercise.title,
        description: exercise.description || '',
        type: exercise.type,
        department: exercise.department.id,
        difficulty: exercise.difficulty,
        timeLimit: exercise.timeLimit,
        passingScore: exercise.passingScore,
        shuffleQuestions: exercise.shuffleQuestions,
        showFeedback: exercise.showFeedback,
        allowReview: exercise.allowReview,
        instructions: exercise.instructions || '',
        attemptsAllowed: 0, // This field doesn't exist in Exercise type yet
      });
    }
  }, [exercise]);

  // Load existing questions when editing
  React.useEffect(() => {
    if (questionsData?.questions) {
      setSelectedQuestions(
        questionsData.questions.map((q) => ({
          questionId: q.id,
          questionText: q.questionText,
          questionTypes: q.questionTypes,
          options: q.options,
          correctAnswers: q.correctAnswers,
          points: q.points,
          order: q.order,
          explanation: q.explanation,
          difficulty: q.difficulty,
          tags: q.tags,
        }))
      );
    }
  }, [questionsData]);

  // Handle form field changes
  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  // Validation
  const validateSettings = (): string[] => {
    const errors: string[] = [];
    if (!formData.title.trim()) errors.push('Title is required');
    if (!formData.department) errors.push('Department is required');
    if (formData.passingScore < 0 || formData.passingScore > 100) {
      errors.push('Passing score must be between 0 and 100');
    }
    if (formData.timeLimit < 0) errors.push('Time limit cannot be negative');
    return errors;
  };

  // Save exercise settings
  const handleSaveSettings = async () => {
    const errors = validateSettings();
    if (errors.length > 0) {
      toast({
        title: 'Validation Error',
        description: errors.join(', '),
        variant: 'destructive',
      });
      return;
    }

    const payload: CreateExercisePayload | UpdateExercisePayload = {
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

    try {
      if (exerciseId) {
        // Update existing exercise
        await updateExercise.mutateAsync({
          id: exerciseId,
          payload: payload as UpdateExercisePayload,
        });
        toast({
          title: 'Success',
          description: 'Exercise settings updated successfully',
        });
      } else {
        // Create new exercise
        const newExercise = await createExercise.mutateAsync(payload as CreateExercisePayload);
        toast({
          title: 'Success',
          description: 'Exercise created successfully',
        });
        // Navigate to edit mode
        navigate(`/staff/courses/exercises/${newExercise.id}${courseId ? `?courseId=${courseId}` : ''}`);
      }
      setHasUnsavedChanges(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save exercise',
        variant: 'destructive',
      });
    }
  };

  // Save questions
  const handleSaveQuestions = async () => {
    if (!exerciseId) {
      toast({
        title: 'Error',
        description: 'Please save exercise settings first',
        variant: 'destructive',
      });
      return;
    }

    try {
      await bulkAddQuestions.mutateAsync({
        id: exerciseId,
        payload: {
          questions: selectedQuestions,
          mode: 'replace',
        },
      });
      toast({
        title: 'Success',
        description: 'Questions saved successfully',
      });
      setHasUnsavedChanges(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save questions',
        variant: 'destructive',
      });
    }
  };

  // Handle question selection from bank
  const handleQuestionsSelected = (questions: QuestionReference[]) => {
    const newQuestions = questions.map((q, index) => ({
      ...q,
      order: selectedQuestions.length + index,
    }));
    setSelectedQuestions([...selectedQuestions, ...newQuestions]);
    setHasUnsavedChanges(true);
    setShowQuestionBank(false);
  };

  // Remove question
  const handleRemoveQuestion = (index: number) => {
    const updated = selectedQuestions.filter((_, i) => i !== index);
    // Reorder remaining questions
    const reordered = updated.map((q, i) => ({ ...q, order: i }));
    setSelectedQuestions(reordered);
    setHasUnsavedChanges(true);
  };


  // Save and add to module
  const handleSaveAndAddToModule = async () => {
    if (!courseId) {
      toast({
        title: 'Error',
        description: 'No course ID provided',
        variant: 'destructive',
      });
      return;
    }

    // First save everything
    await handleSaveSettings();
    if (exerciseId && selectedQuestions.length > 0) {
      await handleSaveQuestions();
    }

    // TODO: Navigate to course module editor or create module with this exercise
    toast({
      title: 'Success',
      description: 'Exercise ready to be added to course module',
    });
    navigate(`/staff/courses/${courseId}/modules`);
  };

  // Calculate total points
  const totalPoints = selectedQuestions.reduce((sum, q) => sum + (q.points || 0), 0);

  if (isLoadingExercise) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading exercise...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      {/* Header */}
      <PageHeader
        title={exerciseId ? 'Edit Exercise' : 'Create Exercise'}
        description={exerciseId
          ? 'Update exercise settings and questions'
          : 'Build a new quiz or assessment'}
        backButton={
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        }
        className="mb-6"
      >
        {hasUnsavedChanges && (
          <Badge variant="secondary" className="mr-2">
            Unsaved changes
          </Badge>
        )}
        {courseId && (
          <Button variant="default" onClick={handleSaveAndAddToModule}>
            <Save className="mr-2 h-4 w-4" />
            Save & Add to Module
          </Button>
        )}
        {!courseId && (
          <Button
            variant="default"
            onClick={activeTab === 'settings' ? handleSaveSettings : handleSaveQuestions}
            disabled={createExercise.isPending || updateExercise.isPending}
          >
            {(createExercise.isPending || updateExercise.isPending) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
        )}
      </PageHeader>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="settings">
            <SettingsIcon className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="questions" disabled={!exerciseId}>
            <FileText className="h-4 w-4 mr-2" />
            Questions ({selectedQuestions.length})
          </TabsTrigger>
          <TabsTrigger value="preview" disabled={!exerciseId || selectedQuestions.length === 0}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </TabsTrigger>
        </TabsList>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Set up the exercise title, description, and type
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
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  placeholder="e.g., Module 1 Quiz - Introduction to CBT"
                  maxLength={200}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  placeholder="Describe what this exercise covers"
                  rows={3}
                  maxLength={2000}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">
                    Type <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: ExerciseType) => handleFieldChange('type', value)}
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
                      handleFieldChange('difficulty', value)
                    }
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
                <Select
                  value={formData.department}
                  onValueChange={(value) => handleFieldChange('department', value)}
                  disabled={!!exerciseId}
                >
                  <SelectTrigger id="department">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departmentsData?.departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {exerciseId && (
                  <p className="text-xs text-muted-foreground">Department cannot be changed</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea
                  id="instructions"
                  value={formData.instructions}
                  onChange={(e) => handleFieldChange('instructions', e.target.value)}
                  placeholder="Instructions displayed before starting the exercise"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Exercise Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Exercise Settings</CardTitle>
              <CardDescription>
                Configure time limits, scoring, and behavior options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                  <Input
                    id="timeLimit"
                    type="number"
                    value={Math.floor(formData.timeLimit / 60)}
                    onChange={(e) => handleFieldChange('timeLimit', Number(e.target.value) * 60)}
                    min={0}
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
                    onChange={(e) => handleFieldChange('passingScore', Number(e.target.value))}
                    min={0}
                    max={100}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="attemptsAllowed">Attempts Allowed</Label>
                  <Input
                    id="attemptsAllowed"
                    type="number"
                    value={formData.attemptsAllowed}
                    onChange={(e) => handleFieldChange('attemptsAllowed', Number(e.target.value))}
                    min={0}
                    placeholder="0 for unlimited"
                  />
                  <p className="text-xs text-muted-foreground">Set to 0 for unlimited attempts</p>
                </div>
              </div>

              <div className="space-y-3 rounded-lg border p-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="shuffleQuestions"
                    checked={formData.shuffleQuestions}
                    onCheckedChange={(checked) =>
                      handleFieldChange('shuffleQuestions', checked as boolean)
                    }
                  />
                  <Label htmlFor="shuffleQuestions" className="cursor-pointer font-normal">
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
                      handleFieldChange('showFeedback', checked as boolean)
                    }
                  />
                  <Label htmlFor="showFeedback" className="cursor-pointer font-normal">
                    Show Feedback
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground pl-6">
                  Display feedback and explanations after submission
                </p>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="allowReview"
                    checked={formData.allowReview}
                    onCheckedChange={(checked) =>
                      handleFieldChange('allowReview', checked as boolean)
                    }
                  />
                  <Label htmlFor="allowReview" className="cursor-pointer font-normal">
                    Allow Review
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground pl-6">
                  Let learners review their answers after completion
                </p>
              </div>

              {!exerciseId && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    After creating the exercise, you'll be able to add questions from the question
                    bank.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Questions Tab */}
        <TabsContent value="questions" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Questions</CardTitle>
                  <CardDescription>
                    Add and manage questions for this exercise
                  </CardDescription>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-muted-foreground">
                    {selectedQuestions.length} questions • {totalPoints} points
                  </div>
                  <Button onClick={() => setShowQuestionBank(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Questions
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {selectedQuestions.length === 0 ? (
                <div className="flex min-h-[300px] items-center justify-center rounded-lg border border-dashed">
                  <div className="text-center">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">No questions added yet</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Get started by adding questions from the question bank
                    </p>
                    <Button className="mt-4" onClick={() => setShowQuestionBank(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Questions
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedQuestions.map((question, index) => (
                    <Card key={index}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">Q{index + 1}</Badge>
                              <Badge variant="secondary">{question.questionTypes?.[0]}</Badge>
                              <Badge>{question.difficulty}</Badge>
                              <span className="text-sm text-muted-foreground">
                                {question.points || 10} pts
                              </span>
                            </div>
                            <p className="text-sm font-medium">{question.questionText}</p>
                            {question.options && question.options.length > 0 && (
                              <div className="mt-2 pl-4 border-l-2 space-y-1">
                                {question.options.map((option, idx) => (
                                  <div key={idx} className="text-sm text-muted-foreground">
                                    {idx + 1}. {option}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveQuestion(index)}
                          >
                            Remove
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview" className="space-y-6">
          <ExercisePreview
            exercise={{
              id: exerciseId || 'preview',
              title: formData.title,
              description: formData.description,
              type: formData.type,
              difficulty: formData.difficulty,
              timeLimit: formData.timeLimit,
              passingScore: formData.passingScore,
              shuffleQuestions: formData.shuffleQuestions,
              showFeedback: formData.showFeedback,
              allowReview: formData.allowReview,
              instructions: formData.instructions,
              totalPoints,
              questionCount: selectedQuestions.length,
              status: 'draft',
            }}
            questions={selectedQuestions.map((q, idx) => ({
              id: q.questionId || `q-${idx}`,
              questionText: q.questionText || '',
              questionTypes: q.questionTypes || ['multiple_choice'],
              order: q.order || idx,
              points: q.points || 10,
              options: q.options,
              correctAnswers: q.correctAnswers || [],
              explanation: q.explanation,
              difficulty: q.difficulty || 'medium',
              tags: q.tags,
              createdAt: new Date().toISOString(),
            }))}
          />
        </TabsContent>
      </Tabs>

      {/* Question Bank Dialog */}
      <Dialog open={showQuestionBank} onOpenChange={setShowQuestionBank}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Question Bank</DialogTitle>
            <DialogDescription>
              Browse and select questions to add to your exercise
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
            <QuestionBankSelector
              onSelect={handleQuestionsSelected}
              onCancel={() => setShowQuestionBank(false)}
              department={formData.department}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
