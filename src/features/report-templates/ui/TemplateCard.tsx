/**
 * Template Card Component
 * Displays a report template in card format
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { FileText, Star, Users, Eye } from 'lucide-react';
import type { ReportTemplate } from '@/entities/report-template';
import { cn } from '@/shared/lib/utils';

interface TemplateCardProps {
  template: ReportTemplate;
  onUse?: (template: ReportTemplate) => void;
  onView?: (templateId: string) => void;
  className?: string;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  onUse,
  onView,
  className,
}) => {
  return (
    <Card className={cn('hover:shadow-md transition-shadow flex flex-col', className)}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <FileText className="h-8 w-8 text-primary" />
          {template.isSystemTemplate && (
            <Badge variant="secondary">System</Badge>
          )}
        </div>
        <CardTitle className="text-lg">{template.name}</CardTitle>
        {template.description && (
          <CardDescription className="line-clamp-2">{template.description}</CardDescription>
        )}
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        <div className="flex flex-wrap gap-1">
          {template.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {template.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{template.tags.length - 3}
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-muted-foreground">Category</p>
            <p className="font-medium capitalize">{template.category}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Type</p>
            <p className="font-medium capitalize">{template.reportType.replace(/-/g, ' ')}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4" />
            <span>{template.usageCount} uses</span>
          </div>
          {template.visibility === 'organization' && (
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>Org-wide</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="gap-2">
        {onView && (
          <Button variant="outline" size="sm" onClick={() => onView(template._id)} className="flex-1">
            <Eye className="h-4 w-4 mr-2" />
            View
          </Button>
        )}
        {onUse && (
          <Button size="sm" onClick={() => onUse(template)} className="flex-1">
            Use Template
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
