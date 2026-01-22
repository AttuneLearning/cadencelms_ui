/**
 * Certificate Configuration Form Component
 * Form for configuring certificate settings on a program
 */

import { useState, useEffect } from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { Switch } from '@/shared/ui/switch';
import { Alert } from '@/shared/ui/alert';
import { Loader2, Save, Award, Image } from 'lucide-react';
import { useCertificateTemplates, useUpdateProgramCertificate } from '../model/useProgram';
import type { CertificateConfig, CertificateTemplate } from '../api/programApi';

interface CertificateConfigFormProps {
  programId: string;
  programName: string;
  departmentId?: string;
  initialConfig?: Partial<CertificateConfig>;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CertificateConfigForm({
  programId,
  programName,
  departmentId,
  initialConfig,
  onSuccess,
  onCancel,
}: CertificateConfigFormProps) {
  const { data: templatesData, isLoading: isLoadingTemplates } = useCertificateTemplates(
    departmentId ? { departmentId } : undefined
  );
  const updateCertificate = useUpdateProgramCertificate();

  const [formData, setFormData] = useState<Partial<CertificateConfig>>({
    enabled: initialConfig?.enabled ?? false,
    templateId: initialConfig?.templateId ?? '',
    title: initialConfig?.title ?? '',
    signatoryName: initialConfig?.signatoryName ?? '',
    signatoryTitle: initialConfig?.signatoryTitle ?? '',
    validityPeriod: initialConfig?.validityPeriod ?? 0,
    autoIssue: initialConfig?.autoIssue ?? true,
  });

  const [selectedTemplate, setSelectedTemplate] = useState<CertificateTemplate | null>(null);

  const templates = templatesData?.templates ?? [];
  const isLoading = updateCertificate.isPending;
  const error = updateCertificate.error;

  // Update selected template when templateId changes
  useEffect(() => {
    if (formData.templateId && templates.length > 0) {
      const template = templates.find((t) => t.id === formData.templateId);
      setSelectedTemplate(template ?? null);
    } else {
      setSelectedTemplate(null);
    }
  }, [formData.templateId, templates]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateCertificate.mutateAsync({
        id: programId,
        config: formData,
      });
      onSuccess?.();
    } catch (err) {
      console.error('Failed to update certificate configuration:', err);
    }
  };

  const handleChange = (
    field: keyof CertificateConfig,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <p>{error.message || 'Failed to save certificate configuration.'}</p>
        </Alert>
      )}

      <div className="space-y-4">
        {/* Enable/Disable Certificates */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <Award className="h-5 w-5 text-primary" />
            <div>
              <Label htmlFor="enabled" className="text-base font-medium">
                Enable Certificates
              </Label>
              <p className="text-sm text-muted-foreground">
                Issue certificates when learners complete {programName}
              </p>
            </div>
          </div>
          <Switch
            id="enabled"
            checked={formData.enabled}
            onCheckedChange={(checked) => handleChange('enabled', checked)}
            disabled={isLoading}
          />
        </div>

        {formData.enabled && (
          <>
            {/* Template Selection */}
            <div className="space-y-2">
              <Label htmlFor="templateId">
                Certificate Template <span className="text-destructive">*</span>
              </Label>
              {isLoadingTemplates ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading templates...
                </div>
              ) : (
                <Select
                  value={formData.templateId}
                  onValueChange={(value) => handleChange('templateId', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger id="templateId">
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        <div className="flex items-center gap-2">
                          {template.name}
                          {template.isDefault && (
                            <span className="text-xs text-muted-foreground">(Default)</span>
                          )}
                          {template.scope === 'department' && template.departmentName && (
                            <span className="text-xs text-muted-foreground">
                              ({template.departmentName})
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {selectedTemplate?.thumbnailUrl && (
                <div className="mt-2 p-2 border rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Image className="h-4 w-4" />
                    Template Preview
                  </div>
                  <img
                    src={selectedTemplate.thumbnailUrl}
                    alt={selectedTemplate.name}
                    className="max-w-full h-auto rounded border"
                  />
                </div>
              )}
            </div>

            {/* Certificate Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Certificate Title</Label>
              <Input
                id="title"
                type="text"
                value={formData.title ?? ''}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Certificate of Completion"
                maxLength={200}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Custom title for the certificate (optional, max 200 characters)
              </p>
            </div>

            {/* Signatory Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="signatoryName">Signatory Name</Label>
                <Input
                  id="signatoryName"
                  type="text"
                  value={formData.signatoryName ?? ''}
                  onChange={(e) => handleChange('signatoryName', e.target.value)}
                  placeholder="Dr. Jane Smith"
                  maxLength={100}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signatoryTitle">Signatory Title</Label>
                <Input
                  id="signatoryTitle"
                  type="text"
                  value={formData.signatoryTitle ?? ''}
                  onChange={(e) => handleChange('signatoryTitle', e.target.value)}
                  placeholder="Department Director"
                  maxLength={100}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Validity Period */}
            <div className="space-y-2">
              <Label htmlFor="validityPeriod">Validity Period (months)</Label>
              <Input
                id="validityPeriod"
                type="number"
                value={formData.validityPeriod ?? 0}
                onChange={(e) =>
                  handleChange('validityPeriod', parseInt(e.target.value, 10) || 0)
                }
                placeholder="24"
                min={0}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Set to 0 for certificates that never expire
              </p>
            </div>

            {/* Auto-Issue Toggle */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label htmlFor="autoIssue" className="text-base font-medium">
                  Auto-Issue Certificates
                </Label>
                <p className="text-sm text-muted-foreground">
                  Automatically issue certificates when learners complete the program
                </p>
              </div>
              <Switch
                id="autoIssue"
                checked={formData.autoIssue}
                onCheckedChange={(checked) => handleChange('autoIssue', checked)}
                disabled={isLoading}
              />
            </div>
          </>
        )}
      </div>

      <div className="flex items-center justify-end gap-4 pt-4 border-t">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Configuration
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
