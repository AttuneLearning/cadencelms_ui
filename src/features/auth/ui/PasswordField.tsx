/**
 * PasswordField Component - Phase 6
 * Version: 2.0.0
 * Date: 2026-01-13
 *
 * Password input with show/hide toggle, strength indicator, and requirements checklist
 */

import React, { useState } from 'react';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Button } from '@/shared/ui/button';
import { validatePasswordStrength } from '../api/passwordApi';

export interface PasswordFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  showStrength?: boolean;
  showRequirements?: boolean;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
}

/**
 * Password input field with visibility toggle and strength validation
 */
export const PasswordField: React.FC<PasswordFieldProps> = ({
  id,
  label,
  value,
  onChange,
  onBlur,
  showStrength = false,
  showRequirements = false,
  error,
  disabled = false,
  placeholder = 'Enter password',
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const validation = validatePasswordStrength(value);

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'strong':
        return 'bg-green-500';
      case 'good':
        return 'bg-blue-500';
      case 'fair':
        return 'bg-yellow-500';
      case 'weak':
        return 'bg-red-500';
      default:
        return 'bg-gray-300';
    }
  };

  const getStrengthLabel = (strength: string) => {
    switch (strength) {
      case 'strong':
        return 'Strong';
      case 'good':
        return 'Good';
      case 'fair':
        return 'Fair';
      case 'weak':
        return 'Weak';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>

      <div className="relative">
        <Input
          id={id}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={placeholder}
          className={error ? 'border-red-500' : ''}
        />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
          onClick={() => setShowPassword(!showPassword)}
          disabled={disabled}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 text-gray-500" />
          ) : (
            <Eye className="h-4 w-4 text-gray-500" />
          )}
        </Button>
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {/* Password Strength Indicator */}
      {showStrength && value && (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${getStrengthColor(validation.strength)}`}
                style={{
                  width: `${
                    validation.strength === 'strong'
                      ? '100%'
                      : validation.strength === 'good'
                      ? '75%'
                      : validation.strength === 'fair'
                      ? '50%'
                      : '25%'
                  }`,
                }}
              />
            </div>
            <span className="text-sm font-medium">
              {getStrengthLabel(validation.strength)}
            </span>
          </div>
        </div>
      )}

      {/* Password Requirements Checklist */}
      {showRequirements && value && (
        <div className="space-y-1 text-sm">
          <p className="font-medium text-gray-700">Password must have:</p>
          <ul className="space-y-1">
            <li className="flex items-center gap-2">
              {validation.requirements.minLength ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <X className="h-4 w-4 text-red-500" />
              )}
              <span className={validation.requirements.minLength ? 'text-green-700' : 'text-gray-600'}>
                At least 8 characters
              </span>
            </li>
            <li className="flex items-center gap-2">
              {validation.requirements.hasUppercase ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <X className="h-4 w-4 text-red-500" />
              )}
              <span className={validation.requirements.hasUppercase ? 'text-green-700' : 'text-gray-600'}>
                One uppercase letter (A-Z)
              </span>
            </li>
            <li className="flex items-center gap-2">
              {validation.requirements.hasLowercase ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <X className="h-4 w-4 text-red-500" />
              )}
              <span className={validation.requirements.hasLowercase ? 'text-green-700' : 'text-gray-600'}>
                One lowercase letter (a-z)
              </span>
            </li>
            <li className="flex items-center gap-2">
              {validation.requirements.hasNumber ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <X className="h-4 w-4 text-red-500" />
              )}
              <span className={validation.requirements.hasNumber ? 'text-green-700' : 'text-gray-600'}>
                One number (0-9)
              </span>
            </li>
            <li className="flex items-center gap-2">
              {validation.requirements.hasSpecialChar ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <X className="h-4 w-4 text-red-500" />
              )}
              <span className={validation.requirements.hasSpecialChar ? 'text-green-700' : 'text-gray-600'}>
                One special character (!@#$%^&*...)
              </span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};
