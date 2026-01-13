/**
 * Person Helper Functions
 *
 * Utility functions for working with Person v2.0 data structures.
 * These helpers simplify accessing nested person data and handle edge cases.
 */

import type { IPerson, IEmail, IPhone, IAddress } from '@/shared/types/person';

/**
 * Get the primary email from a person's email list
 *
 * @param person - The person object
 * @returns The primary email or undefined if none exists
 */
export function getPrimaryEmail(person: IPerson): IEmail | undefined {
  if (!person || !Array.isArray(person.emails)) {
    return undefined;
  }

  return person.emails.find((email) => email.isPrimary);
}

/**
 * Get the primary phone from a person's phone list
 *
 * @param person - The person object
 * @returns The primary phone or undefined if none exists
 */
export function getPrimaryPhone(person: IPerson): IPhone | undefined {
  if (!person || !Array.isArray(person.phones)) {
    return undefined;
  }

  return person.phones.find((phone) => phone.isPrimary);
}

/**
 * Get the primary address from a person's address list
 *
 * @param person - The person object
 * @returns The primary address or undefined if none exists
 */
export function getPrimaryAddress(person: IPerson): IAddress | undefined {
  if (!person || !Array.isArray(person.addresses)) {
    return undefined;
  }

  return person.addresses.find((address) => address.isPrimary);
}

/**
 * Get the display name for a person (uses preferred name if set)
 *
 * Priority:
 * 1. Preferred first/last name if set
 * 2. Legal first/last name as fallback
 *
 * @param person - The person object
 * @returns The formatted display name
 */
export function getDisplayName(person: IPerson): string {
  if (!person) {
    return '';
  }

  const firstName =
    person.preferredFirstName?.trim() || person.firstName?.trim() || '';
  const lastName =
    person.preferredLastName?.trim() || person.lastName?.trim() || '';

  return `${firstName} ${lastName}`.trim();
}

/**
 * Get the full legal name for a person (includes middle name and suffix)
 *
 * Format: FirstName [MiddleName] LastName [Suffix]
 *
 * @param person - The person object
 * @returns The formatted full legal name
 */
export function getFullLegalName(person: IPerson): string {
  if (!person) {
    return '';
  }

  const parts: string[] = [];

  if (person.firstName?.trim()) {
    parts.push(person.firstName.trim());
  }

  if (person.middleName?.trim()) {
    parts.push(person.middleName.trim());
  }

  if (person.lastName?.trim()) {
    parts.push(person.lastName.trim());
  }

  if (person.suffix?.trim()) {
    parts.push(person.suffix.trim());
  }

  return parts.join(' ');
}

/**
 * Format a phone number for display
 *
 * Supports multiple formats:
 * - E.164: +12025551234 -> +1 (202) 555-1234
 * - 10-digit US: 2025551234 -> (202) 555-1234
 * - 11-digit US: 12025551234 -> +1 (202) 555-1234
 * - International: +442012345678 -> +44 20 1234 5678
 *
 * @param phone - The phone object
 * @returns Formatted phone number string
 */
export function formatPhoneNumber(phone: IPhone): string {
  if (!phone || !phone.number) {
    return '';
  }

  let number = phone.number;

  // Extract extension if present
  const extensionMatch = number.match(/(ext\.?|x)\s*(\d+)/i);
  const extension = extensionMatch ? extensionMatch[2] : null;

  // Remove all non-numeric characters except leading +
  const hasPlus = number.startsWith('+');
  const digits = number.replace(/\D/g, '');

  if (!digits) {
    return '';
  }

  // Handle too short numbers
  if (digits.length < 10 && !hasPlus) {
    return number; // Return as-is
  }

  // Format US numbers (country code 1)
  if (digits.length === 10) {
    // 10-digit US number without country code
    const formatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    return extension ? `${formatted} ext. ${extension}` : formatted;
  }

  if (digits.length === 11 && digits.startsWith('1')) {
    // 11-digit US number with country code
    const formatted = `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
    return extension ? `${formatted} ext. ${extension}` : formatted;
  }

  // Format international numbers
  if (hasPlus || digits.length > 11) {
    // Extract country code (typically 1-3 digits)
    let countryCode = '';
    let remaining = digits;

    if (digits.startsWith('1') && digits.length > 11) {
      // Likely US/Canada
      countryCode = '1';
      remaining = digits.slice(1);
    } else if (digits.length >= 12) {
      // International - take first 2-3 digits as country code
      countryCode = digits.slice(0, 2);
      remaining = digits.slice(2);
    }

    if (countryCode) {
      // Format: +CC XX XXXX XXXX
      const parts = [];
      while (remaining.length > 0) {
        parts.push(remaining.slice(0, 4));
        remaining = remaining.slice(4);
      }
      const formatted = `+${countryCode} ${parts.join(' ')}`;
      return extension ? `${formatted} ext. ${extension}` : formatted;
    }
  }

  // Fallback: return with country code if present
  const formatted = hasPlus ? `+${digits}` : digits;
  return extension ? `${formatted} ext. ${extension}` : formatted;
}
