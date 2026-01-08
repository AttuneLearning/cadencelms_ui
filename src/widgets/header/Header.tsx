import React from 'react';
import { GraduationCap } from 'lucide-react';
import { ThemeToggle } from '@/features/theme/ui/ThemeToggle';
import { Separator } from '@/shared/ui/separator';

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <a
            href="/"
            className="mr-6 flex items-center space-x-2"
            aria-label="LMS UI V2 Home"
          >
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">LMS UI V2</span>
          </a>
          <Separator orientation="vertical" className="mx-2 h-6" />
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <a
              href="/dashboard"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Dashboard
            </a>
            <a
              href="/courses"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Courses
            </a>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <nav className="flex items-center space-x-2">
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
};
