/**
 * Exercise Management Page
 * Admin interface for managing exercises with CRUD operations
 */

import React from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { DataTable } from '@/shared/ui/data-table';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Checkbox } from '@/shared/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
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
import { useToast } from '@/shared/ui/use-toast';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import { PageHeader } from '@/shared/ui/page-header';
import { ExerciseForm, QuestionSelector } from '@/entities/exercise';
import {
  useExercises,
  useCreateExercise,
  useUpdateExercise,
  useDeleteExercise,
  usePublishExercise,
  useUnpublishExercise,
  useArchiveExercise,
  useExerciseQuestions,
  useAddExerciseQuestion,
  useRemoveExerciseQuestion,
  type ExerciseListItem,
  type Exercise,
  type ExerciseStatus,
  type ExerciseType,
  type ExerciseDifficulty,
  type ExerciseFilters,
  type CreateExercisePayload,
  type UpdateExercisePayload,
  type QuestionFormData,
} from '@/entities/exercise';
import { useDepartments } from '@/entities/department';
import {
  MoreHorizontal,
  Plus,
  Trash,
  Edit,
  Eye,
  EyeOff,
  Archive,
  Loader2,
  Filter,
  X,
  List,
  FileText,
  Clock,
  Award,
} from 'lucide-react';
import { Label } from '@/shared/ui/label';
import { Card } from '@/shared/ui/card';

