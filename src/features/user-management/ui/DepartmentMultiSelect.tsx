/**
 * Department Multi-Select Component
 * Searchable dropdown for selecting multiple departments with role assignment
 * 
 * Features:
 * - Search and add departments from dropdown
 * - Selected departments shown as expandable cards
 * - Click a department card to expand and show role checkboxes grid
 * - Supports primary department designation
 * - Separate role sets for staff vs learner memberships
 */

import React, { useState, useMemo } from 'react';
import { Check, ChevronsUpDown, X, Star, Building2, ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Checkbox } from '@/shared/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/ui/popover';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/shared/ui/collapsible';
import { Input } from '@/shared/ui/input';
import { useDepartments, type DepartmentListItem } from '@/entities/department';
import { STAFF_DEPARTMENT_ROLES, LEARNER_DEPARTMENT_ROLES, DEPARTMENT_ROLES } from '../model/validation';

export interface DepartmentSelection {
  departmentId: string;
  departmentName: string;
  isPrimary: boolean;
  roles: string[];
}

export type DepartmentRoleType = 'staff' | 'learner' | 'all';

interface DepartmentMultiSelectProps {
  value: DepartmentSelection[];
  onChange: (value: DepartmentSelection[]) => void;
  /** Which role set to show: 'staff' for staff roles, 'learner' for learner roles, 'all' for both */
  roleType?: DepartmentRoleType;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}

