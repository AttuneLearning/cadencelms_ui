/**
 * Report Preview Component
 * Shows a preview of the report structure with sample data
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { CustomReportDefinition } from '@/shared/types/report-builder';

interface ReportPreviewProps {
  definition: CustomReportDefinition;
  className?: string;
}

// Generate sample data based on definition
function generateSampleData(definition: CustomReportDefinition): Array<Record<string, any>> {
  if (definition.dimensions.length === 0 || definition.measures.length === 0) {
    return [];
  }

  const samples = [
    { learner: 'John Doe', course: 'Introduction to React', department: 'Engineering', count: 45, average: 85.5, completionRate: '95%' },
    { learner: 'Jane Smith', course: 'Advanced TypeScript', department: 'Engineering', count: 38, average: 92.3, completionRate: '88%' },
    { learner: 'Bob Johnson', course: 'Data Structures', department: 'Computer Science', count: 52, average: 78.9, completionRate: '92%' },
    { learner: 'Alice Williams', course: 'Web Development', department: 'Design', count: 41, average: 88.7, completionRate: '90%' },
  ];

  return samples.slice(0, 4);
}

export const ReportPreview: React.FC<ReportPreviewProps> = ({ definition, className }) => {
  const sampleData = generateSampleData(definition);
  const hasData = sampleData.length > 0;

  // Build column headers from dimensions and measures
  const columns = [
    ...definition.dimensions.map((dim) => ({
      key: dim.type,
      label: dim.label || dim.type.replace('-', ' '),
      type: 'dimension' as const,
    })),
    ...definition.measures.map((measure) => ({
      key: measure.type,
      label: measure.label || measure.type.replace('-', ' '),
      type: 'measure' as const,
    })),
  ];

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Report Preview</CardTitle>
            <CardDescription>Sample preview of your report structure</CardDescription>
          </div>
          {hasData && (
            <Badge variant="outline" className="text-xs">
              Sample Data
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {!hasData ? (
          <div className="flex items-center gap-3 p-6 rounded-lg border border-border bg-muted/50">
            <AlertCircle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">No Preview Available</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Add at least one dimension and one measure to see a preview
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((col) => (
                    <TableHead key={col.key} className="font-semibold capitalize">
                      {col.label}
                      <Badge variant="outline" className="ml-2 text-xs">
                        {col.type}
                      </Badge>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sampleData.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {columns.map((col) => (
                      <TableCell key={col.key}>
                        {row[col.key] !== undefined ? String(row[col.key]) : '-'}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="p-3 bg-muted/30 border-t border-border">
              <p className="text-xs text-muted-foreground text-center">
                This is sample data. Actual report will contain real data from your system.
              </p>
            </div>
          </div>
        )}

        {/* Filter Summary */}
        {definition.filters && definition.filters.length > 0 && (
          <div className="mt-4 p-3 rounded-lg border border-border bg-card">
            <p className="text-sm font-semibold mb-2">Active Filters</p>
            <div className="flex flex-wrap gap-2">
              {definition.filters.map((filter, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {filter.field} {filter.operator} {Array.isArray(filter.value) ? filter.value.join(', ') : filter.value}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
