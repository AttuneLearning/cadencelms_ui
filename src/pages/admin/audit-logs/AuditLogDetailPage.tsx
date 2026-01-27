/**
 * Audit Log Detail Page
 * View detailed information about a specific audit log entry
 */

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, formatDistanceToNow } from 'date-fns';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Separator } from '@/shared/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table';
import { useToast } from '@/shared/ui/use-toast';
import { PageHeader } from '@/shared/ui/page-header';
import { Progress } from '@/shared/ui/progress';
import {
  ArrowLeft,
  Download,
  Copy,
  AlertCircle,
} from 'lucide-react';
import {
  useAuditLog,
  useRelatedAuditLogs,
  useExportSingleAuditLog,
  type SeverityLevel,
  type AuditLog,
} from '@/entities/audit-log';

const severityColors: Record<SeverityLevel, string> = {
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  error: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

export const AuditLogDetailPage: React.FC = () => {
  const { logId } = useParams<{ logId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch audit log and related logs
  const { data: log, isLoading, error } = useAuditLog(logId!);
  const { data: relatedLogs } = useRelatedAuditLogs(logId!);

  // Export mutation
  const exportMutation = useExportSingleAuditLog();

  const handleExport = async () => {
    try {
      const result = await exportMutation.mutateAsync({
        id: logId!,
        format: 'json',
      });

      // Download the file
      window.open(result.url, '_blank');

      toast({
        title: 'Export successful',
        description: 'Audit log has been exported.',
      });
    } catch (error) {
      toast({
        title: 'Export failed',
        description: 'Failed to export audit log. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleCopyLogId = async () => {
    try {
      await navigator.clipboard.writeText(logId!);
      toast({
        title: 'Copied',
        description: 'Log ID copied to clipboard.',
      });
    } catch (error) {
      toast({
        title: 'Failed to copy',
        description: 'Could not copy log ID to clipboard.',
        variant: 'destructive',
      });
    }
  };

  const handleViewRelatedLog = (id: string) => {
    navigate(`/admin/audit-logs/${id}`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <Progress value={undefined} className="w-64" />
        </div>
      </div>
    );
  }

  if (error || !log) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64 space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Error Loading Audit Log</h2>
              <p className="text-muted-foreground">
                {error ? 'Failed to load audit log. Please try again.' : 'Audit log not found.'}
              </p>
            </div>
            <Button onClick={() => navigate('/admin/audit-logs')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Audit Logs
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        title="Audit Log Details"
        description="View detailed information about this audit log entry"
      >
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyLogId}
        >
          <Copy className="h-4 w-4 mr-2" />
          Copy Log ID
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          disabled={exportMutation.isPending}
        >
          <Download className="h-4 w-4 mr-2" />
          {exportMutation.isPending ? 'Exporting...' : 'Export'}
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate('/admin/audit-logs')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Logs
        </Button>
      </PageHeader>

      {/* Main Details Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Log Entry Details</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="capitalize">
                {log.action}
              </Badge>
              <Badge className={severityColors[log.severity]}>
                {log.severity}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Timestamp */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Timestamp
              </h3>
              <div className="text-lg font-medium">
                {format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm:ss')}
              </div>
              <div className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
              </div>
            </div>

            {/* User Information */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                User
              </h3>
              <div className="text-lg font-medium">{log.userName}</div>
              <div className="text-sm text-muted-foreground">{log.userEmail}</div>
              <div className="text-xs text-muted-foreground mt-1">
                ID: {log.userId}
              </div>
            </div>

            {/* Entity Information */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Entity
              </h3>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="secondary" className="capitalize">
                  {log.entityType}
                </Badge>
              </div>
              {log.entityName && (
                <div className="text-sm font-medium">{log.entityName}</div>
              )}
              {log.entityId && (
                <div className="text-xs text-muted-foreground mt-1">
                  ID: {log.entityId}
                </div>
              )}
            </div>

            {/* Network Information */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Network
              </h3>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">IP Address:</span>
                  <span className="font-mono text-sm">{log.ipAddress}</span>
                </div>
                {log.metadata?.sessionId && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Session:</span>
                    <span className="font-mono text-xs">{log.metadata.sessionId}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Description */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Description
            </h3>
            <p className="text-sm">{log.description}</p>
          </div>

          {/* User Agent */}
          {log.metadata?.userAgent && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  User Agent
                </h3>
                <p className="text-sm font-mono break-all text-muted-foreground">
                  {log.metadata.userAgent}
                </p>
              </div>
            </>
          )}

          {/* Request Metadata */}
          {(log.metadata?.requestId || log.metadata?.duration) && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Request Metadata
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {log.metadata?.requestId && (
                    <div>
                      <span className="text-sm text-muted-foreground">Request ID:</span>
                      <span className="font-mono text-sm ml-2">
                        {log.metadata.requestId}
                      </span>
                    </div>
                  )}
                  {log.metadata?.duration && (
                    <div>
                      <span className="text-sm text-muted-foreground">Duration:</span>
                      <span className="text-sm ml-2">{log.metadata.duration}ms</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Changes Card */}
      {log.changes && log.changes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Changes</CardTitle>
            <CardDescription>
              Field-by-field comparison of changes made
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Field</TableHead>
                  <TableHead>Before</TableHead>
                  <TableHead>After</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {log.changes.map((change, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{change.field}</TableCell>
                    <TableCell>
                      <code className="text-sm bg-muted px-2 py-1 rounded">
                        {change.oldValue === null
                          ? '-'
                          : typeof change.oldValue === 'object'
                          ? JSON.stringify(change.oldValue)
                          : String(change.oldValue)}
                      </code>
                    </TableCell>
                    <TableCell>
                      <code className="text-sm bg-muted px-2 py-1 rounded">
                        {change.newValue === null
                          ? '-'
                          : typeof change.newValue === 'object'
                          ? JSON.stringify(change.newValue)
                          : String(change.newValue)}
                      </code>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Related Logs Card */}
      <Card>
        <CardHeader>
          <CardTitle>Related Logs</CardTitle>
          <CardDescription>
            Other logs from the same user around the same time
          </CardDescription>
        </CardHeader>
        <CardContent>
          {relatedLogs && relatedLogs.length > 0 ? (
            <div className="space-y-2">
              {relatedLogs.map((relatedLog) => (
                <div
                  key={relatedLog.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => handleViewRelatedLog(relatedLog.id)}
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="text-sm font-medium">
                        {format(new Date(relatedLog.timestamp), 'MMM dd, yyyy HH:mm:ss')}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {relatedLog.description}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {relatedLog.action}
                    </Badge>
                    <Badge className={severityColors[relatedLog.severity]}>
                      {relatedLog.severity}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No related logs found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
