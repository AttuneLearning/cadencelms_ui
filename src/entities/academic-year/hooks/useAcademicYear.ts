/**
 * React Query hooks for Academic Year, Terms, and Cohorts
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import {
  listYears,
  getYear,
  createYear,
  updateYear,
  deleteYear,
  listTerms,
  getTerm,
  createTerm,
  updateTerm,
  deleteTerm,
  listCohorts,
  getCohort,
  createCohort,
  updateCohort,
  deleteCohort,
} from '../api/academicYearApi';
import { academicYearKeys } from '../model/academicYearKeys';
import type {
  AcademicYear,
  YearFilters,
  YearsListResponse,
  CreateYearPayload,
  UpdateYearPayload,
  Term,
  TermFilters,
  TermsListResponse,
  CreateTermPayload,
  UpdateTermPayload,
  Cohort,
  CohortFilters,
  CohortsListResponse,
  CreateCohortPayload,
  UpdateCohortPayload,
} from '../model/types';

// =====================
// ACADEMIC YEARS HOOKS
// =====================

/**
 * Hook to fetch list of academic years
 */
export function useAcademicYears(
  filters?: YearFilters,
  options?: Omit<
    UseQueryOptions<YearsListResponse, Error, YearsListResponse, ReturnType<typeof academicYearKeys.yearsList>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: academicYearKeys.yearsList(filters),
    queryFn: () => listYears(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Hook to fetch single academic year
 */
export function useAcademicYear(
  id: string,
  includeTerms?: boolean,
  options?: Omit<
    UseQueryOptions<AcademicYear, Error, AcademicYear, ReturnType<typeof academicYearKeys.year>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: academicYearKeys.year(id),
    queryFn: () => getYear(id, includeTerms),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * Hook to get current academic year
 * Uses isCurrent filter to find the active year
 */
export function useCurrentAcademicYear(
  options?: Omit<
    UseQueryOptions<AcademicYear | null, Error, AcademicYear | null, ReturnType<typeof academicYearKeys.currentYear>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: academicYearKeys.currentYear(),
    queryFn: async () => {
      const result = await listYears({ isCurrent: true, limit: 1 });
      return result.years[0] || null;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
}

/**
 * Hook to create academic year
 */
export function useCreateAcademicYear() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateYearPayload) => createYear(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicYearKeys.years() });
      queryClient.invalidateQueries({ queryKey: academicYearKeys.currentYear() });
    },
  });
}

/**
 * Hook to update academic year
 */
export function useUpdateAcademicYear() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateYearPayload }) =>
      updateYear(id, payload),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(academicYearKeys.year(variables.id), data);
      queryClient.invalidateQueries({ queryKey: academicYearKeys.years() });
      queryClient.invalidateQueries({ queryKey: academicYearKeys.currentYear() });
    },
  });
}

/**
 * Hook to delete academic year
 */
export function useDeleteAcademicYear() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteYear(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicYearKeys.years() });
      queryClient.invalidateQueries({ queryKey: academicYearKeys.currentYear() });
    },
  });
}

// =====================
// ACADEMIC TERMS HOOKS
// =====================

/**
 * Hook to fetch list of terms
 */
export function useTerms(
  filters?: TermFilters,
  options?: Omit<
    UseQueryOptions<TermsListResponse, Error, TermsListResponse, ReturnType<typeof academicYearKeys.termsList>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: academicYearKeys.termsList(filters),
    queryFn: () => listTerms(filters),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * Hook to fetch terms for a specific academic year
 */
export function useTermsByYear(
  yearId: string,
  options?: Omit<
    UseQueryOptions<TermsListResponse, Error, TermsListResponse, ReturnType<typeof academicYearKeys.termsByYear>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: academicYearKeys.termsByYear(yearId),
    queryFn: () => listTerms({ academicYear: yearId }),
    enabled: !!yearId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * Hook to fetch single term
 */
export function useTerm(
  id: string,
  includeClasses?: boolean,
  options?: Omit<
    UseQueryOptions<Term, Error, Term, ReturnType<typeof academicYearKeys.term>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: academicYearKeys.term(id),
    queryFn: () => getTerm(id, includeClasses),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * Hook to create term
 */
export function useCreateTerm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTermPayload) => createTerm(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: academicYearKeys.terms() });
      queryClient.invalidateQueries({ queryKey: academicYearKeys.year(data.academicYear.id) });
      queryClient.invalidateQueries({ queryKey: academicYearKeys.termsByYear(data.academicYear.id) });
    },
  });
}

