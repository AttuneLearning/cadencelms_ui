/**
 * ProgressTable Component
 * A table displaying student progress with sorting and filtering
 */

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Progress } from '@/shared/ui/progress';
import { Badge } from '@/shared/ui/badge';
import { cn } from '@/shared/lib/utils';

export interface ProgressTableRow {
  id: string;
  name: string;
  email: string;
  course: string;
  progress: number;
  status: 'not-started' | 'in-progress' | 'completed';
  lastActivity?: string;
}

interface ProgressTableProps {
  title: string;
  description?: string;
  data: ProgressTableRow[];
  className?: string;
  onRowClick?: (row: ProgressTableRow) => void;
}

export const ProgressTable: React.FC<ProgressTableProps> = ({
  title,
  description,
  data,
  className,
  onRowClick,
}) => {
  const getStatusVariant = (status: ProgressTableRow['status']) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'in-progress':
        return 'secondary';
      case 'not-started':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getStatusLabel = (status: ProgressTableRow['status']) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in-progress':
        return 'In Progress';
      case 'not-started':
        return 'Not Started';
      default:
        return status;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Activity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No data available
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => (
                <TableRow
                  key={row.id}
                  className={cn(onRowClick && 'cursor-pointer hover:bg-muted/50')}
                  onClick={() => onRowClick?.(row)}
                >
                  <TableCell>
                    <div>
                      <div className="font-medium">{row.name}</div>
                      <div className="text-sm text-muted-foreground">{row.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{row.course}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={row.progress} className="h-2 w-20" />
                      <span className="text-sm text-muted-foreground">{row.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(row.status)}>
                      {getStatusLabel(row.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {row.lastActivity || 'N/A'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
