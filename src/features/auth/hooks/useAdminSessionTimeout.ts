/**
 * Admin Session Timeout Hook (ISS-013 Phase 2)
 *
 * Manages admin session timeout with activity tracking
 * - 15 minute timeout from last activity
 * - Warning at 2 minutes remaining
 * - Activity tracking: mouse movement, keyboard, clicks
 * - Auto de-escalation on timeout
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../model/authStore';
import { useToast } from '@/shared/ui/use-toast';

const SESSION_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
const WARNING_THRESHOLD_MS = 2 * 60 * 1000; // 2 minutes
const UPDATE_INTERVAL_MS = 1000; // Update every second

interface UseAdminSessionTimeoutReturn {
  remainingSeconds: number;
  isWarning: boolean;
  isActive: boolean;
  resetTimeout: () => void;
}

export const useAdminSessionTimeout = (): UseAdminSessionTimeoutReturn => {
  const { isAdminSessionActive, deEscalateFromAdmin } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [remainingMs, setRemainingMs] = useState(SESSION_TIMEOUT_MS);
  const [isWarning, setIsWarning] = useState(false);

  const lastActivityRef = useRef<number>(Date.now());
  const warningShownRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset timeout (called on user activity)
  const resetTimeout = useCallback(() => {
    lastActivityRef.current = Date.now();
    setRemainingMs(SESSION_TIMEOUT_MS);
    setIsWarning(false);
    warningShownRef.current = false;
  }, []);

  // Handle timeout expiration
  const handleTimeout = useCallback(() => {
    console.log('[AdminSessionTimeout] Session expired - de-escalating');

    // De-escalate from admin
    deEscalateFromAdmin();

    // Show toast notification
    toast({
      title: 'Admin Session Expired',
      description: 'Your admin session has expired due to inactivity. Please escalate again to access admin features.',
      variant: 'default',
    });

    // Navigate to staff dashboard
    navigate('/staff/dashboard');
  }, [deEscalateFromAdmin, navigate, toast]);

  // Set up activity listeners
  useEffect(() => {
    if (!isAdminSessionActive) {
      return;
    }

    // Activity event handlers
    const handleActivity = () => {
      resetTimeout();
    };

    // Track multiple activity types
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];

    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    console.log('[AdminSessionTimeout] Activity tracking started');

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      console.log('[AdminSessionTimeout] Activity tracking stopped');
    };
  }, [isAdminSessionActive, resetTimeout]);

  // Set up timeout countdown
  useEffect(() => {
    if (!isAdminSessionActive) {
      // Clear interval and reset state when session ends
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setRemainingMs(SESSION_TIMEOUT_MS);
      setIsWarning(false);
      warningShownRef.current = false;
      return;
    }

    // Start countdown interval
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - lastActivityRef.current;
      const remaining = SESSION_TIMEOUT_MS - elapsed;

      setRemainingMs(remaining);

      // Check if we should show warning
      if (remaining <= WARNING_THRESHOLD_MS && remaining > 0) {
        setIsWarning(true);

        // Show warning toast once
        if (!warningShownRef.current) {
          warningShownRef.current = true;
          toast({
            title: 'Admin Session Expiring Soon',
            description: 'Your admin session will expire in 2 minutes. Any activity will extend the session.',
            variant: 'default',
          });
        }
      }

      // Check if timeout expired
      if (remaining <= 0) {
        handleTimeout();
      }
    }, UPDATE_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAdminSessionActive, handleTimeout, toast]);

  return {
    remainingSeconds: Math.ceil(remainingMs / 1000),
    isWarning,
    isActive: isAdminSessionActive,
    resetTimeout,
  };
};

/**
 * Format remaining seconds as MM:SS
 */
export const formatTimeRemaining = (seconds: number): string => {
  if (seconds <= 0) return '00:00';

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};
