/**
 * CertificateUpgradeDialog Component
 * Dialog for upgrading a certificate to a newer version
 */

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import {
  Award,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Clock,
  Info,
  Plus,
  RefreshCw,
} from 'lucide-react';
import type { CertificateUpgradeEligibility } from '@/entities/credential';
import { cn } from '@/shared/lib/utils';

interface CertificateUpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eligibility: CertificateUpgradeEligibility | null;
  isLoading?: boolean;
  onUpgrade?: (targetDefinitionId: string) => Promise<void>;
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'No deadline';
  const date = new Date(dateString);
  const now = new Date();
  const daysUntil = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  const formatted = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  if (daysUntil < 0) return `Expired ${formatted}`;
  if (daysUntil === 0) return 'Expires today';
  if (daysUntil <= 7) return `${daysUntil} day(s) left`;
  return formatted;
};

export const CertificateUpgradeDialog: React.FC<CertificateUpgradeDialogProps> = ({
  open,
  onOpenChange,
  eligibility,
  isLoading = false,
  onUpgrade,
}) => {
  const [selectedUpgrade, setSelectedUpgrade] = React.useState<string | null>(null);
  const [isUpgrading, setIsUpgrading] = React.useState(false);

  React.useEffect(() => {
    if (open && eligibility?.availableUpgrades.length === 1) {
      setSelectedUpgrade(eligibility.availableUpgrades[0].definitionId);
    }
  }, [open, eligibility]);

  const handleUpgrade = async () => {
    if (!selectedUpgrade || !onUpgrade) return;
    setIsUpgrading(true);
    try {
      await onUpgrade(selectedUpgrade);
      onOpenChange(false);
    } finally {
      setIsUpgrading(false);
    }
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Certificate Upgrade</DialogTitle>
          </DialogHeader>
          <div className="flex h-48 items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!eligibility) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Certificate Upgrade</DialogTitle>
            <DialogDescription>Unable to load upgrade information</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  // Not eligible case
  if (!eligibility.isEligible) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Certificate Upgrade
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {eligibility.reason || 'You are not currently eligible to upgrade this certificate.'}
              </AlertDescription>
            </Alert>

            {eligibility.blockers.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium">Blockers:</p>
                <ul className="space-y-2">
                  {eligibility.blockers.map((blocker, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <AlertCircle className="mt-0.5 h-4 w-4 text-destructive" />
                      {blocker.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Upgrade Your Certificate
          </DialogTitle>
          <DialogDescription>
            A newer version of your certificate is available. Complete the additional requirements
            to upgrade.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current certificate */}
          <div className="rounded-lg border bg-muted/50 p-4">
            <p className="text-xs text-muted-foreground">Current Certificate</p>
            <div className="mt-1 flex items-center gap-2">
              <Award className="h-5 w-5 text-muted-foreground" />
              <Badge variant="outline" className="font-mono">
                v{eligibility.currentIssuance.version}
              </Badge>
            </div>
          </div>

          {/* Available upgrades */}
          <div className="space-y-3">
            <p className="text-sm font-medium">Available Upgrades</p>
            {eligibility.availableUpgrades.map((upgrade) => (
              <div
                key={upgrade.definitionId}
                className={cn(
                  'cursor-pointer rounded-lg border p-4 transition-all',
                  selectedUpgrade === upgrade.definitionId
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'hover:border-primary/50'
                )}
                onClick={() => setSelectedUpgrade(upgrade.definitionId)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-primary" />
                    <span className="font-medium">{upgrade.title}</span>
                    <Badge variant="default" className="bg-green-600 font-mono">
                      v{upgrade.version}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDate(upgrade.upgradeDeadline)}
                  </div>
                </div>

                {/* Additional requirements */}
                {upgrade.additionalRequirements.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs text-muted-foreground">Additional Requirements:</p>
                    <ul className="space-y-1">
                      {upgrade.additionalRequirements.map((req, index) => (
                        <li
                          key={index}
                          className="flex items-center gap-2 text-sm"
                        >
                          {req.isNewCourse ? (
                            <Plus className="h-3 w-3 text-blue-500" />
                          ) : (
                            <RefreshCw className="h-3 w-3 text-amber-500" />
                          )}
                          <span>{req.courseTitle}</span>
                          <Badge variant="outline" className="text-xs">
                            {req.isNewCourse ? 'New Course' : 'Updated Version'}
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {upgrade.additionalRequirements.length === 0 && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    No additional requirements - ready to upgrade!
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Info alert */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Upgrading will replace your current certificate with the new version. Your
              completion history and achievements will be preserved.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isUpgrading}>
            Cancel
          </Button>
          <Button
            onClick={handleUpgrade}
            disabled={!selectedUpgrade || isUpgrading}
          >
            {isUpgrading ? 'Upgrading...' : 'Upgrade Certificate'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
