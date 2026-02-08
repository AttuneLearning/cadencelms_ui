/**
 * Staff Flashcard Builder Page
 * Create and manage flashcard sets for learning activities
 *
 * Supports two modes:
 * - Static: Fixed set of flashcards defined inline
 * - Dynamic: Random selection from a question bank (flashcard-type questions)
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
  BookOpen,
  Shuffle,
  AlertCircle,
  Save,
  ArrowLeft,
} from 'lucide-react';

// Form schema
const flashcardSchema = z.object({
  front: z.string().min(1, 'Front content is required'),
  back: z.string().min(1, 'Back content is required'),
  hint: z.string().optional(),
});

const staticFlashcardSetSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  type: z.literal('static'),
  cards: z.array(flashcardSchema).min(1, 'At least one flashcard is required'),
  shuffleCards: z.boolean().default(true),
  masteryThreshold: z.number().min(1).max(10).default(3),
});

const dynamicFlashcardSetSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  type: z.literal('dynamic'),
  questionBankId: z.string().min(1, 'Question bank is required'),
  cardCount: z.number().min(1).max(100).default(10),
  selectionCriteria: z.object({
    difficulty: z.enum(['easy', 'medium', 'hard', 'mixed']).optional(),
    tags: z.array(z.string()).optional(),
  }).optional(),
  shuffleCards: z.boolean().default(true),
  masteryThreshold: z.number().min(1).max(10).default(3),
});

type StaticFlashcardSetFormData = z.infer<typeof staticFlashcardSetSchema>;
type DynamicFlashcardSetFormData = z.infer<typeof dynamicFlashcardSetSchema>;

export const FlashcardBuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const { moduleId } = useParams<{ moduleId?: string }>();
  const { toast } = useToast();
  const { currentDepartmentId, currentDepartmentName } = useDepartmentContext();

  const [flashcardType, setFlashcardType] = React.useState<'static' | 'dynamic'>('static');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Fetch question banks for dynamic mode
  const { data: questionBanksData, isLoading: isLoadingBanks } = useQuestionBanks(
    currentDepartmentId || '',
    { limit: 100 },
    { enabled: !!currentDepartmentId && flashcardType === 'dynamic' }
  );

  // Form for static flashcards
  const staticForm = useForm<StaticFlashcardSetFormData>({
    resolver: zodResolver(staticFlashcardSetSchema),
    defaultValues: {
      title: '',
      description: '',
      type: 'static',
      cards: [{ front: '', back: '', hint: '' }],
      shuffleCards: true,
      masteryThreshold: 3,
    },
  });

  // Form for dynamic flashcards
  const dynamicForm = useForm<DynamicFlashcardSetFormData>({
    resolver: zodResolver(dynamicFlashcardSetSchema),
    defaultValues: {
      title: '',
      description: '',
      type: 'dynamic',
      questionBankId: '',
      cardCount: 10,
      selectionCriteria: { difficulty: 'mixed' },
      shuffleCards: true,
      masteryThreshold: 3,
    },
  });

  // Field array for static cards
  const { fields, append, remove } = useFieldArray({
    control: staticForm.control,
    name: 'cards',
  });

  // Handle form submission
  const handleStaticSubmit = async (data: StaticFlashcardSetFormData) => {
    setIsSubmitting(true);
    try {
      // TODO: Implement API call to create flashcard set
      toast({
        title: 'Flashcard set created',
        description: `"${data.title}" has been created with ${data.cards.length} cards.`,
      });
      if (moduleId) {
        navigate(`/staff/courses/modules/${moduleId}/edit`);
      } else {
        navigate('/staff/flashcards');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create flashcard set. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDynamicSubmit = async (data: DynamicFlashcardSetFormData) => {
    setIsSubmitting(true);
    try {
      // TODO: Implement API call to create dynamic flashcard set
      toast({
        title: 'Flashcard set created',
        description: `"${data.title}" has been created with ${data.cardCount} random cards.`,
      });
      if (moduleId) {
        navigate(`/staff/courses/modules/${moduleId}/edit`);
      } else {
        navigate('/staff/flashcards');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create flashcard set. Please try again.',
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
          title="Flashcard Builder"
          description="Create flashcard sets for learning activities"
        />
        <Alert className="mt-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please select a department from the sidebar to create flashcard sets.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <PageHeader
        title="Flashcard Builder"
        description={`Create flashcard sets for ${currentDepartmentName || 'your department'}`}
      >
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </PageHeader>

      <Tabs value={flashcardType} onValueChange={(v) => setFlashcardType(v as 'static' | 'dynamic')} className="mt-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="static">
            <BookOpen className="mr-2 h-4 w-4" />
            Static Cards
          </TabsTrigger>
          <TabsTrigger value="dynamic">
            <Shuffle className="mr-2 h-4 w-4" />
            Dynamic Cards
          </TabsTrigger>
        </TabsList>

        {/* Static Flashcard Set Form */}
        <TabsContent value="static" className="mt-6">
          <Form {...staticForm}>
            <form onSubmit={staticForm.handleSubmit(handleStaticSubmit)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Flashcard Set Details</CardTitle>
                  <CardDescription>
                    Create a fixed set of flashcards with specific content
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
                          <Input placeholder="e.g., Key Terminology" {...field} />
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
                            placeholder="Describe what learners will study..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-6">
                    <FormField
                      control={staticForm.control}
                      name="shuffleCards"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="!mt-0">Shuffle cards</FormLabel>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={staticForm.control}
                      name="masteryThreshold"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2">
                          <FormLabel>Mastery threshold:</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              max={10}
                              className="w-20"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription className="!mt-0">correct answers</FormDescription>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Flashcards</span>
                    <Badge variant="secondary">{fields.length} cards</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {fields.map((field, index) => (
                    <Card key={field.id} className="border-dashed">
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-2">
                          <div className="cursor-move pt-2 text-muted-foreground">
                            <GripVertical className="h-5 w-5" />
                          </div>
                          <div className="flex-1 space-y-3">
                            <div className="flex gap-4">
                              <FormField
                                control={staticForm.control}
                                name={`cards.${index}.front`}
                                render={({ field }) => (
                                  <FormItem className="flex-1">
                                    <FormLabel>Front</FormLabel>
                                    <FormControl>
                                      <Textarea
                                        placeholder="Term or question"
                                        className="min-h-[80px]"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={staticForm.control}
                                name={`cards.${index}.back`}
                                render={({ field }) => (
                                  <FormItem className="flex-1">
                                    <FormLabel>Back</FormLabel>
                                    <FormControl>
                                      <Textarea
                                        placeholder="Definition or answer"
                                        className="min-h-[80px]"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <FormField
                              control={staticForm.control}
                              name={`cards.${index}.hint`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Hint (optional)</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Optional hint for learners" {...field} />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => remove(index)}
                            disabled={fields.length === 1}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => append({ front: '', back: '', hint: '' })}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Flashcard
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
                  Create Flashcard Set
                </Button>
              </div>
            </form>
          </Form>
        </TabsContent>

        {/* Dynamic Flashcard Set Form */}
        <TabsContent value="dynamic" className="mt-6">
          <Form {...dynamicForm}>
            <form onSubmit={dynamicForm.handleSubmit(handleDynamicSubmit)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Dynamic Flashcard Set</CardTitle>
                  <CardDescription>
                    Randomly select flashcard-type questions from a question bank
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
                          <Input placeholder="e.g., Random Study Session" {...field} />
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
                            placeholder="Describe the study session..."
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
                          Select a bank containing flashcard-type questions
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-6">
                    <FormField
                      control={dynamicForm.control}
                      name="cardCount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of Cards</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              max={100}
                              className="w-32"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            How many cards to randomly select
                          </FormDescription>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={dynamicForm.control}
                      name="selectionCriteria.difficulty"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Difficulty Filter</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-40">
                                <SelectValue placeholder="Any difficulty" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="mixed">Mixed</SelectItem>
                              <SelectItem value="easy">Easy Only</SelectItem>
                              <SelectItem value="medium">Medium Only</SelectItem>
                              <SelectItem value="hard">Hard Only</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex gap-6">
                    <FormField
                      control={dynamicForm.control}
                      name="shuffleCards"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="!mt-0">Shuffle cards</FormLabel>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={dynamicForm.control}
                      name="masteryThreshold"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2">
                          <FormLabel>Mastery threshold:</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              max={10}
                              className="w-20"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription className="!mt-0">correct answers</FormDescription>
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
                  Create Flashcard Set
                </Button>
              </div>
            </form>
          </Form>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FlashcardBuilderPage;
