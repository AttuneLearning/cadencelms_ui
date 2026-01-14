/**
 * Department Overview Card
 * Displays comprehensive department information including hierarchy and audit fields
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import type { DepartmentDetails } from '@/entities/department';

interface DepartmentOverviewCardProps {
  department: DepartmentDetails;
}

export const DepartmentOverviewCard: React.FC<DepartmentOverviewCardProps> = ({
  department,
}) => {
  const statusVariant = department.status === 'active' ? 'default' : 'secondary';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl">{department.name}</CardTitle>
            <CardDescription className="font-mono text-base mt-1">
              {department.code}
            </CardDescription>
          </div>
          <Badge variant={statusVariant} className="text-sm">
            {department.status.charAt(0).toUpperCase() + department.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <dt className="text-sm font-medium text-muted-foreground mb-1">Description</dt>
            <dd className="text-sm">
              {department.description || (
                <span className="text-muted-foreground italic">No description</span>
              )}
            </dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-muted-foreground mb-1">
              Parent Department
            </dt>
            <dd className="text-sm">
              {department.parent ? (
                <Link
                  to={`/admin/departments/${department.parent.id}`}
                  className="text-primary hover:underline font-medium"
                >
                  {department.parent.name} ({department.parent.code})
                </Link>
              ) : (
                <span className="text-muted-foreground">Root Department</span>
              )}
            </dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-muted-foreground mb-1">
              Hierarchy Level
            </dt>
            <dd className="text-sm">Level {department.level}</dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-muted-foreground mb-1">
              Child Departments
            </dt>
            <dd className="text-sm">
              {department.childCount > 0 ? (
                <span className="font-medium">{department.childCount} child department(s)</span>
              ) : (
                <span className="text-muted-foreground">No child departments</span>
              )}
            </dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-muted-foreground mb-1">Created</dt>
            <dd className="text-sm">
              <div>{format(new Date(department.createdAt), 'PPP')}</div>
              {department.createdBy && (
                <div className="text-muted-foreground text-xs mt-1">
                  by {department.createdBy.name}
                </div>
              )}
            </dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-muted-foreground mb-1">Last Updated</dt>
            <dd className="text-sm">
              <div>{format(new Date(department.updatedAt), 'PPP')}</div>
              {department.updatedBy && (
                <div className="text-muted-foreground text-xs mt-1">
                  by {department.updatedBy.name}
                </div>
              )}
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
};
