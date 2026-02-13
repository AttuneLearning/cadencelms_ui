/**
 * Calendar Event API Client
 * Implements calendar feed endpoints
 *
 * Endpoint base: /api/v2/calendar
 */

import { client } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';
import type {
  CalendarFeedFilters,
  CalendarFeedResponse,
  CalendarReminder,
  CreateReminderPayload,
} from '../model/types';

interface ApiResponse<T> {
  status: 'success' | 'error';
  data: T;
  message?: string;
}

/**
 * GET /api/v2/calendar/learner - Fetch learner calendar feed
 */
export async function fetchLearnerFeed(
  filters: CalendarFeedFilters
): Promise<CalendarFeedResponse> {
  const response = await client.get<ApiResponse<CalendarFeedResponse>>(
    endpoints.calendar.learner,
    { params: filters }
  );
  return response.data.data;
}

/**
 * GET /api/v2/calendar/staff - Fetch staff calendar feed
 */
export async function fetchStaffFeed(
  filters: CalendarFeedFilters
): Promise<CalendarFeedResponse> {
  const response = await client.get<ApiResponse<CalendarFeedResponse>>(
    endpoints.calendar.staff,
    { params: filters }
  );
  return response.data.data;
}

/**
 * GET /api/v2/calendar/system - Fetch system calendar feed
 */
export async function fetchSystemFeed(
  filters: CalendarFeedFilters
): Promise<CalendarFeedResponse> {
  const response = await client.get<ApiResponse<CalendarFeedResponse>>(
    endpoints.calendar.system,
    { params: filters }
  );
  return response.data.data;
}

/**
 * POST /api/v2/calendar/reminders - Create a reminder
 */
export async function createReminder(
  payload: CreateReminderPayload
): Promise<CalendarReminder> {
  const response = await client.post<ApiResponse<CalendarReminder>>(
    endpoints.calendar.reminders,
    payload
  );
  return response.data.data;
}

/**
 * DELETE /api/v2/calendar/reminders/:id - Delete a reminder
 */
export async function deleteReminder(id: string): Promise<void> {
  await client.delete(`${endpoints.calendar.reminders}/${id}`);
}
