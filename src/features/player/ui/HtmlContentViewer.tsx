/**
 * HtmlContentViewer Component
 * Renders HTML content from content records (metadata.htmlContent)
 */

import { useEffect, useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useContent } from '@/entities/content';

export interface HtmlContentViewerProps {
  contentId: string;
  onViewed?: () => void;
}

export function HtmlContentViewer({ contentId, onViewed }: HtmlContentViewerProps) {
  const { data: content, isLoading, error } = useContent(contentId);
  const [hasMarkedViewed, setHasMarkedViewed] = useState(false);

  const htmlContent =
    (content?.metadata as Record<string, unknown>)?.htmlContent as string | undefined;

  useEffect(() => {
    setHasMarkedViewed(false);
  }, [contentId]);

  const markViewedFromInteraction = () => {
    if (!htmlContent || !onViewed || hasMarkedViewed) return;
    setHasMarkedViewed(true);
    onViewed();
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading content...</p>
        </div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="flex h-full items-center justify-center bg-muted/10">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <div>
            <h3 className="text-lg font-semibold">Content Not Found</h3>
            <p className="text-sm text-muted-foreground">
              {error instanceof Error ? error.message : 'Unable to load content'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!htmlContent) {
    return (
      <div className="flex h-full items-center justify-center bg-muted/10">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground" />
          <div>
            <h3 className="text-lg font-semibold">No Content Available</h3>
            <p className="text-sm text-muted-foreground">
              This lesson does not have content yet.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-full overflow-y-auto"
      data-testid="html-content-viewer"
      tabIndex={0}
      onMouseDown={markViewedFromInteraction}
      onTouchStart={markViewedFromInteraction}
      onKeyDown={markViewedFromInteraction}
      onScroll={markViewedFromInteraction}
    >
      <div className="mx-auto max-w-3xl px-8 py-8">
        <h1 className="mb-6 text-2xl font-bold">{content.title}</h1>
        <div
          className="prose prose-sm dark:prose-invert max-w-none
            prose-headings:text-foreground prose-p:text-foreground/90
            prose-li:text-foreground/90 prose-strong:text-foreground
            prose-a:text-primary"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </div>
    </div>
  );
}
