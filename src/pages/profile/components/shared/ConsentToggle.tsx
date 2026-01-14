/**
 * ConsentToggle Component
 * Toggle with explanation text for consent fields
 */

import React from 'react';
import { Switch } from '@/shared/ui/switch';
import { Label } from '@/shared/ui/label';

interface ConsentToggleProps {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function ConsentToggle({
  id,
  label,
  description,
  checked,
  onCheckedChange,
  disabled = false,
}: ConsentToggleProps) {
  return (
    <div className="flex items-start space-x-3 p-4 border rounded-lg bg-gray-50">
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className="mt-1"
      />
      <div className="flex-1">
        <Label
          htmlFor={id}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
        >
          {label}
        </Label>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>
    </div>
  );
}
