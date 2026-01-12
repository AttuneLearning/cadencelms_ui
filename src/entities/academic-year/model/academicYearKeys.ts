/**
 * React Query keys for Academic Year, Terms, and Cohorts
 */

import type { YearFilters, TermFilters, CohortFilters } from './types';

export const academicYearKeys = {
  // Academic Years
  all: ['academic-calendar'] as const,

  years: () => [...academicYearKeys.all, 'years'] as const,
  yearsList: (filters?: YearFilters) => [...academicYearKeys.years(), 'list', filters] as const,
  year: (id: string) => [...academicYearKeys.years(), 'detail', id] as const,
  currentYear: () => [...academicYearKeys.years(), 'current'] as const,

  // Terms
  terms: () => [...academicYearKeys.all, 'terms'] as const,
  termsList: (filters?: TermFilters) => [...academicYearKeys.terms(), 'list', filters] as const,
  term: (id: string) => [...academicYearKeys.terms(), 'detail', id] as const,
  termsByYear: (yearId: string) => [...academicYearKeys.terms(), 'by-year', yearId] as const,

  // Cohorts
  cohorts: () => [...academicYearKeys.all, 'cohorts'] as const,
  cohortsList: (filters?: CohortFilters) => [...academicYearKeys.cohorts(), 'list', filters] as const,
  cohort: (id: string) => [...academicYearKeys.cohorts(), 'detail', id] as const,
  cohortsByYear: (yearId: string) => [...academicYearKeys.cohorts(), 'by-year', yearId] as const,
  cohortsByProgram: (programId: string) => [...academicYearKeys.cohorts(), 'by-program', programId] as const,
};
