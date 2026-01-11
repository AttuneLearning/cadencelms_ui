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