export const ExerciseManagementPage: React.FC = () => {
  // State for selections and dialogs
  const [selectedExercises, setSelectedExercises] = React.useState<ExerciseListItem[]>([]);
  const [exerciseToEdit, setExerciseToEdit] = React.useState<ExerciseListItem | null>(null);
  const [exerciseToDelete, setExerciseToDelete] = React.useState<string | null>(null);
  const [exerciseToPublish, setExerciseToPublish] = React.useState<{
    id: string;
    action: 'publish' | 'unpublish';
  } | null>(null);
  const [exerciseToArchive, setExerciseToArchive] = React.useState<string | null>(null);
  const [exerciseToManageQuestions, setExerciseToManageQuestions] = React.useState<string | null>(
    null
  );
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = React.useState(false);
  const [isPublishConfirmOpen, setIsPublishConfirmOpen] = React.useState(false);
  const [isArchiveConfirmOpen, setIsArchiveConfirmOpen] = React.useState(false);
  const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] = React.useState(false);

  // State for filters
  const [filters, setFilters] = React.useState<ExerciseFilters>({
    page: 1,
    limit: 50,
  });
  const [showFilters, setShowFilters] = React.useState(false);

  const { toast } = useToast();

  // Fetch exercises with filters
  const { data: exercisesData, isLoading, error } = useExercises(filters);

  // Fetch departments for filters and forms
  const { data: departmentsData } = useDepartments({ limit: 1000 });

  // Fetch questions for management modal
  const { data: questionsData, isLoading: isLoadingQuestions } = useExerciseQuestions(
    exerciseToManageQuestions || '',
    { includeAnswers: true },
    { enabled: !!exerciseToManageQuestions }
  );

  // Mutations - Exercise CRUD
  const createExercise = useCreateExercise();
  const updateExercise = useUpdateExercise();

  const deleteExercise = useDeleteExercise();

  const publishExercise = usePublishExercise();

  const unpublishExercise = useUnpublishExercise();

  const archiveExercise = useArchiveExercise();

  // Mutations - Question Management
  const addQuestion = useAddExerciseQuestion();
  const removeQuestion = useRemoveExerciseQuestion();

  // Action handlers
  const handleDelete = (id: string) => {
    setExerciseToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  const handleBulkDelete = () => {
    setIsBulkDeleteConfirmOpen(true);
  };

  const handlePublishToggle = (exercise: ExerciseListItem) => {
    const status = exercisesData?.exercises.find((e) => e.id === exercise.id)?.status;
    setExerciseToPublish({
      id: exercise.id,
      action: status === 'published' ? 'unpublish' : 'publish',
    });
    setIsPublishConfirmOpen(true);
  };

  const handleArchive = (id: string) => {
    setExerciseToArchive(id);
    setIsArchiveConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (exerciseToDelete) {
      deleteExercise.mutate(exerciseToDelete, {
        onSuccess: () => {
          toast({
            title: 'Exercise deleted',
            description: 'Exercise has been successfully deleted.',
          });
          setIsDeleteConfirmOpen(false);
          setExerciseToDelete(null);
        },
        onError: (error) => {
          toast({
            title: 'Error',
            description: error.message || 'Failed to delete exercise. Please try again.',
            variant: 'destructive',
          });
        },
      });
    }
  };

  const confirmBulkDelete = async () => {
    try {
      await Promise.all(selectedExercises.map((exercise) => deleteExercise.mutateAsync(exercise.id)));
      toast({
        title: 'Exercises deleted',
        description: `${selectedExercises.length} exercise(s) have been successfully deleted.`,
      });
      setSelectedExercises([]);
      setIsBulkDeleteConfirmOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete some exercises. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const confirmPublish = () => {
    if (exerciseToPublish) {
      if (exerciseToPublish.action === 'publish') {
        publishExercise.mutate(exerciseToPublish.id, {
          onSuccess: () => {
            toast({
              title: 'Exercise published',
              description: 'Exercise is now visible to learners.',
            });
            setIsPublishConfirmOpen(false);
            setExerciseToPublish(null);
          },
          onError: (error) => {
            toast({
              title: 'Error',
              description: error.message || 'Failed to publish exercise. Please try again.',
              variant: 'destructive',
            });
          },
        });
      } else {
        unpublishExercise.mutate(exerciseToPublish.id, {
          onSuccess: () => {
            toast({
              title: 'Exercise unpublished',
              description: 'Exercise is no longer visible to learners.',
            });
            setIsPublishConfirmOpen(false);
            setExerciseToPublish(null);
          },
          onError: (error) => {
            toast({
              title: 'Error',
              description: error.message || 'Failed to unpublish exercise. Please try again.',
              variant: 'destructive',
            });
          },
        });
      }
    }
  };

  const confirmArchive = () => {
    if (exerciseToArchive) {
      archiveExercise.mutate(exerciseToArchive, {
        onSuccess: () => {
          toast({
            title: 'Exercise archived',
            description: 'Exercise has been archived.',
          });
          setIsArchiveConfirmOpen(false);
          setExerciseToArchive(null);
        },
        onError: (error) => {
          toast({
            title: 'Error',
            description: error.message || 'Failed to archive exercise. Please try again.',
            variant: 'destructive',
          });
        },
      });
    }
  };

  const handleFormSubmit = (data: CreateExercisePayload | UpdateExercisePayload) => {
    if (exerciseToEdit) {
      // Edit mode
      updateExercise.mutate(
        { id: exerciseToEdit.id, payload: data as UpdateExercisePayload },
        {
          onSuccess: () => {
            toast({
              title: 'Exercise updated',
              description: 'Exercise has been successfully updated.',
            });
            setExerciseToEdit(null);
          },
          onError: (error) => {
            toast({
              title: 'Error',
              description: error.message || 'Failed to update exercise. Please try again.',
              variant: 'destructive',
            });
          },
        }
      );
    } else {
      // Create mode
      createExercise.mutate(data as CreateExercisePayload, {
        onSuccess: () => {
          toast({
            title: 'Exercise created',
            description: 'Exercise has been successfully created.',
          });
          setIsCreateDialogOpen(false);
        },
        onError: (error) => {
          toast({
            title: 'Error',
            description: error.message || 'Failed to create exercise. Please try again.',
            variant: 'destructive',
          });
        },
      });
    }
  };

  const handleAddQuestion = (question: QuestionFormData) => {
    if (exerciseToManageQuestions) {
      addQuestion.mutate(
        { id: exerciseToManageQuestions, payload: question },
        {
          onSuccess: () => {
            toast({
              title: 'Question added',
              description: 'Question has been successfully added.',
            });
          },
          onError: (error) => {
            toast({
              title: 'Error',
              description: error.message || 'Failed to add question. Please try again.',
              variant: 'destructive',
            });
          },
        }
      );
    }
  };

  const handleRemoveQuestion = (questionId: string) => {
    if (exerciseToManageQuestions) {
      removeQuestion.mutate(
        { id: exerciseToManageQuestions, questionId },
        {
          onSuccess: () => {
            toast({
              title: 'Question removed',
              description: 'Question has been successfully removed.',
            });
          },
          onError: (error) => {
            toast({
              title: 'Error',
              description: error.message || 'Failed to remove question. Please try again.',
              variant: 'destructive',
            });
          },
        }
      );
    }
  };

  const handleFilterChange = (key: keyof ExerciseFilters, value: string | undefined) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
      page: 1, // Reset to first page when filters change
    }));
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 50,
    });
  };

  const hasActiveFilters =
    filters.department || filters.status || filters.type || filters.difficulty || filters.search;

  // Define columns
  const columns: ColumnDef<ExerciseListItem>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => {
        const exercise = row.original;
        return (
          <div>
            <div className="font-medium">{exercise.title}</div>
            {exercise.description && (
              <div className="text-sm text-muted-foreground line-clamp-1">
                {exercise.description}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => {
        const type = row.original.type;
        return <Badge variant="secondary">{formatType(type)}</Badge>;
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        return <Badge variant={getStatusVariant(status)}>{formatStatus(status)}</Badge>;
      },
    },
    {
      accessorKey: 'difficulty',
      header: 'Difficulty',
      cell: ({ row }) => {
        const difficulty = row.original.difficulty;
        return (
          <Badge variant="outline" className={getDifficultyColor(difficulty)}>
            {formatDifficulty(difficulty)}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'questionCount',
      header: 'Questions',
      cell: ({ row }) => {
        const exercise = row.original;
        return (
          <div className="flex items-center gap-1 text-center">
            <List className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{exercise.questionCount}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'totalPoints',
      header: 'Points',
      cell: ({ row }) => {
        const exercise = row.original;
        return (
          <div className="flex items-center gap-1 text-center">
            <Award className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{exercise.totalPoints}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'timeLimit',
      header: 'Time Limit',
      cell: ({ row }) => {
        const exercise = row.original;
        return (
          <div className="flex items-center gap-1 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>
              {exercise.timeLimit > 0
                ? `${Math.floor(exercise.timeLimit / 60)} min`
                : 'Unlimited'}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'passingScore',
      header: 'Pass %',
      cell: ({ row }) => {
        const exercise = row.original;
        return <span className="font-medium">{exercise.passingScore}%</span>;
      },
    },
    {
      accessorKey: 'updatedAt',
      header: 'Last Updated',
      cell: ({ row }) => {
        const updated = row.original.updatedAt;
        return (
          <span className="text-sm text-muted-foreground">
            {format(new Date(updated), 'MMM dd, yyyy')}
          </span>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const exercise = row.original;
        const isPublished = exercise.status === 'published';
        const isArchived = exercise.status === 'archived';

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setExerciseToEdit(exercise)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Exercise
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setExerciseToManageQuestions(exercise.id)}>
                <FileText className="mr-2 h-4 w-4" />
                Manage Questions
              </DropdownMenuItem>
              {!isArchived && (
                <DropdownMenuItem onClick={() => handlePublishToggle(exercise)}>
                  {isPublished ? (
                    <>
                      <EyeOff className="mr-2 h-4 w-4" />
                      Unpublish
                    </>
                  ) : (
                    <>
                      <Eye className="mr-2 h-4 w-4" />
                      Publish
                    </>
                  )}
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {!isArchived && (
                <DropdownMenuItem onClick={() => handleArchive(exercise.id)}>
                  <Archive className="mr-2 h-4 w-4" />
                  Archive
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => handleDelete(exercise.id)}
                className="text-destructive"
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete Exercise
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <PageHeader
        title="Exercise Management"
        description="Manage exercises, quizzes, exams, and assessments"
      >
        {selectedExercises.length > 0 && (
          <Button variant="destructive" onClick={handleBulkDelete}>
            <Trash className="mr-2 h-4 w-4" />
            Delete Selected ({selectedExercises.length})
          </Button>
        )}
        <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
          <Filter className="mr-2 h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-2">
              {
                Object.keys(filters).filter(
                  (k) => k !== 'page' && k !== 'limit' && filters[k as keyof ExerciseFilters]
                ).length
              }
            </Badge>
          )}
        </Button>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Exercise
        </Button>
      </PageHeader>

      {/* Filters */}
      {showFilters && (
        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Filters</h3>
              <p className="text-sm text-muted-foreground">
                Filter exercises by type, status, difficulty, department, or search
              </p>
            </div>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="mr-2 h-4 w-4" />
                Clear All
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label htmlFor="filter-type">Type</Label>
              <Select
                value={filters.type || 'all'}
                onValueChange={(value) =>
                  handleFilterChange('type', value === 'all' ? undefined : value)
                }
              >
                <SelectTrigger id="filter-type">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="quiz">Quiz</SelectItem>
                  <SelectItem value="exam">Exam</SelectItem>
                  <SelectItem value="practice">Practice</SelectItem>
                  <SelectItem value="assessment">Assessment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="filter-status">Status</Label>
              <Select
                value={filters.status || 'all'}
                onValueChange={(value) =>
                  handleFilterChange('status', value === 'all' ? undefined : value)
                }
              >
                <SelectTrigger id="filter-status">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="filter-difficulty">Difficulty</Label>
              <Select
                value={filters.difficulty || 'all'}
                onValueChange={(value) =>
                  handleFilterChange('difficulty', value === 'all' ? undefined : value)
                }
              >
                <SelectTrigger id="filter-difficulty">
                  <SelectValue placeholder="All difficulties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Difficulties</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="filter-department">Department</Label>
              <Select
                value={filters.department || 'all'}
                onValueChange={(value) =>
                  handleFilterChange('department', value === 'all' ? undefined : value)
                }
              >
                <SelectTrigger id="filter-department">
                  <SelectValue placeholder="All departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departmentsData?.departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="filter-search">Search</Label>
              <div className="relative">
                <input
                  id="filter-search"
                  type="text"
                  placeholder="Search exercises..."
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card className="p-6 border-destructive">
          <div className="text-destructive">
            <h3 className="font-semibold mb-2">Error loading exercises</h3>
            <p className="text-sm">{error.message}</p>
          </div>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading exercises...</span>
        </div>
      )}

      {/* Data Table */}
      {!isLoading && !error && (
        <DataTable
          columns={columns}
          data={exercisesData?.exercises || []}
          searchable
          searchPlaceholder="Search exercises..."
          onRowSelectionChange={setSelectedExercises}
        />
      )}

      {/* Pagination Info */}
      {exercisesData?.pagination && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div>
            Showing {exercisesData.exercises.length} of {exercisesData.pagination.total} exercise(s)
          </div>
          <div>
            Page {exercisesData.pagination.page} of {exercisesData.pagination.totalPages}
          </div>
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Exercise</DialogTitle>
            <DialogDescription>
              Fill in the information to create a new exercise, quiz, or exam.
            </DialogDescription>
          </DialogHeader>
          <ExerciseForm
            onSubmit={handleFormSubmit}
            onCancel={() => setIsCreateDialogOpen(false)}
            isLoading={createExercise.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={!!exerciseToEdit}
        onOpenChange={(open) => {
          if (!open) {
            setExerciseToEdit(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Exercise</DialogTitle>
            <DialogDescription>Update the exercise information below.</DialogDescription>
          </DialogHeader>
          {exerciseToEdit && (
            <ExerciseForm
              exercise={
                {
                  id: exerciseToEdit.id,
                  title: exerciseToEdit.title,
                  description: exerciseToEdit.description,
                  type: exerciseToEdit.type,
                  department: {
                    id: exerciseToEdit.department,
                    name: '',
                  },
                  difficulty: exerciseToEdit.difficulty,
                  timeLimit: exerciseToEdit.timeLimit,
                  passingScore: exerciseToEdit.passingScore,
                  totalPoints: exerciseToEdit.totalPoints,
                  questionCount: exerciseToEdit.questionCount,
                  shuffleQuestions: exerciseToEdit.shuffleQuestions,
                  showFeedback: exerciseToEdit.showFeedback,
                  allowReview: exerciseToEdit.allowReview,
                  status: exerciseToEdit.status,
                  createdBy: {
                    id: exerciseToEdit.createdBy,
                    firstName: '',
                    lastName: '',
                  },
                  createdAt: exerciseToEdit.createdAt,
                  updatedAt: exerciseToEdit.updatedAt,
                } as Exercise
              }
              onSubmit={handleFormSubmit}
              onCancel={() => setExerciseToEdit(null)}
              isLoading={updateExercise.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Question Management Dialog */}
      <Dialog
        open={!!exerciseToManageQuestions}
        onOpenChange={(open) => {
          if (!open) {
            setExerciseToManageQuestions(null);
          }
        }}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Questions</DialogTitle>
            <DialogDescription>
              {questionsData?.exerciseTitle && `Add or remove questions for "${questionsData.exerciseTitle}"`}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6">
            {isLoadingQuestions ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading questions...</span>
              </div>
            ) : (
              <QuestionSelector
                questions={questionsData?.questions || []}
                onAddQuestion={handleAddQuestion}
                onRemoveQuestion={handleRemoveQuestion}
                isLoading={addQuestion.isPending || removeQuestion.isPending}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        onConfirm={confirmDelete}
        title="Delete Exercise"
        description="Are you sure you want to delete this exercise? This will also remove all associated questions and learner attempts. This action cannot be undone."
        confirmText="Delete"
        isDestructive
        isLoading={deleteExercise.isPending}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmDialog
        open={isBulkDeleteConfirmOpen}
        onOpenChange={setIsBulkDeleteConfirmOpen}
        onConfirm={confirmBulkDelete}
        title="Delete Multiple Exercises"
        description={`Are you sure you want to delete ${selectedExercises.length} exercise(s)? This will also remove all associated questions and learner attempts. This action cannot be undone.`}
        confirmText="Delete All"
        isDestructive
        isLoading={deleteExercise.isPending}
      />

      {/* Publish/Unpublish Confirmation */}
      <ConfirmDialog
        open={isPublishConfirmOpen}
        onOpenChange={setIsPublishConfirmOpen}
        onConfirm={confirmPublish}
        title={exerciseToPublish?.action === 'publish' ? 'Publish Exercise' : 'Unpublish Exercise'}
        description={
          exerciseToPublish?.action === 'publish'
            ? 'Are you sure you want to publish this exercise? It will become visible to learners and available for completion.'
            : 'Are you sure you want to unpublish this exercise? It will no longer be visible to learners.'
        }
        confirmText={exerciseToPublish?.action === 'publish' ? 'Publish' : 'Unpublish'}
        isLoading={publishExercise.isPending || unpublishExercise.isPending}
      />

      {/* Archive Confirmation */}
      <ConfirmDialog
        open={isArchiveConfirmOpen}
        onOpenChange={setIsArchiveConfirmOpen}
        onConfirm={confirmArchive}
        title="Archive Exercise"
        description="Are you sure you want to archive this exercise? Archived exercises can be restored later but are hidden from most views."
        confirmText="Archive"
        isLoading={archiveExercise.isPending}
      />
    </div>
  );
};

// Helper functions
function formatType(type: ExerciseType): string {
  const map: Record<ExerciseType, string> = {
    quiz: 'Quiz',
    exam: 'Exam',
    practice: 'Practice',
    assessment: 'Assessment',
    flashcard: 'Flashcard',
    matching: 'Matching',
  };
  return map[type] || type;
}

function formatStatus(status: ExerciseStatus): string {
  const map: Record<ExerciseStatus, string> = {
    draft: 'Draft',
    published: 'Published',
    archived: 'Archived',
  };
  return map[status] || status;
}

function formatDifficulty(difficulty: ExerciseDifficulty): string {
  const map: Record<ExerciseDifficulty, string> = {
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
  };
  return map[difficulty] || difficulty;
}

function getStatusVariant(status: ExerciseStatus): 'default' | 'secondary' | 'destructive' {
  switch (status) {
    case 'published':
      return 'default';
    case 'draft':
      return 'secondary';
    case 'archived':
      return 'destructive';
    default:
      return 'secondary';
  }
}

function getDifficultyColor(difficulty: ExerciseDifficulty): string {
  switch (difficulty) {
    case 'easy':
      return 'text-emerald-700 dark:text-emerald-400 border-emerald-500/30';
    case 'medium':
      return 'text-yellow-700 dark:text-yellow-400 border-yellow-500/30';
    case 'hard':
      return 'text-destructive border-destructive/30';
    default:
      return '';
  }
}
