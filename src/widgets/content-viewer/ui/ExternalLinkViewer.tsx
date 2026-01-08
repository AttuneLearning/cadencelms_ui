/**
 * ExternalLinkViewer Component
 * Handles external link content display with iframe or redirect option
 */

import React, { useState } from 'react';
import { ExternalLink, AlertCircle } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { cn } from '@/shared/lib/utils';

interface ExternalLinkViewerProps {
  url: string;
  title?: string;
  description?: string;
  allowIframe?: boolean;
  onVisit?: () => void;
  className?: string;
}

export const ExternalLinkViewer: React.FC<ExternalLinkViewerProps> = ({
  url,
  title,
  description,
  allowIframe = true,
  onVisit,
  className,
}) => {
  const [iframeError, setIframeError] = useState(false);

  const handleOpenLink = () => {
    if (onVisit) {
      onVisit();
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleIframeError = () => {
    setIframeError(true);
  };

  return (
    <div className={cn('relative w-full h-full flex flex-col', className)}>
      {allowIframe && !iframeError ? (
        <>
          {/* Toolbar */}
          <div className="flex items-center justify-between p-3 border-b bg-muted/30">
            <div className="flex-1">
              {title && <span className="text-sm font-medium">{title}</span>}
            </div>
            <Button variant="ghost" size="sm" onClick={handleOpenLink}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Open in New Tab
            </Button>
          </div>

          {/* Iframe */}
          <div className="flex-1 overflow-hidden">
            <iframe
              src={url}
              className="w-full h-full border-0"
              title={title || 'External Content'}
              onError={handleIframeError}
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            />
          </div>
        </>
      ) : (
        /* Fallback Card */
        <div className="flex items-center justify-center h-full p-6">
          <Card className="max-w-md">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <ExternalLink className="h-6 w-6 text-primary" />
                <CardTitle>{title || 'External Resource'}</CardTitle>
              </div>
              {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent className="space-y-4">
              {iframeError && (
                <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900 rounded-md">
                  <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    This content cannot be displayed in a frame. Click the button below to
                    open it in a new tab.
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">URL:</p>
                <code className="block p-2 bg-muted rounded text-xs break-all">
                  {url}
                </code>
              </div>

              <Button onClick={handleOpenLink} className="w-full">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open External Resource
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
