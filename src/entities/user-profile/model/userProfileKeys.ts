/**
 * React Query keys for user profile queries
 */

export const userProfileKeys = {
  all: ['user-profile'] as const,
  profile: (context?: string) => [...userProfileKeys.all, 'me', context || 'default'] as const,
  departments: () => [...userProfileKeys.all, 'departments'] as const,
  // ISS-010: PersonExtended & Demographics query keys
  personExtended: (context: string) => [...userProfileKeys.all, 'person-extended', context] as const,
  demographics: () => [...userProfileKeys.all, 'demographics'] as const,
};
