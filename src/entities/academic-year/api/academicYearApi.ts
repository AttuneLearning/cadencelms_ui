/**
 * Academic Year API Client
 * Implements endpoints from academic-years.contract.ts v1.0.0
 *
 * Covers:
 * - Academic Years (CRUD + list)
 * - Academic Terms (CRUD + list)
 * - Cohorts/Year Groups (CRUD + list)
 */

import { client } from '@/shared/api/client';
import type {
  AcademicYear,
  CreateYearPayload,
  UpdateYearPayload,
  YearFilters,
  YearsListResponse,
  Term,
  CreateTermPayload,
  UpdateTermPayload,
  TermFilters,
  TermsListResponse,
  Cohort,
  CreateCohortPayload,
  UpdateCohortPayload,
  CohortFilters,
  CohortsListResponse,
} from '../model/types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// =====================
// ACADEMIC YEARS
// =====================

/**
 * GET /api/v2/calendar/years - List all academic years
 */
export async function listYears(filters?: YearFilters): Promise<YearsListResponse> {
  const response = await client.get<ApiResponse<YearsListResponse>>(
    '/api/v2/calendar/years',
    { params: filters }
  );
  return response.data.data;
}

/**
 * GET /api/v2/calendar/years/:id - Get academic year details
 */
export async function getYear(id: string, includeTerms?: boolean): Promise<AcademicYear> {
  const response = await client.get<ApiResponse<AcademicYear>>(
    `/api/v2/calendar/years/${id}`,
    { params: { includeTerms } }
  );
  return response.data.data;
}

/**
 * POST /api/v2/calendar/years - Create new academic year
 */
export async function createYear(payload: CreateYearPayload): Promise<AcademicYear> {
  const response = await client.post<ApiResponse<AcademicYear>>(
    '/api/v2/calendar/years',
    payload
  );
  return response.data.data;
}

/**
 * PUT /api/v2/calendar/years/:id - Update academic year
 */
export async function updateYear(id: string, payload: UpdateYearPayload): Promise<AcademicYear> {
  const response = await client.put<ApiResponse<AcademicYear>>(
    `/api/v2/calendar/years/${id}`,
    payload
  );
  return response.data.data;
}

/**
 * DELETE /api/v2/calendar/years/:id - Delete academic year
 */
export async function deleteYear(id: string): Promise<void> {
  await client.delete(`/api/v2/calendar/years/${id}`);
}

// =====================
// ACADEMIC TERMS
// =====================

/**
 * GET /api/v2/calendar/terms - List all academic terms
 */
export async function listTerms(filters?: TermFilters): Promise<TermsListResponse> {
  const response = await client.get<ApiResponse<TermsListResponse>>(
    '/api/v2/calendar/terms',
    { params: filters }
  );
  return response.data.data;
}

/**
 * GET /api/v2/calendar/terms/:id - Get term details
 */
export async function getTerm(id: string, includeClasses?: boolean): Promise<Term> {
  const response = await client.get<ApiResponse<Term>>(
    `/api/v2/calendar/terms/${id}`,
    { params: { includeClasses } }
  );
  return response.data.data;
}

/**
 * POST /api/v2/calendar/terms - Create new term
 */
export async function createTerm(payload: CreateTermPayload): Promise<Term> {
  const response = await client.post<ApiResponse<Term>>(
    '/api/v2/calendar/terms',
    payload
  );
  return response.data.data;
}

/**
 * PUT /api/v2/calendar/terms/:id - Update term
 */
export async function updateTerm(id: string, payload: UpdateTermPayload): Promise<Term> {
  const response = await client.put<ApiResponse<Term>>(
    `/api/v2/calendar/terms/${id}`,
    payload
  );
  return response.data.data;
}

/**
 * DELETE /api/v2/calendar/terms/:id - Delete term
 */
export async function deleteTerm(id: string): Promise<void> {
  await client.delete(`/api/v2/calendar/terms/${id}`);
}

// =====================
// COHORTS (YEAR GROUPS)
// =====================

/**
 * GET /api/v2/calendar/cohorts - List all cohorts
 */
export async function listCohorts(filters?: CohortFilters): Promise<CohortsListResponse> {
  const response = await client.get<ApiResponse<CohortsListResponse>>(
    '/api/v2/calendar/cohorts',
    { params: filters }
  );
  return response.data.data;
}

/**
 * GET /api/v2/calendar/cohorts/:id - Get cohort details
 */
export async function getCohort(id: string, includeLearners?: boolean): Promise<Cohort> {
  const response = await client.get<ApiResponse<Cohort>>(
    `/api/v2/calendar/cohorts/${id}`,
    { params: { includeLearners } }
  );
  return response.data.data;
}

/**
 * POST /api/v2/calendar/cohorts - Create new cohort
 */
export async function createCohort(payload: CreateCohortPayload): Promise<Cohort> {
  const response = await client.post<ApiResponse<Cohort>>(
    '/api/v2/calendar/cohorts',
    payload
  );
  return response.data.data;
}

/**
 * PUT /api/v2/calendar/cohorts/:id - Update cohort
 */
export async function updateCohort(id: string, payload: UpdateCohortPayload): Promise<Cohort> {
  const response = await client.put<ApiResponse<Cohort>>(
    `/api/v2/calendar/cohorts/${id}`,
    payload
  );
  return response.data.data;
}

/**
 * DELETE /api/v2/calendar/cohorts/:id - Delete cohort
 */
export async function deleteCohort(id: string): Promise<void> {
  await client.delete(`/api/v2/calendar/cohorts/${id}`);
}
