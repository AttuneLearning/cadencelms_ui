/**
 * Auth Components - Barrel Export
 * Version: 2.0.0
 * Date: 2026-01-11
 *
 * Exports all authentication and authorization-related components
 * for easy importing throughout the application.
 */

// Sensitive Data Warning Components
export {
  SensitiveDataWarning,
  FERPAWarning,
  BillingWarning,
  PIIWarning,
  AuditWarning,
  type SensitiveDataWarningProps,
  type SensitiveDataType,
} from './SensitiveDataWarning';

// Protected Component and Convenience Wrappers
export {
  ProtectedComponent,
  StaffOnly,
  LearnerOnly,
  AdminOnly,
  type ProtectedComponentProps,
} from './ProtectedComponent';
