/**
 * Question List Component
 * Displays a list of questions with filtering and pagination
 */

import { useState } from 'react';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { Badge } from '@/shared/ui/badge';
import { Loader2, Search, X, Filter } from 'lucide-react';
import { QuestionCard } from './QuestionCard';
import { useQuestions } from '../model/useQuestion';
import type { QuestionListParams } from '../model/types';

interface QuestionListProps {
  initialFilters?: QuestionListParams;
  onQuestionClick?: (questionId: string) => void;
  showUsageStats?: boolean;
  departmentId?: string;
}

export function QuestionList({
  initialFilters = {},
  onQuestionClick,
  showUsageStats = false,
  departmentId,
}: QuestionListProps) {
  const [filters, setFilters] = useState<QuestionListParams>({
    page: 1,
    limit: 10,
    ...initialFilters,
  });

  const [searchInput, setSearchInput] = useState(filters.search || '');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const { data, isLoading, error } = useQuestions(departmentId || '', filters);

  const handleFilterChange = (key: keyof QuestionListParams, value: string | undefined) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  const handleSearch = () => {
    setFilters((prev) => ({
      ...prev,
      search: searchInput,
      page: 1,
    }));
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setFilters((prev) => ({
      ...prev,
      search: undefined,
      page: 1,
    }));
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = selectedTags.filter((tag) => tag !== tagToRemove);
    setSelectedTags(newTags);
    setFilters((prev) => ({
      ...prev,
      tag: newTags[newTags.length - 1],
      page: 1,
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      ...(departmentId && { department: departmentId }),
    });
    setSearchInput('');
    setSelectedTags([]);
  };

  const hasActiveFilters =
    filters.search ||
    filters.questionType ||
    filters.difficulty ||
    selectedTags.length > 0 ||
    filters.sort;

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Error loading questions: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters Section */}
      <div className="space-y-4 p-4 border rounded-lg bg-card">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-medium">Filters</h3>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="ml-auto"
            >
              Clear all
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search questions..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-9"
            />
            {searchInput && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearSearch}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Button onClick={handleSearch}>Search</Button>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Question Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Question Type</label>
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
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                <SelectItem value="true_false">True/False</SelectItem>
                <SelectItem value="short_answer">Short Answer</SelectItem>
                <SelectItem value="essay">Essay</SelectItem>
                <SelectItem value="fill_blank">Fill in the Blank</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Difficulty */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Difficulty</label>
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
                <SelectItem value="all">All difficulties</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Sort By</label>
            <Select
              value={filters.sort || '-createdAt'}
              onValueChange={(value) => handleFilterChange('sort', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="-createdAt">Newest first</SelectItem>
                <SelectItem value="createdAt">Oldest first</SelectItem>
                <SelectItem value="-updatedAt">Recently updated</SelectItem>
                <SelectItem value="difficulty">Difficulty (asc)</SelectItem>
                <SelectItem value="-difficulty">Difficulty (desc)</SelectItem>
                <SelectItem value="points">Points (asc)</SelectItem>
                <SelectItem value="-points">Points (desc)</SelectItem>
                <SelectItem value="questionType">Question type</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Tags */}
        {selectedTags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">Tags:</span>
            {selectedTags.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1">
                {tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Question List */}
      {!isLoading && data && (
        <>
          {data.questions.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-muted/50">
              <p className="text-muted-foreground">
                No questions found matching your filters.
              </p>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                  className="mt-4"
                >
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {data.questions.length} of {data.pagination.total} questions
                </p>
              </div>

              <div className="grid gap-4">
                {data.questions.map((question) => (
                  <QuestionCard
                    key={question.id}
                    question={question}
                    showUsageStats={showUsageStats}
                    onClick={onQuestionClick ? () => onQuestionClick(question.id) : undefined}
                  />
                ))}
              </div>

              {/* Pagination */}
              {data.pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(filters.page! - 1)}
                    disabled={!data.pagination.hasPrev}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {data.pagination.page} of {data.pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(filters.page! + 1)}
                    disabled={!data.pagination.hasNext}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
