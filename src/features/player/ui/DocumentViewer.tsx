/**
 * DocumentViewer Component
 * Renders PDF and image documents
 */

import { useState } from 'react';
import { AlertCircle, Loader2, Download } from 'lucide-react';
import { Button } from '@/shared/ui/button';

export interface DocumentViewerProps {
  attemptId: string;
  documentUrl: string;
  documentType: 'pdf' | 'image';
  onViewed?: () => void;
  onError?: (error: string) => void;
}

export function DocumentViewer({
  documentUrl,
  documentType,
  onViewed,
  onError,
}: DocumentViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleLoad = () => {
    setIsLoading(false);
    if (onViewed) {
      onViewed();
    }
  };

  const handleError = () => {
    setError('Failed to load document');
    setIsLoading(false);
    if (onError) {
      onError('Failed to load document');
    }
  };

  const handleDownload = () => {
    window.open(documentUrl, '_blank');
  };

  if (!documentUrl) {
    return (
      <div className="flex h-full items-center justify-center bg-muted/10">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <div>
            <h3 className="text-lg font-semibold">Invalid Document URL</h3>
            <p className="text-sm text-muted-foreground">No document URL provided</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center bg-muted/10">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <div>
            <h3 className="text-lg font-semibold">Error Loading Document</h3>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
          <Button variant="outline" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download Document
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full bg-muted/5">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading document...</p>
          </div>
        </div>
      )}

      {/* Download Button */}
      <div className="absolute right-4 top-4 z-20">
        <Button variant="secondary" size="sm" onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
      </div>

      {documentType === 'pdf' ? (
        <iframe
          src={documentUrl}
          title="PDF Document"
          className="h-full w-full border-0"
          onLoad={handleLoad}
          onError={handleError}
        />
      ) : (
        <div className="flex h-full items-center justify-center p-8">
          <img
            src={documentUrl}
            alt="Document"
            className="max-h-full max-w-full object-contain"
            onLoad={handleLoad}
            onError={handleError}
          />
        </div>
      )}
    </div>
  );
}
