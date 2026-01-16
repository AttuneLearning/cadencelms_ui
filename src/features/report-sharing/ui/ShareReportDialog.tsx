/**
 * Share Report Dialog Component
 * Dialog for managing report sharing and permissions
 */

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { useToast } from '@/shared/ui/use-toast';
import { Link2, Copy, Check } from 'lucide-react';
import { VisibilitySelector } from './VisibilitySelector';
import { UserShareList } from './UserShareList';
import type { ReportVisibility } from '@/shared/types/report-builder';

interface ShareReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportId: string;
  reportName: string;
  currentVisibility: ReportVisibility;
  sharedWith?: Array<{
    userId: string;
    userName: string;
    email: string;
    permission: 'view' | 'edit';
    sharedAt: string;
  }>;
}

export const ShareReportDialog: React.FC<ShareReportDialogProps> = ({
  open,
  onOpenChange,
  reportId,
  reportName,
  currentVisibility,
  sharedWith = [],
}) => {
  const { toast } = useToast();
  const [visibility, setVisibility] = React.useState<ReportVisibility>(currentVisibility);
  const [shareLink, setShareLink] = React.useState('');
  const [linkCopied, setLinkCopied] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  // Generate share link based on visibility
  React.useEffect(() => {
    if (visibility === 'organization' || visibility === 'department') {
      const baseUrl = window.location.origin;
      setShareLink(`${baseUrl}/reports/shared/${reportId}`);
    } else {
      setShareLink('');
    }
  }, [visibility, reportId]);

  const handleVisibilityChange = async (newVisibility: ReportVisibility) => {
    setIsLoading(true);
    try {
      // In real implementation, would call API endpoint
      // await api.patch(`/api/v2/reports/${reportId}/visibility`, { visibility: newVisibility });

      setVisibility(newVisibility);

      toast({
        title: 'Visibility Updated',
        description: `Report visibility changed to ${newVisibility}.`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update visibility',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setLinkCopied(true);

      toast({
        title: 'Link Copied',
        description: 'Share link copied to clipboard.',
      });

      setTimeout(() => setLinkCopied(false), 2000);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy link to clipboard',
        variant: 'destructive',
      });
    }
  };

  const handleAddUser = async (email: string, permission: 'view' | 'edit') => {
    try {
      // In real implementation, would call API endpoint
      // await api.post(`/api/v2/reports/${reportId}/share`, { email, permission });

      toast({
        title: 'User Added',
        description: `${email} can now ${permission} this report.`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to share report',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveUser = async (_userId: string) => {
    try {
      // In real implementation, would call API endpoint
      // await api.delete(`/api/v2/reports/${reportId}/share/${userId}`);

      toast({
        title: 'Access Removed',
        description: 'User access has been removed.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove user access',
        variant: 'destructive',
      });
    }
  };

  const handleUpdatePermission = async (_userId: string, permission: 'view' | 'edit') => {
    try {
      // In real implementation, would call API endpoint
      // await api.patch(`/api/v2/reports/${reportId}/share/${_userId}`, { permission });

      toast({
        title: 'Permission Updated',
        description: `User permission changed to ${permission}.`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update permission',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Share Report</DialogTitle>
          <DialogDescription>
            Manage who can access "{reportName}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Visibility Selector */}
          <div className="space-y-2">
            <Label>Report Visibility</Label>
            <VisibilitySelector
              value={visibility}
              onChange={handleVisibilityChange}
              disabled={isLoading}
            />
          </div>

          {/* Share Link (for public/organization visibility) */}
          {shareLink && (
            <div className="space-y-2">
              <Label htmlFor="shareLink">Share Link</Label>
              <div className="flex gap-2">
                <Input
                  id="shareLink"
                  value={shareLink}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCopyLink}
                  className="flex-shrink-0"
                >
                  {linkCopied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Link2 className="h-3 w-3" />
                Anyone with this link can access the report
              </p>
            </div>
          )}

          {/* User Share List */}
          <div className="space-y-2">
            <Label>Share with Specific Users</Label>
            <UserShareList
              sharedWith={sharedWith}
              onAddUser={handleAddUser}
              onRemoveUser={handleRemoveUser}
              onUpdatePermission={handleUpdatePermission}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
