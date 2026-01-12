/**
 * NavLink Component
 * Reusable navigation link component with active state detection
 * Version: 2.0.0
 * Date: 2026-01-10
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/shared/lib/utils';

// ============================================================================
// Props Interface
// ============================================================================

interface NavLinkProps {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
  disabled?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export const NavLink: React.FC<NavLinkProps> = ({ label, path, icon: Icon, onClick, disabled = false }) => {
  const location = useLocation();

  // Determine if this link is active
  // Active if current path matches exactly or starts with the link path followed by '/'
  const isActive =
    location.pathname === path || location.pathname.startsWith(path + '/');

  // Disabled links render as non-interactive divs
  if (disabled) {
    return (
      <div
        className={cn(
          'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium',
          'opacity-50 cursor-not-allowed text-muted-foreground'
        )}
      >
        <Icon className="h-5 w-5 flex-shrink-0" />
        <span className="truncate">{label}</span>
      </div>
    );
  }

  return (
    <Link
      to={path}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
        'hover:bg-accent hover:text-accent-foreground',
        isActive
          ? 'bg-accent text-accent-foreground'
          : 'text-muted-foreground'
      )}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      <span className="truncate">{label}</span>
    </Link>
  );
};
