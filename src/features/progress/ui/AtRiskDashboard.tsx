/**
 * AtRiskDashboard Component
 * Dashboard widget showing at-risk students with quick intervention options
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Progress } from '@/shared/ui/progress';
import { AlertTriangle, Eye, Mail } from 'lucide-react';

export interface AtRiskStudent {
  id: string;
  name: string;
  email: string;
  progress: number;
  lastActivity: string;
  avgScore: number;
  riskFactors: string[];
}

export interface AtRiskDashboardProps {
  students: AtRiskStudent[];
  onViewStudent?: (studentId: string) => void;
  onContactStudent?: (studentId: string) => void;
}

export const AtRiskDashboard: React.FC<AtRiskDashboardProps> = ({
  students,
  onViewStudent,
  onContactStudent,
}) => {
  // Sort students by number of risk factors (most at-risk first)
  const sortedStudents = [...students].sort(
    (a, b) => b.riskFactors.length - a.riskFactors.length
  );

  const getSeverityColor = (riskCount: number) => {
    if (riskCount >= 3) return 'destructive';
    if (riskCount >= 2) return 'destructive';
    return 'secondary';
  };

  if (students.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            At-Risk Students
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No at-risk students at this time. Great job!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          At-Risk Students ({students.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedStudents.map((student) => (
          <Card
            key={student.id}
            className="border-l-4 border-l-destructive"
            role="article"
          >
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold">{student.name}</h4>
                  <p className="text-sm text-muted-foreground">{student.email}</p>
                </div>
                <Badge variant={getSeverityColor(student.riskFactors.length)}>
                  {student.riskFactors.length} Risk{student.riskFactors.length !== 1 ? 's' : ''}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{student.progress}%</span>
                </div>
                <Progress value={student.progress} className="h-2" />
              </div>

              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Risk Factors:</p>
                <div className="flex flex-wrap gap-1">
                  {student.riskFactors.map((factor, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {factor}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                {onViewStudent && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => onViewStudent(student.id)}
                  >
                    <Eye className="h-3 w-3 mr-2" />
                    View
                  </Button>
                )}
                {onContactStudent && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => onContactStudent(student.id)}
                  >
                    <Mail className="h-3 w-3 mr-2" />
                    Contact
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
};
