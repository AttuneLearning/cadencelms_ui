import * as React from 'react';
import { X } from 'lucide-react';

import { cn } from '@/shared/lib/utils/cn';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Input, type InputProps } from '@/shared/ui/input';

type SeparatorKey = 'Enter' | ',';

export interface TagInputProps extends Omit<InputProps, 'value' | 'onChange'> {
  value: string[];
  onChange: (tags: string[]) => void;
  addButton?: boolean;
  addButtonLabel?: string;
  allowDuplicates?: boolean;
  caseSensitive?: boolean;
  maxTags?: number;
  maxTagLength?: number;
  separators?: SeparatorKey[];
  tagsClassName?: string;
}

function normalizeTag(tag: string, caseSensitive: boolean) {
  const trimmed = tag.trim();
  return caseSensitive ? trimmed : trimmed.toLowerCase();
}

export function TagInput({
  value,
  onChange,
  addButton = false,
  addButtonLabel = 'Add',
  allowDuplicates = false,
  caseSensitive = false,
  maxTags,
  maxTagLength,
  separators = ['Enter', ','],
  className,
  tagsClassName,
  disabled,
  ...inputProps
}: TagInputProps) {
  const [inputValue, setInputValue] = React.useState('');

  const canAddMore = maxTags === undefined || value.length < maxTags;

  const buildNextTags = React.useCallback(
    (rawTag: string, currentTags: string[]) => {
      if (disabled) return currentTags;
      if (maxTags !== undefined && currentTags.length >= maxTags) return currentTags;

      const normalized = normalizeTag(rawTag, caseSensitive);
      if (!normalized) return currentTags;
      if (maxTagLength && normalized.length > maxTagLength) return currentTags;

      const alreadyExists = currentTags.some(
        (existing) => normalizeTag(existing, caseSensitive) === normalized
      );
      if (!allowDuplicates && alreadyExists) return currentTags;

      return [...currentTags, normalized];
    },
    [allowDuplicates, caseSensitive, disabled, maxTagLength, maxTags]
  );

  const addTag = React.useCallback(
    (rawTag: string) => {
      if (disabled || !canAddMore) return;
      const nextTags = buildNextTags(rawTag, value);
      if (nextTags.length === value.length) return;
      onChange(nextTags);
      setInputValue('');
    },
    [
      buildNextTags,
      canAddMore,
      disabled,
      onChange,
      value,
    ]
  );

  const removeTag = React.useCallback(
    (tagToRemove: string) => {
      if (disabled) return;
      onChange(value.filter((tag) => tag !== tagToRemove));
    },
    [disabled, onChange, value]
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (separators.includes(event.key as SeparatorKey)) {
      event.preventDefault();
      if (inputValue) addTag(inputValue);
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    const pasted = event.clipboardData.getData('text');
    if (!pasted.includes(',')) return;

    event.preventDefault();
    const nextTags = pasted
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean)
      .reduce((tags, part) => buildNextTags(part, tags), value);

    if (nextTags.length !== value.length) {
      onChange(nextTags);
      setInputValue('');
    }
  };

  const handleAddClick = () => addTag(inputValue);

  const inputDisabled = disabled || !canAddMore;

  return (
    <div className={cn('space-y-2', className)}>
      <div className={cn('flex gap-2', !addButton && 'gap-0')}>
        <Input
          {...inputProps}
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          disabled={inputDisabled}
        />
        {addButton && (
          <Button
            type="button"
            variant="outline"
            onClick={handleAddClick}
            disabled={inputDisabled || !inputValue.trim()}
          >
            {addButtonLabel}
          </Button>
        )}
      </div>

      {value.length > 0 && (
        <div className={cn('flex flex-wrap gap-2', tagsClassName)}>
          {value.map((tag, index) => (
            <Badge key={`${tag}-${index}`} variant="secondary" className="gap-1">
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-1 hover:text-destructive disabled:opacity-50"
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
