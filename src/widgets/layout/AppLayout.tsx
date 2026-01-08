import React from 'react';
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

  // Check if current route should show sidebar
  const showSidebar = isAuthenticated && !NO_SIDEBAR_ROUTES.includes(location.pathname);

  return (
    <div className="relative min-h-screen flex flex-col bg-background">
      <Header />

      <div className="flex flex-1">
        {/* Sidebar - only show on authenticated routes */}
        {showSidebar && <Sidebar />}

        {/* Main content */}
        <main
          className={cn(
            'flex-1',
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
