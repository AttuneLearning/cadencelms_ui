import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Copy, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { useToast } from '@/shared/ui/use-toast';
import { useErrorDetailsPreference } from '@/shared/hooks/useErrorDetailsPreference';
import { ApiClientError } from '@/shared/api/client';

export interface ErrorPanelLink {
  label: string;
  to: string;
}

export interface ErrorPanelDetails {
  endpoint?: string;
  method?: string;
  statusCode?: number;
  requestId?: string;
  component?: string;
  stack?: string;
}

export interface ErrorPanelProps {
  title?: string;
  message?: string;
  error?: unknown;
  details?: ErrorPanelDetails;
  onRetry?: () => void;
  links?: ErrorPanelLink[];
}

function resolveErrorMessage(message?: string, error?: unknown): string {
  if (message) return message;
  if (error instanceof ApiClientError) return error.message;
  if (error instanceof Error) return error.message;
  return 'Something went wrong while loading this page.';
}

function buildDetails(details?: ErrorPanelDetails, error?: unknown): ErrorPanelDetails {
  const base: ErrorPanelDetails = {
    ...details,
  };

  if (error instanceof ApiClientError) {
    if (base.statusCode == null) base.statusCode = error.status;
    if (!base.requestId && error.requestId) base.requestId = error.requestId;
  }

  if (!base.stack && error instanceof Error) {
    base.stack = error.stack;
  }

  return base;
}

function buildCopyText(details: ErrorPanelDetails): string {
  const lines: string[] = [];

  if (details.endpoint) lines.push(`Endpoint: ${details.endpoint}`);
  if (details.method) lines.push(`Method: ${details.method}`);
  if (details.statusCode != null) lines.push(`Status: ${details.statusCode}`);
  if (details.requestId) lines.push(`Request ID: ${details.requestId}`);
  if (details.component) lines.push(`Component: ${details.component}`);
  if (details.stack) lines.push(`Stack:\n${details.stack}`);

  return lines.join('\n');
}

export const ErrorPanel: React.FC<ErrorPanelProps> = ({
  title = 'Unable to load page',
  message,
  error,
  details,
  onRetry,
  links,
}) => {
  const { toast } = useToast();
  const [detailsEnabled] = useErrorDetailsPreference();
  const resolvedDetails = buildDetails(details, error);
  const hasDetails =
    resolvedDetails.endpoint ||
    resolvedDetails.method ||
    resolvedDetails.statusCode != null ||
    resolvedDetails.requestId ||
    resolvedDetails.component ||
    resolvedDetails.stack;

  const handleCopy = async () => {
    const text = buildCopyText(resolvedDetails);
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: 'Copied', description: 'Error details copied to clipboard.' });
    } catch {
      toast({
        title: 'Copy failed',
        description: 'Unable to copy error details.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="border-destructive">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <CardTitle>{title}</CardTitle>
        </div>
        <CardDescription>{resolveErrorMessage(message, error)}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {(onRetry || (links && links.length > 0)) && (
          <div className="flex flex-wrap gap-2">
            {onRetry && (
              <Button onClick={onRetry} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            )}
            {links?.map((link) => (
              <Button key={link.to} asChild variant="outline" size="sm">
                <Link to={link.to}>{link.label}</Link>
              </Button>
            ))}
          </div>
        )}

        {hasDetails && (
          <>
            {!detailsEnabled ? (
              <p className="text-sm text-muted-foreground">
                Error details are hidden. Enable them in Admin Settings to view
                diagnostics.
              </p>
            ) : (
              <details className="rounded-md border border-border p-3">
                <summary className="cursor-pointer text-sm font-medium">
                  Technical details
                </summary>
                <div className="mt-3 space-y-3 text-sm">
                  <div className="space-y-1">
                    {resolvedDetails.endpoint && (
                      <p>
                        <span className="text-muted-foreground">Endpoint:</span>{' '}
                        {resolvedDetails.endpoint}
                      </p>
                    )}
                    {resolvedDetails.method && (
                      <p>
                        <span className="text-muted-foreground">Method:</span>{' '}
                        {resolvedDetails.method}
                      </p>
                    )}
                    {resolvedDetails.statusCode != null && (
                      <p>
                        <span className="text-muted-foreground">Status:</span>{' '}
                        {resolvedDetails.statusCode}
                      </p>
                    )}
                    {resolvedDetails.requestId && (
                      <p>
                        <span className="text-muted-foreground">Request ID:</span>{' '}
                        {resolvedDetails.requestId}
                      </p>
                    )}
                    {resolvedDetails.component && (
                      <p>
                        <span className="text-muted-foreground">Component:</span>{' '}
                        {resolvedDetails.component}
                      </p>
                    )}
                  </div>

                  {resolvedDetails.stack && (
                    <pre className="whitespace-pre-wrap rounded-md bg-muted p-3 text-xs">
                      {resolvedDetails.stack}
                    </pre>
                  )}

                  <Button variant="ghost" size="sm" onClick={handleCopy}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy details
                  </Button>
                </div>
              </details>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
