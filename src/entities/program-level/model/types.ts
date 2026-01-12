/**
 * Program Level Entity Types
 * Generated from: /contracts/api/program-levels.contract.ts v1.0.0
 *
 * Types for program levels (Year 1, Year 2, etc.) within academic programs.
 * Program levels represent sequential stages within programs.
 */

/**
 * Program Level Reference
 * Minimal program info included in level details
 */
export interface ProgramLevelProgramRef {
  id: string;
  name: string;
  code: string;
  departmentId: string;
}

/**
 * Program Level
 * Full level information including program reference and courses
 */
export interface ProgramLevel {
  id: string;
  name: string;
  order: number;
  programId: string;
  program: ProgramLevelProgramRef;
  description: string | null;
  requiredCredits: number | null;
  courses: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Program Level List Item
 * Simplified level info used in list views
 */
export interface ProgramLevelListItem {
  id: string;
  name: string;
  order: number;
  programId: string;
  description: string | null;
  requiredCredits: number | null;
  courseCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create Program Level Payload
 */
export interface CreateProgramLevelPayload {
  programId: string;
  name: string;
  description?: string;
  requiredCredits?: number;
  courses?: string[];
}

/**
 * Update Program Level Payload
 */
export interface UpdateProgramLevelPayload {
  name: string;
  description?: string;
  requiredCredits?: number;
  courses?: string[];
}

/**
 * Reorder Level Payload
 */
export interface ReorderProgramLevelPayload {
  newOrder: number;
}

/**
 * Reorder Level Response Item
 */
export interface ReorderedProgramLevel {
  id: string;
  name: string;
  order: number;
}

/**
 * Reorder Level Response
 */
export interface ReorderProgramLevelResponse {
  updatedLevels: ReorderedProgramLevel[];
}

/**
 * Program Level Form Data
 * Used for creating/updating program levels in forms
 */
export interface ProgramLevelFormData {
  name: string;
  description?: string;
  requiredCredits?: number;
  courses?: string[];
}
