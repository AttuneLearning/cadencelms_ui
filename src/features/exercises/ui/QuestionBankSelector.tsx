/**
 * Question Bank Selector
 * Component for browsing and selecting questions from the question bank
 */

import React, { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Card, CardContent } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
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
import {
  useQuestions,
  type QuestionListItem,
  type QuestionType,
  type QuestionDifficulty,
  type QuestionFilters,
} from '@/entities/question';
import type { QuestionReference } from '@/entities/exercise';
import {
  Search,
  Filter,
  X,
  CheckCircle2,
  XCircle,
  Eye,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface QuestionBankSelectorProps {
  onSelect: (questions: QuestionReference[]) => void;
  onCancel: () => void;
  department?: string;
  preSelectedQuestionIds?: string[];
}

export const QuestionBankSelector: React.FC<QuestionBankSelectorProps> = ({
  onSelect,
  onCancel,
  department,
  preSelectedQuestionIds = [],
}) => {
  // State
  const [selectedQuestions, setSelectedQuestions] = useState<QuestionListItem[]>([]);
  const [previewQuestion, setPreviewQuestion] = useState<QuestionListItem | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<QuestionFilters>({
    page: 1,
    limit: 20,
    department,
  });

  // Query
  const { data: questionsData, isLoading, error } = useQuestions(filters);

  // Handle question selection
  const handleToggleQuestion = (question: QuestionListItem) => {
    const isSelected = selectedQuestions.some((q) => q.id === question.id);
    if (isSelected) {
      setSelectedQuestions(selectedQuestions.filter((q) => q.id !== question.id));
    } else {
      setSelectedQuestions([...selectedQuestions, question]);
    }
  };

  // Handle select all on page
  const handleSelectAllOnPage = () => {
    if (!questionsData?.questions) return;

    const pageQuestions = questionsData.questions.filter(
      (q) => !selectedQuestions.some((sq) => sq.id === q.id)
    );

    if (pageQuestions.length > 0) {
      setSelectedQuestions([...selectedQuestions, ...pageQuestions]);
    } else {
      // Deselect all on page
      const pageQuestionIds = new Set(questionsData.questions.map((q) => q.id));
      setSelectedQuestions(selectedQuestions.filter((q) => !pageQuestionIds.has(q.id)));
    }
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof QuestionFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
      page: 1, // Reset to first page
    }));
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 20,
      department,
    });
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  // Handle confirm selection
  const handleConfirmSelection = () => {
    const questionReferences: QuestionReference[] = selectedQuestions.map((q) => ({
      questionId: q.id,
      questionText: q.questionText,
      questionType: q.questionType as any,
      options: q.options.map((opt) => opt.text),
      correctAnswer: q.correctAnswer,
      points: q.points,
      explanation: q.explanation || undefined,
      difficulty: q.difficulty,
      tags: q.tags,
    }));
    onSelect(questionReferences);
  };

  // Check if question is already selected or pre-selected
  const isQuestionSelected = (questionId: string): boolean => {
    return (
      selectedQuestions.some((q) => q.id === questionId) ||
      preSelectedQuestionIds.includes(questionId)
    );
  };

  const hasActiveFilters = filters.questionType || filters.difficulty || filters.tag || filters.search;

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search questions..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            variant={showFilters ? 'default' : 'outline'}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2">
                {Object.keys(filters).filter((k) => k !== 'page' && k !== 'limit' && k !== 'department' && filters[k as keyof QuestionFilters]).length}
              </Badge>
            )}
          </Button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Filter Questions</h3>
                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      <X className="h-4 w-4 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Question Type</Label>
                    <Select
                      value={filters.questionType || 'all'}
                      onValueChange={(value) =>
                        handleFilterChange('questionType', value === 'all' ? undefined : value)
                      }
                    >
                      <SelectTrigger>
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
                    <Label>Difficulty</Label>
                    <Select
                      value={filters.difficulty || 'all'}
                      onValueChange={(value) =>
                        handleFilterChange('difficulty', value === 'all' ? undefined : value)
                      }
                    >
                      <SelectTrigger>
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
                    <Label>Tag</Label>
                    <Input
                      placeholder="Filter by tag..."
                      value={filters.tag || ''}
                      onChange={(e) => handleFilterChange('tag', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Selection Summary */}
      {selectedQuestions.length > 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span className="font-medium">
                  {selectedQuestions.length} question{selectedQuestions.length !== 1 ? 's' : ''}{' '}
                  selected
                </span>
                <span className="text-sm text-muted-foreground">
                  ({selectedQuestions.reduce((sum, q) => sum + q.points, 0)} points total)
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedQuestions([])}
              >
                Clear Selection
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Questions List */}
      <div className="space-y-3">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading questions...</span>
          </div>
        )}

        {error && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <div className="text-destructive">
                <h3 className="font-semibold mb-2">Error loading questions</h3>
                <p className="text-sm">{error.message}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {!isLoading && !error && questionsData?.questions.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <p className="text-muted-foreground">No questions found matching your filters</p>
              </div>
            </CardContent>
          </Card>
        )}

        {!isLoading && !error && questionsData?.questions && questionsData.questions.length > 0 && (
          <>
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
              <Button variant="outline" size="sm" onClick={handleSelectAllOnPage}>
                {questionsData.questions.every((q) => isQuestionSelected(q.id))
                  ? 'Deselect All on Page'
                  : 'Select All on Page'}
              </Button>
              <span>
                Showing {questionsData.questions.length} of {questionsData.pagination.total} questions
              </span>
            </div>

            {questionsData.questions.map((question) => {
              const isSelected = isQuestionSelected(question.id);
              const isPreSelected = preSelectedQuestionIds.includes(question.id);

              return (
                <Card
                  key={question.id}
                  className={cn(
                    'cursor-pointer transition-colors',
                    isSelected && 'border-primary bg-primary/5',
                    isPreSelected && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => !isPreSelected && handleToggleQuestion(question)}
                        disabled={isPreSelected}
                        className="mt-1"
                      />
                      <div className="flex-1" onClick={() => !isPreSelected && handleToggleQuestion(question)}>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary">{formatQuestionType(question.questionType)}</Badge>
                          <Badge variant={getDifficultyVariant(question.difficulty)}>
                            {formatDifficulty(question.difficulty)}
                          </Badge>
                          <span className="text-sm text-muted-foreground">{question.points} pts</span>
                          {question.tags.length > 0 && (
                            <div className="flex gap-1">
                              {question.tags.slice(0, 2).map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {question.tags.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{question.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                        <p className="text-sm font-medium line-clamp-2">{question.questionText}</p>
                        {question.options.length > 0 && (
                          <div className="mt-2 text-sm text-muted-foreground">
                            {question.options.length} options
                          </div>
                        )}
                        {isPreSelected && (
                          <p className="mt-2 text-xs text-muted-foreground">
                            Already added to exercise
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewQuestion(question);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </>
        )}
      </div>

      {/* Pagination */}
      {questionsData?.pagination && questionsData.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <div className="text-sm text-muted-foreground">
            Page {questionsData.pagination.page} of {questionsData.pagination.totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(filters.page! - 1)}
              disabled={!questionsData.pagination.hasPrev}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(filters.page! + 1)}
              disabled={!questionsData.pagination.hasNext}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={handleConfirmSelection}
          disabled={selectedQuestions.length === 0}
        >
          Add {selectedQuestions.length} Question{selectedQuestions.length !== 1 ? 's' : ''}
        </Button>
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewQuestion} onOpenChange={() => setPreviewQuestion(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Question Preview</DialogTitle>
            <DialogDescription>Review question details</DialogDescription>
          </DialogHeader>
          {previewQuestion && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{formatQuestionType(previewQuestion.questionType)}</Badge>
                <Badge variant={getDifficultyVariant(previewQuestion.difficulty)}>
                  {formatDifficulty(previewQuestion.difficulty)}
                </Badge>
                <span className="text-sm text-muted-foreground">{previewQuestion.points} pts</span>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-2">Question</h3>
                <p className="text-sm">{previewQuestion.questionText}</p>
              </div>

              {previewQuestion.options.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2">Answer Options</h3>
                  <div className="space-y-2">
                    {previewQuestion.options.map((option, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          'flex items-center gap-2 p-2 rounded-md border',
                          option.isCorrect && 'bg-green-50 border-green-200'
                        )}
                      >
                        {option.isCorrect ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className={cn('text-sm', option.isCorrect && 'font-medium')}>
                          {option.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {previewQuestion.explanation && (
                <div>
                  <h3 className="text-sm font-semibold mb-2">Explanation</h3>
                  <p className="text-sm text-muted-foreground">{previewQuestion.explanation}</p>
                </div>
              )}

              {previewQuestion.tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-1">
                    {previewQuestion.tags.map((tag) => (
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

function getDifficultyVariant(difficulty: QuestionDifficulty): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (difficulty) {
    case 'easy':
      return 'secondary';
    case 'medium':
      return 'default';
    case 'hard':
      return 'destructive';
    default:
      return 'outline';
  }
}
