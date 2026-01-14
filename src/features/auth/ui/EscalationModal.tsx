/**
 * Escalation Modal Component (ISS-013)
 * Prompts for admin escalation password before allowing access to admin dashboard
 *
 * Security Requirements:
 * - Admin token stored in memory only (never localStorage/sessionStorage)
 * - Session timeout: 15 minutes of inactivity
 * - Password field masked
 * - Focus trap within modal
 * - Escape key closes modal
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Lock, AlertCircle, Loader2 } from 'lucide-react';
import { useAuthStore } from '../model/authStore';

interface EscalationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  redirectPath?: string; // Where to navigate after successful escalation
}

export const EscalationModal: React.FC<EscalationModalProps> = ({
  open,
  onOpenChange,
  redirectPath = '/admin/dashboard',
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { escalateToAdmin } = useAuthStore();

  // Clear form when modal opens/closes
  useEffect(() => {
    if (!open) {
      setPassword('');
      setError(null);
      setIsLoading(false);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password.trim()) {
      setError('Please enter your escalation password');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await escalateToAdmin(password);

      // Success - close modal and navigate
      onOpenChange(false);
      navigate(redirectPath);
    } catch (err: any) {
      console.error('[EscalationModal] Escalation failed:', err);

      // Handle specific error types
      if (err.message?.includes('INVALID_ESCALATION_PASSWORD') || err.message?.includes('Incorrect')) {
        setError('Incorrect escalation password. Please try again.');
      } else if (err.message?.includes('NOT_ADMIN')) {
        setError('You do not have admin privileges.');
      } else if (err.message?.includes('ADMIN_DISABLED')) {
        setError('Admin access has been disabled for your account.');
      } else {
        setError(err.message || 'Failed to enter admin mode. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-red-600" />
              <DialogTitle>Enter Admin Mode</DialogTitle>
            </div>
            <DialogDescription>
              Admin access requires your escalation password. This is separate from your login
              password and provides elevated privileges for administrative tasks.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="escalation-password">Escalation Password</Label>
              <Input
                id="escalation-password"
                type="password"
                placeholder="Enter escalation password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                autoFocus
                autoComplete="off"
              />
              <p className="text-xs text-muted-foreground">
                Your admin session will expire after 15 minutes of inactivity.
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Enter Admin Mode'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
