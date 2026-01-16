/**
 * Filter Row Component
 * Single filter row with field, operator, and value inputs
 */

import React from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { X } from 'lucide-react';
import type { ReportFilter, FilterOperator } from '@/shared/types/report-builder';

interface FilterRowProps {
  filter: ReportFilter;
  onUpdate: (filter: ReportFilter) => void;
  onRemove: () => void;
}

const FILTER_OPERATORS: Array<{ value: FilterOperator; label: string }> = [
  { value: 'eq', label: 'Equals' },
  { value: 'ne', label: 'Not equals' },
  { value: 'gt', label: 'Greater than' },
  { value: 'gte', label: 'Greater than or equal' },
  { value: 'lt', label: 'Less than' },
  { value: 'lte', label: 'Less than or equal' },
  { value: 'contains', label: 'Contains' },
  { value: 'startsWith', label: 'Starts with' },
  { value: 'endsWith', label: 'Ends with' },
  { value: 'in', label: 'In list' },
  { value: 'notIn', label: 'Not in list' },
];

const FILTER_FIELDS: Array<{ value: string; label: string; type: 'string' | 'number' | 'boolean' }> = [
  { value: 'learnerId', label: 'Learner ID', type: 'string' },
  { value: 'learnerName', label: 'Learner Name', type: 'string' },
  { value: 'courseId', label: 'Course ID', type: 'string' },
  { value: 'courseName', label: 'Course Name', type: 'string' },
  { value: 'departmentId', label: 'Department ID', type: 'string' },
  { value: 'departmentName', label: 'Department Name', type: 'string' },
  { value: 'completionStatus', label: 'Completion Status', type: 'string' },
  { value: 'score', label: 'Score', type: 'number' },
  { value: 'progress', label: 'Progress', type: 'number' },
  { value: 'isActive', label: 'Is Active', type: 'boolean' },
];

export const FilterRow: React.FC<FilterRowProps> = ({ filter, onUpdate, onRemove }) => {
  const handleFieldChange = (field: string) => {
    onUpdate({
      ...filter,
      field,
      // Reset value when field changes
      value: '',
    });
  };

  const handleOperatorChange = (operator: FilterOperator) => {
    onUpdate({
      ...filter,
      operator,
    });
  };

  const handleValueChange = (value: string) => {
    // Parse value based on operator
    if (filter.operator === 'in' || filter.operator === 'notIn') {
      // Split comma-separated values
      const arrayValue = value.split(',').map((v) => v.trim()).filter(Boolean);
      onUpdate({
        ...filter,
        value: arrayValue,
      });
    } else {
      onUpdate({
        ...filter,
        value,
      });
    }
  };

  const selectedField = FILTER_FIELDS.find((f) => f.value === filter.field);
  const displayValue = Array.isArray(filter.value) ? filter.value.join(', ') : String(filter.value);

  return (
    <div className="flex items-center gap-2">
      {/* Field Select */}
      <div className="flex-1">
        <Select value={filter.field} onValueChange={handleFieldChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select field" />
          </SelectTrigger>
          <SelectContent>
            {FILTER_FIELDS.map((field) => (
              <SelectItem key={field.value} value={field.value}>
                {field.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Operator Select */}
      <div className="flex-1">
        <Select value={filter.operator} onValueChange={handleOperatorChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select operator" />
          </SelectTrigger>
          <SelectContent>
            {FILTER_OPERATORS.map((op) => (
              <SelectItem key={op.value} value={op.value}>
                {op.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Value Input */}
      <div className="flex-1">
        <Input
          type={selectedField?.type === 'number' ? 'number' : 'text'}
          value={displayValue}
          onChange={(e) => handleValueChange(e.target.value)}
          placeholder={
            filter.operator === 'in' || filter.operator === 'notIn'
              ? 'value1, value2, value3'
              : 'Enter value'
          }
        />
      </div>

      {/* Remove Button */}
      <Button variant="ghost" size="sm" onClick={onRemove} className="flex-shrink-0">
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};
