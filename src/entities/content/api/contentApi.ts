/**
 * Content API functions
 * Handles all content-related API calls
 */

import { client } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';
import type { ApiResponse, PaginatedResponse, QueryParams } from '@/shared/api/types';
import type {
  Content,
  CreateContentPayload,
  UpdateContentPayload,
  ContentFilterParams,
} from '../model/types';

/**
 * Fetch a single content item by ID
 */
export async function getContent(id: string): Promise<Content> {
  const response = await client.get<ApiResponse<Content>>(endpoints.content.byId(id));
  return response.data.data;
}

/**
 * Fetch a list of content items with optional filtering and pagination
 */
export async function getContentList(
  params?: ContentFilterParams & QueryParams
): Promise<PaginatedResponse<Content>> {
  const response = await client.get<PaginatedResponse<Content>>(
    endpoints.content.scormPackages,
    {
      params,
    }
  );
  return response.data;
}

/**
 * Fetch content items by course ID
 */
export async function getContentByCourseId(
  courseId: string,
  params?: QueryParams
): Promise<PaginatedResponse<Content>> {
  const response = await client.get<PaginatedResponse<Content>>(
    endpoints.content.scormPackages,
    {
      params: {
        ...params,
        courseId,
      },
    }
  );
  return response.data;
}

/**
 * Fetch content items by lesson ID
 */
export async function getContentByLessonId(
  lessonId: string,
  params?: QueryParams
): Promise<PaginatedResponse<Content>> {
  const response = await client.get<PaginatedResponse<Content>>(
    endpoints.content.scormPackages,
    {
      params: {
        ...params,
        lessonId,
      },
    }
  );
  return response.data;
}

/**
 * Create a new content item
 */
export async function createContent(
  payload: CreateContentPayload
): Promise<Content> {
  const response = await client.post<ApiResponse<Content>>(
    endpoints.content.scormPackages,
    payload
  );
  return response.data.data;
}

/**
 * Update an existing content item
 */
export async function updateContent(
  id: string,
  payload: UpdateContentPayload
): Promise<Content> {
  const response = await client.put<ApiResponse<Content>>(
    endpoints.content.byId(id),
    payload
  );
  return response.data.data;
}

/**
 * Delete a content item
 */
export async function deleteContent(id: string): Promise<void> {
  await client.delete(endpoints.content.byId(id));
}

/**
 * Upload a SCORM package
 */
export async function uploadScormPackage(
  file: File,
  onProgress?: (progress: number) => void
): Promise<Content> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await client.post<ApiResponse<Content>>(
    endpoints.content.uploadScorm,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    }
  );

  return response.data.data;
}

/**
 * Search content by query string
 */
export async function searchContent(
  query: string,
  params?: ContentFilterParams & QueryParams
): Promise<PaginatedResponse<Content>> {
  const response = await client.get<PaginatedResponse<Content>>(
    endpoints.content.scormPackages,
    {
      params: {
        ...params,
        search: query,
      },
    }
  );
  return response.data;
}

/**
 * Get content by tags
 */
export async function getContentByTags(
  tags: string[],
  params?: QueryParams
): Promise<PaginatedResponse<Content>> {
  const response = await client.get<PaginatedResponse<Content>>(
    endpoints.content.scormPackages,
    {
      params: {
        ...params,
        tags: tags.join(','),
      },
    }
  );
  return response.data;
}
