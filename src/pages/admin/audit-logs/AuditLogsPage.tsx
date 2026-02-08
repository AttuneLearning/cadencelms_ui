/**
 * Audit Logs Page
 * Admin interface for viewing and filtering audit logs
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { type ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { DataTable } from '@/shared/ui/data-table';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Card, CardContent, CardHeader } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { useToast } from '@/shared/ui/use-toast';
import { PageHeader } from '@/shared/ui/page-header';
import {
  Download,
  RefreshCw,
  Filter,
  ChevronDown,
  Eye,
  X,
} from 'lucide-react';
import {
  useAuditLogs,
  useExportAuditLogs,
  type AuditLog,
  type ActionType,
  type EntityType,
  type SeverityLevel,
} from '@/entities/audit-log';

const severityColors: Record<SeverityLevel, string> = {
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  error: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

export const AuditLogsPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isExportDialogOpen, setIsExportDialogOpen] = React.useState(false);
  const [isFiltersExpanded, setIsFiltersExpanded] = React.useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = React.useState('');
  const [userFilter, setUserFilter] = React.useState('');
  const [actionFilter, setActionFilter] = React.useState<ActionType[]>([]);
  const [entityTypeFilter, setEntityTypeFilter] = React.useState<EntityType | 'all'>('all');
  const [severityFilter, setSeverityFilter] = React.useState<SeverityLevel[]>([]);
  const [ipAddressFilter, setIpAddressFilter] = React.useState('');
  const [dateFrom, setDateFrom] = React.useState('');
  const [dateTo, setDateTo] = React.useState('');
  const [sortBy, _setSortBy] = React.useState('-timestamp');
  const [page, setPage] = React.useState(1);
  const [limit] = React.useState(20);

  // Export state
  const [exportFormat, setExportFormat] = React.useState<'csv' | 'excel' | 'json'>('csv');
  const [exportDateFrom, setExportDateFrom] = React.useState('');
  const [exportDateTo, setExportDateTo] = React.useState('');
  const [applyCurrentFilters, setApplyCurrentFilters] = React.useState(true);

  // Build filters
  const filters = React.useMemo(() => {
    const f: any = { page, limit, sort: sortBy };
    if (searchQuery) f.search = searchQuery;
    if (userFilter) f.userId = userFilter;
    if (actionFilter.length > 0) f.action = actionFilter;
    if (entityTypeFilter !== 'all') f.entityType = entityTypeFilter;
    if (severityFilter.length > 0) f.severity = severityFilter;
    if (ipAddressFilter) f.ipAddress = ipAddressFilter;
    if (dateFrom) f.dateFrom = dateFrom;
    if (dateTo) f.dateTo = dateTo;
    return f;
  }, [searchQuery, userFilter, actionFilter, entityTypeFilter, severityFilter, ipAddressFilter, dateFrom, dateTo, sortBy, page, limit]);

  // Fetch audit logs
  const { data, isLoading, refetch } = useAuditLogs(filters);
  const logs = data?.logs || [];
  const pagination = data?.pagination;

  // Export mutation
  const exportMutation = useExportAuditLogs();

  const handleClearFilters = () => {
    setSearchQuery('');
    setUserFilter('');
    setActionFilter([]);
    setEntityTypeFilter('all');
    setSeverityFilter([]);
    setIpAddressFilter('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };

  const handleExport = async () => {
    try {
      const exportPayload: any = {
        format: exportFormat,
      };

      if (applyCurrentFilters) {
        exportPayload.filters = filters;
      }

      if (exportDateFrom && exportDateTo) {
        exportPayload.dateRange = {
          start: exportDateFrom,
          end: exportDateTo,
        };
      }

      const result = await exportMutation.mutateAsync(exportPayload);

      // Download the file
      window.open(result.url, '_blank');

      toast({
        title: 'Export successful',
        description: 'Your audit logs have been exported.',
      });

      setIsExportDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Export failed',
        description: 'Failed to export audit logs. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleViewDetails = (logId: string) => {
    navigate(`/admin/audit-logs/${logId}`);
  };

  const columns: ColumnDef<AuditLog>[] = [
    {
      accessorKey: 'timestamp',
      header: 'Timestamp',
      cell: ({ row }) => (
        <div className="whitespace-nowrap">
          {format(new Date(row.original.timestamp), 'MMM dd, yyyy HH:mm:ss')}
        </div>
      ),
    },
    {
      accessorKey: 'userName',
      header: 'User',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.userName}</div>
          <div className="text-sm text-muted-foreground">{row.original.userEmail}</div>
        </div>
      ),
    },
    {
      accessorKey: 'action',
      header: 'Action',
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize">
          {row.original.action}
        </Badge>
      ),
    },
    {
      accessorKey: 'entityType',
      header: 'Entity Type',
      cell: ({ row }) => (
        <Badge variant="secondary" className="capitalize">
          {row.original.entityType}
        </Badge>
      ),
    },
    {
      accessorKey: 'entityName',
      header: 'Entity',
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate" title={row.original.entityName || '-'}>
          {row.original.entityName || '-'}
        </div>
      ),
    },
    {
      accessorKey: 'severity',
      header: 'Severity',
      cell: ({ row }) => (
        <Badge className={severityColors[row.original.severity]}>
          {row.original.severity}
        </Badge>
      ),
    },
    {
      accessorKey: 'ipAddress',
      header: 'IP Address',
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.original.ipAddress}</span>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Details',
      cell: ({ row }) => (
        <div className="max-w-[300px] truncate" title={row.original.description}>
          {row.original.description}
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleViewDetails(row.original.id)}
        >
          <Eye className="h-4 w-4 mr-1" />
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        title="Audit Logs"
        description="View and track system activity and changes"
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                <ChevronDown
                  className={`h-4 w-4 ml-2 transition-transform ${
                    isFiltersExpanded ? 'rotate-180' : ''
                  }`}
                />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsExportDialogOpen(true)}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {isFiltersExpanded && (
            <div className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 border rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="search">Search</Label>
                  <Input
                    id="search"
                    placeholder="Search by description..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setPage(1);
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="user">User</Label>
                  <Input
                    id="user"
                    placeholder="Filter by user ID..."
                    value={userFilter}
                    onChange={(e) => {
                      setUserFilter(e.target.value);
                      setPage(1);
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="entityType">Entity Type</Label>
                  <Select
                    value={entityTypeFilter}
                    onValueChange={(value) => {
                      setEntityTypeFilter(value as EntityType | 'all');
                      setPage(1);
                    }}
                  >
                    <SelectTrigger id="entityType">
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="course">Course</SelectItem>
                      <SelectItem value="enrollment">Enrollment</SelectItem>
                      <SelectItem value="program">Program</SelectItem>
                      <SelectItem value="class">Class</SelectItem>
                      <SelectItem value="content">Content</SelectItem>
                      <SelectItem value="exercise">Exercise</SelectItem>
                      <SelectItem value="report">Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ipAddress">IP Address</Label>
                  <Input
                    id="ipAddress"
                    placeholder="Filter by IP..."
                    value={ipAddressFilter}
                    onChange={(e) => {
                      setIpAddressFilter(e.target.value);
                      setPage(1);
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateFrom">Date From</Label>
                  <Input
                    id="dateFrom"
                    type="date"
                    value={dateFrom}
                    onChange={(e) => {
                      setDateFrom(e.target.value);
                      setPage(1);
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateTo">Date To</Label>
                  <Input
                    id="dateTo"
                    type="date"
                    value={dateTo}
                    onChange={(e) => {
                      setDateTo(e.target.value);
                      setPage(1);
                    }}
                  />
                </div>

                <div className="col-span-full flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearFilters}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Loading audit logs...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">No audit logs found.</p>
            </div>
          ) : (
            <>
              <DataTable columns={columns} data={logs} />
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-2 py-4">
                  <div className="text-sm text-muted-foreground">
                    Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page <= 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
                      disabled={page >= pagination.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Export Dialog */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Audit Logs</DialogTitle>
            <DialogDescription>
              Choose export format and date range for your audit logs export.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="exportFormat">Format</Label>
              <Select
                value={exportFormat}
                onValueChange={(value) => setExportFormat(value as 'csv' | 'excel' | 'json')}
              >
                <SelectTrigger id="exportFormat">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="exportDateFrom">Date From</Label>
              <Input
                id="exportDateFrom"
                type="date"
                value={exportDateFrom}
                onChange={(e) => setExportDateFrom(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="exportDateTo">Date To</Label>
              <Input
                id="exportDateTo"
                type="date"
                value={exportDateTo}
                onChange={(e) => setExportDateTo(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="applyFilters"
                checked={applyCurrentFilters}
                onChange={(e) => setApplyCurrentFilters(e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="applyFilters" className="cursor-pointer">
                Apply current filters to export
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsExportDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleExport}
              disabled={exportMutation.isPending}
            >
              <Download className="h-4 w-4 mr-2" />
              {exportMutation.isPending ? 'Exporting...' : 'Export'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
