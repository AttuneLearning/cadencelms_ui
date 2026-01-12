/**
 * Grading Utilities
 * Functions for calculating grade letters and colors
 */

/**
 * Calculate grade letter from percentage
 * Default grading scale:
 * A: 90-100%
 * B: 80-89%
 * C: 70-79%
 * D: 60-69%
 * F: 0-59%
 */
export function calculateGradeLetter(percentage: number): string {
  if (percentage >= 90) return 'A';
  if (percentage >= 80) return 'B';
  if (percentage >= 70) return 'C';
  if (percentage >= 60) return 'D';
  return 'F';
}

/**
 * Get color based on grade letter for UI display
 */
export function getGradeColor(
  grade: string
): 'success' | 'info' | 'warning' | 'orange' | 'error' | 'default' {
  const upperGrade = grade.toUpperCase();

  switch (upperGrade) {
    case 'A':
      return 'success';
    case 'B':
      return 'info';
    case 'C':
      return 'warning';
    case 'D':
      return 'orange';
    case 'F':
      return 'error';
    default:
      return 'default';
  }
}

/**
 * Determine if a grade is passing (not F)
 */
export function isPassingGrade(grade: string): boolean {
  const upperGrade = grade.toUpperCase();
  return ['A', 'B', 'C', 'D'].includes(upperGrade);
}

/**
 * Get grade description text
 */
export function getGradeDescription(grade: string): string {
  const upperGrade = grade.toUpperCase();

  switch (upperGrade) {
    case 'A':
      return 'Excellent';
    case 'B':
      return 'Good';
    case 'C':
      return 'Satisfactory';
    case 'D':
      return 'Needs Improvement';
    case 'F':
      return 'Failing';
    default:
      return 'Not Graded';
  }
}
