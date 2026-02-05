/**
 * Staff Question Bank Page
 * Department-scoped question bank management for staff with content-admin or department-admin roles
 * 
 * Per ADR-AUTH-001: Uses department context for permission checking
 * Required permission: question:manage-department
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
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { QuestionForm } from '@/entities/question';
import {
  useQuestions,
  useCreateQuestion,
  useUpdateQuestion,
  useDeleteQuestion,
  useDuplicateQuestion,
  type QuestionListItem,
  type QuestionType,
  type QuestionDifficulty,
  type QuestionListParams,
  type QuestionFormData,
} from '@/entities/question';
import { useDepartmentContext } from '@/shared/hooks/useDepartmentContext';
import {
  MoreHorizontal,
  Plus,
  Trash,
  Edit,
  Copy,
  Loader2,
  Filter,
  X,
  AlertCircle,
} from 'lucide-react';
import { Label } from '@/shared/ui/label';
import { Card } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';

export const StaffQuestionBankPage: React.FC = () => {
  // Get department context - this is the key difference from admin page
  const {
    currentDepartmentId,
    currentDepartmentName,
    hasPermission,
  } = useDepartmentContext();

  // Check if user has question management permission in current department
  const canManageQuestions = hasPermission('question:manage-department');

  // State for selections and dialogs
  const [selectedQuestions, setSelectedQuestions] = React.useState<QuestionListItem[]>([]);
  const [questionToEdit, setQuestionToEdit] = React.useState<QuestionListItem | null>(null);
  const [questionToDelete, setQuestionToDelete] = React.useState<string | null>(null);
  const [questionToDuplicate, setQuestionToDuplicate] = React.useState<string | null>(null);
  const [questionToPreview, setQuestionToPreview] = React.useState<QuestionListItem | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = React.useState(false);
  const [isDuplicateConfirmOpen, setIsDuplicateConfirmOpen] = React.useState(false);
  const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] = React.useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = React.useState(false);

  // State for filters
  const [filters, setFilters] = React.useState<QuestionListParams>({
    page: 1,
    limit: 50,
  });
  const [showFilters, setShowFilters] = React.useState(false);
  const [tagFilter, setTagFilter] = React.useState<string>('');
  const [availableTags, setAvailableTags] = React.useState<string[]>([]);

  const { toast } = useToast();

  // Fetch questions for current department only
  const { data: questionsData, isLoading, error } = useQuestions(
    currentDepartmentId || '',
    filters,
    { enabled: !!currentDepartmentId }
  );

  // Extract unique tags from questions
  React.useEffect(() => {
    if (questionsData?.questions) {
      const tags = new Set<string>();
      questionsData.questions.forEach((q) => {
        q.tags?.forEach((tag) => tags.add(tag));
      });
      setAvailableTags(Array.from(tags).sort());
    }
  }, [questionsData]);

  // Mutations - all scoped to current department
  const createQuestion = useCreateQuestion(currentDepartmentId || '', {
    onSuccess: () => {
      toast({
        title: 'Question created',
        description: 'Question has been successfully created.',
      });
      setIsCreateDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create question. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const updateQuestion = useUpdateQuestion(currentDepartmentId || '', {
    onSuccess: () => {
      toast({
        title: 'Question updated',
        description: 'Question has been successfully updated.',
      });
      setQuestionToEdit(null);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update question. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const deleteQuestion = useDeleteQuestion(currentDepartmentId || '', {
    onSuccess: () => {
      toast({
        title: 'Question deleted',
        description: 'Question has been successfully deleted.',
      });
      setIsDeleteConfirmOpen(false);
      setQuestionToDelete(null);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete question. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const duplicateQuestion = useDuplicateQuestion(currentDepartmentId || '', {
    onSuccess: () => {
      toast({
        title: 'Question duplicated',
        description: 'A copy of the question has been created.',
      });
      setIsDuplicateConfirmOpen(false);
      setQuestionToDuplicate(null);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to duplicate question. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Action handlers
  const handleDelete = (id: string) => {
    setQuestionToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  const handleBulkDelete = () => {
    setIsBulkDeleteConfirmOpen(true);
  };

  const handleDuplicate = (id: string) => {
    setQuestionToDuplicate(id);
    setIsDuplicateConfirmOpen(true);
  };

  const handlePreview = (question: QuestionListItem) => {
    setQuestionToPreview(question);
    setIsPreviewDialogOpen(true);
  };

  const confirmDelete = () => {
    if (questionToDelete) {
      deleteQuestion.mutate(questionToDelete);
    }
  };

  const confirmBulkDelete = async () => {
    for (const question of selectedQuestions) {
      await deleteQuestion.mutateAsync(question.id);
    }
    setSelectedQuestions([]);
    setIsBulkDeleteConfirmOpen(false);
    toast({
      title: 'Questions deleted',
      description: `${selectedQuestions.length} question(s) have been deleted.`,
    });
  };

  const confirmDuplicate = () => {
    if (questionToDuplicate) {
      duplicateQuestion.mutate(questionToDuplicate);
    }
  };

  const handleCreate = (data: QuestionFormData) => {
    createQuestion.mutate(data);
  };

  const handleUpdate = (data: QuestionFormData) => {
    if (questionToEdit) {
      updateQuestion.mutate({ id: questionToEdit.id, payload: data });
    }
  };

  // Filter handlers
  const handleTypeFilter = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      questionType: value === 'all' ? undefined : value,
      page: 1,
    }));
  };

  const handleDifficultyFilter = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      difficulty: value === 'all' ? undefined : (value as QuestionDifficulty),
      page: 1,
    }));
  };

  const handleTagFilter = () => {
    if (tagFilter.trim()) {
      setFilters((prev) => ({
        ...prev,
        tag: tagFilter.trim(),
        page: 1,
      }));
    }
  };

  const clearFilters = () => {
    setFilters({ page: 1, limit: 50 });
    setTagFilter('');
  };

  // If no department selected, show message
  if (!currentDepartmentId) {
    return (
      <div className="container mx-auto py-6">
        <PageHeader
          title="Question Bank"
          description="Select a department to view questions"
        />
        <Alert className="mt-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please select a department from the sidebar to view and manage questions.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // If user doesn't have permission, show access denied
  if (!canManageQuestions) {
    return (
      <div className="container mx-auto py-6">
        <PageHeader
          title="Question Bank"
          description={`Questions for ${currentDepartmentName || 'selected department'}`}
        />
        <Alert variant="destructive" className="mt-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to manage questions in this department.
            Contact your department administrator if you need access.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Table columns
  const columns: ColumnDef<QuestionListItem>[] = [
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
      accessorKey: 'questionText',
      header: 'Question',
      cell: ({ row }) => (
        <div className="max-w-md">
          <p className="font-medium truncate">{row.getValue('questionText')}</p>
          {row.original.tags && row.original.tags.length > 0 && (
            <div className="flex gap-1 mt-1 flex-wrap">
              {row.original.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {row.original.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{row.original.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'questionTypes',
      header: 'Type',
      cell: ({ row }) => {
        const types = row.getValue('questionTypes') as QuestionType[];
        const typeLabels: Record<QuestionType, string> = {
          'multiple_choice': 'Multiple Choice',
          'multiple_select': 'Multiple Select',
          'true_false': 'True/False',
          'short_answer': 'Short Answer',
          'long_answer': 'Long Answer',
          'matching': 'Matching',
          'flashcard': 'Flashcard',
          'fill_in_blank': 'Fill in Blank',
          'essay': 'Essay',
          'fill_blank': 'Fill Blank',
        };
        const firstType = types?.[0];
        return (
          <Badge variant="secondary">
            {typeLabels[firstType] || firstType || 'Unknown'}
            {types?.length > 1 && ` +${types.length - 1}`}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'difficulty',
      header: 'Difficulty',
      cell: ({ row }) => {
        const difficulty = row.getValue('difficulty') as QuestionDifficulty;
        const variants: Record<QuestionDifficulty, 'default' | 'secondary' | 'destructive'> = {
          easy: 'default',
          medium: 'secondary',
          hard: 'destructive',
        };
        return <Badge variant={variants[difficulty]}>{difficulty}</Badge>;
      },
    },
    {
      accessorKey: 'points',
      header: 'Points',
      cell: ({ row }) => <span>{row.getValue('points')}</span>,
    },
    {
      accessorKey: 'usageCount',
      header: 'Usage',
      cell: ({ row }) => <span>{row.getValue('usageCount') || 0}</span>,
    },
    {
      accessorKey: 'updatedAt',
      header: 'Updated',
      cell: ({ row }) => {
        const date = row.getValue('updatedAt') as string;
        return date ? format(new Date(date), 'MMM d, yyyy') : '-';
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const question = row.original;
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
              <DropdownMenuItem onClick={() => handlePreview(question)}>
                Preview
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setQuestionToEdit(question)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDuplicate(question.id)}>
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDelete(question.id)}
                className="text-destructive"
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="container mx-auto py-6">
      <PageHeader
        title="Question Bank"
        description={`Manage questions for ${currentDepartmentName || 'your department'}`}
      >
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Question
          </Button>
        </div>
      </PageHeader>

      {/* Filter Bar */}
      {showFilters && (
        <Card className="p-4 mt-4 mb-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <Label className="text-sm">Type</Label>
              <Select
                value={filters.questionType || 'all'}
                onValueChange={handleTypeFilter}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                  <SelectItem value="multiple_select">Multiple Select</SelectItem>
                  <SelectItem value="true_false">True/False</SelectItem>
                  <SelectItem value="short_answer">Short Answer</SelectItem>
                  <SelectItem value="long_answer">Long Answer</SelectItem>
                  <SelectItem value="matching">Matching</SelectItem>
                  <SelectItem value="flashcard">Flashcard</SelectItem>
                  <SelectItem value="fill_in_blank">Fill in Blank</SelectItem>
                  <SelectItem value="essay">Essay</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm">Difficulty</Label>
              <Select
                value={filters.difficulty || 'all'}
                onValueChange={handleDifficultyFilter}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All difficulties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All difficulties</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm">Tag</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Filter by tag"
                  value={tagFilter}
                  onChange={(e) => setTagFilter(e.target.value)}
                  className="w-[150px]"
                  list="available-tags"
                />
                <datalist id="available-tags">
                  {availableTags.map((tag) => (
                    <option key={tag} value={tag} />
                  ))}
                </datalist>
                <Button variant="outline" size="sm" onClick={handleTagFilter}>
                  Apply
                </Button>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="mr-2 h-4 w-4" />
              Clear
            </Button>
          </div>
        </Card>
      )}

      {/* Bulk Actions */}
      {selectedQuestions.length > 0 && (
        <div className="flex items-center gap-4 mb-4 p-2 bg-muted rounded-lg">
          <span className="text-sm font-medium">
            {selectedQuestions.length} selected
          </span>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleBulkDelete}
          >
            <Trash className="mr-2 h-4 w-4" />
            Delete Selected
          </Button>
        </div>
      )}

      {/* Questions Table */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load questions. Please try again.
          </AlertDescription>
        </Alert>
      ) : (
        <DataTable
          columns={columns}
          data={questionsData?.questions || []}
          onRowSelectionChange={(rows) => setSelectedQuestions(rows as QuestionListItem[])}
        />
      )}

      {/* Create Question Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Question</DialogTitle>
            <DialogDescription>
              Add a new question to the {currentDepartmentName} question bank.
            </DialogDescription>
          </DialogHeader>
          <QuestionForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreateDialogOpen(false)}
            isLoading={createQuestion.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Question Dialog */}
      <Dialog open={!!questionToEdit} onOpenChange={() => setQuestionToEdit(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Question</DialogTitle>
            <DialogDescription>
              Modify the question details.
            </DialogDescription>
          </DialogHeader>
          {questionToEdit && (
            <QuestionForm
              initialData={questionToEdit}
              onSubmit={handleUpdate}
              onCancel={() => setQuestionToEdit(null)}
              isLoading={updateQuestion.isPending}
              mode="edit"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Question Preview</DialogTitle>
          </DialogHeader>
          {questionToPreview && (
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Question</Label>
                <p className="mt-1">{questionToPreview.questionText}</p>
              </div>
              <div className="flex gap-4">
                <div>
                  <Label className="text-muted-foreground">Types</Label>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {questionToPreview.questionTypes?.map((t) => (
                      <Badge key={t} variant="secondary">{t.replace(/_/g, ' ')}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Difficulty</Label>
                  <p className="mt-1">{questionToPreview.difficulty}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Points</Label>
                  <p className="mt-1">{questionToPreview.points}</p>
                </div>
              </div>
              {questionToPreview.tags && questionToPreview.tags.length > 0 && (
                <div>
                  <Label className="text-muted-foreground">Tags</Label>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {questionToPreview.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        title="Delete Question"
        description="Are you sure you want to delete this question? This action cannot be undone."
        confirmText="Delete"
        onConfirm={confirmDelete}
        isLoading={deleteQuestion.isPending}
        isDestructive
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmDialog
        open={isBulkDeleteConfirmOpen}
        onOpenChange={setIsBulkDeleteConfirmOpen}
        title="Delete Questions"
        description={`Are you sure you want to delete ${selectedQuestions.length} question(s)? This action cannot be undone.`}
        confirmText="Delete All"
        onConfirm={confirmBulkDelete}
        isLoading={deleteQuestion.isPending}
        isDestructive
      />

      {/* Duplicate Confirmation */}
      <ConfirmDialog
        open={isDuplicateConfirmOpen}
        onOpenChange={setIsDuplicateConfirmOpen}
        title="Duplicate Question"
        description="Create a copy of this question?"
        confirmText="Duplicate"
        onConfirm={confirmDuplicate}
        isLoading={duplicateQuestion.isPending}
      />
    </div>
  );
};

export default StaffQuestionBankPage;
