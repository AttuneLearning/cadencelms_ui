/**
 * CourseForumPage
 * Discussion forum for a course with thread list
 */

import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCourseThreads, useCreateThread } from '@/entities/forum';
import type { ThreadFilters } from '@/entities/forum';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { PageHeader } from '@/shared/ui/page-header';
import { MessageSquare, Search as SearchIcon, Plus, Lock, Pin, MessageCircle } from 'lucide-react';
import { useToast } from '@/shared/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';

type SortOption = 'newest' | 'oldest' | 'most_replies' | 'recently_active';

export const CourseForumPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recently_active');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newThreadBody, setNewThreadBody] = useState('');

  const filters: ThreadFilters = {
    courseId: courseId!,
    sort: sortBy,
    search: searchQuery || undefined,
    page: currentPage,
    limit: 20,
  };

  const { data, isLoading, error, refetch } = useCourseThreads(courseId!, filters);
  const createThreadMutation = useCreateThread();

  const threads = data?.threads || [];
  const pagination = data?.pagination;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value as SortOption);
    setCurrentPage(1);
  };

  const handleCreateThread = async () => {
    if (!newThreadTitle.trim() || !newThreadBody.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Title and body are required',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createThreadMutation.mutateAsync({
        courseId: courseId!,
        title: newThreadTitle,
        body: newThreadBody,
      });

      toast({
        title: 'Success',
        description: 'Thread created successfully',
      });

      setIsCreateDialogOpen(false);
      setNewThreadTitle('');
      setNewThreadBody('');
      refetch();
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to create thread',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <PageHeader
        title="Course Forum"
        description="Discuss course topics with your peers and instructors"
        className="mb-8"
      />

      {/* Search, Sort, and Create Thread */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search threads..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10"
            />
          </div>
          <div className="sm:w-64">
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recently_active">Recently Active</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="most_replies">Most Replies</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Thread
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Thread</DialogTitle>
                <DialogDescription>Start a new discussion topic</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="thread-title">Title</Label>
                  <Input
                    id="thread-title"
                    value={newThreadTitle}
                    onChange={(e) => setNewThreadTitle(e.target.value)}
                    placeholder="Enter thread title..."
                  />
                </div>
                <div>
                  <Label htmlFor="thread-body">Body</Label>
                  <Textarea
                    id="thread-body"
                    value={newThreadBody}
                    onChange={(e) => setNewThreadBody(e.target.value)}
                    placeholder="Enter your question or discussion topic..."
                    rows={6}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateThread}
                  disabled={createThreadMutation.isPending}
                >
                  {createThreadMutation.isPending ? 'Creating...' : 'Create Thread'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-center text-destructive">
              <p className="font-semibold">Error loading threads</p>
              <p className="text-sm mt-1">
                {error instanceof Error ? error.message : 'An error occurred'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <Skeleton className="h-4 w-1/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && threads.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery ? 'No threads found' : 'No threads yet'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery
                  ? 'Try adjusting your search query'
                  : 'Be the first to start a discussion'}
              </p>
              {!searchQuery && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Thread
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Thread List */}
      {!isLoading && !error && threads.length > 0 && (
        <>
          <div className="space-y-3">
            {threads.map((thread) => (
              <Link
                key={thread.id}
                to={`/learner/courses/${courseId}/forum/${thread.id}`}
                className="block"
              >
                <Card className="hover:bg-accent transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {thread.isPinned && (
                            <Pin className="h-4 w-4 text-primary flex-shrink-0" />
                          )}
                          {thread.isLocked && (
                            <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          )}
                          <CardTitle className="text-base truncate">{thread.title}</CardTitle>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span>
                            {thread.author.firstName} {thread.author.lastName}
                          </span>
                          <span>•</span>
                          <span>
                            {formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground flex-shrink-0">
                        <MessageCircle className="h-4 w-4" />
                        <span>{thread.replyCount}</span>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => p - 1)}
                  disabled={!pagination.hasPrev}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={!pagination.hasNext}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
