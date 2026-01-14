/**
 * User Profile React Query Hooks
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import {
  getUserProfile,
  updateUserProfile,
  getUserDepartments,
  getPersonExtended,
  updatePersonExtended,
  getDemographics,
  updateDemographics,
} from '../api/userProfileApi';
import { userProfileKeys } from './userProfileKeys';
import type {
  UserProfile,
  UpdateProfilePayload,
  UserDepartment,
  UserProfileContext,
  IStaffPersonExtended,
  ILearnerPersonExtended,
  IDemographics,
} from './types';

/**
 * Hook to fetch current user profile (GET /users/me)
 */
export function useUserProfile(
  context?: UserProfileContext,
  options?: Omit<
    UseQueryOptions<UserProfile, Error, UserProfile, ReturnType<typeof userProfileKeys.profile>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: userProfileKeys.profile(context),
    queryFn: () => getUserProfile(context),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Hook to update current user profile (PUT /users/me)
 */
export function useUpdateUserProfile(context?: UserProfileContext) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => updateUserProfile(payload, context),
    onSuccess: (data) => {
      // Update cached profile immediately
      queryClient.setQueryData(userProfileKeys.profile(context), data);
    },
  });
}

/**
 * Hook to fetch user's department assignments (GET /users/me/departments)
 * Staff-only endpoint
 */
export function useUserDepartments(
  options?: Omit<
    UseQueryOptions<UserDepartment[], Error, UserDepartment[], ReturnType<typeof userProfileKeys.departments>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: userProfileKeys.departments(),
    queryFn: getUserDepartments,
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
}

// ============================================================================
// ISS-010: PersonExtended & Demographics Hooks
// ============================================================================

/**
 * Hook to fetch staff extended profile (GET /users/me/person/extended)
 * Context: staff
 */
export function useStaffExtended(
  options?: Omit<
    UseQueryOptions<IStaffPersonExtended, Error, IStaffPersonExtended, ReturnType<typeof userProfileKeys.personExtended>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: userProfileKeys.personExtended('staff'),
    queryFn: () => getPersonExtended<IStaffPersonExtended>('staff'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Hook to update staff extended profile (PUT /users/me/person/extended)
 * Auto-save on blur implementation
 */
export function useUpdateStaffExtended() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Partial<IStaffPersonExtended>) =>
      updatePersonExtended<IStaffPersonExtended>(payload, 'staff'),
    onSuccess: (data) => {
      // Update cached profile immediately
      queryClient.setQueryData(userProfileKeys.personExtended('staff'), data);
    },
  });
}

/**
 * Hook to fetch learner extended profile (GET /users/me/person/extended)
 * Context: learner
 */
export function useLearnerExtended(
  options?: Omit<
    UseQueryOptions<ILearnerPersonExtended, Error, ILearnerPersonExtended, ReturnType<typeof userProfileKeys.personExtended>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: userProfileKeys.personExtended('learner'),
    queryFn: () => getPersonExtended<ILearnerPersonExtended>('learner'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Hook to update learner extended profile (PUT /users/me/person/extended)
 * Auto-save on blur implementation
 */
export function useUpdateLearnerExtended() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Partial<ILearnerPersonExtended>) =>
      updatePersonExtended<ILearnerPersonExtended>(payload, 'learner'),
    onSuccess: (data) => {
      // Update cached profile immediately
      queryClient.setQueryData(userProfileKeys.personExtended('learner'), data);
    },
  });
}

/**
 * Hook to fetch demographics data (GET /users/me/demographics)
 */
export function useDemographics(
  options?: Omit<
    UseQueryOptions<IDemographics, Error, IDemographics, ReturnType<typeof userProfileKeys.demographics>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: userProfileKeys.demographics(),
    queryFn: getDemographics,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Hook to update demographics data (PUT /users/me/demographics)
 * Auto-save on blur implementation
 */
export function useUpdateDemographics() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Partial<IDemographics>) => updateDemographics(payload),
    onSuccess: (data) => {
      // Update cached demographics immediately
      queryClient.setQueryData(userProfileKeys.demographics(), data);
    },
  });
}
