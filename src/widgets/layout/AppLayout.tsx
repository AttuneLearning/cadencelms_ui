import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from '@/widgets/header/Header';
import { Sidebar } from '@/widgets/sidebar/Sidebar';
import { Toaster } from '@/shared/ui/toaster';
import { useAuth } from '@/features/auth/model/useAuth';
import { cn } from '@/shared/lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
}

// Routes that should not show the sidebar
const NO_SIDEBAR_ROUTES = ['/login', '/', '/unauthorized', '/404'];

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const mainRef = useRef<HTMLElement>(null);
  const isFirstRender = useRef(true);

  // Check if current route should show sidebar
  const showSidebar = isAuthenticated && !NO_SIDEBAR_ROUTES.includes(location.pathname);

  // Focus main content on route change (skip first render)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    mainRef.current?.focus({ preventScroll: false });
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen flex flex-col bg-background">
      {/* Skip to content link — visible on focus for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-2 focus:left-2 focus:px-4 focus:py-2 focus:bg-background focus:text-foreground focus:border focus:border-border focus:rounded-md focus:shadow-lg"
      >
        Skip to main content
      </a>

      <Header />

      <div className="flex flex-1">
        {/* Sidebar - only show on authenticated routes */}
        {showSidebar && <Sidebar />}

        {/* Main content */}
        <main
          ref={mainRef}
          id="main-content"
          tabIndex={-1}
          className={cn(
            'flex-1 outline-none',
            showSidebar ? 'lg:ml-0' : '',
            'container py-6'
          )}
        >
          {children}
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-14 md:flex-row">
          <p className="text-sm text-muted-foreground">
            Built with React, Tailwind CSS, and shadcn/ui
          </p>
        </div>
      </footer>

      <Toaster />
    </div>
  );
};
