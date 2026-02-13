import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { env } from '@/shared/config/env';
import { server } from '@/test/mocks/server';
import {
  updateMatchingExercise,
  updateMatchingPairs,
} from '../matchingBuilderApi';

describe('matchingBuilderApi canonical update routes', () => {
  const baseUrl = env.apiFullUrl;
  const exerciseId = 'exercise-1';

  beforeEach(() => {
    server.resetHandlers();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  it('updates matching exercise via canonical /content/exercises/:id/matching route', async () => {
    let capturedBody: Record<string, unknown> | null = null;

    server.use(
      http.put(`${baseUrl}/content/exercises/${exerciseId}/matching`, async ({ request }) => {
        capturedBody = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({
          data: {
            id: exerciseId,
            moduleId: 'module-1',
            questionId: 'question-1',
            title: 'Updated Matching',
            instructions: 'Match the pairs',
            pairs: [],
            settings: {
              shufflePairs: true,
              timeLimit: 0,
              attemptsAllowed: 0,
              showFeedback: true,
              pointsPerMatch: 1,
            },
            tags: [],
            createdAt: '2026-02-13T00:00:00.000Z',
            updatedAt: '2026-02-13T00:00:00.000Z',
          },
        });
      })
    );

    const result = await updateMatchingExercise('module-ignored', exerciseId, {
      title: 'Updated Matching',
    });

    expect(capturedBody).toEqual({ title: 'Updated Matching' });
    expect(result.id).toBe(exerciseId);
  });

  it('updates matching pairs via canonical /content/exercises/:id/matching route', async () => {
    let capturedBody: Record<string, unknown> | null = null;

    server.use(
      http.put(`${baseUrl}/content/exercises/${exerciseId}/matching`, async ({ request }) => {
        capturedBody = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({
          data: [
            {
              id: 'pair-1',
              left: { text: 'A' },
              right: { text: '1' },
              sequence: 1,
            },
          ],
        });
      })
    );

    const result = await updateMatchingPairs('module-ignored', exerciseId, {
      pairs: [
        {
          left: { text: 'A' },
          right: { text: '1' },
        },
      ],
    });

    expect(capturedBody).toEqual({
      pairs: [{ left: { text: 'A' }, right: { text: '1' } }],
    });
    expect(result).toHaveLength(1);
  });
});
