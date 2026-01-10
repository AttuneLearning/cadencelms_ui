/**
 * CourseModules Component
 * Display course modules with collapsible sections
 */

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import type { CourseSegmentListItem } from '@/entities/course-segment';

interface CourseModulesProps {
  modules: CourseSegmentListItem[];
}

export const CourseModules: React.FC<CourseModulesProps> = ({ modules }) => {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

  if (modules.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-4" />
            <p>No modules available yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Content</CardTitle>
        <p className="text-sm text-muted-foreground">
          {modules.length} {modules.length === 1 ? 'module' : 'modules'}
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        {modules.map((module, index) => {
          const isExpanded = expandedModules.has(module.id);
          return (
            <div
              key={module.id}
              className="border rounded-lg hover:bg-accent/50 transition-colors"
            >
              <button
                onClick={() => toggleModule(module.id)}
                className="w-full flex items-center gap-3 p-4 text-left"
              >
                <div className="flex-shrink-0">
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5" />
                  ) : (
                    <ChevronRight className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2">
                    <span className="text-sm text-muted-foreground font-medium">
                      {index + 1}.
                    </span>
                    <div className="flex-1">
                      <h4 className="font-medium">{module.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {module.type}
                        </Badge>
                        {module.isPublished && (
                          <Badge variant="secondary" className="text-xs">
                            Published
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </button>
              {isExpanded && (
                <div className="px-4 pb-4 pl-12 text-sm text-muted-foreground">
                  <p>Module {index + 1}: {module.title}</p>
                  <p className="text-xs mt-1">Type: {module.type}</p>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