export const DepartmentMultiSelect: React.FC<DepartmentMultiSelectProps> = ({
  value,
  onChange,
  roleType = 'all',
  placeholder = 'Select departments...',
  disabled = false,
  error,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [expandedDepts, setExpandedDepts] = useState<Set<string>>(new Set());
  
  // Get the appropriate roles based on roleType
  const availableRoles = useMemo(() => {
    switch (roleType) {
      case 'staff':
        return STAFF_DEPARTMENT_ROLES;
      case 'learner':
        return LEARNER_DEPARTMENT_ROLES;
      default:
        return DEPARTMENT_ROLES;
    }
  }, [roleType]);
  
  // Fetch departments
  const { data: departmentsData, isLoading } = useDepartments({ limit: 100 });
  
  const departments = departmentsData?.departments ?? [];

  // Filter departments based on search
  const filteredDepartments = useMemo(() => {
    if (!search.trim()) return departments;
    const searchLower = search.toLowerCase();
    return departments.filter(
      (dept) =>
        dept.name.toLowerCase().includes(searchLower) ||
        dept.code.toLowerCase().includes(searchLower)
    );
  }, [departments, search]);

  // Track selected department IDs
  const selectedIds = useMemo(() => new Set(value.map((v) => v.departmentId)), [value]);

  const handleSelect = (department: DepartmentListItem) => {
    if (selectedIds.has(department.id)) {
      // Remove if already selected
      onChange(value.filter((v) => v.departmentId !== department.id));
      // Also remove from expanded
      setExpandedDepts(prev => {
        const next = new Set(prev);
        next.delete(department.id);
        return next;
      });
    } else {
      // Add with isPrimary = true if first selection
      const isPrimary = value.length === 0;
      onChange([
        ...value,
        {
          departmentId: department.id,
          departmentName: department.name,
          isPrimary,
          roles: [],
        },
      ]);
      // Expand to show roles
      setExpandedDepts(prev => new Set([...prev, department.id]));
    }
  };

  const handleRemove = (departmentId: string) => {
    const removed = value.find((v) => v.departmentId === departmentId);
    const newValue = value.filter((v) => v.departmentId !== departmentId);
    
    // If we removed the primary, set a new primary
    if (removed?.isPrimary && newValue.length > 0) {
      newValue[0].isPrimary = true;
    }
    
    onChange(newValue);
    // Remove from expanded
    setExpandedDepts(prev => {
      const next = new Set(prev);
      next.delete(departmentId);
      return next;
    });
  };

  const handleSetPrimary = (departmentId: string) => {
    onChange(
      value.map((v) => ({
        ...v,
        isPrimary: v.departmentId === departmentId,
      }))
    );
  };

  const handleRoleToggle = (departmentId: string, roleKey: string) => {
    onChange(
      value.map((v) => {
        if (v.departmentId !== departmentId) return v;
        const currentRoles = v.roles || [];
        const hasRole = currentRoles.includes(roleKey);
        return {
          ...v,
          roles: hasRole 
            ? currentRoles.filter(r => r !== roleKey)
            : [...currentRoles, roleKey],
        };
      })
    );
  };

  return (
    <div className="space-y-3">
      {/* Assigned Departments - Shown First */}
      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((dept) => {
            const isExpanded = expandedDepts.has(dept.departmentId);
            return (
              <Collapsible
                key={dept.departmentId}
                open={isExpanded}
                onOpenChange={(open) => {
                  setExpandedDepts(prev => {
                    const next = new Set(prev);
                    if (open) {
                      next.add(dept.departmentId);
                    } else {
                      next.delete(dept.departmentId);
                    }
                    return next;
                  });
                }}
              >
                <div
                  className={cn(
                    'rounded-lg border transition-colors',
                    dept.isPrimary ? 'bg-primary/5 border-primary/30' : 'bg-muted/30 border-border',
                    isExpanded && 'ring-1 ring-primary/20'
                  )}
                >
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-accent/50 rounded-t-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-muted">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{dept.departmentName}</span>
                            {dept.isPrimary && (
                              <Badge variant="default" className="text-xs">
                                Primary
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {dept.roles && dept.roles.length > 0 ? (
                              dept.roles.map((roleKey) => {
                                const roleInfo = availableRoles.find(r => r.key === roleKey);
                                return (
                                  <Badge key={roleKey} variant="secondary" className="text-xs">
                                    {roleInfo?.displayAs || roleKey}
                                  </Badge>
                                );
                              })
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                Click to assign roles
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {!dept.isPrimary && value.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSetPrimary(dept.departmentId);
                            }}
                            title="Set as primary"
                          >
                            <Star className="h-3 w-3 mr-1" />
                            Primary
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemove(dept.departmentId);
                          }}
                          title="Remove department"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <div className="px-3 pb-3 pt-1 border-t">
                      <div className="text-xs font-medium text-muted-foreground mb-2">
                        Department Roles:
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                        {availableRoles.map((role) => (
                          <div key={role.key} className="flex items-center space-x-2">
                            <Checkbox
                              id={`edit-${dept.departmentId}-${role.key}`}
                              checked={dept.roles?.includes(role.key) || false}
                              onCheckedChange={() => handleRoleToggle(dept.departmentId, role.key)}
                            />
                            <label
                              htmlFor={`edit-${dept.departmentId}-${role.key}`}
                              className="text-sm cursor-pointer select-none"
                            >
                              {role.displayAs}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            );
          })}
        </div>
      )}

      {/* Add Department Button/Dropdown */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              'w-full justify-start gap-2',
              error && 'border-destructive'
            )}
          >
            <Plus className="h-4 w-4" />
            {placeholder}
            <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[450px] p-0" align="start">
          <div className="p-2 border-b">
            <Input
              placeholder="Search departments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8"
            />
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-muted-foreground">
                Loading departments...
              </div>
            ) : filteredDepartments.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No departments found
              </div>
            ) : (
              filteredDepartments.map((department) => {
                const isSelected = selectedIds.has(department.id);
                
                return (
                  <div
                    key={department.id}
                    className={cn(
                      'flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-accent',
                      isSelected && 'bg-accent/50 opacity-60'
                    )}
                    onClick={() => !isSelected && handleSelect(department)}
                  >
                    <div className="flex items-center gap-2">
                      <Check
                        className={cn(
                          'h-4 w-4',
                          isSelected ? 'opacity-100 text-primary' : 'opacity-0'
                        )}
                      />
                      <div>
                        <div className="font-medium">{department.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {department.code}
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <Badge variant="secondary" className="text-xs">
                        Added
                      </Badge>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </PopoverContent>
      </Popover>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};
