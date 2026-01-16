/**
 * Report Template Query Keys Tests
 */

import { describe, it, expect } from 'vitest';
import { reportTemplateKeys } from '../reportTemplateKeys';

describe('reportTemplateKeys', () => {
  it('should return base key array', () => {
    expect(reportTemplateKeys.all).toEqual(['report-templates']);
  });

  it('should return list key with params', () => {
    const params = { category: 'enrollment' };
    expect(reportTemplateKeys.list(params)).toEqual(['report-templates', 'list', params]);
  });

  it('should return my templates key', () => {
    expect(reportTemplateKeys.my()).toEqual(['report-templates', 'my']);
  });

  it('should return system templates key', () => {
    expect(reportTemplateKeys.system()).toEqual(['report-templates', 'system']);
  });

  it('should return detail key for specific template', () => {
    const templateId = 'template-123';
    expect(reportTemplateKeys.detail(templateId)).toEqual([
      'report-templates',
      'detail',
      templateId,
    ]);
  });

  it('should maintain proper key hierarchy', () => {
    expect(reportTemplateKeys.lists()[0]).toBe(reportTemplateKeys.all[0]);
    expect(reportTemplateKeys.details()[0]).toBe(reportTemplateKeys.all[0]);
    expect(reportTemplateKeys.my()[0]).toBe(reportTemplateKeys.all[0]);
    expect(reportTemplateKeys.system()[0]).toBe(reportTemplateKeys.all[0]);
  });
});
