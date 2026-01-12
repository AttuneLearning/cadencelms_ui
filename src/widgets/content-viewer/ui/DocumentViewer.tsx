/**
 * DocumentViewer Component
 * Handles document content display (PDF, presentations, etc.)
 */

import React, { useState } from 'react';
import { Download, ExternalLink, ZoomIn, ZoomOut, FileText } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { cn } from '@/shared/lib/utils';

interface DocumentViewerProps {
  documentUrl: string;
  title?: string;
  mimeType?: string;
  isDownloadable?: boolean;
  onProgress?: (progress: { scrollPercent: number }) => void;
  className?: string;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  documentUrl,
  title,
  mimeType,
  isDownloadable = false,
  onProgress,
  className,
}) => {
  const [zoom, setZoom] = useState(100);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = documentUrl;
    link.download = title || 'document';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(200, prev + 25));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(50, prev - 25));
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const scrollPercent =
      (element.scrollTop / (element.scrollHeight - element.clientHeight)) * 100;

    if (onProgress) {
      onProgress({ scrollPercent });
    }
  };

  // Determine if we can use iframe or need a fallback
  const canUseIframe = mimeType === 'application/pdf' || documentUrl.endsWith('.pdf');

  return (
    <div className={cn('relative w-full h-full flex flex-col', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-muted-foreground" />
          {title && <span className="text-sm font-medium">{title}</span>}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomOut}
            disabled={zoom <= 50}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground w-12 text-center">
            {zoom}%
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomIn}
            disabled={zoom >= 200}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-border mx-2" />

          {isDownloadable && (
            <Button variant="ghost" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          )}

          <Button variant="ghost" size="sm" asChild>
            <a href={documentUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Open
            </a>
          </Button>
        </div>
      </div>

      {/* Document Display */}
      <div
        className="flex-1 overflow-auto bg-muted/10"
        onScroll={handleScroll}
      >
        {canUseIframe ? (
          <div className="w-full h-full p-4">
            <iframe
              src={documentUrl}
              className="w-full h-full border rounded-lg"
              style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left' }}
              title={title || 'Document'}
            />
          </div>
        ) : (
          <Card className="m-4 p-6">
            <div className="flex flex-col items-center justify-center gap-4">
              <FileText className="h-16 w-16 text-muted-foreground" />
              <div className="text-center">
                <h3 className="font-semibold mb-2">Document Preview</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  This document type cannot be previewed in the browser.
                </p>
                <div className="flex gap-2 justify-center">
                  {isDownloadable && (
                    <Button onClick={handleDownload}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  )}
                  <Button variant="outline" asChild>
                    <a href={documentUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open in New Tab
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
