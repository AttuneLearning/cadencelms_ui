/**
 * Admin Session Indicator Component (ISS-013 Phase 2)
 *
 * Displays admin session status in Header:
 * - "Admin Mode" badge with timer
 * - Warning state when < 2 minutes remaining
 * - De-escalation button with confirmation
 * - Session timeout managed by useAdminSessionTimeout hook
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ShieldAlert, LogOut } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/alert-dialog';
import { cn } from '@/shared/lib/utils';
import { useAuthStore } from '../model/authStore';
import { useAdminSessionTimeout, formatTimeRemaining } from '../hooks/useAdminSessionTimeout';

export const AdminSessionIndicator: React.FC = () => {
  const { isAdminSessionActive, deEscalateFromAdmin } = useAuthStore();
  const { remainingSeconds, isWarning } = useAdminSessionTimeout();
  const navigate = useNavigate();
  const [showDeEscalateDialog, setShowDeEscalateDialog] = useState(false);

  if (!isAdminSessionActive) {
    return null;
  }

  const handleDeEscalate = () => {
    deEscalateFromAdmin();
    setShowDeEscalateDialog(false);
    navigate('/staff/dashboard');
  };

  const timeRemaining = formatTimeRemaining(remainingSeconds);

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Admin Mode Badge */}
        <Badge
          variant={isWarning ? 'destructive' : 'default'}
          className={cn(
            'flex items-center gap-1.5 px-2 py-1',
            isWarning
              ? 'bg-red-500 hover:bg-red-600 animate-pulse'
              : 'bg-blue-600 hover:bg-blue-700'
          )}
        >
          {isWarning ? (
            <ShieldAlert className="h-3.5 w-3.5" />
          ) : (
            <Shield className="h-3.5 w-3.5" />
          )}
          <span className="text-xs font-semibold">Admin Mode</span>
          <span className="text-xs font-mono">{timeRemaining}</span>
        </Badge>

        {/* De-escalate Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDeEscalateDialog(true)}
          className="h-8 px-2"
          title="Exit Admin Mode"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>

      {/* De-escalation Confirmation Dialog */}
      <AlertDialog open={showDeEscalateDialog} onOpenChange={setShowDeEscalateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Exit Admin Mode?</AlertDialogTitle>
            <AlertDialogDescription>
              You will be returned to the staff dashboard and will need to enter your escalation
              password again to access admin features.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeEscalate}>Exit Admin Mode</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
