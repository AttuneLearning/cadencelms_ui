/**
 * Staff List Component
 * Displays a list of staff members with filtering and pagination
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Badge } from '@/shared/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Loader2,
  Mail,
  AlertCircle,
} from 'lucide-react';
import { useStaffList } from '../model/useStaff';
import type { StaffListParams, Staff, StaffStatus, StaffRole } from '../model/types';

interface StaffListProps {
  initialParams?: StaffListParams;
  onSelectStaff?: (staff: Staff) => void;
  showFilters?: boolean;
}

export function StaffList({
  initialParams = {},
  onSelectStaff,
  showFilters = true,
}: StaffListProps) {
  const [params, setParams] = useState<StaffListParams>({
    page: 1,
    limit: 10,
    status: 'active',
    ...initialParams,
  });

  const { data, isLoading, isError, error } = useStaffList(params);

  const updateParams = (updates: Partial<StaffListParams>) => {
    setParams((prev) => ({
      ...prev,
      ...updates,
      page: updates.page !== undefined ? updates.page : 1, // Reset to page 1 on filter change
    }));
  };

  const handleSearch = (search: string) => {
    updateParams({ search: search || undefined });
  };

  const handleStatusFilter = (status: string) => {
    updateParams({ status: status === 'all' ? undefined : (status as StaffStatus) });
  };

  const handleRoleFilter = (role: string) => {
    updateParams({ role: role === 'all' ? undefined : (role as StaffRole) });
  };

  const handlePageChange = (page: number) => {
    setParams((prev) => ({ ...prev, page }));
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-500';
      case 'inactive':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'withdrawn':
        return 'bg-gray-500/10 text-gray-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Staff Members</CardTitle>
        <CardDescription>
          Manage staff users and their department assignments
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filters */}
        {showFilters && (
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={params.search || ''}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Status Filter */}
            <Select
              value={params.status || 'all'}
              onValueChange={handleStatusFilter}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="withdrawn">Withdrawn</SelectItem>
              </SelectContent>
            </Select>

            {/* Role Filter */}
            <Select
              value={params.role || 'all'}
              onValueChange={handleRoleFilter}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="instructor">Instructor</SelectItem>
                <SelectItem value="content-admin">Content Admin</SelectItem>
                <SelectItem value="dept-admin">Dept Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-4 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <div>
              <div className="font-medium">Failed to load staff</div>
              <div className="text-sm">{error?.message || 'An error occurred'}</div>
            </div>
          </div>
        )}

        {/* Staff List */}
        {!isLoading && !isError && data && (
          <>
            <div className="space-y-3">
              {data.staff.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No staff members found
                </div>
              ) : (
                data.staff.map((staff) => {
                  const initials = `${staff.firstName[0]}${staff.lastName[0]}`.toUpperCase();
                  const fullName = `${staff.firstName} ${staff.lastName}`;

                  return (
                    <div
                      key={staff.id}
                      className="flex items-center gap-4 rounded-lg border p-4 hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => onSelectStaff?.(staff)}
                    >
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={staff.profileImage || undefined} alt={fullName} />
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold truncate">{fullName}</h3>
                          <Badge variant="outline" className={getStatusBadgeColor(staff.status)}>
                            {staff.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-3.5 w-3.5" />
                          <span className="truncate">{staff.email}</span>
                        </div>
                        {staff.departments && staff.departments.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {staff.departments.map((dept, index) => (
                              <Badge
                                key={`${dept.departmentId}-${index}`}
                                variant="secondary"
                                className="text-xs"
                              >
                                {dept.departmentName} ({dept.roleInDepartment})
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Pagination */}
            {data.pagination.totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Page {data.pagination.page} of {data.pagination.totalPages}
                  {' '}({data.pagination.total} total)
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(data.pagination.page - 1)}
                    disabled={!data.pagination.hasPrev}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(data.pagination.page + 1)}
                    disabled={!data.pagination.hasNext}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
