/**
 * Office Hours Section (Staff - Section 1.4)
 * Array field with weekly schedule display
 */

import { useState } from 'react';
import { CollapsibleSection } from '../shared/CollapsibleSection';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Button } from '@/shared/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Textarea } from '@/shared/ui/textarea';
import { Badge } from '@/shared/ui/badge';
import { Checkbox } from '@/shared/ui/checkbox';
import { useUpdateStaffExtended } from '@/entities/user-profile/model/useUserProfile';
import type { IOfficeHours, DayOfWeek } from '@/entities/user-profile/model/types';
import { Plus, Trash2, CheckCircle2, Loader2, Clock } from 'lucide-react';

interface OfficeHoursSectionProps {
  data: {
    officeHours?: IOfficeHours[];
  };
}

const dayOptions: { value: DayOfWeek; label: string }[] = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
];

export function OfficeHoursSection({ data }: OfficeHoursSectionProps) {
  const [officeHours, setOfficeHours] = useState<IOfficeHours[]>(data.officeHours || []);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const updateMutation = useUpdateStaffExtended();

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      await updateMutation.mutateAsync({ officeHours });
      setSaveStatus('saved');
      setEditingIndex(null);
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('idle');
      console.error('Failed to save:', error);
    }
  };

  const handleAdd = () => {
    const newHours: IOfficeHours = {
      dayOfWeek: 'monday',
      startTime: '09:00',
      endTime: '10:00',
    };
    setOfficeHours([...officeHours, newHours]);
    setEditingIndex(officeHours.length);
  };

  const handleRemove = (index: number) => {
    setOfficeHours(officeHours.filter((_, i) => i !== index));
  };

  const handleUpdate = (index: number, field: keyof IOfficeHours, value: any) => {
    const updated = [...officeHours];
    updated[index] = { ...updated[index], [field]: value };
    setOfficeHours(updated);
  };

  const isValid = (hours: IOfficeHours) => {
    return hours.dayOfWeek && hours.startTime && hours.endTime;
  };

  return (
    <CollapsibleSection
      title="Office Hours"
      badge={officeHours.length > 0 && <Badge>{officeHours.length}</Badge>}
      defaultExpanded={false}
    >
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

        <div className="space-y-3">
          {officeHours.map((hours, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <Badge variant="outline">
                    {dayOptions.find((d) => d.value === hours.dayOfWeek)?.label}
                  </Badge>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleRemove(index)}>
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>

              {editingIndex === index ? (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>Day of Week *</Label>
                    <Select
                      value={hours.dayOfWeek}
                      onValueChange={(value) => handleUpdate(index, 'dayOfWeek', value as DayOfWeek)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {dayOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Start Time *</Label>
                      <Input
                        type="time"
                        value={hours.startTime}
                        onChange={(e) => handleUpdate(index, 'startTime', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End Time *</Label>
                      <Input
                        type="time"
                        value={hours.endTime}
                        onChange={(e) => handleUpdate(index, 'endTime', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input
                      value={hours.location || ''}
                      onChange={(e) => handleUpdate(index, 'location', e.target.value)}
                      placeholder="e.g., My Office, Building A Room 205"
                      maxLength={100}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`appointment-${index}`}
                      checked={hours.appointmentRequired || false}
                      onCheckedChange={(checked) => handleUpdate(index, 'appointmentRequired', checked)}
                    />
                    <Label htmlFor={`appointment-${index}`} className="cursor-pointer">
                      Appointment Required
                    </Label>
                  </div>

                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea
                      value={hours.notes || ''}
                      onChange={(e) => handleUpdate(index, 'notes', e.target.value)}
                      placeholder="Additional information for students"
                      rows={2}
                      maxLength={500}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleSave} disabled={!isValid(hours)}>
                      Save
                    </Button>
                    <Button variant="outline" onClick={() => setEditingIndex(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="font-semibold">
                    {hours.startTime} - {hours.endTime}
                  </div>
                  {hours.location && <div className="text-sm text-gray-600">Location: {hours.location}</div>}
                  {hours.appointmentRequired && (
                    <Badge variant="secondary" className="text-xs">
                      Appointment Required
                    </Badge>
                  )}
                  {hours.notes && <p className="text-sm text-gray-600">{hours.notes}</p>}
                  <Button variant="outline" size="sm" onClick={() => setEditingIndex(index)}>
                    Edit
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>

        <Button variant="outline" onClick={handleAdd} className="w-full" disabled={editingIndex !== null}>
          <Plus className="h-4 w-4 mr-2" />
          Add Office Hours
        </Button>
      </div>
    </CollapsibleSection>
  );
}
