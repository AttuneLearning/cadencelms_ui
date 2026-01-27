/**
 * Cognitive Depth API Client
 * API operations for cognitive depth level management
 */

import { client } from '@/shared/api/client';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}
import type {
  CognitiveDepthLevel,
  CourseDepthLevelsResponse,
  DepthOverridePayload,
  ResetOverridesPayload,
} from '../model/types';

/**
 * GET /cognitive-depth-levels - Get system default depth levels
 */
export async function getSystemDepthLevels(): Promise<CognitiveDepthLevel[]> {
  const response = await client.get<ApiResponse<CognitiveDepthLevel[]>>(
    '/cognitive-depth-levels'
  );
  return response.data.data;
}

/**
 * GET /departments/:departmentId/cognitive-depth-levels - Get department depth levels
 * Merges system defaults with department overrides
 */
export async function getDepartmentDepthLevels(
  departmentId: string
): Promise<CognitiveDepthLevel[]> {
  const response = await client.get<ApiResponse<CognitiveDepthLevel[]>>(
    `/departments/${departmentId}/cognitive-depth-levels`
  );
  return response.data.data;
}

/**
 * GET /courses/:courseId/cognitive-depth-levels - Get course depth levels
 * Merges system → department → course overrides
 */
export async function getCourseDepthLevels(
  courseId: string
): Promise<CourseDepthLevelsResponse> {
  const response = await client.get<ApiResponse<CourseDepthLevelsResponse>>(
    `/courses/${courseId}/cognitive-depth-levels`
  );
  return response.data.data;
}

/**
 * PUT /courses/:courseId/cognitive-depth-levels/:slug - Override course depth level
 */
export async function overrideCourseDepthLevel(
  courseId: string,
  slug: string,
  payload: DepthOverridePayload
): Promise<CognitiveDepthLevel> {
  const response = await client.put<ApiResponse<CognitiveDepthLevel>>(
    `/courses/${courseId}/cognitive-depth-levels/${slug}`,
    payload
  );
  return response.data.data;
}

/**
 * POST /courses/:courseId/cognitive-depth-levels/reset - Reset course overrides
 */
export async function resetCourseDepthOverrides(
  courseId: string,
  payload: ResetOverridesPayload
): Promise<void> {
  await client.post(
    `/courses/${courseId}/cognitive-depth-levels/reset`,
    payload
  );
}
