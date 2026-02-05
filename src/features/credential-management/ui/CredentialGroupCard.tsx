/**
 * CredentialGroupCard Component
 * Displays a credential group (certificate or badge) with its key metrics
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import {
  Award,
  Shield,
  MoreHorizontal,
  Eye,
  Edit,
  FileText,
  Users,
  Building,
  Calendar,
} from 'lucide-react';
import type { CredentialGroupListItem } from '@/entities/credential';
import { cn } from '@/shared/lib/utils';

interface CredentialGroupCardProps {
  credentialGroup: CredentialGroupListItem;
  onView?: (credentialGroup: CredentialGroupListItem) => void;
  onEdit?: (credentialGroup: CredentialGroupListItem) => void;
  onViewDefinitions?: (credentialGroup: CredentialGroupListItem) => void;
  onViewIssuances?: (credentialGroup: CredentialGroupListItem) => void;
  className?: string;
}

export const CredentialGroupCard: React.FC<CredentialGroupCardProps> = ({
  credentialGroup,
  onView,
  onEdit,
  onViewDefinitions,
  onViewIssuances,
  className,
}) => {
  const TypeIcon = credentialGroup.type === 'certificate' ? Award : Shield;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card className={cn('transition-all hover:shadow-md', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            {/* Badge icon */}
            <div
              className="flex h-12 w-12 items-center justify-center rounded-lg"
              style={{ backgroundColor: (credentialGroup.badgeColor || '#3B82F6') + '20' }}
            >
              {credentialGroup.badgeImageUrl ? (
                <img
                  src={credentialGroup.badgeImageUrl}
                  alt={credentialGroup.name}
                  className="h-8 w-8"
                />
              ) : (
                <TypeIcon
                  className="h-6 w-6"
                  style={{ color: credentialGroup.badgeColor || '#3B82F6' }}
                />
              )}
            </div>

            <div className="flex-1">
              <CardTitle className="line-clamp-1 text-base">{credentialGroup.name}</CardTitle>
              <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline" className="text-xs">
                  {credentialGroup.code}
                </Badge>
                <Badge
                  variant={credentialGroup.type === 'certificate' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {credentialGroup.type === 'certificate' ? 'Certificate' : 'Badge'}
                </Badge>
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView?.(credentialGroup)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(credentialGroup)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onViewDefinitions?.(credentialGroup)}>
                <FileText className="mr-2 h-4 w-4" />
                View Definitions
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onViewIssuances?.(credentialGroup)}>
                <Users className="mr-2 h-4 w-4" />
                View Issuances
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Status badge */}
        <div className="mt-2">
          {credentialGroup.isActive ? (
            <Badge variant="default" className="bg-green-600 text-xs">
              Active
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-xs">
              Inactive
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span>{credentialGroup.activeDefinitionsCount} definition(s)</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{credentialGroup.totalIssuances.toLocaleString()} issued</span>
          </div>
        </div>

        {/* Department and program info */}
        <div className="mt-3 space-y-1 border-t pt-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Building className="h-3 w-3" />
            <span>{credentialGroup.department.name}</span>
          </div>
          {credentialGroup.program && (
            <div className="flex items-center gap-2">
              <Award className="h-3 w-3" />
              <span>{credentialGroup.program.name}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Calendar className="h-3 w-3" />
            <span>Created {formatDate(credentialGroup.createdAt)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
