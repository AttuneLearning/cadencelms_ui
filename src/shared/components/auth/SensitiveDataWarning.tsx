/**
 * SensitiveDataWarning Component
 * Version: 1.0.0
 * Date: 2026-01-11
 * Track: 1B - FERPA and Sensitive Data Warnings
 *
 * Displays warnings before users access sensitive data (FERPA, billing, PII, audit).
 * Implements session-based acknowledgment memory to prevent warning fatigue.
 *
 * Features:
 * - 4 data types: FERPA, billing, PII, audit
 * - Session-based acknowledgment (persists until browser close)
 * - Cancel navigation option
 * - Integration with shadcn/ui Alert component
 * - Clear, user-friendly, compliance-focused messaging
 * - Accessibility support (ARIA labels, keyboard navigation)
 *
 * Compliance:
 * - FERPA compliance requirement (P0 - CRITICAL)
 * - Audit logging support
 * - User acknowledgment tracking
 */

import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';
import { AlertTriangle, Shield, DollarSign, FileText } from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

/**
 * Types of sensitive data that require warnings
 */
export type SensitiveDataType = 'ferpa' | 'billing' | 'pii' | 'audit';

/**
 * Props for SensitiveDataWarning component
 */
export interface SensitiveDataWarningProps {
  /** Type of sensitive data being accessed */
  dataType: SensitiveDataType;

  /** Optional resource ID for session memory (e.g., studentId, invoiceId) */
  resourceId?: string;

  /** Callback when user acknowledges warning and proceeds */
  onAcknowledge: () => void;

  /** Optional callback when user cancels (defaults to history.back()) */
  onCancel?: () => void;

  /** Children to render after acknowledgment */
  children: React.ReactNode;

  /** Optional custom message (overrides default) */
  customMessage?: string;
}

/**
 * Configuration for each warning type
 */
interface WarningConfig {
  title: string;
  message: string;
  bulletPoints: string[];
  icon: React.ComponentType<{ className?: string }>;
  variant: 'default' | 'destructive';
}

// ============================================================================
// Warning Configurations
// ============================================================================

/**
 * Default warning messages for each data type
 * Based on FERPA and compliance requirements
 */
const WARNING_CONFIGS: Record<SensitiveDataType, WarningConfig> = {
  ferpa: {
    title: 'Student Education Records (FERPA Protected)',
    message:
      'You are about to access student education records protected under the Family Educational Rights and Privacy Act (FERPA).',
    bulletPoints: [
      'You have a legitimate educational interest in this data',
      'You will maintain confidentiality of student information',
      'You will not share this data with unauthorized parties',
      'You understand the legal implications of FERPA violations',
    ],
    icon: Shield,
    variant: 'destructive',
  },
  billing: {
    title: 'Sensitive Financial Information',
    message: 'You are about to access billing and payment information.',
    bulletPoints: [
      'You have proper authorization to view financial data',
      'You will handle payment information securely',
      'You will not share financial data inappropriately',
    ],
    icon: DollarSign,
    variant: 'default',
  },
  pii: {
    title: 'Personally Identifiable Information (PII)',
    message: 'You are about to access personally identifiable information.',
    bulletPoints: [
      'You have authorization to view this data',
      'You will protect individual privacy',
      'You will handle this data according to privacy policies',
    ],
    icon: AlertTriangle,
    variant: 'default',
  },
  audit: {
    title: 'Audit and System Logs',
    message: 'You are about to access system audit logs containing user activity.',
    bulletPoints: [
      'You have proper authorization for audit access',
      'You will use this data for legitimate purposes only',
      'You will maintain confidentiality of user activities',
    ],
    icon: FileText,
    variant: 'default',
  },
};

// ============================================================================
// Session Memory Utilities
// ============================================================================

/**
 * Generate sessionStorage key for acknowledgment
 * Format: sensitiveDataAck_<dataType>_<resourceId>
 */
function getSessionKey(dataType: SensitiveDataType, resourceId?: string): string {
  const baseKey = `sensitiveDataAck_${dataType}`;
  return resourceId ? `${baseKey}_${resourceId}` : baseKey;
}

/**
 * Check if user has already acknowledged this warning in current session
 */
function hasAcknowledged(dataType: SensitiveDataType, resourceId?: string): boolean {
  try {
    const key = getSessionKey(dataType, resourceId);
    return sessionStorage.getItem(key) === 'true';
  } catch (error) {
    // sessionStorage might not be available (e.g., in tests or strict privacy mode)
    console.warn('sessionStorage not available:', error);
    return false;
  }
}

/**
 * Record acknowledgment in session memory
 */
