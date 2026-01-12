/**
 * React Query keys for user profile queries
 */

export const userProfileKeys = {
  all: ['user-profile'] as const,
  profile: () => [...userProfileKeys.all, 'me'] as const,
  departments: () => [...userProfileKeys.all, 'departments'] as const,
};
