/**
 * VersionHistoryDialog Component
 * Dialog for viewing and managing course version history
 */

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Separator } from '@/shared/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import {
  Lock,
  MoreHorizontal,
  Eye,
  GitBranch,
  Copy,
  Archive,
  CheckCircle,
  Clock,
  FileText,
} from 'lucide-react';
import type { CourseVersionListItem, CourseVersionsListResponse } from '@/entities/course-version';

interface VersionHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseCode: string;
  versionHistory: CourseVersionsListResponse | null;
  isLoading?: boolean;
  onViewVersion?: (version: CourseVersionListItem) => void;
  onCreateVersionFrom?: (version: CourseVersionListItem) => void;
  onCompareVersions?: (version1: CourseVersionListItem, version2: CourseVersionListItem) => void;
}

const getStatusBadge = (status: CourseVersionListItem['status'], isLocked: boolean) => {
  if (isLocked) {
    return (
      <Badge variant="secondary" className="gap-1">
        <Lock className="h-3 w-3" />
        Locked
      </Badge>
    );
  }

  switch (status) {
    case 'published':
      return (
        <Badge variant="default" className="gap-1 bg-green-600">
          <CheckCircle className="h-3 w-3" />
          Published
        </Badge>
      );
    case 'draft':
      return (
        <Badge variant="outline" className="gap-1">
          <FileText className="h-3 w-3" />
          Draft
        </Badge>
      );
    case 'archived':
      return (
        <Badge variant="secondary" className="gap-1">
          <Archive className="h-3 w-3" />
          Archived
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const VersionHistoryDialog: React.FC<VersionHistoryDialogProps> = ({
  open,
  onOpenChange,
  courseCode,
  versionHistory,
  isLoading = false,
  onViewVersion,
  onCreateVersionFrom,
}) => {
  const [selectedVersions, setSelectedVersions] = React.useState<string[]>([]);

  const handleVersionSelect = (versionId: string) => {
    setSelectedVersions((prev) => {
      if (prev.includes(versionId)) {
        return prev.filter((id) => id !== versionId);
      }
      if (prev.length < 2) {
        return [...prev, versionId];
      }
      return [prev[1], versionId];
    });
  };

  const handleClearSelection = () => {
    setSelectedVersions([]);
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Version History</DialogTitle>
            <DialogDescription>Loading version history...</DialogDescription>
          </DialogHeader>
          <div className="flex h-48 items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading...</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!versionHistory) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Version History</DialogTitle>
            <DialogDescription>No version history available</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Version History: {courseCode}
          </DialogTitle>
          <DialogDescription>
            View and manage all versions of this course. Total versions:{' '}
            {versionHistory.totalVersions}
          </DialogDescription>
        </DialogHeader>

        {/* Selection toolbar */}
        {selectedVersions.length > 0 && (
          <>
            <div className="flex items-center justify-between rounded-lg bg-muted p-3">
              <span className="text-sm text-muted-foreground">
                {selectedVersions.length} version(s) selected
                {selectedVersions.length === 2 && ' - Ready to compare'}
              </span>
              <div className="flex gap-2">
                {selectedVersions.length === 2 && (
                  <Button variant="outline" size="sm" disabled>
                    <Copy className="mr-2 h-4 w-4" />
                    Compare (Coming Soon)
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={handleClearSelection}>
                  Clear Selection
                </Button>
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Versions table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">Select</TableHead>
                <TableHead className="w-[80px]">Version</TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="w-[120px]">Status</TableHead>
                <TableHead className="w-[100px]">Modules</TableHead>
                <TableHead className="w-[100px]">Enrollments</TableHead>
                <TableHead className="w-[160px]">Published</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {versionHistory.versions.map((version) => (
                <TableRow
                  key={version.id}
                  className={selectedVersions.includes(version.id) ? 'bg-muted/50' : ''}
                >
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedVersions.includes(version.id)}
                      onChange={() => handleVersionSelect(version.id)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="font-mono text-xs">
                        v{version.version}
                      </Badge>
                      {version.isLatest && (
                        <Badge variant="secondary" className="text-xs">
                          Latest
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{version.title}</span>
                      {version.changeNotes && (
                        <span className="text-xs text-muted-foreground line-clamp-1">
                          {version.changeNotes}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(version.status, version.isLocked)}</TableCell>
                  <TableCell>{version.moduleCount}</TableCell>
                  <TableCell>{version.enrollmentCount.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDate(version.publishedAt)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onViewVersion?.(version)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        {!version.isLocked && version.status === 'published' && (
                          <DropdownMenuItem onClick={() => onCreateVersionFrom?.(version)}>
                            <GitBranch className="mr-2 h-4 w-4" />
                            Create New Version From
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {versionHistory.versions.length} of {versionHistory.totalVersions} versions
          </span>
          <div className="flex items-center gap-2">
            <Lock className="h-3 w-3" />
            <span>Locked versions cannot be edited</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