function recordAcknowledgment(dataType: SensitiveDataType, resourceId?: string): void {
  try {
    const key = getSessionKey(dataType, resourceId);
    sessionStorage.setItem(key, 'true');
  } catch (error) {
    // sessionStorage might not be available
    console.warn('Could not record acknowledgment:', error);
  }
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * SensitiveDataWarning Component
 *
 * Shows a warning dialog before allowing access to sensitive data.
 * Remembers acknowledgment for the current browser session.
 *
 * @example
 * ```tsx
 * <FERPAWarning
 *   resourceId={studentId}
 *   onAcknowledge={() => setCanViewTranscript(true)}
 *   onCancel={() => navigate('/students')}
 * >
 *   <StudentTranscript studentId={studentId} />
 * </FERPAWarning>
 * ```
 */
export function SensitiveDataWarning({
  dataType,
  resourceId,
  onAcknowledge,
  onCancel,
  children,
  customMessage,
}: SensitiveDataWarningProps): JSX.Element {
  // Check session memory on mount
  const [acknowledged, setAcknowledged] = useState(() => hasAcknowledged(dataType, resourceId));

  // Re-check if dataType or resourceId changes
  useEffect(() => {
    setAcknowledged(hasAcknowledged(dataType, resourceId));
  }, [dataType, resourceId]);

  // If already acknowledged, show content immediately
  if (acknowledged) {
    return <>{children}</>;
  }

  // Get warning configuration
  const config = WARNING_CONFIGS[dataType];
  const Icon = config.icon;

  /**
   * Handle user acknowledgment
   */
  const handleAcknowledge = () => {
    // Record in session memory
    recordAcknowledgment(dataType, resourceId);

    // Update local state
    setAcknowledged(true);

    // Notify parent component
    onAcknowledge();
  };

  /**
   * Handle user cancellation
   */
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      // Default behavior: navigate back
      window.history.back();
    }
  };

  // Render warning dialog
  return (
    <div
      className="flex items-center justify-center min-h-[400px] p-8"
      role="dialog"
      aria-labelledby="sensitive-data-warning-title"
      aria-describedby="sensitive-data-warning-description"
    >
      <Alert variant={config.variant} className="max-w-2xl">
        <Icon className="h-6 w-6" aria-hidden="true" />
        <AlertTitle id="sensitive-data-warning-title" className="text-xl mb-2">
          {config.title}
        </AlertTitle>
        <AlertDescription id="sensitive-data-warning-description" className="space-y-4">
          <p className="text-base font-semibold">{customMessage || config.message}</p>

          <div className="space-y-2">
            <p className="text-sm font-medium">By proceeding, you acknowledge that:</p>
            <ul className="list-disc list-inside space-y-1 text-sm ml-2">
              {config.bulletPoints.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          </div>

          <p className="text-sm font-medium mt-4 text-muted-foreground">
            Your access will be logged for audit purposes.
          </p>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleAcknowledge}
              variant="default"
              aria-label="Acknowledge warning and continue"
            >
              I Understand - Continue
            </Button>
            <Button
              onClick={handleCancel}
              variant="outline"
              aria-label="Cancel and go back"
            >
              Cancel
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}

// ============================================================================
// Convenience Wrappers
// ============================================================================

/**
 * Props for convenience wrapper components (omit dataType)
 */
type WrapperProps = Omit<SensitiveDataWarningProps, 'dataType'>;

/**
 * FERPAWarning - Convenience wrapper for FERPA-protected student data
 *
 * @example
 * ```tsx
 * <FERPAWarning
 *   resourceId={studentId}
 *   onAcknowledge={() => console.log('Acknowledged')}
 * >
 *   <StudentTranscript />
 * </FERPAWarning>
 * ```
 */
export function FERPAWarning(props: WrapperProps): JSX.Element {
  return <SensitiveDataWarning {...props} dataType="ferpa" />;
}

/**
 * BillingWarning - Convenience wrapper for billing and payment data
 *
 * @example
 * ```tsx
 * <BillingWarning
 *   resourceId={invoiceId}
 *   onAcknowledge={() => console.log('Acknowledged')}
 * >
 *   <InvoiceDetails />
 * </BillingWarning>
 * ```
 */
export function BillingWarning(props: WrapperProps): JSX.Element {
  return <SensitiveDataWarning {...props} dataType="billing" />;
}

/**
 * PIIWarning - Convenience wrapper for personally identifiable information
 *
 * @example
 * ```tsx
 * <PIIWarning
 *   resourceId={userId}
 *   onAcknowledge={() => console.log('Acknowledged')}
 * >
 *   <UserProfile />
 * </PIIWarning>
 * ```
 */
export function PIIWarning(props: WrapperProps): JSX.Element {
  return <SensitiveDataWarning {...props} dataType="pii" />;
}

/**
 * AuditWarning - Convenience wrapper for audit logs
 *
 * @example
 * ```tsx
 * <AuditWarning
 *   onAcknowledge={() => console.log('Acknowledged')}
 * >
 *   <AuditLogViewer />
 * </AuditWarning>
 * ```
 */
export function AuditWarning(props: WrapperProps): JSX.Element {
  return <SensitiveDataWarning {...props} dataType="audit" />;
}
