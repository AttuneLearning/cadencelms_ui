import React from 'react';
import { Header } from '@/widgets/header/Header';
import { Toaster } from '@/shared/ui/toaster';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="relative min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container py-6">{children}</main>
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
