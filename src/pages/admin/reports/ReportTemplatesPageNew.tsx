/**
 * Report Templates Page (New System 2.0)
 * Browse and manage report templates
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/shared/ui/page-header';
import {
  useReportTemplates,
  useMyTemplates,
  useSystemTemplates,
  type ListReportTemplatesParams,
} from '@/entities/report-template';
import type { ReportTemplate } from '@/entities/report-template';
import {
  TemplateGrid,
  TemplateFilters,
  CreateTemplateDialog,
  UseTemplateDialog,
} from '@/features/report-templates';

export const ReportTemplatesPageNew: React.FC = () => {
  const navigate = useNavigate();

  // State
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [selectedTemplate, setSelectedTemplate] = React.useState<ReportTemplate | null>(null);
  const [activeTab, setActiveTab] = React.useState('all');

  // Filters
  const [filters, setFilters] = React.useState<ListReportTemplatesParams>({
    page: 1,
    limit: 100,
  });

  // Data fetching
  const { data: allTemplates, isLoading: isLoadingAll } = useReportTemplates(filters);
  const { data: myTemplates, isLoading: isLoadingMy } = useMyTemplates();
  const { data: systemTemplates, isLoading: isLoadingSystem } = useSystemTemplates();

  const handleUseTemplate = (template: ReportTemplate) => {
    setSelectedTemplate(template);
  };

  const handleViewTemplate = (templateId: string) => {
    navigate(`/admin/reports/templates/${templateId}`);
  };

  const handleClearFilters = () => {
    setFilters({ page: 1, limit: 100 });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Report Templates"
        description="Browse and create reusable report templates"
      >
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </PageHeader>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Templates</CardDescription>
            <CardTitle className="text-3xl">{allTemplates?.totalCount || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>My Templates</CardDescription>
            <CardTitle className="text-3xl text-primary">
              {myTemplates?.length || 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>System Templates</CardDescription>
            <CardTitle className="text-3xl text-green-600">
              {systemTemplates?.length || 0}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Templates Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Browse Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All Templates</TabsTrigger>
              <TabsTrigger value="my">My Templates</TabsTrigger>
              <TabsTrigger value="system">System Templates</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <TemplateFilters
                filters={filters}
                onFiltersChange={setFilters}
                onClear={handleClearFilters}
              />
              <TemplateGrid
                templates={allTemplates?.templates || []}
                onUse={handleUseTemplate}
                onView={handleViewTemplate}
                emptyMessage="No templates found. Create your first template to get started."
              />
            </TabsContent>

            <TabsContent value="my" className="space-y-4">
              <TemplateGrid
                templates={myTemplates || []}
                onUse={handleUseTemplate}
                onView={handleViewTemplate}
                emptyMessage="You haven't created any templates yet."
              />
            </TabsContent>

            <TabsContent value="system" className="space-y-4">
              <TemplateGrid
                templates={systemTemplates || []}
                onUse={handleUseTemplate}
                onView={handleViewTemplate}
                emptyMessage="No system templates available."
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <CreateTemplateDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />

      {/* Use Template Dialog */}
      <UseTemplateDialog
        open={!!selectedTemplate}
        onOpenChange={(open) => !open && setSelectedTemplate(null)}
        template={selectedTemplate}
      />
    </div>
  );
};
