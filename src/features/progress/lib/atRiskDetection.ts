/**
 * At-Risk Detection Logic
 * Determines if a student is at risk based on various factors
 */

import { differenceInDays } from 'date-fns';

export interface StudentMetrics {
  progress: number;
  lastActivity: string | null;
  avgScore: number;
  enrollmentDays: number;
}

export interface RiskAssessment {
  isAtRisk: boolean;
  riskFactors: string[];
  severity: 'low' | 'medium' | 'high';
}

/**
 * Determines if a student is at risk and identifies risk factors
 */
export function assessStudentRisk(metrics: StudentMetrics): RiskAssessment {
  const riskFactors: string[] = [];
  let riskScore = 0;

  // Factor 1: Inactivity (no activity for 7+ days)
  if (metrics.lastActivity) {
    const daysSinceActivity = differenceInDays(new Date(), new Date(metrics.lastActivity));

    if (daysSinceActivity > 14) {
      riskFactors.push(`No activity for ${daysSinceActivity} days`);
      riskScore += 3;
    } else if (daysSinceActivity > 7) {
      riskFactors.push(`Inactive for ${daysSinceActivity} days`);
      riskScore += 2;
    }
  } else {
    riskFactors.push('No recorded activity');
    riskScore += 2;
  }

  // Factor 2: Low average score (below 60%)
  if (metrics.avgScore < 50) {
    riskFactors.push('Very low scores (below 50%)');
    riskScore += 3;
  } else if (metrics.avgScore < 60) {
    riskFactors.push('Low scores (below 60%)');
    riskScore += 2;
  }

  // Factor 3: Progress rate (less than expected based on enrollment time)
  const expectedProgress = Math.min(100, (metrics.enrollmentDays / 90) * 100); // Expect completion in ~90 days
  const progressRate = metrics.progress / (metrics.enrollmentDays || 1);

  if (progressRate < 0.5 && metrics.progress < 20) {
    riskFactors.push('Very slow progress');
    riskScore += 3;
  } else if (progressRate < 1.0 && metrics.progress < expectedProgress - 20) {
    riskFactors.push('Behind schedule');
    riskScore += 2;
  }

  // Factor 4: Very low overall progress (below 10%)
  if (metrics.progress < 5 && metrics.enrollmentDays > 7) {
    riskFactors.push('Minimal progress');
    riskScore += 2;
  }

  // Determine severity based on total risk score
  let severity: 'low' | 'medium' | 'high' = 'low';
  if (riskScore >= 5) {
    severity = 'high';
  } else if (riskScore >= 3) {
    severity = 'medium';
  }

  return {
    isAtRisk: riskFactors.length > 0,
    riskFactors,
    severity,
  };
}

/**
 * Calculate days since enrollment
 */
export function calculateEnrollmentDays(enrolledAt: string): number {
  return Math.max(1, differenceInDays(new Date(), new Date(enrolledAt)));
}
