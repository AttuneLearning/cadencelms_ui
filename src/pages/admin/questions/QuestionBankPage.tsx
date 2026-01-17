/**
 * Question Bank Management Page
 * Admin interface for managing question bank with CRUD operations
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
import { QuestionForm } from '@/entities/question';
import {
  useQuestions,
  useCreateQuestion,
  useUpdateQuestion,
  useDeleteQuestion,
  useDuplicateQuestion,
  useBulkImportQuestions,
  type QuestionListItem,
  type QuestionType,
  type QuestionDifficulty,
  type QuestionFilters,
  type QuestionFormData,
  type BulkImportQuestionItem,
} from '@/entities/question';
import { useDepartments } from '@/entities/department';
import {
  MoreHorizontal,
  Plus,
  Trash,
  Edit,
  Copy,
  Loader2,
  Filter,
  X,
  Upload,
  Download,
  FileText,
} from 'lucide-react';
import { Label } from '@/shared/ui/label';
import { Card } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';

export const QuestionBankPage: React.FC = () => {
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
  const [isBulkImportDialogOpen, setIsBulkImportDialogOpen] = React.useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = React.useState(false);

  // State for filters
  const [filters, setFilters] = React.useState<QuestionFilters>({
    page: 1,
    limit: 50,
  });
  const [showFilters, setShowFilters] = React.useState(false);
  const [tagFilter, setTagFilter] = React.useState<string>('');
  const [availableTags, setAvailableTags] = React.useState<string[]>([]);

  // State for bulk import
  const [bulkImportFormat, setBulkImportFormat] = React.useState<'json' | 'csv'>('json');
  const [bulkImportFile, setBulkImportFile] = React.useState<File | null>(null);
  const [bulkImportData, setBulkImportData] = React.useState<BulkImportQuestionItem[]>([]);
  const [bulkImportDepartment, setBulkImportDepartment] = React.useState<string>('');

  const { toast } = useToast();

  // Fetch questions with filters
  const { data: questionsData, isLoading, error } = useQuestions(filters);

  // Fetch departments for the form
  const { data: departmentsData } = useDepartments({ limit: 1000 });

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

  // Mutations
  const createQuestion = useCreateQuestion({
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

  const updateQuestion = useUpdateQuestion({
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

  const deleteQuestion = useDeleteQuestion({
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

  const duplicateQuestion = useDuplicateQuestion({
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

  const bulkImport = useBulkImportQuestions({
    onSuccess: (data) => {
      toast({
        title: 'Bulk import completed',
        description: `Imported ${data.imported} question(s). ${data.failed > 0 ? `Failed: ${data.failed}` : ''}`,
      });
      setIsBulkImportDialogOpen(false);
      setBulkImportFile(null);
      setBulkImportData([]);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to import questions. Please try again.',
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
    try {
      await Promise.all(selectedQuestions.map((question) => deleteQuestion.mutateAsync(question.id)));
      toast({
        title: 'Questions deleted',
        description: `${selectedQuestions.length} question(s) have been successfully deleted.`,
      });
      setSelectedQuestions([]);
      setIsBulkDeleteConfirmOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete some questions. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const confirmDuplicate = () => {
    if (questionToDuplicate) {
      duplicateQuestion.mutate(questionToDuplicate);
    }
  };

  const handleFormSubmit = (data: QuestionFormData) => {
    if (questionToEdit) {
      updateQuestion.mutate({
        id: questionToEdit.id,
        payload: data,
      });
    } else {
      createQuestion.mutate(data);
    }
  };

  const handleFilterChange = (key: keyof QuestionFilters, value: string | undefined) => {
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
    setTagFilter('');
  };

  const hasActiveFilters =
    filters.questionType || filters.difficulty || filters.search || filters.department || filters.tag;

  // Bulk import handlers
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBulkImportFile(file);

    try {
      const text = await file.text();
      let parsedData: BulkImportQuestionItem[] = [];

      if (bulkImportFormat === 'json') {
        const json = JSON.parse(text);
        parsedData = Array.isArray(json) ? json : [json];
      } else {
        // Simple CSV parsing (production should use a proper CSV parser)
        const lines = text.split('\n').filter((line) => line.trim());
        const headers = lines[0].split(',').map((h) => h.trim());

        parsedData = lines.slice(1).map((line) => {
          const values = line.split(',').map((v) => v.trim());
          const item: any = {};
          headers.forEach((header, index) => {
            item[header] = values[index];
          });
          return item as BulkImportQuestionItem;
        });
      }

      setBulkImportData(parsedData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to parse file. Please check the format.',
        variant: 'destructive',
      });
    }
  };

  const handleBulkImportSubmit = () => {
    if (bulkImportData.length === 0) {
      toast({
        title: 'Error',
        description: 'No questions to import.',
        variant: 'destructive',
      });
      return;
    }

    bulkImport.mutate({
      format: bulkImportFormat,
      questions: bulkImportData,
      department: bulkImportDepartment || undefined,
      overwriteExisting: false,
    });
  };

  const handleExportTemplate = () => {
    const template = [
      {
        questionText: 'Sample question text',
        questionType: 'multiple_choice',
        options: [
          { text: 'Option 1', isCorrect: true },
          { text: 'Option 2', isCorrect: false },
        ],
        correctAnswer: '',
        points: 1,
        difficulty: 'medium',
        tags: ['sample', 'template'],
        explanation: 'Explanation text',
      },
    ];

    const dataStr = JSON.stringify(template, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = 'question-import-template.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Define columns
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
      cell: ({ row }) => {
        const question = row.original;
        return (
          <div className="max-w-md">
            <div className="font-medium line-clamp-2">{question.questionText}</div>
            {question.tags && question.tags.length > 0 && (
              <div className="flex gap-1 flex-wrap mt-1">
                {question.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {question.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{question.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'questionType',
      header: 'Type',
      cell: ({ row }) => {
        const type = row.original.questionType;
        return <Badge variant="secondary">{formatQuestionType(type)}</Badge>;
      },
    },
    {
      accessorKey: 'difficulty',
      header: 'Difficulty',
      cell: ({ row }) => {
        const difficulty = row.original.difficulty;
        return <Badge variant={getDifficultyVariant(difficulty)}>{formatDifficulty(difficulty)}</Badge>;
      },
    },
    {
      accessorKey: 'points',
      header: 'Points',
      cell: ({ row }) => {
        const points = row.original.points;
        return (
          <div className="text-center">
            <span className="font-medium">{points}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'department',
      header: 'Department',
      cell: ({ row }) => {
        const department = row.original.department;
        return department ? (
          <span className="text-sm">{department}</span>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        );
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
                <FileText className="mr-2 h-4 w-4" />
                Preview
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setQuestionToEdit(question)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Question
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
                Delete Question
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
        title="Question Bank Management"
        description="Manage questions for assessments and quizzes"
      >
        {selectedQuestions.length > 0 && (
          <Button variant="destructive" onClick={handleBulkDelete}>
            <Trash className="mr-2 h-4 w-4" />
            Delete Selected ({selectedQuestions.length})
          </Button>
        )}
        <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
          <Filter className="mr-2 h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-2">
              {Object.keys(filters).filter(
                (k) =>
                  k !== 'page' &&
                  k !== 'limit' &&
                  filters[k as keyof QuestionFilters]
              ).length}
            </Badge>
          )}
        </Button>
        <Button variant="outline" onClick={() => setIsBulkImportDialogOpen(true)}>
          <Upload className="mr-2 h-4 w-4" />
          Bulk Import
        </Button>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Question
        </Button>
      </PageHeader>

      {/* Filters */}
      {showFilters && (
        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Filters</h3>
              <p className="text-sm text-muted-foreground">
                Filter questions by type, difficulty, tags, or search
              </p>
            </div>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="mr-2 h-4 w-4" />
                Clear All
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="filter-type">Question Type</Label>
              <Select
                value={filters.questionType || 'all'}
                onValueChange={(value) =>
                  handleFilterChange('questionType', value === 'all' ? undefined : value)
                }
              >
                <SelectTrigger id="filter-type">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                  <SelectItem value="true_false">True/False</SelectItem>
                  <SelectItem value="short_answer">Short Answer</SelectItem>
                  <SelectItem value="essay">Essay</SelectItem>
                  <SelectItem value="fill_blank">Fill in the Blank</SelectItem>
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
              <Label htmlFor="filter-tag">Tag</Label>
              <Select
                value={tagFilter || 'all'}
                onValueChange={(value) => {
                  const newValue = value === 'all' ? '' : value;
                  setTagFilter(newValue);
                  handleFilterChange('tag', newValue || undefined);
                }}
              >
                <SelectTrigger id="filter-tag">
                  <SelectValue placeholder="All tags" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tags</SelectItem>
                  {availableTags.map((tag) => (
                    <SelectItem key={tag} value={tag}>
                      {tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="filter-search">Search</Label>
              <Input
                id="filter-search"
                type="text"
                placeholder="Search questions..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
          </div>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card className="p-6 border-destructive">
          <div className="text-destructive">
            <h3 className="font-semibold mb-2">Error loading questions</h3>
            <p className="text-sm">{error.message}</p>
          </div>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading questions...</span>
        </div>
      )}

      {/* Data Table */}
      {!isLoading && !error && (
        <DataTable
          columns={columns}
          data={questionsData?.questions || []}
          searchable
          searchPlaceholder="Search questions..."
          onRowSelectionChange={setSelectedQuestions}
        />
      )}

      {/* Pagination Info */}
      {questionsData?.pagination && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div>
            Showing {questionsData.questions.length} of {questionsData.pagination.total} question(s)
          </div>
          <div>
            Page {questionsData.pagination.page} of {questionsData.pagination.totalPages}
          </div>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog
        open={isCreateDialogOpen || !!questionToEdit}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false);
            setQuestionToEdit(null);
          }
        }}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {questionToEdit ? 'Edit Question' : 'Create New Question'}
            </DialogTitle>
            <DialogDescription>
              {questionToEdit
                ? 'Update the question information below.'
                : 'Fill in the information to create a new question.'}
            </DialogDescription>
          </DialogHeader>
          <QuestionForm
            initialData={questionToEdit || undefined}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setIsCreateDialogOpen(false);
              setQuestionToEdit(null);
            }}
            isLoading={createQuestion.isPending || updateQuestion.isPending}
            mode={questionToEdit ? 'edit' : 'create'}
          />
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Question Preview</DialogTitle>
          </DialogHeader>
          {questionToPreview && (
            <div className="space-y-4">
              <div>
                <Label className="text-base font-semibold">Question</Label>
                <p className="mt-2">{questionToPreview.questionText}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Type</Label>
                  <p className="text-sm mt-1">
                    <Badge variant="secondary">
                      {formatQuestionType(questionToPreview.questionType)}
                    </Badge>
                  </p>
                </div>
                <div>
                  <Label>Difficulty</Label>
                  <p className="text-sm mt-1">
                    <Badge variant={getDifficultyVariant(questionToPreview.difficulty)}>
                      {formatDifficulty(questionToPreview.difficulty)}
                    </Badge>
                  </p>
                </div>
                <div>
                  <Label>Points</Label>
                  <p className="text-sm mt-1">{questionToPreview.points}</p>
                </div>
                <div>
                  <Label>Department</Label>
                  <p className="text-sm mt-1">{questionToPreview.department || '-'}</p>
                </div>
              </div>

              {questionToPreview.options && questionToPreview.options.length > 0 && (
                <div>
                  <Label className="text-base font-semibold">Answer Options</Label>
                  <div className="space-y-2 mt-2">
                    {questionToPreview.options.map((option, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-md border ${
                          option.isCorrect
                            ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800'
                            : 'bg-muted'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{String.fromCharCode(65 + index)}.</span>
                          <span>{option.text}</span>
                          {option.isCorrect && (
                            <Badge variant="outline" className="ml-auto">
                              Correct
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {questionToPreview.correctAnswer &&
                typeof questionToPreview.correctAnswer === 'string' &&
                (questionToPreview.questionType === 'short_answer' ||
                  questionToPreview.questionType === 'essay' ||
                  questionToPreview.questionType === 'fill_blank') && (
                  <div>
                    <Label className="text-base font-semibold">Correct Answer</Label>
                    <p className="mt-2 p-3 bg-muted rounded-md">
                      {questionToPreview.correctAnswer}
                    </p>
                  </div>
                )}

              {questionToPreview.explanation && (
                <div>
                  <Label className="text-base font-semibold">Explanation</Label>
                  <p className="mt-2 p-3 bg-muted rounded-md">{questionToPreview.explanation}</p>
                </div>
              )}

              {questionToPreview.tags && questionToPreview.tags.length > 0 && (
                <div>
                  <Label className="text-base font-semibold">Tags</Label>
                  <div className="flex gap-2 flex-wrap mt-2">
                    {questionToPreview.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-xs text-muted-foreground">
                Created: {format(new Date(questionToPreview.createdAt), 'PPpp')} | Updated:{' '}
                {format(new Date(questionToPreview.updatedAt), 'PPpp')}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Bulk Import Dialog */}
      <Dialog open={isBulkImportDialogOpen} onOpenChange={setIsBulkImportDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bulk Import Questions</DialogTitle>
            <DialogDescription>
              Upload a JSON or CSV file to import multiple questions at once.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Import Format</Label>
              <Select
                value={bulkImportFormat}
                onValueChange={(value: 'json' | 'csv') => setBulkImportFormat(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Department (Optional)</Label>
              <Select
                value={bulkImportDepartment}
                onValueChange={setBulkImportDepartment}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {departmentsData?.departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Upload File</Label>
              <Input
                type="file"
                accept={bulkImportFormat === 'json' ? '.json' : '.csv'}
                onChange={handleFileUpload}
              />
              {bulkImportFile && (
                <p className="text-sm text-muted-foreground">
                  Selected: {bulkImportFile.name} ({bulkImportData.length} questions)
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExportTemplate} className="flex-1">
                <Download className="mr-2 h-4 w-4" />
                Download Template
              </Button>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setIsBulkImportDialogOpen(false)}
                disabled={bulkImport.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleBulkImportSubmit}
                disabled={bulkImport.isPending || bulkImportData.length === 0}
              >
                {bulkImport.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Import Questions
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        onConfirm={confirmDelete}
        title="Delete Question"
        description="Are you sure you want to delete this question? This action cannot be undone."
        confirmText="Delete"
        isDestructive
        isLoading={deleteQuestion.isPending}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmDialog
        open={isBulkDeleteConfirmOpen}
        onOpenChange={setIsBulkDeleteConfirmOpen}
        onConfirm={confirmBulkDelete}
        title="Delete Multiple Questions"
        description={`Are you sure you want to delete ${selectedQuestions.length} question(s)? This action cannot be undone.`}
        confirmText="Delete All"
        isDestructive
        isLoading={deleteQuestion.isPending}
      />

      {/* Duplicate Confirmation */}
      <ConfirmDialog
        open={isDuplicateConfirmOpen}
        onOpenChange={setIsDuplicateConfirmOpen}
        onConfirm={confirmDuplicate}
        title="Duplicate Question"
        description="Are you sure you want to duplicate this question? A new question will be created with the same content and settings."
        confirmText="Duplicate"
        isLoading={duplicateQuestion.isPending}
      />
    </div>
  );
};

// Helper functions
function formatQuestionType(type: QuestionType): string {
  const map: Record<QuestionType, string> = {
    multiple_choice: 'Multiple Choice',
    true_false: 'True/False',
    short_answer: 'Short Answer',
    essay: 'Essay',
    fill_blank: 'Fill in the Blank',
  };
  return map[type] || type;
}

function formatDifficulty(difficulty: QuestionDifficulty): string {
  const map: Record<QuestionDifficulty, string> = {
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
  };
  return map[difficulty] || difficulty;
}

function getDifficultyVariant(
  difficulty: QuestionDifficulty
): 'default' | 'secondary' | 'destructive' {
  switch (difficulty) {
    case 'easy':
      return 'secondary';
    case 'medium':
      return 'default';
    case 'hard':
      return 'destructive';
    default:
      return 'default';
  }
}
