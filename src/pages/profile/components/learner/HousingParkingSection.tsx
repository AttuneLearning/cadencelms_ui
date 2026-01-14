/**
 * Housing & Parking Section (Learner - Section 2.7)
 * Housing status with conditional room/building fields
 * Parking permit tracking
 */

import React, { useState, useEffect } from 'react';
import { CollapsibleSection } from '../shared/CollapsibleSection';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Badge } from '@/shared/ui/badge';
import { Switch } from '@/shared/ui/switch';
import { useUpdateLearnerExtended } from '@/entities/user-profile/model/useUserProfile';
import type { HousingStatus } from '@/entities/user-profile/model/types';
import { CheckCircle2, Loader2, Home, Car } from 'lucide-react';

interface HousingParkingSectionProps {
  data: {
    housingStatus?: HousingStatus;
    buildingName?: string;
    roomNumber?: string;
    hasParkingPermit?: boolean;
    parkingLotAssignment?: string;
    parkingPermitNumber?: string;
    vehicleMake?: string;
    vehicleModel?: string;
    vehicleLicensePlate?: string;
  };
}

const housingStatusOptions: { value: HousingStatus; label: string }[] = [
  { value: 'on-campus', label: 'On-Campus Housing' },
  { value: 'off-campus', label: 'Off-Campus Housing' },
  { value: 'commuter', label: 'Commuter' },
  { value: 'none', label: 'No Housing Needed' },
];

export function HousingParkingSection({ data }: HousingParkingSectionProps) {
  const [localData, setLocalData] = useState(data);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const updateMutation = useUpdateLearnerExtended();

  useEffect(() => {
    setLocalData(data);
  }, [data]);

  const handleBlur = async (field: keyof typeof localData, value: any) => {
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

  const handleHousingStatusChange = async (value: HousingStatus) => {
    const updates: Partial<HousingParkingSectionProps['data']> = {
      housingStatus: value,
    };

    // Clear on-campus fields if not on-campus
    if (value !== 'on-campus') {
      updates.buildingName = undefined;
      updates.roomNumber = undefined;
    }

    setLocalData({ ...localData, ...updates });

    setSaveStatus('saving');
    try {
      await updateMutation.mutateAsync(updates);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('idle');
      console.error('Failed to save:', error);
    }
  };

  const handleParkingToggle = async (checked: boolean) => {
    const updates: Partial<HousingParkingSectionProps['data']> = {
      hasParkingPermit: checked,
    };

    // Clear parking fields if toggled off
    if (!checked) {
      updates.parkingLotAssignment = undefined;
      updates.parkingPermitNumber = undefined;
      updates.vehicleMake = undefined;
      updates.vehicleModel = undefined;
      updates.vehicleLicensePlate = undefined;
    }

    setLocalData({ ...localData, ...updates });

    setSaveStatus('saving');
    try {
      await updateMutation.mutateAsync(updates);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('idle');
      console.error('Failed to save:', error);
    }
  };

  const showOnCampusFields = localData.housingStatus === 'on-campus';
  const showParkingFields = localData.hasParkingPermit;

  return (
    <CollapsibleSection title="Housing & Parking" defaultExpanded={false}>
      <div className="space-y-6">
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

        {/* Housing Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Home className="h-5 w-5 text-gray-400" />
            <h4 className="font-semibold text-gray-900">Housing Information</h4>
          </div>

          <div className="space-y-2">
            <Label htmlFor="housingStatus">Housing Status</Label>
            <Select
              value={localData.housingStatus || 'none'}
              onValueChange={(value) => handleHousingStatusChange(value as HousingStatus)}
            >
              <SelectTrigger id="housingStatus">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {housingStatusOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Conditional On-Campus Fields */}
          {showOnCampusFields && (
            <div className="pl-6 border-l-2 border-blue-200 space-y-3">
              <Badge variant="outline" className="mb-2">On-Campus Details</Badge>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="buildingName">Building Name</Label>
                  <Input
                    id="buildingName"
                    value={localData.buildingName || ''}
                    onChange={(e) => setLocalData({ ...localData, buildingName: e.target.value })}
                    onBlur={(e) => handleBlur('buildingName', e.target.value)}
                    placeholder="e.g., North Hall"
                    maxLength={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="roomNumber">Room Number</Label>
                  <Input
                    id="roomNumber"
                    value={localData.roomNumber || ''}
                    onChange={(e) => setLocalData({ ...localData, roomNumber: e.target.value })}
                    onBlur={(e) => handleBlur('roomNumber', e.target.value)}
                    placeholder="e.g., 312B"
                    maxLength={20}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Parking Section */}
        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <Car className="h-5 w-5 text-gray-400" />
            <h4 className="font-semibold text-gray-900">Parking Information</h4>
          </div>

          <div className="flex items-center space-x-3">
            <Switch
              id="hasParkingPermit"
              checked={localData.hasParkingPermit || false}
              onCheckedChange={handleParkingToggle}
            />
            <div>
              <Label htmlFor="hasParkingPermit" className="cursor-pointer">
                I have a parking permit
              </Label>
              <p className="text-xs text-gray-500 mt-1">
                Toggle on if you need to register vehicle and parking information
              </p>
            </div>
          </div>

          {/* Conditional Parking Fields */}
          {showParkingFields && (
            <div className="pl-6 border-l-2 border-green-200 space-y-3">
              <Badge variant="outline" className="mb-2 bg-green-50">Parking Details</Badge>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="parkingPermitNumber">Permit Number</Label>
                  <Input
                    id="parkingPermitNumber"
                    value={localData.parkingPermitNumber || ''}
                    onChange={(e) => setLocalData({ ...localData, parkingPermitNumber: e.target.value })}
                    onBlur={(e) => handleBlur('parkingPermitNumber', e.target.value)}
                    placeholder="e.g., PKG-2024-1234"
                    maxLength={50}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parkingLotAssignment">Lot Assignment</Label>
                  <Input
                    id="parkingLotAssignment"
                    value={localData.parkingLotAssignment || ''}
                    onChange={(e) => setLocalData({ ...localData, parkingLotAssignment: e.target.value })}
                    onBlur={(e) => handleBlur('parkingLotAssignment', e.target.value)}
                    placeholder="e.g., Lot A, West Parking"
                    maxLength={50}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">Vehicle Information</Label>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="vehicleMake">Make</Label>
                  <Input
                    id="vehicleMake"
                    value={localData.vehicleMake || ''}
                    onChange={(e) => setLocalData({ ...localData, vehicleMake: e.target.value })}
                    onBlur={(e) => handleBlur('vehicleMake', e.target.value)}
                    placeholder="e.g., Toyota"
                    maxLength={50}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicleModel">Model</Label>
                  <Input
                    id="vehicleModel"
                    value={localData.vehicleModel || ''}
                    onChange={(e) => setLocalData({ ...localData, vehicleModel: e.target.value })}
                    onBlur={(e) => handleBlur('vehicleModel', e.target.value)}
                    placeholder="e.g., Camry"
                    maxLength={50}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicleLicensePlate">License Plate</Label>
                  <Input
                    id="vehicleLicensePlate"
                    value={localData.vehicleLicensePlate || ''}
                    onChange={(e) => setLocalData({ ...localData, vehicleLicensePlate: e.target.value })}
                    onBlur={(e) => handleBlur('vehicleLicensePlate', e.target.value)}
                    placeholder="e.g., ABC1234"
                    maxLength={20}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </CollapsibleSection>
  );
}
