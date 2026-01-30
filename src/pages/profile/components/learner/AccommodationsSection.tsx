/**
 * Accommodations Section (Learner - Section 2.6)
 * Special access pattern: Learners VIEW + REQUEST only
 * Per ISS-010 clarification Q3: Dept-Admins have full CRUD, learners can view and request
 */

import React, { useState } from 'react';
import { CollapsibleSection } from '../shared/CollapsibleSection';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Textarea } from '@/shared/ui/textarea';
import { Label } from '@/shared/ui/label';
import type { IAccommodation, DisabilityType } from '@/entities/user-profile/model/types';
import { Info, Plus, FileText, Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';

interface AccommodationsSectionProps {
  data: {
    accommodations?: IAccommodation[];
  };
}

const disabilityTypeLabels: Record<DisabilityType, string> = {
  'learning': 'Learning Disability',
  'physical': 'Physical Disability',
  'visual': 'Visual Impairment',
  'hearing': 'Hearing Impairment',
  'psychiatric': 'Psychiatric/Mental Health',
  'mental-health': 'Mental Health',
  'chronic-illness': 'Chronic Illness',
  'other': 'Other',
};

const statusColors = {
  'active': 'bg-green-500',
  'pending': 'bg-yellow-500',
  'expired': 'bg-gray-500',
  'denied': 'bg-red-500',
};

const statusIcons = {
  'active': CheckCircle,
  'pending': Clock,
  'expired': Calendar,
  'denied': XCircle,
};

export function AccommodationsSection({ data }: AccommodationsSectionProps) {
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestText, setRequestText] = useState('');
  const accommodations = data.accommodations || [];

  const handleSubmitRequest = () => {
    // TODO: Implement actual request submission to API
    console.log('Accommodation request submitted:', requestText);
    setRequestText('');
    setShowRequestForm(false);
    // In real implementation, would call API endpoint to create request
    // that goes to Dept-Admin for approval
  };

  return (
    <CollapsibleSection
      title="Accommodations"
      badge={accommodations.length > 0 && <Badge>{accommodations.length}</Badge>}
      defaultExpanded={false}
    >
      <div className="space-y-4">
        <Alert className="border-blue-200 bg-blue-50/50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-sm text-blue-800">
            Accommodations are managed by the Disability Services office. You can view your current accommodations
            and request new ones. All requests require approval from a Department Administrator.
          </AlertDescription>
        </Alert>

        {/* Existing Accommodations - VIEW ONLY */}
        {accommodations.length > 0 ? (
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Current Accommodations</h4>
            {accommodations.map((acc, index) => {
              const statusKey =
                (acc.status as keyof typeof statusIcons | undefined) || 'pending';
              const StatusIcon = statusIcons[statusKey] || Clock;
              return (
                <div key={index} className="border rounded-lg p-4 space-y-3 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <Badge variant="outline">
                        {acc.disabilityType
                          ? disabilityTypeLabels[acc.disabilityType]
                          : 'Unknown'}
                      </Badge>
                      <Badge className={statusColors[statusKey] || statusColors.pending}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusKey.charAt(0).toUpperCase() + statusKey.slice(1)}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="font-semibold text-gray-900">
                      {acc.accommodationType}
                    </div>
                    {acc.description && (
                      <div className="text-sm text-gray-600">
                        {acc.description}
                      </div>
                    )}
                    {acc.approvedBy && (
                      <div className="text-xs text-gray-500">
                        Approved by: {acc.approvedBy}
                      </div>
                    )}
                    <div className="flex gap-4 text-xs text-gray-500">
                      {acc.startDate && (
                        <div>
                          Start: {new Date(acc.startDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                      )}
                      {acc.endDate && (
                        <div>
                          End: {new Date(acc.endDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                      )}
                    </div>
                    {statusKey === 'expired' && (
                      <Alert className="border-amber-200 bg-amber-50/50 mt-2">
                        <Calendar className="h-4 w-4 text-amber-600" />
                        <AlertDescription className="text-sm text-amber-800">
                          This accommodation has expired. Please contact Disability Services to renew.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No accommodations on file</p>
          </div>
        )}

        {/* Request New Accommodation Form */}
        {!showRequestForm ? (
          <Button
            variant="outline"
            onClick={() => setShowRequestForm(true)}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Request New Accommodation
          </Button>
        ) : (
          <div className="border rounded-lg p-4 space-y-3 bg-blue-50/30">
            <h4 className="font-semibold text-gray-900">New Accommodation Request</h4>
            <div className="space-y-2">
              <Label htmlFor="request-text">
                Describe the accommodation you are requesting *
              </Label>
              <Textarea
                id="request-text"
                value={requestText}
                onChange={(e) => setRequestText(e.target.value)}
                placeholder="Please describe the accommodation you need and any relevant medical documentation you can provide. A Department Administrator will review your request."
                rows={5}
                maxLength={2000}
              />
              <p className="text-xs text-gray-500">
                Your request will be reviewed by Disability Services. You may be contacted for additional documentation.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSubmitRequest}
                disabled={!requestText.trim()}
              >
                Submit Request
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowRequestForm(false);
                  setRequestText('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        <Alert className="border-gray-200 bg-gray-50">
          <Info className="h-4 w-4 text-gray-600" />
          <AlertDescription className="text-sm text-gray-600">
            For questions about accommodations, contact Disability Services at disability@institution.edu
            or call (555) 123-4567.
          </AlertDescription>
        </Alert>
      </div>
    </CollapsibleSection>
  );
}
