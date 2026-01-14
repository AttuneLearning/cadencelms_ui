/**
 * CollapsibleSection Component
 * Reusable collapsible wrapper for profile form sections
 */

import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface CollapsibleSectionProps {
  title: string;
  badge?: React.ReactNode;
  defaultExpanded?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function CollapsibleSection({
  title,
  badge,
  defaultExpanded = false,
  children,
  className,
}: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className={cn('border rounded-lg overflow-hidden', className)}>
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="h-5 w-5 text-gray-600" />
          ) : (
            <ChevronRight className="h-5 w-5 text-gray-600" />
          )}
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {badge && <div className="ml-2">{badge}</div>}
        </div>
      </button>

      {isExpanded && (
        <div className="p-6 space-y-4 bg-white">
          {children}
        </div>
      )}
    </div>
  );
}
