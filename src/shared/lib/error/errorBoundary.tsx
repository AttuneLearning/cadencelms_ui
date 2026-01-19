/**
 * Error Boundary
 * Production-ready error handling with logging and fallback UI
 */

import { Component, ErrorInfo, ReactNode } from 'react';
import { env } from '@/shared/config/env';
import { ErrorPanel } from '@/shared/ui/error-panel';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to monitoring service
    console.error('ErrorBoundary caught error:', error, errorInfo);

    // Call custom error handler
    this.props.onError?.(error, errorInfo);

    this.setState({ errorInfo });

    // Send to error tracking service (e.g., Sentry)
    if (process.env.NODE_ENV === 'production') {
      // Send to error tracking
      fetch(`${env.apiFullUrl}/errors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: {
            message: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
          },
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
        }),
      }).catch(console.error);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const componentStack = this.state.errorInfo?.componentStack || '';
      const componentLine = componentStack
        .split('\n')
        .map((line) => line.trim())
        .find((line) => line.startsWith('in '));
      const componentName = componentLine ? componentLine.replace(/^in\s+/, '') : undefined;
      const stack = [this.state.error?.stack, componentStack ? `Component stack:\n${componentStack}` : null]
        .filter(Boolean)
        .join('\n\n');

      return (
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="w-full max-w-2xl">
            <ErrorPanel
              title="Something went wrong"
              message="An unexpected error occurred. Please try refreshing the page."
              error={this.state.error}
              details={{
                component: componentName,
                stack,
              }}
              onRetry={this.handleReset}
              links={[{ label: 'Go Home', to: '/' }]}
            />
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