/**
 * Hook to update term
 */
export function useUpdateTerm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTermPayload }) =>
      updateTerm(id, payload),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(academicYearKeys.term(variables.id), data);
      queryClient.invalidateQueries({ queryKey: academicYearKeys.terms() });
      queryClient.invalidateQueries({ queryKey: academicYearKeys.year(data.academicYear.id) });
      queryClient.invalidateQueries({ queryKey: academicYearKeys.termsByYear(data.academicYear.id) });
    },
  });
}

/**
 * Hook to delete term
 */
export function useDeleteTerm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTerm(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicYearKeys.terms() });
      queryClient.invalidateQueries({ queryKey: academicYearKeys.years() });
    },
  });
}

// =====================
// COHORTS HOOKS
// =====================

/**
 * Hook to fetch list of cohorts
 */
export function useCohorts(
  filters?: CohortFilters,
  options?: Omit<
    UseQueryOptions<CohortsListResponse, Error, CohortsListResponse, ReturnType<typeof academicYearKeys.cohortsList>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: academicYearKeys.cohortsList(filters),
    queryFn: () => listCohorts(filters),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * Hook to fetch cohorts for a specific academic year
 */
export function useCohortsByYear(
  yearId: string,
  options?: Omit<
    UseQueryOptions<CohortsListResponse, Error, CohortsListResponse, ReturnType<typeof academicYearKeys.cohortsByYear>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: academicYearKeys.cohortsByYear(yearId),
    queryFn: () => listCohorts({ academicYear: yearId }),
    enabled: !!yearId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * Hook to fetch cohorts for a specific program
 */
export function useCohortsByProgram(
  programId: string,
  options?: Omit<
    UseQueryOptions<CohortsListResponse, Error, CohortsListResponse, ReturnType<typeof academicYearKeys.cohortsByProgram>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: academicYearKeys.cohortsByProgram(programId),
    queryFn: () => listCohorts({ program: programId }),
    enabled: !!programId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * Hook to fetch single cohort
 */
export function useCohort(
  id: string,
  includeLearners?: boolean,
  options?: Omit<
    UseQueryOptions<Cohort, Error, Cohort, ReturnType<typeof academicYearKeys.cohort>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: academicYearKeys.cohort(id),
    queryFn: () => getCohort(id, includeLearners),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * Hook to create cohort
 */
export function useCreateCohort() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCohortPayload) => createCohort(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: academicYearKeys.cohorts() });
      queryClient.invalidateQueries({ queryKey: academicYearKeys.cohortsByYear(data.academicYear.id) });
      queryClient.invalidateQueries({ queryKey: academicYearKeys.cohortsByProgram(data.program.id) });
    },
  });
}

/**
 * Hook to update cohort
 */
export function useUpdateCohort() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCohortPayload }) =>
      updateCohort(id, payload),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(academicYearKeys.cohort(variables.id), data);
      queryClient.invalidateQueries({ queryKey: academicYearKeys.cohorts() });
      queryClient.invalidateQueries({ queryKey: academicYearKeys.cohortsByYear(data.academicYear.id) });
      queryClient.invalidateQueries({ queryKey: academicYearKeys.cohortsByProgram(data.program.id) });
    },
  });
}

/**
 * Hook to delete cohort
 */
export function useDeleteCohort() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCohort(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicYearKeys.cohorts() });
    },
  });
}
