/**
 * Staff Match Game Builder Page
 * Create and manage matching game activities for learning
 *
 * Supports two modes:
 * - Static: Fixed set of matching pairs defined inline
 * - Dynamic: Random selection from a question bank (matching-type questions)
 */

import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
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
import { useQuestionBanks } from '@/entities/question-bank';
import {
  Plus,
  Trash2,
  GripVertical,
  Loader2,
  Link2,
  Shuffle,
  AlertCircle,
  Save,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';

// Form schema for matching pairs
const matchingPairSchema = z.object({
  left: z.string().min(1, 'Left side is required'),
  right: z.string().min(1, 'Right side is required'),
});

const staticMatchGameSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  instructions: z.string().optional(),
  type: z.literal('static'),
  pairs: z.array(matchingPairSchema).min(2, 'At least two matching pairs are required'),
  shufflePairs: z.boolean().default(true),
  timeLimit: z.number().min(0).max(60).default(0), // 0 = no limit
  attemptsAllowed: z.number().min(0).max(10).default(3), // 0 = unlimited
  showFeedback: z.boolean().default(true),
  pointsPerMatch: z.number().min(1).max(100).default(10),
});

const dynamicMatchGameSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  instructions: z.string().optional(),
  type: z.literal('dynamic'),
  questionBankId: z.string().min(1, 'Question bank is required'),
  pairCount: z.number().min(2).max(20).default(5),
  selectionCriteria: z.object({
    difficulty: z.enum(['easy', 'medium', 'hard', 'mixed']).optional(),
    tags: z.array(z.string()).optional(),
  }).optional(),
  shufflePairs: z.boolean().default(true),
  timeLimit: z.number().min(0).max(60).default(0),
  attemptsAllowed: z.number().min(0).max(10).default(3),
  showFeedback: z.boolean().default(true),
  pointsPerMatch: z.number().min(1).max(100).default(10),
});

type StaticMatchGameFormData = z.infer<typeof staticMatchGameSchema>;
type DynamicMatchGameFormData = z.infer<typeof dynamicMatchGameSchema>;

