/**
 * Tests for Person Helper Functions
 * TDD RED Phase - Tests written before implementation
 */

import { describe, it, expect } from 'vitest';
import {
  getPrimaryEmail,
  getPrimaryPhone,
  getPrimaryAddress,
  getDisplayName,
  getFullLegalName,
  formatPhoneNumber,
} from '../person-helpers';
import type { IPerson, IPhone } from '@/shared/types/person';
import {
  mockPersonWithAllFields,
  mockPersonMinimal,
  mockPersonNoPrimary,
  mockPrimaryEmail,
  mockSecondaryEmail,
  mockPrimaryPhone,
  mockSecondaryPhone,
  mockPrimaryAddress,
  mockSecondaryAddress,
} from '@/test/fixtures/person.fixtures';

describe('person-helpers', () => {
  describe('getPrimaryEmail', () => {
    it('should return the primary email when one exists', () => {
      const result = getPrimaryEmail(mockPersonWithAllFields);

      expect(result).toBeDefined();
      expect(result?.isPrimary).toBe(true);
      expect(result?.email).toBe(mockPrimaryEmail.email);
    });

    it('should return undefined when no primary email exists', () => {
      const result = getPrimaryEmail(mockPersonNoPrimary);

      expect(result).toBeUndefined();
    });

    it('should return undefined when emails array is empty', () => {
      const person: IPerson = {
        ...mockPersonMinimal,
        emails: [],
      };

      const result = getPrimaryEmail(person);

      expect(result).toBeUndefined();
    });

    it('should return the first email marked as primary when multiple exist', () => {
      const person: IPerson = {
        ...mockPersonMinimal,
        emails: [
          { ...mockSecondaryEmail, isPrimary: true },
          { ...mockPrimaryEmail, isPrimary: true },
        ],
      };

      const result = getPrimaryEmail(person);

      expect(result).toBeDefined();
      expect(result?.email).toBe(mockSecondaryEmail.email);
    });

    it('should handle null person gracefully', () => {
      const result = getPrimaryEmail(null as any);

      expect(result).toBeUndefined();
    });

    it('should handle undefined emails array', () => {
      const person: IPerson = {
        ...mockPersonMinimal,
        emails: undefined as any,
      };

      const result = getPrimaryEmail(person);

      expect(result).toBeUndefined();
    });
  });

  describe('getPrimaryPhone', () => {
    it('should return the primary phone when one exists', () => {
      const result = getPrimaryPhone(mockPersonWithAllFields);

      expect(result).toBeDefined();
      expect(result?.isPrimary).toBe(true);
      expect(result?.number).toBe(mockPrimaryPhone.number);
    });

    it('should return undefined when no primary phone exists', () => {
      const result = getPrimaryPhone(mockPersonNoPrimary);

      expect(result).toBeUndefined();
    });

    it('should return undefined when phones array is empty', () => {
      const person: IPerson = {
        ...mockPersonMinimal,
        phones: [],
      };

      const result = getPrimaryPhone(person);

      expect(result).toBeUndefined();
    });

    it('should return the first phone marked as primary when multiple exist', () => {
      const person: IPerson = {
        ...mockPersonMinimal,
        phones: [
          { ...mockSecondaryPhone, isPrimary: true },
          { ...mockPrimaryPhone, isPrimary: true },
        ],
      };

      const result = getPrimaryPhone(person);

      expect(result).toBeDefined();
      expect(result?.number).toBe(mockSecondaryPhone.number);
    });

    it('should handle null person gracefully', () => {
      const result = getPrimaryPhone(null as any);

      expect(result).toBeUndefined();
    });

    it('should handle undefined phones array', () => {
      const person: IPerson = {
        ...mockPersonMinimal,
        phones: undefined as any,
      };

      const result = getPrimaryPhone(person);

      expect(result).toBeUndefined();
    });
  });

  describe('getPrimaryAddress', () => {
    it('should return the primary address when one exists', () => {
      const result = getPrimaryAddress(mockPersonWithAllFields);

      expect(result).toBeDefined();
      expect(result?.isPrimary).toBe(true);
      expect(result?.street1).toBe(mockPrimaryAddress.street1);
    });

    it('should return undefined when no primary address exists', () => {
      const result = getPrimaryAddress(mockPersonNoPrimary);

      expect(result).toBeUndefined();
    });

    it('should return undefined when addresses array is empty', () => {
      const person: IPerson = {
        ...mockPersonMinimal,
        addresses: [],
      };

      const result = getPrimaryAddress(person);

      expect(result).toBeUndefined();
    });

    it('should return the first address marked as primary when multiple exist', () => {
      const person: IPerson = {
        ...mockPersonMinimal,
        addresses: [
          { ...mockSecondaryAddress, isPrimary: true },
          { ...mockPrimaryAddress, isPrimary: true },
        ],
      };

      const result = getPrimaryAddress(person);

      expect(result).toBeDefined();
      expect(result?.street1).toBe(mockSecondaryAddress.street1);
    });

    it('should handle null person gracefully', () => {
      const result = getPrimaryAddress(null as any);

      expect(result).toBeUndefined();
    });

    it('should handle undefined addresses array', () => {
      const person: IPerson = {
        ...mockPersonMinimal,
        addresses: undefined as any,
      };

      const result = getPrimaryAddress(person);

      expect(result).toBeUndefined();
    });
  });

  describe('getDisplayName', () => {
    it('should return preferredFirstName when set', () => {
      const result = getDisplayName(mockPersonWithAllFields);

      expect(result).toBe('Janey Smith');
    });

    it('should use legal firstName when preferredFirstName is null', () => {
      const result = getDisplayName(mockPersonMinimal);

      expect(result).toBe('John Doe');
    });

    it('should use preferredLastName when set', () => {
      const person: IPerson = {
        ...mockPersonMinimal,
        firstName: 'John',
        lastName: 'Smith',
        preferredFirstName: 'Johnny',
        preferredLastName: 'Smithson',
      };

      const result = getDisplayName(person);

      expect(result).toBe('Johnny Smithson');
    });

    it('should handle only preferredFirstName set', () => {
      const person: IPerson = {
        ...mockPersonMinimal,
        firstName: 'John',
        lastName: 'Smith',
        preferredFirstName: 'Johnny',
        preferredLastName: null,
      };

      const result = getDisplayName(person);

      expect(result).toBe('Johnny Smith');
    });

    it('should handle only preferredLastName set', () => {
      const person: IPerson = {
        ...mockPersonMinimal,
        firstName: 'John',
        lastName: 'Smith',
        preferredFirstName: null,
        preferredLastName: 'Smithson',
      };

      const result = getDisplayName(person);

      expect(result).toBe('John Smithson');
    });

    it('should handle empty string preferred names', () => {
      const person: IPerson = {
        ...mockPersonMinimal,
        firstName: 'John',
        lastName: 'Smith',
        preferredFirstName: '',
        preferredLastName: '',
      };

      const result = getDisplayName(person);

      expect(result).toBe('John Smith');
    });

    it('should handle whitespace-only preferred names', () => {
      const person: IPerson = {
        ...mockPersonMinimal,
        firstName: 'John',
        lastName: 'Smith',
        preferredFirstName: '   ',
        preferredLastName: '   ',
      };

      const result = getDisplayName(person);

      expect(result).toBe('John Smith');
    });

    it('should handle null person', () => {
      const result = getDisplayName(null as any);

      expect(result).toBe('');
    });

    it('should handle undefined firstName/lastName', () => {
      const person: IPerson = {
        ...mockPersonMinimal,
        firstName: undefined as any,
        lastName: undefined as any,
      };

      const result = getDisplayName(person);

      expect(result).toBe('');
    });
  });

  describe('getFullLegalName', () => {
    it('should return full legal name with all fields', () => {
      const person: IPerson = {
        ...mockPersonMinimal,
        firstName: 'John',
        middleName: 'Robert',
        lastName: 'Smith',
        suffix: 'Jr.',
      };

      const result = getFullLegalName(person);

      expect(result).toBe('John Robert Smith Jr.');
    });

    it('should return name without middle name when null', () => {
      const person: IPerson = {
        ...mockPersonMinimal,
        firstName: 'John',
        middleName: null,
        lastName: 'Smith',
        suffix: 'III',
      };

      const result = getFullLegalName(person);

      expect(result).toBe('John Smith III');
    });

    it('should return name without suffix when null', () => {
      const person: IPerson = {
        ...mockPersonMinimal,
        firstName: 'John',
        middleName: 'Robert',
        lastName: 'Smith',
        suffix: null,
      };

      const result = getFullLegalName(person);

      expect(result).toBe('John Robert Smith');
    });

    it('should return name without middle name and suffix when both null', () => {
      const result = getFullLegalName(mockPersonMinimal);

      expect(result).toBe('John Doe');
    });

    it('should handle middle initial', () => {
      const person: IPerson = {
        ...mockPersonMinimal,
        firstName: 'John',
        middleName: 'R.',
        lastName: 'Smith',
        suffix: null,
      };

      const result = getFullLegalName(person);

      expect(result).toBe('John R. Smith');
    });

    it('should trim extra whitespace', () => {
      const person: IPerson = {
        ...mockPersonMinimal,
        firstName: '  John  ',
        middleName: '  Robert  ',
        lastName: '  Smith  ',
        suffix: '  Jr.  ',
      };

      const result = getFullLegalName(person);

      expect(result).toBe('John Robert Smith Jr.');
    });

    it('should handle null person', () => {
      const result = getFullLegalName(null as any);

      expect(result).toBe('');
    });

    it('should handle undefined names', () => {
      const person: IPerson = {
        ...mockPersonMinimal,
        firstName: undefined as any,
        lastName: undefined as any,
      };

      const result = getFullLegalName(person);

      expect(result).toBe('');
    });
  });

  describe('formatPhoneNumber', () => {
    it('should format E.164 format with country code', () => {
      const phone: IPhone = {
        ...mockPrimaryPhone,
        number: '+12025551234',
      };

      const result = formatPhoneNumber(phone);

      expect(result).toBe('+1 (202) 555-1234');
    });

    it('should format phone with dashes', () => {
      const phone: IPhone = {
        ...mockPrimaryPhone,
        number: '+1-555-012-3456',
      };

      const result = formatPhoneNumber(phone);

      expect(result).toBe('+1 (555) 012-3456');
    });

    it('should handle 10-digit US number without country code', () => {
      const phone: IPhone = {
        ...mockPrimaryPhone,
        number: '2025551234',
      };

      const result = formatPhoneNumber(phone);

      expect(result).toBe('(202) 555-1234');
    });

    it('should handle 11-digit US number with leading 1', () => {
      const phone: IPhone = {
        ...mockPrimaryPhone,
        number: '12025551234',
      };

      const result = formatPhoneNumber(phone);

      expect(result).toBe('+1 (202) 555-1234');
    });

    it('should handle international format', () => {
      const phone: IPhone = {
        ...mockPrimaryPhone,
        number: '+442012345678',
      };

      const result = formatPhoneNumber(phone);

      // Should format with country code
      expect(result).toContain('+44');
      expect(result.replace(/\D/g, '')).toBe('442012345678');
    });

    it('should strip non-numeric characters before formatting', () => {
      const phone: IPhone = {
        ...mockPrimaryPhone,
        number: '(202) 555-1234',
      };

      const result = formatPhoneNumber(phone);

      expect(result).toBe('(202) 555-1234');
    });

    it('should handle already formatted number', () => {
      const phone: IPhone = {
        ...mockPrimaryPhone,
        number: '+1 (202) 555-1234',
      };

      const result = formatPhoneNumber(phone);

      // Should maintain or reformat consistently
      expect(result).toMatch(/\+1.*202.*555.*1234/);
    });

    it('should handle empty string', () => {
      const phone: IPhone = {
        ...mockPrimaryPhone,
        number: '',
      };

      const result = formatPhoneNumber(phone);

      expect(result).toBe('');
    });

    it('should handle null phone', () => {
      const result = formatPhoneNumber(null as any);

      expect(result).toBe('');
    });

    it('should handle undefined number', () => {
      const phone: IPhone = {
        ...mockPrimaryPhone,
        number: undefined as any,
      };

      const result = formatPhoneNumber(phone);

      expect(result).toBe('');
    });

    it('should handle invalid short number', () => {
      const phone: IPhone = {
        ...mockPrimaryPhone,
        number: '123',
      };

      const result = formatPhoneNumber(phone);

      // Should return as-is or handle gracefully
      expect(result).toBeDefined();
    });

    it('should preserve extension if present', () => {
      const phone: IPhone = {
        ...mockPrimaryPhone,
        number: '+12025551234 ext. 5678',
      };

      const result = formatPhoneNumber(phone);

      // Should include extension
      expect(result).toContain('5678');
    });
  });
});
