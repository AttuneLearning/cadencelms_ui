/**
 * Professional Links Section (Staff - Section 1.6)
 * URL validation for LinkedIn, ORCID, Google Scholar, personal website
 */

import { useState, useEffect } from 'react';
import { CollapsibleSection } from '../shared/CollapsibleSection';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { useUpdateStaffExtended } from '@/entities/user-profile/model/useUserProfile';
import { CheckCircle2, Loader2, ExternalLink } from 'lucide-react';

interface ProfessionalLinksSectionProps {
  data: {
    linkedInUrl?: string;
    orcidId?: string;
    googleScholarUrl?: string;
    websiteUrl?: string;
  };
}

export function ProfessionalLinksSection({ data }: ProfessionalLinksSectionProps) {
  const [localData, setLocalData] = useState(data);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const updateMutation = useUpdateStaffExtended();

  useEffect(() => {
    setLocalData(data);
  }, [data]);

  const handleBlur = async (field: keyof typeof localData, value: string) => {
    if (localData[field] === value) return;

    setSaveStatus('saving');
    try {
      await updateMutation.mutateAsync({ [field]: value });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('idle');
      console.error('Failed to save:', error);
    }
  };

  return (
    <CollapsibleSection title="Professional Links" defaultExpanded={false}>
      <div className="space-y-4">
        {saveStatus !== 'idle' && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            {saveStatus === 'saving' && (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving...</span>
              </>
            )}
            {saveStatus === 'saved' && (
              <>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-green-600">Saved</span>
              </>
            )}
          </div>
        )}

        {/* LinkedIn */}
        <div className="space-y-2">
          <Label htmlFor="linkedInUrl">LinkedIn Profile</Label>
          <Input
            id="linkedInUrl"
            type="url"
            placeholder="https://www.linkedin.com/in/yourprofile"
            value={localData.linkedInUrl || ''}
            onChange={(e) => setLocalData({ ...localData, linkedInUrl: e.target.value })}
            onBlur={(e) => handleBlur('linkedInUrl', e.target.value)}
          />
          {localData.linkedInUrl && (
            <a
              href={localData.linkedInUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline flex items-center gap-1"
            >
              View Profile <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>

        {/* ORCID */}
        <div className="space-y-2">
          <Label htmlFor="orcidId">ORCID iD</Label>
          <Input
            id="orcidId"
            placeholder="0000-0000-0000-0000"
            pattern="[0-9]{4}-[0-9]{4}-[0-9]{4}-[0-9]{4}"
            maxLength={19}
            value={localData.orcidId || ''}
            onChange={(e) => setLocalData({ ...localData, orcidId: e.target.value })}
            onBlur={(e) => handleBlur('orcidId', e.target.value)}
          />
          <p className="text-xs text-gray-500">Format: 0000-0000-0000-0000</p>
          {localData.orcidId && (
            <a
              href={`https://orcid.org/${localData.orcidId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline flex items-center gap-1"
            >
              View ORCID Profile <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>

        {/* Google Scholar */}
        <div className="space-y-2">
          <Label htmlFor="googleScholarUrl">Google Scholar Profile</Label>
          <Input
            id="googleScholarUrl"
            type="url"
            placeholder="https://scholar.google.com/citations?user=..."
            value={localData.googleScholarUrl || ''}
            onChange={(e) => setLocalData({ ...localData, googleScholarUrl: e.target.value })}
            onBlur={(e) => handleBlur('googleScholarUrl', e.target.value)}
          />
          {localData.googleScholarUrl && (
            <a
              href={localData.googleScholarUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline flex items-center gap-1"
            >
              View Scholar Profile <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>

        {/* Personal Website */}
        <div className="space-y-2">
          <Label htmlFor="websiteUrl">Personal Website</Label>
          <Input
            id="websiteUrl"
            type="url"
            placeholder="https://yourwebsite.com"
            value={localData.websiteUrl || ''}
            onChange={(e) => setLocalData({ ...localData, websiteUrl: e.target.value })}
            onBlur={(e) => handleBlur('websiteUrl', e.target.value)}
          />
          {localData.websiteUrl && (
            <a
              href={localData.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline flex items-center gap-1"
            >
              Visit Website <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>
    </CollapsibleSection>
  );
}