export const MatchGameBuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const { moduleId } = useParams<{ moduleId?: string }>();
  const { toast } = useToast();
  const { currentDepartmentId, currentDepartmentName } = useDepartmentContext();

  const [gameType, setGameType] = React.useState<'static' | 'dynamic'>('static');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Fetch question banks for dynamic mode
  const { data: questionBanksData, isLoading: isLoadingBanks } = useQuestionBanks(
    currentDepartmentId || '',
    { limit: 100 },
    { enabled: !!currentDepartmentId && gameType === 'dynamic' }
  );

  // Form for static match game
  const staticForm = useForm<StaticMatchGameFormData>({
    resolver: zodResolver(staticMatchGameSchema),
    defaultValues: {
      title: '',
      description: '',
      instructions: 'Match each item on the left with its corresponding item on the right.',
      type: 'static',
      pairs: [
        { left: '', right: '' },
        { left: '', right: '' },
      ],
      shufflePairs: true,
      timeLimit: 0,
      attemptsAllowed: 3,
      showFeedback: true,
      pointsPerMatch: 10,
    },
  });

  // Form for dynamic match game
  const dynamicForm = useForm<DynamicMatchGameFormData>({
    resolver: zodResolver(dynamicMatchGameSchema),
    defaultValues: {
      title: '',
      description: '',
      instructions: 'Match each item on the left with its corresponding item on the right.',
      type: 'dynamic',
      questionBankId: '',
      pairCount: 5,
      selectionCriteria: { difficulty: 'mixed' },
      shufflePairs: true,
      timeLimit: 0,
      attemptsAllowed: 3,
      showFeedback: true,
      pointsPerMatch: 10,
    },
  });

  // Field array for static pairs
  const { fields, append, remove } = useFieldArray({
    control: staticForm.control,
    name: 'pairs',
  });

  // Handle form submission
  const handleStaticSubmit = async (data: StaticMatchGameFormData) => {
    setIsSubmitting(true);
    try {
      // TODO: Implement API call to create match game
      toast({
        title: 'Match game created',
        description: `"${data.title}" has been created with ${data.pairs.length} matching pairs.`,
      });
      if (moduleId) {
        navigate(`/staff/courses/modules/${moduleId}/edit`);
      } else {
        navigate('/staff/activities');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create match game. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDynamicSubmit = async (data: DynamicMatchGameFormData) => {
    setIsSubmitting(true);
    try {
      // TODO: Implement API call to create dynamic match game
      toast({
        title: 'Match game created',
        description: `"${data.title}" has been created with ${data.pairCount} random pairs.`,
      });
      if (moduleId) {
        navigate(`/staff/courses/modules/${moduleId}/edit`);
      } else {
        navigate('/staff/activities');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create match game. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check for department context
  if (!currentDepartmentId) {
    return (
      <div className="container mx-auto py-6">
        <PageHeader
          title="Match Game Builder"
          description="Create matching game activities"
        />
        <Alert className="mt-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please select a department from the sidebar to create match games.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <PageHeader
        title="Match Game Builder"
        description={`Create matching activities for ${currentDepartmentName || 'your department'}`}
      >
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </PageHeader>

      <Tabs value={gameType} onValueChange={(v) => setGameType(v as 'static' | 'dynamic')} className="mt-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="static">
            <Link2 className="mr-2 h-4 w-4" />
            Static Pairs
          </TabsTrigger>
          <TabsTrigger value="dynamic">
            <Shuffle className="mr-2 h-4 w-4" />
            Dynamic Pairs
          </TabsTrigger>
        </TabsList>

        {/* Static Match Game Form */}
        <TabsContent value="static" className="mt-6">
          <Form {...staticForm}>
            <form onSubmit={staticForm.handleSubmit(handleStaticSubmit)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Match Game Details</CardTitle>
                  <CardDescription>
                    Create a matching activity with specific pairs
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={staticForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Vocabulary Matching" {...field} />
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
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the matching activity..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={staticForm.control}
                    name="instructions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instructions</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Instructions for learners..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <FormField
                      control={staticForm.control}
                      name="timeLimit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Time Limit (min)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              max={60}
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormDescription>0 = unlimited</FormDescription>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={staticForm.control}
                      name="attemptsAllowed"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Attempts</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              max={10}
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormDescription>0 = unlimited</FormDescription>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={staticForm.control}
                      name="pointsPerMatch"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Points/Match</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              max={100}
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 10)}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <div className="space-y-2">
                      <FormField
                        control={staticForm.control}
                        name="shufflePairs"
                        render={({ field }) => (
                          <FormItem className="flex items-center gap-2">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="!mt-0">Shuffle</FormLabel>
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
                            <FormLabel className="!mt-0">Feedback</FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Matching Pairs</span>
                    <Badge variant="secondary">{fields.length} pairs</Badge>
                  </CardTitle>
                  <CardDescription>
                    Define the items that learners will match together
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-[auto_1fr_auto_1fr_auto] gap-2 items-center px-2 py-1 bg-muted rounded-md text-sm font-medium text-muted-foreground">
                    <span></span>
                    <span>Left Side</span>
                    <span></span>
                    <span>Right Side</span>
                    <span></span>
                  </div>

                  {fields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-[auto_1fr_auto_1fr_auto] gap-2 items-center">
                      <div className="cursor-move text-muted-foreground">
                        <GripVertical className="h-5 w-5" />
                      </div>
                      <FormField
                        control={staticForm.control}
                        name={`pairs.${index}.left`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input placeholder={`Item ${index + 1}`} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <FormField
                        control={staticForm.control}
                        name={`pairs.${index}.right`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input placeholder={`Match ${index + 1}`} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        disabled={fields.length <= 2}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => append({ left: '', right: '' })}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Matching Pair
                  </Button>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Create Match Game
                </Button>
              </div>
            </form>
          </Form>
        </TabsContent>

        {/* Dynamic Match Game Form */}
        <TabsContent value="dynamic" className="mt-6">
          <Form {...dynamicForm}>
            <form onSubmit={dynamicForm.handleSubmit(handleDynamicSubmit)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Dynamic Match Game</CardTitle>
                  <CardDescription>
                    Randomly select matching-type questions from a question bank
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={dynamicForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Random Matching Challenge" {...field} />
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
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the matching activity..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={dynamicForm.control}
                    name="questionBankId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Question Bank</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a question bank" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {isLoadingBanks ? (
                              <SelectItem value="" disabled>
                                Loading...
                              </SelectItem>
                            ) : (
                              questionBanksData?.questionBanks.map((bank) => (
                                <SelectItem key={bank.id} value={bank.id}>
                                  {bank.name} ({bank.questionCount} questions)
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Select a bank containing matching-type questions
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <FormField
                      control={dynamicForm.control}
                      name="pairCount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of Pairs</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={2}
                              max={20}
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 5)}
                            />
                          </FormControl>
                          <FormDescription>2-20 pairs</FormDescription>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={dynamicForm.control}
                      name="selectionCriteria.difficulty"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Difficulty</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Any" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="mixed">Mixed</SelectItem>
                              <SelectItem value="easy">Easy</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="hard">Hard</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={dynamicForm.control}
                      name="timeLimit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Time Limit (min)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              max={60}
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormDescription>0 = unlimited</FormDescription>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={dynamicForm.control}
                      name="pointsPerMatch"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Points/Match</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              max={100}
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 10)}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex gap-6">
                    <FormField
                      control={dynamicForm.control}
                      name="shufflePairs"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="!mt-0">Shuffle pairs</FormLabel>
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
                          <FormLabel className="!mt-0">Show feedback</FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Create Match Game
                </Button>
              </div>
            </form>
          </Form>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MatchGameBuilderPage;
