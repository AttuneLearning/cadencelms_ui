/**
 * User Profile React Query Hooks
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import { getUserProfile, updateUserProfile, getUserDepartments } from '../api/userProfileApi';
import { userProfileKeys } from './userProfileKeys';
import type { UserProfile, UserDepartment } from './types';

/**
 * Hook to fetch current user profile (GET /users/me)
 */
export function useUserProfile(
  options?: Omit<
    UseQueryOptions<UserProfile, Error, UserProfile, ReturnType<typeof userProfileKeys.profile>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: userProfileKeys.profile(),
    queryFn: getUserProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Hook to update current user profile (PUT /users/me)
 */
export function useUpdateUserProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (data) => {
      // Update cached profile immediately
      queryClient.setQueryData(userProfileKeys.profile(), data);
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
