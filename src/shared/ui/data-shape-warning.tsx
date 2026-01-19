import React from 'react';
import { AlertTriangle, Copy } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';
import { useToast } from '@/shared/ui/use-toast';
import { useErrorDetailsPreference } from '@/shared/hooks/useErrorDetailsPreference';
import type { DataShapeWarningDetails } from '@/shared/types/data-shape-warning';

export interface DataShapeWarningProps {
  title?: string;
  message?: string;
  details?: DataShapeWarningDetails;
}

function formatReceived(value: unknown): string | undefined {
  if (value == null) return undefined;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function buildCopyText(details: DataShapeWarningDetails, receivedText?: string): string {
  const lines: string[] = [];

  if (details.endpoint) lines.push(`Endpoint: ${details.endpoint}`);
  if (details.method) lines.push(`Method: ${details.method}`);
  if (details.requestId) lines.push(`Request ID: ${details.requestId}`);
  if (details.component) lines.push(`Component: ${details.component}`);
  if (details.expected) lines.push(`Expected: ${details.expected}`);
  if (receivedText) lines.push(`Received:\n${receivedText}`);

  return lines.join('\n');
}

export const DataShapeWarning: React.FC<DataShapeWarningProps> = ({
  title = 'Unexpected data shape',
  message = 'Some data did not match the expected format.',
  details,
}) => {
  const { toast } = useToast();
  const [detailsEnabled] = useErrorDetailsPreference();
  const hasDetails =
    !!details &&
    (details.endpoint ||
      details.method ||
      details.requestId ||
      details.component ||
      details.expected ||
      details.received != null);

  const handleCopy = async () => {
    if (!details || !detailsEnabled) return;
    const receivedText = formatReceived(details.received);
    const text = buildCopyText(details, receivedText);
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: 'Copied', description: 'Data shape details copied to clipboard.' });
    } catch {
      toast({
        title: 'Copy failed',
        description: 'Unable to copy data shape details.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Alert className="border-amber-200/70 bg-amber-50/60 text-foreground">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="space-y-2">
        <p>{message}</p>
        {hasDetails && (
          <>
            {!detailsEnabled ? (
              <p className="text-sm text-muted-foreground">
                Data shape details are hidden. Enable them in Admin Settings to view diagnostics.
              </p>
            ) : (
              <details className="rounded-md border border-border bg-background p-3">
                <summary className="cursor-pointer text-sm font-medium">
                  View data shape details
                </summary>
                <div className="mt-3 space-y-3 text-sm">
                  <div className="space-y-1">
                    {details?.endpoint && (
                      <p>
                        <span className="text-muted-foreground">Endpoint:</span>{' '}
                        {details.endpoint}
                      </p>
                    )}
                    {details?.method && (
                      <p>
                        <span className="text-muted-foreground">Method:</span> {details.method}
                      </p>
                    )}
                    {details?.requestId && (
                      <p>
                        <span className="text-muted-foreground">Request ID:</span>{' '}
                        {details.requestId}
                      </p>
                    )}
                    {details?.component && (
                      <p>
                        <span className="text-muted-foreground">Component:</span>{' '}
                        {details.component}
                      </p>
                    )}
                    {details?.expected && (
                      <p>
                        <span className="text-muted-foreground">Expected:</span>{' '}
                        {details.expected}
                      </p>
                    )}
                  </div>

                  {details?.received != null && (
                    <pre className="whitespace-pre-wrap rounded-md bg-muted p-3 text-xs">
                      {formatReceived(details.received)}
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
      </AlertDescription>
    </Alert>
  );
};
