/**
 * ThreadDetailPage
 * Display thread with replies and reply form
 */

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useThread, useCreateReply } from '@/entities/forum';
import type { ForumReply } from '@/entities/forum';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { Badge } from '@/shared/ui/badge';
import { Textarea } from '@/shared/ui/textarea';
import { Separator } from '@/shared/ui/separator';
import { Avatar, AvatarFallback } from '@/shared/ui/avatar';
import { ArrowLeft, Lock, Pin, CheckCircle } from 'lucide-react';
import { useToast } from '@/shared/ui/use-toast';
import { formatDistanceToNow, format } from 'date-fns';

const getInitials = (firstName: string, lastName: string) => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

const ReplyCard: React.FC<{ reply: ForumReply; depth?: number }> = ({ reply, depth = 0 }) => {
  const maxDepth = 3; // Max nesting level for visual clarity
  const displayDepth = Math.min(depth, maxDepth);

  return (
    <div className={`${displayDepth > 0 ? 'ml-8' : ''}`}>
      <Card className={reply.isInstructorAnswer ? 'border-primary bg-primary/5' : ''}>
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">
                {getInitials(reply.author.firstName, reply.author.lastName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-sm">
                  {reply.author.firstName} {reply.author.lastName}
                </span>
                {reply.author.role && (
                  <Badge variant="secondary" className="text-xs">
                    {reply.author.role}
                  </Badge>
                )}
                {reply.isInstructorAnswer && (
                  <Badge variant="default" className="text-xs">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Instructor Answer
                  </Badge>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <p className="whitespace-pre-wrap">{reply.body}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const ThreadDetailPage: React.FC = () => {
  const { courseId, threadId } = useParams<{ courseId: string; threadId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [replyBody, setReplyBody] = useState('');

  const { data, isLoading, error, refetch } = useThread(threadId!);
  const createReplyMutation = useCreateReply();

  const thread = data?.thread;
  const replies = data?.replies || [];

  const handleSubmitReply = async () => {
    if (!replyBody.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Reply body cannot be empty',
        variant: 'destructive',
      });
      return;
    }

    if (thread?.isLocked) {
      toast({
        title: 'Thread Locked',
        description: 'This thread is locked and cannot accept new replies',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createReplyMutation.mutateAsync({
        threadId: threadId!,
        body: replyBody,
      });

      toast({
        title: 'Success',
        description: 'Reply posted successfully',
      });

      setReplyBody('');
      refetch();
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to post reply',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Skeleton className="h-8 w-32 mb-6" />
        <Card className="mb-6">
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2 mb-4" />
            <Skeleton className="h-20 w-full" />
          </CardHeader>
        </Card>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-1/3 mb-2" />
                <Skeleton className="h-16 w-full" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !thread) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-center text-destructive">
              <p className="font-semibold">Error loading thread</p>
              <p className="text-sm mt-1">
                {error instanceof Error ? error.message : 'Thread not found'}
              </p>
              <Button
                variant="outline"
                onClick={() => navigate(`/learner/courses/${courseId}/forum`)}
                className="mt-4"
              >
                Back to Forum
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate(`/learner/courses/${courseId}/forum`)}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Forum
      </Button>

      {/* Thread */}
      <Card className="mb-6">
        <CardHeader>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {thread.isPinned && <Pin className="h-5 w-5 text-primary" />}
              {thread.isLocked && <Lock className="h-5 w-5 text-muted-foreground" />}
              <h1 className="text-2xl font-bold">{thread.title}</h1>
            </div>
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">
                  {getInitials(thread.author.firstName, thread.author.lastName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold text-sm">
                  {thread.author.firstName} {thread.author.lastName}
                  {thread.author.role && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {thread.author.role}
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {format(new Date(thread.createdAt), 'PPpp')}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <p className="whitespace-pre-wrap">{thread.body}</p>
          </div>
        </CardContent>
      </Card>

      <Separator className="my-8" />

      {/* Replies */}
      <div className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold">
          Replies ({replies.length})
        </h2>
        {replies.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No replies yet. Be the first to respond!
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {replies.map((reply) => (
              <ReplyCard key={reply.id} reply={reply} />
            ))}
          </div>
        )}
      </div>

      {/* Reply Form */}
      {thread.isLocked ? (
        <Card className="bg-muted">
          <CardContent className="py-8 text-center">
            <Lock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">
              This thread is locked and cannot accept new replies
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <h3 className="font-semibold">Post a Reply</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Textarea
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                placeholder="Write your reply..."
                rows={5}
                disabled={createReplyMutation.isPending}
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleSubmitReply}
                  disabled={createReplyMutation.isPending || !replyBody.trim()}
                >
                  {createReplyMutation.isPending ? 'Posting...' : 'Post Reply'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
