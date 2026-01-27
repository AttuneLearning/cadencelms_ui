/**
 * Staff Reports Page
 * Staff-facing reports page with simplified interface
 */

import { useState, useEffect } from 'react';
import { useReports, useCreateReport, useDeleteReport } from '@/entities/report/hooks';
import { downloadReport } from '@/entities/report/api/reportApi';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shared/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/alert-dialog';
import { PageHeader } from '@/shared/ui/page-header';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table';
import { Badge } from '@/shared/ui/badge';
import { Skeleton } from '@/shared/ui/skeleton';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import {
  FileText,
  BarChart3,
  Calendar,
  TrendingUp,
  Download,
  Trash2,
  AlertCircle,
  FileBarChart,
} from 'lucide-react';
import type { ReportType, ExportFormat, ReportFilter } from '@/entities/report/model/types';

interface ReportTypeCard {
  type: ReportType;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const reportTypeCards: ReportTypeCard[] = [
  {
    type: 'enrollment',
    title: 'My Classes Enrollment Report',
    description: 'View enrollment statistics and trends for your classes',
    icon: <FileText className="h-8 w-8" />,
  },
  {
    type: 'performance',
    title: 'My Classes Performance Report',
    description: 'Analyze student performance across your classes',
    icon: <BarChart3 className="h-8 w-8" />,
  },
  {
    type: 'attendance',
    title: 'My Classes Attendance Report',
    description: 'Track attendance patterns in your classes',
    icon: <Calendar className="h-8 w-8" />,
  },
  {
    type: 'learner-activity',
    title: 'Student Progress Report',
    description: 'Monitor individual student progress',
    icon: <TrendingUp className="h-8 w-8" />,
  },
];

export function StaffReportsPage() {
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState<ReportType | null>(null);
  const [deleteReportId, setDeleteReportId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    dateFrom: string;
    dateTo: string;
    exportFormat: ExportFormat;
  }>({
    dateFrom: '',
    dateTo: '',
    exportFormat: 'pdf',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Fetch reports with auto-refresh for generating reports
  const { data, isLoading, error, refetch } = useReports({ sort: '-createdAt' });
  const createReport = useCreateReport();
  const deleteReport = useDeleteReport();

  // Auto-refresh when there are generating reports
  useEffect(() => {
    if (data?.reports.some((r) => r.status === 'generating' || r.status === 'pending')) {
      const interval = setInterval(() => {
        refetch();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [data, refetch]);

  const handleReportTypeClick = (type: ReportType) => {
    setSelectedReportType(type);
    setShowFilterModal(true);
    setFormData({
      dateFrom: '',
      dateTo: '',
      exportFormat: 'pdf',
    });
    setFormErrors({});
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.dateFrom) {
      errors.dateFrom = 'Date from is required';
    }

    if (!formData.dateTo) {
      errors.dateTo = 'Date to is required';
    }

    if (formData.dateFrom && formData.dateTo && formData.dateFrom > formData.dateTo) {
      errors.dateTo = 'Date to must be after date from';
    }

    if (!formData.exportFormat) {
      errors.exportFormat = 'Export format is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleGenerateReport = async () => {
    if (!validateForm() || !selectedReportType) return;

    const reportTitle = reportTypeCards.find((r) => r.type === selectedReportType)?.title || 'Report';
    const filters: ReportFilter = {
      dateRange: {
        start: formData.dateFrom,
        end: formData.dateTo,
      },
    };

    try {
      await createReport.mutateAsync({
        name: reportTitle,
        type: selectedReportType,
        filters,
      });
      setShowFilterModal(false);
    } catch (error) {
      console.error('Failed to generate report:', error);
    }
  };

  const handleDownloadReport = async (reportId: string, reportName: string) => {
    try {
      const result = await downloadReport(reportId, formData.exportFormat);
      // Open the download URL
      window.open(result.url, '_blank');
    } catch (error) {
      console.error('Failed to download report:', error);
    }
  };

  const handleDeleteReport = async () => {
    if (!deleteReportId) return;

    try {
      await deleteReport.mutateAsync(deleteReportId);
      setDeleteReportId(null);
    } catch (error) {
      console.error('Failed to delete report:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pending', variant: 'secondary' as const },
      generating: { label: 'Generating', variant: 'default' as const },
      ready: { label: 'Ready', variant: 'success' as const },
      failed: { label: 'Failed', variant: 'destructive' as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        title="Reports"
        description="Generate and manage reports for your classes and students"
      />

      {/* Quick Report Generation */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Report Generation</CardTitle>
          <CardDescription>
            Select a report type to generate
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {reportTypeCards.map((card) => (
              <button
                key={card.type}
                onClick={() => handleReportTypeClick(card.type)}
                className="flex flex-col items-start p-4 border rounded-lg hover:border-primary hover:shadow-md transition-all text-left"
              >
                <div className="mb-3 text-primary">{card.icon}</div>
                <h3 className="font-semibold mb-2">{card.title}</h3>
                <p className="text-sm text-muted-foreground">{card.description}</p>
                <Button variant="ghost" size="sm" className="mt-4 w-full">
                  Generate
                </Button>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* My Generated Reports */}
      <Card>
        <CardHeader>
          <CardTitle>My Generated Reports</CardTitle>
          <CardDescription>
            View and download your recent reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Loading State */}
          {isLoading && (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <div className="text-center mt-4 text-muted-foreground">Loading...</div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Error loading reports. Please try again later.
              </AlertDescription>
            </Alert>
          )}

          {/* Empty State */}
          {!isLoading && !error && data?.reports.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <FileBarChart className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">No reports generated yet</p>
              <p className="text-sm mt-2">
                Generate your first report using the cards above
              </p>
            </div>
          )}

          {/* Reports Table */}
          {!isLoading && !error && data && data.reports.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">{report.name}</TableCell>
                    <TableCell className="capitalize">
                      {report.type.replace(/-/g, ' ')}
                    </TableCell>
                    <TableCell>
                      {new Date(report.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{getStatusBadge(report.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {report.status === 'ready' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadReport(report.id, report.name)}
                          >
                            <Download className="h-4 w-4" />
                            Download
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteReportId(report.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Generation Error */}
          {createReport.isError && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to generate report. Please try again.
              </AlertDescription>
            </Alert>
          )}

          {/* Delete Error */}
          {deleteReport.isError && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to delete report. Please try again.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Filter Modal */}
      <Dialog open={showFilterModal} onOpenChange={setShowFilterModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configure Report Filters</DialogTitle>
            <DialogDescription>
              Set the filters for your report
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Date From */}
            <div className="space-y-2">
              <Label htmlFor="dateFrom">Date From</Label>
              <Input
                id="dateFrom"
                type="date"
                value={formData.dateFrom}
                onChange={(e) =>
                  setFormData({ ...formData, dateFrom: e.target.value })
                }
              />
              {formErrors.dateFrom && (
                <p className="text-sm text-destructive">{formErrors.dateFrom}</p>
              )}
            </div>

            {/* Date To */}
            <div className="space-y-2">
              <Label htmlFor="dateTo">Date To</Label>
              <Input
                id="dateTo"
                type="date"
                value={formData.dateTo}
                onChange={(e) =>
                  setFormData({ ...formData, dateTo: e.target.value })
                }
              />
              {formErrors.dateTo && (
                <p className="text-sm text-destructive">{formErrors.dateTo}</p>
              )}
            </div>

            {/* Export Format */}
            <div className="space-y-2">
              <Label htmlFor="exportFormat">Export Format</Label>
              <Select
                value={formData.exportFormat}
                onValueChange={(value) =>
                  setFormData({ ...formData, exportFormat: value as ExportFormat })
                }
              >
                <SelectTrigger id="exportFormat">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                </SelectContent>
              </Select>
              {formErrors.exportFormat && (
                <p className="text-sm text-destructive">{formErrors.exportFormat}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFilterModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleGenerateReport}
              disabled={createReport.isPending}
            >
              {createReport.isPending ? 'Generating...' : 'Generate Report'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteReportId} onOpenChange={() => setDeleteReportId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the report.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteReport}
              disabled={deleteReport.isPending}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
