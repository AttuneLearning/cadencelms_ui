/**
 * Compose Message Dialog
 * Dialog for creating and sending new messages
 */

import React, { useState } from 'react';
import { Loader2, Send, X } from 'lucide-react';
import { useSendMessage } from '@/entities/message';
import type { SendMessagePayload } from '@/entities/message';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { Label } from '@/shared/ui/label';
import { useToast } from '@/shared/ui/use-toast';

interface ComposeMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipientId?: string;
  recipientName?: string;
}

export const ComposeMessageDialog: React.FC<ComposeMessageDialogProps> = ({
  open,
  onOpenChange,
  recipientId: initialRecipientId,
  recipientName: initialRecipientName,
}) => {
  const [recipientId, setRecipientId] = useState(initialRecipientId || '');
  const [recipientName, setRecipientName] = useState(initialRecipientName || '');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const { toast } = useToast();
  const sendMessageMutation = useSendMessage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!recipientId.trim()) {
      toast({
        title: 'Recipient Required',
        description: 'Please enter a recipient ID.',
        variant: 'destructive',
      });
      return;
    }

    if (!subject.trim()) {
      toast({
        title: 'Subject Required',
        description: 'Please enter a subject for your message.',
        variant: 'destructive',
      });
      return;
    }

    if (!body.trim()) {
      toast({
        title: 'Message Body Required',
        description: 'Please enter a message body.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const payload: SendMessagePayload = {
        recipientId,
        subject,
        body,
        type: 'direct',
      };

      await sendMessageMutation.mutateAsync(payload);

      toast({
        title: 'Message Sent',
        description: 'Your message has been sent successfully.',
      });

      // Reset form and close dialog
      setRecipientId(initialRecipientId || '');
      setRecipientName(initialRecipientName || '');
      setSubject('');
      setBody('');
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Failed to Send Message',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    }
  };

  const handleClose = () => {
    setRecipientId(initialRecipientId || '');
    setRecipientName(initialRecipientName || '');
    setSubject('');
    setBody('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Compose Message</DialogTitle>
          <DialogDescription>Send a message to another user</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Recipient */}
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient</Label>
            {initialRecipientId ? (
              <div className="px-3 py-2 bg-muted rounded-md text-sm">
                {initialRecipientName || initialRecipientId}
              </div>
            ) : (
              <div className="space-y-2">
                <Input
                  id="recipientId"
                  placeholder="Recipient User ID"
                  value={recipientId}
                  onChange={(e) => setRecipientId(e.target.value)}
                  disabled={sendMessageMutation.isPending}
                />
                <Input
                  id="recipientName"
                  placeholder="Recipient Name (optional)"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  disabled={sendMessageMutation.isPending}
                />
              </div>
            )}
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              placeholder="Message subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={sendMessageMutation.isPending}
              required
            />
          </div>

          {/* Body */}
          <div className="space-y-2">
            <Label htmlFor="body">Message</Label>
            <Textarea
              id="body"
              placeholder="Type your message here..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              disabled={sendMessageMutation.isPending}
              rows={8}
              required
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={sendMessageMutation.isPending}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" disabled={sendMessageMutation.isPending}>
              {sendMessageMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Send Message
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
