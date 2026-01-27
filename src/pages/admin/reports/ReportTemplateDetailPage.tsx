/**
 * Report Template Detail Page
 * Displays template details and allows generating reports from the template
 */

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/shared/ui/page-header';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { ArrowLeft, Play, Trash2, FileText, Tag, BarChart } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/shared/ui/use-toast';
import {
  useReportTemplate,
  useDeleteReportTemplate,
} from '@/entities/report-template';
import { UseTemplateDialog } from '@/features/report-templates';
import { cn } from '@/shared/lib/utils';

export const ReportTemplateDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [useTemplateDialogOpen, setUseTemplateDialogOpen] = React.useState(false);

  const { data: template, isLoading } = useReportTemplate(id!);
  const deleteMutation = useDeleteReportTemplate();

  const handleDelete = async () => {
    if (!template) return;
    if (template.isSystemTemplate) {
      toast({
        title: 'Cannot Delete',
        description: 'System templates cannot be deleted.',
        variant: 'destructive',
      });
      return;
    }
    if (!confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(template._id);
      toast({
        title: 'Template Deleted',
        description: 'The template has been deleted successfully.',
      });
      navigate('/admin/reports/templates');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete template',
        variant: 'destructive',
      });
    }
  };

  if (isLoading || !template) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading template...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title={template.name} description={template.description}>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate('/admin/reports/templates')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button onClick={() => setUseTemplateDialogOpen(true)}>
            <Play className="mr-2 h-4 w-4" />
            Use Template
          </Button>
          {!template.isSystemTemplate && (
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          )}
        </div>
      </PageHeader>

      {/* Badges */}
      <div className="flex items-center gap-2">
        {template.isSystemTemplate && <Badge>System Template</Badge>}
        <Badge variant="outline">{template.category}</Badge>
        <Badge variant="secondary">{template.visibility}</Badge>
      </div>

      {/* Template Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Template Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <FileText className="h-3 w-3" />
                Report Type
              </p>
              <p className="font-medium capitalize">
                {template.predefinedType?.replace('-', ' ') || 'Custom'}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <BarChart className="h-3 w-3" />
                Category
              </p>
              <p className="font-medium capitalize">{template.category}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Default Output Format</p>
              <p className="font-medium uppercase">{template.defaultOutputFormat}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Usage Count</p>
              <p className="font-medium">{template.usageCount} times</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="font-medium">{format(new Date(template.createdAt), 'PPP')}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Last Updated</p>
              <p className="font-medium">{format(new Date(template.updatedAt), 'PPP')}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Report Definition</CardTitle>
            <CardDescription>Report structure and configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Dimensions</p>
              <div className="mt-1 space-y-1">
                {template.definition.dimensions.map((dim, index) => (
                  <Badge key={index} variant="outline">
                    {dim.type}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Measures</p>
              <div className="mt-1 space-y-1">
                {template.definition.measures.map((measure, index) => (
                  <Badge key={index} variant="outline">
                    {measure.type}
                  </Badge>
                ))}
              </div>
            </div>

            {template.definition.slicers && template.definition.slicers.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground">Slicers</p>
                <div className="mt-1 space-y-1">
                  {template.definition.slicers.map((slicer, index) => (
                    <Badge key={index} variant="outline">
                      {slicer.field}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {template.definition.groups && template.definition.groups.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground">Groups</p>
                <div className="mt-1 space-y-1">
                  {template.definition.groups.map((group, index) => (
                    <Badge key={index} variant="outline">
                      {typeof group === 'string' ? group : group.type}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tags */}
      {template.tags && template.tags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Tags
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {template.tags.map((tag, index) => (
                <Badge key={index} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Use Template Dialog */}
      {template && (
        <UseTemplateDialog
          open={useTemplateDialogOpen}
          onOpenChange={setUseTemplateDialogOpen}
          template={template}
        />
      )}
    </div>
  );
};
