/**
 * Inbox Page
 * Unified messaging inbox for learners
 * Displays direct messages, announcements, reminders, and system notifications
 */

import React, { useState, useMemo } from 'react';
import {
  Mail,
  Megaphone,
  Bell,
  Info,
  Search,
  Edit,
  Loader2,
  Inbox as InboxIcon,
  Archive,
  Trash2,
  AlertCircle,
  MailOpen,
} from 'lucide-react';
import { useMessages, useMarkAsRead, useArchiveMessages, useDeleteMessage } from '@/entities/message';
import type { MessageType, MessageListItem } from '@/entities/message';
import { ComposeMessageDialog } from '@/features/messaging';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Badge } from '@/shared/ui/badge';
import { Checkbox } from '@/shared/ui/checkbox';
import { cn } from '@/shared/lib/utils';
import { useToast } from '@/shared/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';

type TabValue = 'all' | 'direct' | 'announcement' | 'reminder';

export const InboxPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabValue>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set());
  const [expandedMessageId, setExpandedMessageId] = useState<string | null>(null);
  const [composeDialogOpen, setComposeDialogOpen] = useState(false);

  const { toast } = useToast();

  // Build filters based on active tab
  const filters = useMemo(() => {
    const baseFilters: any = {
      sort: 'date-desc' as const,
      limit: 50,
    };

    if (activeTab !== 'all') {
      baseFilters.type = activeTab as MessageType;
    }

    if (searchQuery.trim()) {
      baseFilters.search = searchQuery.trim();
    }

    return baseFilters;
  }, [activeTab, searchQuery]);

  // Fetch messages
  const { data: messagesData, isLoading, error } = useMessages(filters);
  const messages = messagesData?.messages || [];
  const unreadCount = messagesData?.unreadCount || 0;

  // Mutations
  const markAsReadMutation = useMarkAsRead();
  const archiveMessagesMutation = useArchiveMessages();
  const deleteMessageMutation = useDeleteMessage();

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value as TabValue);
    setSelectedMessages(new Set());
    setExpandedMessageId(null);
  };

  // Handle message selection
  const toggleMessageSelection = (messageId: string) => {
    setSelectedMessages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedMessages.size === messages.length) {
      setSelectedMessages(new Set());
    } else {
      setSelectedMessages(new Set(messages.map((m) => m.id)));
    }
  };

  // Handle message click (expand/collapse + mark as read)
  const handleMessageClick = async (message: MessageListItem) => {
    // Toggle expansion
    if (expandedMessageId === message.id) {
      setExpandedMessageId(null);
    } else {
      setExpandedMessageId(message.id);

      // Mark as read if unread
      if (message.status === 'unread') {
        try {
          await markAsReadMutation.mutateAsync({ messageIds: [message.id] });
        } catch (error) {
          console.error('Failed to mark message as read:', error);
        }
      }
    }
  };

  // Bulk actions
  const handleMarkAsRead = async () => {
    if (selectedMessages.size === 0) return;

    try {
      await markAsReadMutation.mutateAsync({ messageIds: Array.from(selectedMessages) });
      toast({
        title: 'Messages Marked as Read',
        description: `${selectedMessages.size} message(s) marked as read.`,
      });
      setSelectedMessages(new Set());
    } catch (error) {
      toast({
        title: 'Failed to Mark as Read',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    }
  };

  const handleArchive = async () => {
    if (selectedMessages.size === 0) return;

    try {
      await archiveMessagesMutation.mutateAsync({ messageIds: Array.from(selectedMessages) });
      toast({
        title: 'Messages Archived',
        description: `${selectedMessages.size} message(s) archived.`,
      });
      setSelectedMessages(new Set());
    } catch (error) {
      toast({
        title: 'Failed to Archive',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (selectedMessages.size === 0) return;

    try {
      for (const messageId of Array.from(selectedMessages)) {
        await deleteMessageMutation.mutateAsync(messageId);
      }
      toast({
        title: 'Messages Deleted',
        description: `${selectedMessages.size} message(s) deleted.`,
      });
      setSelectedMessages(new Set());
    } catch (error) {
      toast({
        title: 'Failed to Delete',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    }
  };

  // Get icon for message type
  const getMessageTypeIcon = (type: MessageType) => {
    switch (type) {
      case 'direct':
        return <Mail className="h-4 w-4" />;
      case 'announcement':
        return <Megaphone className="h-4 w-4" />;
      case 'reminder':
        return <Bell className="h-4 w-4" />;
      case 'system':
        return <Info className="h-4 w-4" />;
    }
  };


  // Render empty state
  const renderEmptyState = () => {
    if (searchQuery.trim()) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Search className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No messages found</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            No messages match your search query. Try different keywords.
          </p>
        </div>
      );
    }

    const emptyStateContent: Record<TabValue, { icon: React.ReactNode; title: string; description: string }> = {
      all: {
        icon: <InboxIcon className="h-12 w-12 text-muted-foreground" />,
        title: 'Inbox Empty',
        description: 'You have no messages. Check back later for new messages.',
      },
      direct: {
        icon: <Mail className="h-12 w-12 text-muted-foreground" />,
        title: 'No Direct Messages',
        description: 'You have no direct messages from instructors or staff.',
      },
      announcement: {
        icon: <Megaphone className="h-12 w-12 text-muted-foreground" />,
        title: 'No Announcements',
        description: 'You have no announcements at this time.',
      },
      reminder: {
        icon: <Bell className="h-12 w-12 text-muted-foreground" />,
        title: 'No Reminders',
        description: 'You have no upcoming reminders.',
      },
    };

    const content = emptyStateContent[activeTab];

    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        {content.icon}
        <h3 className="text-lg font-semibold mb-2 mt-4">{content.title}</h3>
        <p className="text-sm text-muted-foreground max-w-md">{content.description}</p>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inbox</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0 && (
              <span className="font-medium">
                {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}
              </span>
            )}
            {unreadCount === 0 && <span>All caught up!</span>}
          </p>
        </div>
        <Button onClick={() => setComposeDialogOpen(true)}>
          <Edit className="h-4 w-4 mr-2" />
          Compose
        </Button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="direct">Messages</TabsTrigger>
          <TabsTrigger value="announcement">Announcements</TabsTrigger>
          <TabsTrigger value="reminder">Reminders</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-4">
          {/* Bulk Actions Bar */}
          {selectedMessages.size > 0 && (
            <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
              <span className="text-sm font-medium">
                {selectedMessages.size} selected
              </span>
              <div className="flex-1" />
              <Button
                size="sm"
                variant="outline"
                onClick={handleMarkAsRead}
                disabled={markAsReadMutation.isPending}
              >
                <MailOpen className="h-4 w-4 mr-2" />
                Mark Read
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleArchive}
                disabled={archiveMessagesMutation.isPending}
              >
                <Archive className="h-4 w-4 mr-2" />
                Archive
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteMessageMutation.isPending}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <h3 className="text-lg font-semibold mb-2">Failed to Load Messages</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                {error instanceof Error ? error.message : 'An error occurred'}
              </p>
            </div>
          )}

          {/* Message List */}
          {!isLoading && !error && messages.length === 0 && renderEmptyState()}

          {!isLoading && !error && messages.length > 0 && (
            <div className="space-y-2">
              {/* Select All */}
              <div className="flex items-center gap-2 px-4 py-2 border-b">
                <Checkbox
                  checked={selectedMessages.size === messages.length && messages.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
                <span className="text-sm text-muted-foreground">Select all</span>
              </div>

              {/* Messages */}
              {messages.map((message) => {
                const isExpanded = expandedMessageId === message.id;
                const isSelected = selectedMessages.has(message.id);

                return (
                  <div
                    key={message.id}
                    className={cn(
                      'border rounded-lg transition-colors',
                      message.status === 'unread' && 'bg-accent/30',
                      isExpanded && 'ring-2 ring-primary'
                    )}
                  >
                    {/* Message Header */}
                    <div
                      className="flex items-start gap-3 p-4 cursor-pointer hover:bg-accent/50"
                      onClick={() => handleMessageClick(message)}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleMessageSelection(message.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-1"
                      />
                      <div className="flex-shrink-0 mt-1">
                        {getMessageTypeIcon(message.type)}
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              'font-medium truncate',
                              message.status === 'unread' && 'font-semibold'
                            )}
                          >
                            {message.subject}
                          </span>
                          {message.isImportant && (
                            <Badge variant="destructive" className="text-xs">
                              Important
                            </Badge>
                          )}
                          {message.status === 'unread' && (
                            <Badge variant="default" className="text-xs">
                              New
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>
                            From: {message.sender.firstName} {message.sender.lastName}
                            {message.sender.role && ` (${message.sender.role})`}
                          </span>
                        </div>
                        {!isExpanded && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {message.preview}
                          </p>
                        )}
                        {message.relatedEntity && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>Related: {message.relatedEntity.name}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-shrink-0 text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                      </div>
                    </div>

                    {/* Expanded Message Body */}
                    {isExpanded && (
                      <div className="px-4 pb-4 space-y-3 border-t">
                        <div className="pt-4">
                          <div className="prose prose-sm max-w-none">
                            <p className="whitespace-pre-wrap text-sm">{message.preview}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Compose Dialog */}
      <ComposeMessageDialog open={composeDialogOpen} onOpenChange={setComposeDialogOpen} />
    </div>
  );
};
