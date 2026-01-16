/**
 * Custom Report Builder Page
 * Build custom reports using drag-and-drop interface
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/shared/ui/page-header';
import { Button } from '@/shared/ui/button';
import { ArrowLeft, Play, Save } from 'lucide-react';
import { useToast } from '@/shared/ui/use-toast';
import { useReportBuilder } from '@/features/report-builder/lib/useReportBuilder';
import {
  FieldPalette,
  ReportCanvas,
  FilterPanel,
  ReportPreview,
  ExportOptions,
  SaveTemplateDialog,
} from '@/features/report-builder/ui';
import { useCreateReportJob } from '@/entities/report-job';
import type { CreateReportJobRequest } from '@/entities/report-job';

export const CustomReportBuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const builder = useReportBuilder();
  const createJobMutation = useCreateReportJob();
  const [saveTemplateDialogOpen, setSaveTemplateDialogOpen] = React.useState(false);

  const handleAddFilter = () => {
    builder.addFilter({
      field: '',
      operator: 'eq',
      value: '',
    });
  };

  const handleGenerateReport = async () => {
    // Validate report definition
    if (!builder.validate()) {
      toast({
        title: 'Validation Failed',
        description: builder.errors[0] || 'Please fix the errors before generating the report.',
        variant: 'destructive',
      });
      return;
    }

    const request: CreateReportJobRequest = {
      type: 'custom',
      customDefinition: builder.definition,
      name: 'Custom Report',
      outputFormat: builder.outputFormat,
      visibility: 'private',
    };

    try {
      const job = await createJobMutation.mutateAsync(request);

      toast({
        title: 'Report Job Created',
        description: 'Your report is being generated. You will be redirected to the job page.',
      });

      // Redirect to job detail page
      navigate(`/admin/reports/jobs/${job._id}`);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create report job',
        variant: 'destructive',
      });
    }
  };

  const handleSaveTemplate = () => {
    // Validate before opening dialog
    if (!builder.validate()) {
      toast({
        title: 'Validation Failed',
        description: builder.errors[0] || 'Please fix the errors before saving as template.',
        variant: 'destructive',
      });
      return;
    }

    setSaveTemplateDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Custom Report Builder"
        description="Build custom reports by dragging and dropping fields"
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate('/admin/reports')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button variant="outline" onClick={handleSaveTemplate}>
            <Save className="mr-2 h-4 w-4" />
            Save as Template
          </Button>
          <Button
            onClick={handleGenerateReport}
            disabled={createJobMutation.isPending || !builder.definition.dimensions.length}
          >
            <Play className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Field Palette */}
        <div className="lg:col-span-1">
          <FieldPalette />
        </div>

        {/* Right Column: Canvas, Filters, Preview, and Export Options */}
        <div className="lg:col-span-2 space-y-6">
          {/* Report Canvas */}
          <ReportCanvas
            dimensions={builder.definition.dimensions}
            measures={builder.definition.measures}
            slicers={builder.definition.slicers}
            groups={builder.definition.groups}
            onAddDimension={builder.addDimension}
            onRemoveDimension={builder.removeDimension}
            onAddMeasure={builder.addMeasure}
            onRemoveMeasure={builder.removeMeasure}
            errors={builder.errors}
          />

          {/* Filter Panel */}
          <FilterPanel
            filters={builder.definition.filters || []}
            onAddFilter={handleAddFilter}
            onUpdateFilter={builder.updateFilter}
            onRemoveFilter={builder.removeFilter}
          />

          {/* Export Options */}
          <ExportOptions
            selected={builder.outputFormat}
            onSelect={builder.setOutputFormat}
          />

          {/* Report Preview */}
          <ReportPreview definition={builder.definition} />
        </div>
      </div>

      {/* Save Template Dialog */}
      <SaveTemplateDialog
        open={saveTemplateDialogOpen}
        onOpenChange={setSaveTemplateDialogOpen}
        definition={builder.definition}
        outputFormat={builder.outputFormat}
      />
    </div>
  );
};
