/**
 * CertificateDefinitionList Component
 * Displays a list of certificate definitions with version information
 */

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import {
  MoreHorizontal,
  Eye,
  Edit,
  GitBranch,
  Archive,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  Users,
} from 'lucide-react';
import type { CertificateDefinitionListItem } from '@/entities/credential';

interface CertificateDefinitionListProps {
  definitions: CertificateDefinitionListItem[];
  isLoading?: boolean;
  onView?: (definition: CertificateDefinitionListItem) => void;
  onEdit?: (definition: CertificateDefinitionListItem) => void;
  onCreateVersion?: (definition: CertificateDefinitionListItem) => void;
  onArchive?: (definition: CertificateDefinitionListItem) => void;
}

const getStatusBadge = (status: CertificateDefinitionListItem['status']) => {
  switch (status) {
    case 'active':
      return (
        <Badge variant="default" className="gap-1 bg-green-600">
          <CheckCircle className="h-3 w-3" />
          Active
        </Badge>
      );
    case 'draft':
      return (
        <Badge variant="outline" className="gap-1">
          <FileText className="h-3 w-3" />
          Draft
        </Badge>
      );
    case 'deprecated':
      return (
        <Badge variant="secondary" className="gap-1">
          <AlertCircle className="h-3 w-3" />
          Deprecated
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
  });
};

export const CertificateDefinitionList: React.FC<CertificateDefinitionListProps> = ({
  definitions,
  isLoading = false,
  onView,
  onEdit,
  onCreateVersion,
  onArchive,
}) => {
  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading definitions...</div>
      </div>
    );
  }

  if (definitions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
        <FileText className="h-12 w-12 text-muted-foreground" />
        <p className="mt-4 text-muted-foreground">No certificate definitions found</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Definition</TableHead>
            <TableHead className="w-[100px]">Version</TableHead>
            <TableHead className="w-[100px]">Status</TableHead>
            <TableHead className="w-[80px]">Req.</TableHead>
            <TableHead className="w-[100px]">Issuances</TableHead>
            <TableHead className="w-[140px]">Valid Period</TableHead>
            <TableHead className="w-[60px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {definitions.map((definition) => (
            <TableRow key={definition.id}>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{definition.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {definition.credentialGroupName} ({definition.credentialGroupCode})
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="font-mono text-xs">
                    v{definition.version}
                  </Badge>
                  {!definition.isCompatible && (
                    <AlertCircle className="h-3 w-3 text-amber-500" />
                  )}
                </div>
              </TableCell>
              <TableCell>{getStatusBadge(definition.status)}</TableCell>
              <TableCell>
                <Badge variant="secondary" className="text-xs">
                  {definition.requirementCount}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 text-sm">
                  <Users className="h-3 w-3 text-muted-foreground" />
                  {definition.totalIssuances.toLocaleString()}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>
                    {formatDate(definition.validFrom)} - {formatDate(definition.validUntil)}
                  </span>
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
                    <DropdownMenuItem onClick={() => onView?.(definition)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    {definition.status === 'draft' && (
                      <DropdownMenuItem onClick={() => onEdit?.(definition)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                    )}
                    {definition.status === 'active' && (
                      <DropdownMenuItem onClick={() => onCreateVersion?.(definition)}>
                        <GitBranch className="mr-2 h-4 w-4" />
                        Create New Version
                      </DropdownMenuItem>
                    )}
                    {(definition.status === 'active' || definition.status === 'deprecated') && (
                      <DropdownMenuItem onClick={() => onArchive?.(definition)}>
                        <Archive className="mr-2 h-4 w-4" />
                        Archive
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
  );
};
