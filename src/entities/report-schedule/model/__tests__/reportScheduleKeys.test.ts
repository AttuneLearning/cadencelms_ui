/**
 * Report Schedule Query Keys Tests
 */

import { describe, it, expect } from 'vitest';
import { reportScheduleKeys } from '../reportScheduleKeys';

describe('reportScheduleKeys', () => {
  it('should return base key array', () => {
    expect(reportScheduleKeys.all).toEqual(['report-schedules']);
  });

  it('should return list key with params', () => {
    const params = { isActive: true };
    expect(reportScheduleKeys.list(params)).toEqual(['report-schedules', 'list', params]);
  });

  it('should return detail key for specific schedule', () => {
    const scheduleId = 'schedule-123';
    expect(reportScheduleKeys.detail(scheduleId)).toEqual([
      'report-schedules',
      'detail',
      scheduleId,
    ]);
  });

  it('should maintain proper key hierarchy', () => {
    expect(reportScheduleKeys.lists()[0]).toBe(reportScheduleKeys.all[0]);
    expect(reportScheduleKeys.details()[0]).toBe(reportScheduleKeys.all[0]);

    const scheduleId = 'test-schedule';
    const detailKey = reportScheduleKeys.detail(scheduleId);
    expect(detailKey[0]).toBe('report-schedules');
    expect(detailKey[1]).toBe('detail');
    expect(detailKey[2]).toBe(scheduleId);
  });
});
