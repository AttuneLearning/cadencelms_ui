/**
 * Field Palette Component
 * Draggable list of available dimensions and measures for building reports
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import {
  Users,
  BookOpen,
  Building2,
  GraduationCap,
  UserCheck,
  Calendar,
  CheckCircle,
  Hash,
  Plus,
  Minus,
  TrendingUp,
  Clock,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface FieldItem {
  id: string;
  label: string;
  type: 'dimension' | 'measure';
  category: string;
  icon: React.ElementType;
  description?: string;
}

const AVAILABLE_DIMENSIONS: FieldItem[] = [
  {
    id: 'learner',
    label: 'Learner',
    type: 'dimension',
    category: 'People',
    icon: Users,
    description: 'Group by individual learners',
  },
  {
    id: 'course',
    label: 'Course',
    type: 'dimension',
    category: 'Content',
    icon: BookOpen,
    description: 'Group by courses',
  },
  {
    id: 'class',
    label: 'Class',
    type: 'dimension',
    category: 'Content',
    icon: GraduationCap,
    description: 'Group by class instances',
  },
  {
    id: 'department',
    label: 'Department',
    type: 'dimension',
    category: 'Organization',
    icon: Building2,
    description: 'Group by departments',
  },
  {
    id: 'program',
    label: 'Program',
    type: 'dimension',
    category: 'Organization',
    icon: GraduationCap,
    description: 'Group by programs',
  },
  {
    id: 'instructor',
    label: 'Instructor',
    type: 'dimension',
    category: 'People',
    icon: UserCheck,
    description: 'Group by instructors',
  },
  {
    id: 'date',
    label: 'Date',
    type: 'dimension',
    category: 'Time',
    icon: Calendar,
    description: 'Group by date ranges',
  },
  {
    id: 'completion-status',
    label: 'Completion Status',
    type: 'dimension',
    category: 'Progress',
    icon: CheckCircle,
    description: 'Group by completion status',
  },
];

const AVAILABLE_MEASURES: FieldItem[] = [
  {
    id: 'count',
    label: 'Count',
    type: 'measure',
    category: 'Basic',
    icon: Hash,
    description: 'Count of records',
  },
  {
    id: 'sum',
    label: 'Sum',
    type: 'measure',
    category: 'Basic',
    icon: Plus,
    description: 'Sum of values',
  },
  {
    id: 'average',
    label: 'Average',
    type: 'measure',
    category: 'Basic',
    icon: Minus,
    description: 'Average of values',
  },
  {
    id: 'min',
    label: 'Minimum',
    type: 'measure',
    category: 'Basic',
    icon: TrendingUp,
    description: 'Minimum value',
  },
  {
    id: 'max',
    label: 'Maximum',
    type: 'measure',
    category: 'Basic',
    icon: TrendingUp,
    description: 'Maximum value',
  },
  {
    id: 'completion-rate',
    label: 'Completion Rate',
    type: 'measure',
    category: 'Progress',
    icon: BarChart3,
    description: 'Percentage of completions',
  },
  {
    id: 'time-spent',
    label: 'Time Spent',
    type: 'measure',
    category: 'Progress',
    icon: Clock,
    description: 'Total time spent',
  },
];

interface FieldPaletteProps {
  onFieldSelect?: (field: FieldItem) => void;
  className?: string;
}

export const FieldPalette: React.FC<FieldPaletteProps> = ({ onFieldSelect, className }) => {
  const [selectedTab, setSelectedTab] = React.useState<'dimensions' | 'measures'>('dimensions');

  const handleFieldClick = (field: FieldItem) => {
    onFieldSelect?.(field);
  };

  const fields = selectedTab === 'dimensions' ? AVAILABLE_DIMENSIONS : AVAILABLE_MEASURES;

  // Group fields by category
  const fieldsByCategory = fields.reduce((acc, field) => {
    if (!acc[field.category]) {
      acc[field.category] = [];
    }
    acc[field.category].push(field);
    return acc;
  }, {} as Record<string, FieldItem[]>);

  return (
    <Card className={cn('h-full', className)}>
      <CardHeader>
        <CardTitle>Field Palette</CardTitle>
        <CardDescription>Click to add fields to your report</CardDescription>

        {/* Tab Selector */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setSelectedTab('dimensions')}
            className={cn(
              'flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              selectedTab === 'dimensions'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            )}
          >
            Dimensions
          </button>
          <button
            onClick={() => setSelectedTab('measures')}
            className={cn(
              'flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              selectedTab === 'measures'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            )}
          >
            Measures
          </button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
        {Object.entries(fieldsByCategory).map(([category, categoryFields]) => (
          <div key={category}>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">{category}</h3>
            <div className="space-y-2">
              {categoryFields.map((field) => {
                const Icon = field.icon;
                return (
                  <button
                    key={field.id}
                    onClick={() => handleFieldClick(field)}
                    className={cn(
                      'w-full flex items-start gap-3 p-3 rounded-lg border border-border',
                      'bg-card hover:bg-accent hover:border-accent-foreground/20',
                      'transition-colors cursor-pointer text-left'
                    )}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('application/json', JSON.stringify(field));
                      e.dataTransfer.effectAllowed = 'copy';
                    }}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{field.label}</p>
                        <Badge variant="outline" className="text-xs">
                          {field.type}
                        </Badge>
                      </div>
                      {field.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">{field.description}</p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

// Export field data for use in other components
export { AVAILABLE_DIMENSIONS, AVAILABLE_MEASURES };
export type { FieldItem };
