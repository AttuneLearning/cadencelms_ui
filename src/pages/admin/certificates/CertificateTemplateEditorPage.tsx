/**
 * Certificate Template Editor Page
 * WYSIWYG editor for creating and editing certificate templates
 */

import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Checkbox } from '@/shared/ui/checkbox';
import { Separator } from '@/shared/ui/separator';
import { Badge } from '@/shared/ui/badge';
import { useToast } from '@/shared/ui/use-toast';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form';
import {
  useCertificateTemplateDetail,
  useCreateCertificateTemplate,
  useUpdateCertificateTemplate,
} from '@/entities/certificate-template/hooks/useCertificateTemplate';
import { TEMPLATE_VARIABLES, SAMPLE_CERTIFICATE_DATA } from '@/entities/certificate-template/model/types';
import {
  ArrowLeft,
  Save,
  Eye,
  Code,
  Copy,
  Loader2,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { PageHeader } from '@/shared/ui/page-header';

// Form validation schema
const templateFormSchema = z.object({
  name: z.string().min(1, 'Template name is required').max(200),
  description: z.string().max(500).optional(),
  htmlTemplate: z.string().min(1, 'HTML template is required'),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

type TemplateFormData = z.infer<typeof templateFormSchema>;

export const CertificateTemplateEditorPage: React.FC = () => {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isNewTemplate = templateId === 'new';

  // State
  const [showPreview, setShowPreview] = React.useState(false);
  const [previewHtml, setPreviewHtml] = React.useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);

  // Fetch template data
  const { data: template, isLoading: isLoadingTemplate } = useCertificateTemplateDetail(
    isNewTemplate ? '' : (templateId || '')
  );

  // Mutations
  const createTemplateMutation = useCreateCertificateTemplate();
  const updateTemplateMutation = useUpdateCertificateTemplate();

  // Form
  const form = useForm<TemplateFormData>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: {
      name: '',
      description: '',
      htmlTemplate: getDefaultTemplate(),
      isDefault: false,
      isActive: true,
    },
  });

  const htmlTemplate = form.watch('htmlTemplate');

  // Update form when template loads
  React.useEffect(() => {
    if (template) {
      form.setValue('name', template.name);
      form.setValue('description', template.description);
      form.setValue('htmlTemplate', template.htmlTemplate);
      form.setValue('isDefault', template.isDefault);
      form.setValue('isActive', template.isActive);
    }
  }, [template, form]);

  // Track unsaved changes
  React.useEffect(() => {
    setHasUnsavedChanges(form.formState.isDirty);
  }, [form.formState.isDirty]);

  // Update preview when HTML changes
  React.useEffect(() => {
    if (htmlTemplate) {
      setPreviewHtml(renderPreview(htmlTemplate));
    }
  }, [htmlTemplate]);

  // Handlers
  const handleBack = () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to leave?'
      );
      if (!confirmed) return;
    }
    navigate('/admin/certificates');
  };

  const handleSave = async (data: TemplateFormData) => {
    try {
      if (isNewTemplate) {
        await createTemplateMutation.mutateAsync({
          ...data,
          description: data.description || '',
        });
        toast({
          title: 'Template created',
          description: 'Certificate template has been created successfully.',
        });
      } else {
        await updateTemplateMutation.mutateAsync({
          id: templateId!,
          data,
        });
        toast({
          title: 'Template updated',
          description: 'Certificate template has been updated successfully.',
        });
      }
      setHasUnsavedChanges(false);
      navigate('/admin/certificates');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save template. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleInsertVariable = (variable: string) => {
    const currentTemplate = form.watch('htmlTemplate');
    form.setValue('htmlTemplate', currentTemplate + ` ${variable}`, { shouldDirty: true });
  };

  const handleCopyVariable = async (variable: string) => {
    try {
      await navigator.clipboard.writeText(variable);
      toast({
        title: 'Copied',
        description: 'Variable copied to clipboard.',
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy to clipboard.',
        variant: 'destructive',
      });
    }
  };

  // Loading state
  if (!isNewTemplate && isLoadingTemplate) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <div className="space-y-6 p-8">
        <PageHeader
        title={isNewTemplate ? 'Create Certificate Template' : 'Edit Certificate Template'}
        description={
          hasUnsavedChanges ? (
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs">
                <AlertCircle className="mr-1 h-3 w-3" />
                Unsaved changes
              </Badge>
            </div>
          ) : undefined
        }
        backButton={
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        }
      >
        <Button
          variant="outline"
          onClick={() => setShowPreview(!showPreview)}
        >
          {showPreview ? (
            <>
              <Code className="mr-2 h-4 w-4" />
              Edit Mode
            </>
          ) : (
            <>
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </>
          )}
        </Button>

        <Button
          onClick={form.handleSubmit(handleSave)}
          disabled={
            createTemplateMutation.isPending || updateTemplateMutation.isPending
          }
        >
          {(createTemplateMutation.isPending || updateTemplateMutation.isPending) && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          <Save className="mr-2 h-4 w-4" />
          {isNewTemplate ? 'Create Template' : 'Save Changes'}
        </Button>
      </PageHeader>

      {/* Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Template Variables */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Template Variables</CardTitle>
              <CardDescription>
                Click to copy, or use insert button
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {TEMPLATE_VARIABLES.map((variable) => (
                  <div
                    key={variable.key}
                    className="flex items-start justify-between gap-2 rounded-md border p-3 hover:bg-accent"
                  >
                    <div className="min-w-0 flex-1">
                      <code className="text-xs font-mono text-primary">
                        {variable.key}
                      </code>
                      <p className="text-xs text-muted-foreground mt-1">
                        {variable.description}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => handleCopyVariable(variable.key)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => handleInsertVariable(variable.key)}
                      >
                        Insert
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 text-green-600" />
                <p>Use HTML and inline CSS for styling</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 text-green-600" />
                <p>Preview with sample data before saving</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 text-green-600" />
                <p>Use page-break-after for multi-page PDFs</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 text-green-600" />
                <p>Recommended width: 800-900px</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Editor/Preview */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Template Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Template Name <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Course Completion Certificate"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Brief description of this template"
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              <div className="flex items-center gap-4">
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={!!field.value}
                          onCheckedChange={(checked) =>
                            field.onChange(!!checked)
                          }
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal cursor-pointer">
                        Active
                      </FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isDefault"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={!!field.value}
                          onCheckedChange={(checked) =>
                            field.onChange(!!checked)
                          }
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal cursor-pointer">
                        Set as Default
                      </FormLabel>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                {showPreview ? 'Preview' : 'HTML Template'}
              </CardTitle>
              <CardDescription>
                {showPreview
                  ? 'Preview with sample data'
                  : 'HTML template with CSS styling'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {showPreview ? (
                <div
                  className="border rounded-md p-6 bg-white min-h-[600px]"
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              ) : (
                <FormField
                  control={form.control}
                  name="htmlTemplate"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          className="font-mono text-sm min-h-[600px]"
                          placeholder="Enter HTML template with inline CSS..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="mt-2" />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </Form>
  );
};

// Helper Functions

/**
 * Get default HTML template
 */
function getDefaultTemplate(): string {
  return `<div style="width: 850px; padding: 60px; font-family: Arial, sans-serif; border: 10px solid #2c3e50; background: white;">
  <div style="text-align: center;">
    <h1 style="color: #2c3e50; font-size: 48px; margin-bottom: 10px;">Certificate of Completion</h1>
    <p style="color: #7f8c8d; font-size: 16px; margin-bottom: 40px;">This certifies that</p>

    <h2 style="color: #3498db; font-size: 36px; margin: 30px 0; font-weight: bold;">{{learnerName}}</h2>

    <p style="color: #7f8c8d; font-size: 16px; margin: 30px 0;">has successfully completed the course</p>

    <h3 style="color: #2c3e50; font-size: 28px; margin: 20px 0;">{{courseName}}</h3>
    <p style="color: #95a5a6; font-size: 14px; margin-bottom: 40px;">Course Code: {{courseCode}}</p>

    <div style="margin: 40px 0;">
      <p style="color: #7f8c8d; font-size: 14px;">Grade: <strong>{{grade}}</strong> ({{gradePercentage}})</p>
      <p style="color: #7f8c8d; font-size: 14px; margin-top: 10px;">Issue Date: {{issueDate}}</p>
    </div>

    <div style="margin-top: 60px; padding-top: 30px; border-top: 2px solid #ecf0f1;">
      <p style="color: #95a5a6; font-size: 12px;">Verification Code: {{verificationCode}}</p>
      <p style="color: #95a5a6; font-size: 12px; margin-top: 5px;">Certificate ID: {{certificateId}}</p>
    </div>
  </div>
</div>`;
}

/**
 * Render preview with sample data
 */
function renderPreview(htmlTemplate: string): string {
  let preview = htmlTemplate;

  // Replace all template variables with sample data
  Object.entries(SAMPLE_CERTIFICATE_DATA).forEach(([key, value]) => {
    const variable = `{{${key}}}`;
    preview = preview.replace(new RegExp(variable, 'g'), value);
  });

  return preview;
}
