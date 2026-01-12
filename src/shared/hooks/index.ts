/**
 * Shared hooks exports
 */

export { useOnlineStatus, useIsOnline, useOnlineStatusEffect } from './useOnlineStatus';
export type { OnlineStatus, UseOnlineStatusOptions } from './useOnlineStatus';
export { useDebounce } from './useDebounce';

// Permission hooks (Phase 5)
export {
  usePermission,
  usePermissions,
  useUserType,
  useRole,
  useDepartmentPermissions,
  useAccess,
} from './usePermission';

// Department context hook (Contract Alignment - Track C)
export { useDepartmentContext } from './useDepartmentContext';
export type { DepartmentContext } from './useDepartmentContext';

// Feature access hook (Phase 2 - Track 2C)
export { useFeatureAccess } from './useFeatureAccess';
export type { FeatureAccessFlags } from './useFeatureAccess';
