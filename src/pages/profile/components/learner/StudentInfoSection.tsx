/**
 * Student Information Section (Learner - Section 2.1)
 * Readonly: studentId, enrollmentStatus, actualGraduationDate, transferCredits
 * Editable: expectedGraduationDate
 */

import React, { useState, useEffect } from 'react';
import { CollapsibleSection } from '../shared/CollapsibleSection';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Badge } from '@/shared/ui/badge';
import { useUpdateLearnerExtended } from '@/entities/user-profile/model/useUserProfile';
import type { EnrollmentStatus } from '@/entities/user-profile/model/types';
import { CheckCircle2, Loader2 } from 'lucide-react';

interface StudentInfoSectionProps {
  data: {
    studentId?: string;
    enrollmentStatus?: EnrollmentStatus;
    expectedGraduationDate?: string;
    actualGraduationDate?: string;
    transferCredits?: number;
  };
}

const enrollmentStatusColors: Record<EnrollmentStatus, string> = {
  'enrolled': 'bg-green-500',
  'admitted': 'bg-blue-500',
  'prospective': 'bg-gray-500',
  'leave-of-absence': 'bg-yellow-500',
  'withdrawn': 'bg-red-500',
  'expelled': 'bg-red-600',
  'graduated': 'bg-purple-500',
};

const enrollmentStatusLabels: Record<EnrollmentStatus, string> = {
  'enrolled': 'Enrolled',
  'admitted': 'Admitted',
  'prospective': 'Prospective',
  'leave-of-absence': 'Leave of Absence',
  'withdrawn': 'Withdrawn',
  'expelled': 'Expelled',
  'graduated': 'Graduated',
};

export function StudentInfoSection({ data }: StudentInfoSectionProps) {
  const [expectedGradDate, setExpectedGradDate] = useState(data.expectedGraduationDate || '');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const updateMutation = useUpdateLearnerExtended();

  useEffect(() => {
    setExpectedGradDate(data.expectedGraduationDate || '');
  }, [data.expectedGraduationDate]);

  const handleBlur = async () => {
    if (expectedGradDate === data.expectedGraduationDate) return;

    setSaveStatus('saving');
    try {
      await updateMutation.mutateAsync({ expectedGraduationDate: expectedGradDate });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('idle');
      console.error('Failed to save:', error);
    }
  };

  return (
    <CollapsibleSection title="Student Information" defaultExpanded={true}>
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

        {/* Student ID - Readonly */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label>Student ID</Label>
            <Badge variant="secondary" className="text-xs">Readonly</Badge>
          </div>
          <div className="text-sm text-gray-600 font-mono bg-gray-50 p-2 rounded border">
            {data.studentId || 'Not assigned'}
          </div>
        </div>

        {/* Enrollment Status - Readonly */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label>Enrollment Status</Label>
            <Badge variant="secondary" className="text-xs">Readonly</Badge>
          </div>
          <div>
            {data.enrollmentStatus && (
              <Badge className={enrollmentStatusColors[data.enrollmentStatus]}>
                {enrollmentStatusLabels[data.enrollmentStatus]}
              </Badge>
            )}
            {!data.enrollmentStatus && <span className="text-sm text-gray-500">Not set</span>}
          </div>
        </div>

        {/* Expected Graduation Date - Editable */}
        <div className="space-y-2">
          <Label htmlFor="expectedGraduationDate">Expected Graduation Date</Label>
          <Input
            id="expectedGraduationDate"
            type="date"
            value={expectedGradDate}
            onChange={(e) => setExpectedGradDate(e.target.value)}
            onBlur={handleBlur}
          />
          <p className="text-xs text-gray-500">When you expect to complete your program</p>
        </div>

        {/* Actual Graduation Date - Readonly */}
        {data.actualGraduationDate && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label>Actual Graduation Date</Label>
              <Badge variant="secondary" className="text-xs">Readonly</Badge>
            </div>
            <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded border">
              {new Date(data.actualGraduationDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>
        )}

        {/* Transfer Credits - Readonly */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label>Transfer Credits</Label>
            <Badge variant="secondary" className="text-xs">Readonly</Badge>
          </div>
          <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded border">
            {data.transferCredits !== undefined ? `${data.transferCredits} credits` : 'None'}
          </div>
        </div>
      </div>
    </CollapsibleSection>
  );
}
