/**
 * TemplateCard Component
 * Displays a template as a card with metadata matching the contract
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { FileCode, Users, Building2, Globe } from 'lucide-react';
import type { TemplateListItem } from '../model/types';
import { cn } from '@/shared/lib/utils';

interface TemplateCardProps {
  template: TemplateListItem;
  className?: string;
  showUsageCount?: boolean;
  onPreview?: (id: string) => void;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  className,
  showUsageCount = true,
  onPreview,
}) => {
  const typeColor = getTypeColor(template.type);
  const statusColor = getStatusColor(template.status);

  return (
    <Card className={cn('h-full transition-shadow hover:shadow-lg', className)}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2 flex-wrap">
              <Badge variant={typeColor} className="text-xs">
                {formatTemplateType(template.type)}
              </Badge>
              <Badge variant={statusColor} className="text-xs">
                {template.status}
              </Badge>
              {template.isGlobal && (
                <Badge variant="outline" className="text-xs">
                  <Globe className="mr-1 h-3 w-3" />
                  Global
                </Badge>
              )}
            </div>
            <CardTitle className="line-clamp-2">
              <Link to={`/templates/${template.id}`} className="hover:underline">
                {template.name}
              </Link>
            </CardTitle>
          </div>
        </div>
        <CardDescription className="mt-2">
          Created by {template.createdBy.firstName} {template.createdBy.lastName}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Department */}
        {template.departmentName && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 className="h-4 w-4" />
            <span>{template.departmentName}</span>
          </div>
        )}

        {/* Metadata */}
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <FileCode className="h-4 w-4" />
            <span>
              {template.type === 'master'
                ? 'Master Template'
                : template.type === 'department'
                ? 'Department Template'
                : 'Custom Template'}
            </span>
          </div>
          {showUsageCount && (
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{template.usageCount} Course{template.usageCount !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {/* Dates */}
        <div className="text-xs text-muted-foreground">
          <div>Created: {formatDate(template.createdAt)}</div>
          <div>Updated: {formatDate(template.updatedAt)}</div>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2">
        {onPreview && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onPreview(template.id);
            }}
            className="text-sm text-primary hover:underline"
          >
            Preview
          </button>
        )}
        <Link
          to={`/templates/${template.id}`}
          className="text-sm text-primary hover:underline"
        >
          View Details
        </Link>
      </CardFooter>
    </Card>
  );
};

// Helper functions
function getTypeColor(
  type: string
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (type) {
    case 'master':
      return 'default';
    case 'department':
      return 'secondary';
    case 'custom':
      return 'outline';
    default:
      return 'default';
  }
}

function getStatusColor(
  status: string
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'active':
      return 'default';
    case 'draft':
      return 'secondary';
    default:
      return 'default';
  }
}

function formatTemplateType(type: string): string {
  switch (type) {
    case 'master':
      return 'Master';
    case 'department':
      return 'Department';
    case 'custom':
      return 'Custom';
    default:
      return type;
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
