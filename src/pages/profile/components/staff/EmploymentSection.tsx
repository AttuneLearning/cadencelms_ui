/**
 * Employment Details Section (Staff - Section 1.2)
 * Readonly fields: employeeId, hireDate
 * Editable: officeLocation
 */

import { useState, useEffect } from 'react';
import { CollapsibleSection } from '../shared/CollapsibleSection';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Badge } from '@/shared/ui/badge';
import { useUpdateStaffExtended } from '@/entities/user-profile/model/useUserProfile';
import { CheckCircle2, Loader2 } from 'lucide-react';

interface EmploymentSectionProps {
  data: {
    employeeId?: string;
    hireDate?: string;
    officeLocation?: string;
  };
}

export function EmploymentSection({ data }: EmploymentSectionProps) {
  const [officeLocation, setOfficeLocation] = useState(data.officeLocation || '');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const updateMutation = useUpdateStaffExtended();

  useEffect(() => {
    setOfficeLocation(data.officeLocation || '');
  }, [data.officeLocation]);

  const handleBlur = async () => {
    if (officeLocation === data.officeLocation) return;

    setSaveStatus('saving');
    try {
      await updateMutation.mutateAsync({ officeLocation });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('idle');
      console.error('Failed to save:', error);
    }
  };

  return (
    <CollapsibleSection title="Employment Details" defaultExpanded={false}>
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

        {/* Employee ID - Readonly */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label>Employee ID</Label>
            <Badge variant="secondary" className="text-xs">Readonly</Badge>
          </div>
          <div className="text-sm text-gray-600 font-mono bg-gray-50 p-2 rounded border">
            {data.employeeId || 'Not assigned'}
          </div>
        </div>

        {/* Hire Date - Readonly */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label>Hire Date</Label>
            <Badge variant="secondary" className="text-xs">Readonly</Badge>
          </div>
          <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded border">
            {data.hireDate
              ? new Date(data.hireDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })
              : 'Not set'}
          </div>
        </div>

        {/* Office Location - Editable */}
        <div className="space-y-2">
          <Label htmlFor="officeLocation">Office Location</Label>
          <Input
            id="officeLocation"
            placeholder="e.g., Building A, Room 205"
            maxLength={100}
            value={officeLocation}
            onChange={(e) => setOfficeLocation(e.target.value)}
            onBlur={handleBlur}
          />
          <p className="text-xs text-gray-500">
            Where students and colleagues can find you
          </p>
        </div>
      </div>
    </CollapsibleSection>
  );
}
