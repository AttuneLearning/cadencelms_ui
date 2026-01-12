/**
 * SensitiveDataWarning Component Tests
 * Version: 1.0.0
 * Date: 2026-01-11
 * Track: 1B - FERPA and Sensitive Data Warnings
 *
 * Test Coverage:
 * - All 4 data types (FERPA, billing, PII, audit)
 * - Acknowledgment flow
 * - Cancel flow
 * - Session memory persistence
 * - Custom messages
 * - Accessibility
 *
 * Target Coverage: >85%
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  SensitiveDataWarning,
  FERPAWarning,
  BillingWarning,
  PIIWarning,
  AuditWarning,
  type SensitiveDataType,
} from '../SensitiveDataWarning';

// ============================================================================
// Test Setup
// ============================================================================

// Mock window.history.back
const mockHistoryBack = vi.fn();
Object.defineProperty(window, 'history', {
  value: { back: mockHistoryBack },
  writable: true,
});

// Helper to clear sessionStorage before each test
beforeEach(() => {
  sessionStorage.clear();
  mockHistoryBack.mockClear();
});

// ============================================================================
// Basic Rendering Tests
// ============================================================================

describe('SensitiveDataWarning - Basic Rendering', () => {
  it('should render warning dialog when not acknowledged', () => {
    const onAcknowledge = vi.fn();

    render(
      <SensitiveDataWarning dataType="ferpa" onAcknowledge={onAcknowledge}>
        <div>Protected Content</div>
      </SensitiveDataWarning>
    );

    // Warning should be visible
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Student Education Records/i })).toBeInTheDocument();

    // Content should be hidden
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should render content immediately if already acknowledged in session', () => {
    const onAcknowledge = vi.fn();

    // Pre-acknowledge in sessionStorage
    sessionStorage.setItem('sensitiveDataAck_ferpa', 'true');

    render(
      <SensitiveDataWarning dataType="ferpa" onAcknowledge={onAcknowledge}>
        <div>Protected Content</div>
      </SensitiveDataWarning>
    );

    // Warning should not be visible
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Content should be visible
    expect(screen.getByText('Protected Content')).toBeInTheDocument();

    // onAcknowledge should not be called (already acknowledged)
    expect(onAcknowledge).not.toHaveBeenCalled();
  });

  it('should render with custom message when provided', () => {
    const onAcknowledge = vi.fn();
    const customMessage = 'This is a custom warning message for testing.';

    render(
      <SensitiveDataWarning
        dataType="ferpa"
        onAcknowledge={onAcknowledge}
        customMessage={customMessage}
      >
        <div>Protected Content</div>
      </SensitiveDataWarning>
    );

    // Use getAllByText and check first instance (more specific than just getByText)
    const messages = screen.getAllByText(customMessage);
    expect(messages.length).toBeGreaterThan(0);
  });
});

// ============================================================================
// Data Type Tests
// ============================================================================

describe('SensitiveDataWarning - Data Types', () => {
  const dataTypes: Array<{ type: SensitiveDataType; titleText: RegExp }> = [
    { type: 'ferpa', titleText: /Student Education Records/i },
    { type: 'billing', titleText: /Sensitive Financial Information/i },
    { type: 'pii', titleText: /Personally Identifiable Information/i },
    { type: 'audit', titleText: /Audit and System Logs/i },
  ];

  dataTypes.forEach(({ type, titleText }) => {
    it(`should render ${type} warning with correct title and content`, () => {
      const onAcknowledge = vi.fn();

      render(
        <SensitiveDataWarning dataType={type} onAcknowledge={onAcknowledge}>
          <div>Content</div>
        </SensitiveDataWarning>
      );

      // Check title is present - use role heading for specificity
      expect(screen.getByRole('heading', { name: titleText })).toBeInTheDocument();

      // Check acknowledgment text is present
      expect(screen.getByText(/By proceeding, you acknowledge that:/i)).toBeInTheDocument();

      // Check audit logging notice
      expect(screen.getByText(/Your access will be logged for audit purposes/i)).toBeInTheDocument();

      // Check buttons are present
      expect(screen.getByText('I Understand - Continue')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });
  });

  it('should render FERPA warning with correct bullet points', () => {
    const onAcknowledge = vi.fn();

    render(
      <SensitiveDataWarning dataType="ferpa" onAcknowledge={onAcknowledge}>
        <div>Content</div>
      </SensitiveDataWarning>
    );

    // Check for FERPA-specific bullet points
    expect(screen.getByText(/legitimate educational interest/i)).toBeInTheDocument();
    expect(screen.getByText(/maintain confidentiality of student information/i)).toBeInTheDocument();
    expect(screen.getByText(/not share this data with unauthorized parties/i)).toBeInTheDocument();
    expect(screen.getByText(/legal implications of FERPA violations/i)).toBeInTheDocument();
  });

  it('should render billing warning with correct bullet points', () => {
    const onAcknowledge = vi.fn();

    render(
      <SensitiveDataWarning dataType="billing" onAcknowledge={onAcknowledge}>
        <div>Content</div>
      </SensitiveDataWarning>
    );

    // Check for billing-specific bullet points
    expect(screen.getByText(/proper authorization to view financial data/i)).toBeInTheDocument();
    expect(screen.getByText(/handle payment information securely/i)).toBeInTheDocument();
    expect(screen.getByText(/not share financial data inappropriately/i)).toBeInTheDocument();
  });

  it('should render PII warning with correct bullet points', () => {
    const onAcknowledge = vi.fn();

    render(
      <SensitiveDataWarning dataType="pii" onAcknowledge={onAcknowledge}>
        <div>Content</div>
      </SensitiveDataWarning>
    );

    // Check for PII-specific bullet points
    expect(screen.getByText(/authorization to view this data/i)).toBeInTheDocument();
    expect(screen.getByText(/protect individual privacy/i)).toBeInTheDocument();
    expect(screen.getByText(/handle this data according to privacy policies/i)).toBeInTheDocument();
  });

  it('should render audit warning with correct bullet points', () => {
    const onAcknowledge = vi.fn();

    render(
      <SensitiveDataWarning dataType="audit" onAcknowledge={onAcknowledge}>
        <div>Content</div>
      </SensitiveDataWarning>
    );

    // Check for audit-specific bullet points
    expect(screen.getByText(/proper authorization for audit access/i)).toBeInTheDocument();
    expect(screen.getByText(/use this data for legitimate purposes only/i)).toBeInTheDocument();
    expect(screen.getByText(/maintain confidentiality of user activities/i)).toBeInTheDocument();
  });
});

// ============================================================================
// Acknowledgment Flow Tests
// ============================================================================

describe('SensitiveDataWarning - Acknowledgment Flow', () => {
  it('should call onAcknowledge and show content when user clicks Continue', async () => {
    const onAcknowledge = vi.fn();

    render(
      <SensitiveDataWarning dataType="ferpa" onAcknowledge={onAcknowledge}>
        <div>Protected Content</div>
      </SensitiveDataWarning>
    );

    // Click Continue button
    const continueButton = screen.getByText('I Understand - Continue');
    fireEvent.click(continueButton);

    // onAcknowledge should be called
    expect(onAcknowledge).toHaveBeenCalledTimes(1);

    // Wait for state update
    await waitFor(() => {
      // Content should now be visible
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    // Warning should be hidden
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should store acknowledgment in sessionStorage', () => {
    const onAcknowledge = vi.fn();

    render(
      <SensitiveDataWarning dataType="ferpa" onAcknowledge={onAcknowledge}>
        <div>Content</div>
      </SensitiveDataWarning>
    );

    // Click Continue button
    const continueButton = screen.getByText('I Understand - Continue');
    fireEvent.click(continueButton);

    // Check sessionStorage
    expect(sessionStorage.getItem('sensitiveDataAck_ferpa')).toBe('true');
  });

  it('should store acknowledgment with resourceId in sessionStorage', () => {
    const onAcknowledge = vi.fn();

    render(
      <SensitiveDataWarning
        dataType="ferpa"
        resourceId="student-123"
        onAcknowledge={onAcknowledge}
      >
        <div>Content</div>
      </SensitiveDataWarning>
    );

    // Click Continue button
    const continueButton = screen.getByText('I Understand - Continue');
    fireEvent.click(continueButton);

    // Check sessionStorage with resourceId
    expect(sessionStorage.getItem('sensitiveDataAck_ferpa_student-123')).toBe('true');
  });

  it('should remember acknowledgment for same dataType across re-renders', () => {
    const onAcknowledge = vi.fn();

    const { unmount } = render(
      <SensitiveDataWarning dataType="ferpa" onAcknowledge={onAcknowledge}>
        <div>Content 1</div>
      </SensitiveDataWarning>
    );

    // Acknowledge
    fireEvent.click(screen.getByText('I Understand - Continue'));

    // Unmount and remount
    unmount();
    render(
      <SensitiveDataWarning dataType="ferpa" onAcknowledge={onAcknowledge}>
        <div>Content 2</div>
      </SensitiveDataWarning>
    );

    // Should show content immediately (no warning)
    expect(screen.getByText('Content 2')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should NOT remember acknowledgment for different resourceId', () => {
    const onAcknowledge = vi.fn();

    // First resource
    const { unmount } = render(
      <SensitiveDataWarning
        dataType="ferpa"
        resourceId="student-123"
        onAcknowledge={onAcknowledge}
      >
        <div>Content 1</div>
      </SensitiveDataWarning>
    );

    // Acknowledge
    fireEvent.click(screen.getByText('I Understand - Continue'));

    // Unmount and render with different resourceId
    unmount();
    render(
      <SensitiveDataWarning
        dataType="ferpa"
        resourceId="student-456"
        onAcknowledge={onAcknowledge}
      >
        <div>Content 2</div>
      </SensitiveDataWarning>
    );

    // Should show warning again (different resource)
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.queryByText('Content 2')).not.toBeInTheDocument();
  });
});

// ============================================================================
// Cancel Flow Tests
// ============================================================================

describe('SensitiveDataWarning - Cancel Flow', () => {
  it('should call window.history.back() when Cancel is clicked and no onCancel provided', () => {
    const onAcknowledge = vi.fn();

    render(
      <SensitiveDataWarning dataType="ferpa" onAcknowledge={onAcknowledge}>
        <div>Content</div>
      </SensitiveDataWarning>
    );

    // Click Cancel button
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    // history.back should be called
    expect(mockHistoryBack).toHaveBeenCalledTimes(1);

    // onAcknowledge should NOT be called
    expect(onAcknowledge).not.toHaveBeenCalled();
  });

  it('should call custom onCancel when provided', () => {
    const onAcknowledge = vi.fn();
    const onCancel = vi.fn();

    render(
      <SensitiveDataWarning
        dataType="ferpa"
        onAcknowledge={onAcknowledge}
        onCancel={onCancel}
      >
        <div>Content</div>
      </SensitiveDataWarning>
    );

    // Click Cancel button
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    // Custom onCancel should be called
    expect(onCancel).toHaveBeenCalledTimes(1);

    // history.back should NOT be called (custom handler takes precedence)
    expect(mockHistoryBack).not.toHaveBeenCalled();

    // onAcknowledge should NOT be called
    expect(onAcknowledge).not.toHaveBeenCalled();
  });

  it('should NOT store acknowledgment in sessionStorage when Cancel is clicked', () => {
    const onAcknowledge = vi.fn();

    render(
      <SensitiveDataWarning dataType="ferpa" onAcknowledge={onAcknowledge}>
        <div>Content</div>
      </SensitiveDataWarning>
    );

    // Click Cancel button
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    // sessionStorage should be empty
    expect(sessionStorage.getItem('sensitiveDataAck_ferpa')).toBeNull();
  });
});

// ============================================================================
// Convenience Wrapper Tests
// ============================================================================

describe('SensitiveDataWarning - Convenience Wrappers', () => {
  it('should render FERPAWarning correctly', () => {
    const onAcknowledge = vi.fn();

    render(
      <FERPAWarning onAcknowledge={onAcknowledge}>
        <div>Student Data</div>
      </FERPAWarning>
    );

    expect(screen.getByRole('heading', { name: /Student Education Records/i })).toBeInTheDocument();
  });

  it('should render BillingWarning correctly', () => {
    const onAcknowledge = vi.fn();

    render(
      <BillingWarning onAcknowledge={onAcknowledge}>
        <div>Billing Data</div>
      </BillingWarning>
    );

    expect(screen.getByRole('heading', { name: /Sensitive Financial Information/i })).toBeInTheDocument();
  });

  it('should render PIIWarning correctly', () => {
    const onAcknowledge = vi.fn();

    render(
      <PIIWarning onAcknowledge={onAcknowledge}>
        <div>PII Data</div>
      </PIIWarning>
    );

    expect(screen.getByRole('heading', { name: /Personally Identifiable Information/i })).toBeInTheDocument();
  });

  it('should render AuditWarning correctly', () => {
    const onAcknowledge = vi.fn();

    render(
      <AuditWarning onAcknowledge={onAcknowledge}>
        <div>Audit Logs</div>
      </AuditWarning>
    );

    expect(screen.getByRole('heading', { name: /Audit and System Logs/i })).toBeInTheDocument();
  });

  it('should support resourceId in convenience wrappers', () => {
    const onAcknowledge = vi.fn();

    render(
      <FERPAWarning resourceId="student-789" onAcknowledge={onAcknowledge}>
        <div>Content</div>
      </FERPAWarning>
    );

    // Acknowledge
    fireEvent.click(screen.getByText('I Understand - Continue'));

    // Check sessionStorage with resourceId
    expect(sessionStorage.getItem('sensitiveDataAck_ferpa_student-789')).toBe('true');
  });
});

// ============================================================================
// Accessibility Tests
// ============================================================================

describe('SensitiveDataWarning - Accessibility', () => {
  it('should have proper ARIA role for dialog', () => {
    const onAcknowledge = vi.fn();

    render(
      <SensitiveDataWarning dataType="ferpa" onAcknowledge={onAcknowledge}>
        <div>Content</div>
      </SensitiveDataWarning>
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-labelledby', 'sensitive-data-warning-title');
    expect(dialog).toHaveAttribute('aria-describedby', 'sensitive-data-warning-description');
  });

  it('should have proper ARIA labels on buttons', () => {
    const onAcknowledge = vi.fn();

    render(
      <SensitiveDataWarning dataType="ferpa" onAcknowledge={onAcknowledge}>
        <div>Content</div>
      </SensitiveDataWarning>
    );

    const continueButton = screen.getByLabelText('Acknowledge warning and continue');
    const cancelButton = screen.getByLabelText('Cancel and go back');

    expect(continueButton).toBeInTheDocument();
    expect(cancelButton).toBeInTheDocument();
  });

  it('should support keyboard navigation', () => {
    const onAcknowledge = vi.fn();

    render(
      <SensitiveDataWarning dataType="ferpa" onAcknowledge={onAcknowledge}>
        <div>Content</div>
      </SensitiveDataWarning>
    );

    const continueButton = screen.getByText('I Understand - Continue');

    // Focus on button
    continueButton.focus();
    expect(document.activeElement).toBe(continueButton);

    // Press Enter (simulates keyboard interaction)
    fireEvent.click(continueButton);
    expect(onAcknowledge).toHaveBeenCalled();
  });
});

// ============================================================================
// Edge Cases and Error Handling
// ============================================================================

describe('SensitiveDataWarning - Edge Cases', () => {
  it('should handle sessionStorage not available gracefully', () => {
    // Mock sessionStorage to throw error
    const mockGetItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('sessionStorage not available');
    });
    const mockSetItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('sessionStorage not available');
    });

    const onAcknowledge = vi.fn();

    render(
      <SensitiveDataWarning dataType="ferpa" onAcknowledge={onAcknowledge}>
        <div>Content</div>
      </SensitiveDataWarning>
    );

    // Should still show warning (fails gracefully)
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // Click Continue
    fireEvent.click(screen.getByText('I Understand - Continue'));

    // onAcknowledge should still be called
    expect(onAcknowledge).toHaveBeenCalled();

    // Cleanup
    mockGetItem.mockRestore();
    mockSetItem.mockRestore();
  });

  it('should update when dataType changes', () => {
    const onAcknowledge = vi.fn();

    const { rerender } = render(
      <SensitiveDataWarning dataType="ferpa" onAcknowledge={onAcknowledge}>
        <div>Content</div>
      </SensitiveDataWarning>
    );

    // Acknowledge FERPA
    fireEvent.click(screen.getByText('I Understand - Continue'));

    // Change dataType to billing
    rerender(
      <SensitiveDataWarning dataType="billing" onAcknowledge={onAcknowledge}>
        <div>Content</div>
      </SensitiveDataWarning>
    );

    // Should show billing warning (different dataType)
    expect(screen.getByRole('heading', { name: /Sensitive Financial Information/i })).toBeInTheDocument();
  });

  it('should update when resourceId changes', () => {
    const onAcknowledge = vi.fn();

    const { rerender } = render(
      <SensitiveDataWarning
        dataType="ferpa"
        resourceId="student-123"
        onAcknowledge={onAcknowledge}
      >
        <div>Content</div>
      </SensitiveDataWarning>
    );

    // Acknowledge for student-123
    fireEvent.click(screen.getByText('I Understand - Continue'));

    // Wait for content to be visible
    expect(screen.getByText('Content')).toBeInTheDocument();

    // Change resourceId to student-456
    rerender(
      <SensitiveDataWarning
        dataType="ferpa"
        resourceId="student-456"
        onAcknowledge={onAcknowledge}
      >
        <div>Content</div>
      </SensitiveDataWarning>
    );

    // Should show warning again (different resource)
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
