/**
 * Question Bank Types
 * Entity types for Question Bank collections in Adaptive Learning system
 */

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Question Bank
 * Collections of questions for adaptive assessment
 */
export interface QuestionBank {
  id: string;
  departmentId: string;
  name: string;
  description: string | null;
  questionCount: number;
  tags: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Question Bank List Item
 * Simplified view for list displays
 */
export interface QuestionBankListItem {
  id: string;
  departmentId: string;
  name: string;
  description: string | null;
  questionCount: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Question Bank List Query Parameters
 */
export interface QuestionBankListParams {
  search?: string;
  tags?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

/**
 * Question Bank List Response
 */
export interface QuestionBankListResponse {
  questionBanks: QuestionBankListItem[];
  pagination: Pagination;
}

/**
 * Create Question Bank Payload
 */
export interface CreateQuestionBankPayload {
  name: string;
  description?: string;
  tags?: string[];
}

/**
 * Update Question Bank Payload
 */
export interface UpdateQuestionBankPayload {
  name?: string;
  description?: string;
  tags?: string[];
}
