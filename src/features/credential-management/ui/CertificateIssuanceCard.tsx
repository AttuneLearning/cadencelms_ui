/**
 * CertificateIssuanceCard Component
 * Displays an issued certificate with verification details
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import {
  Award,
  Download,
  Share2,
  ExternalLink,
  Calendar,
  ShieldCheck,
  AlertTriangle,
  User,
} from 'lucide-react';
import type { CertificateIssuanceListItem } from '@/entities/credential';
import { cn } from '@/shared/lib/utils';

interface CertificateIssuanceCardProps {
  issuance: CertificateIssuanceListItem;
  onDownload?: (issuance: CertificateIssuanceListItem) => void;
  onShare?: (issuance: CertificateIssuanceListItem) => void;
  onVerify?: (issuance: CertificateIssuanceListItem) => void;
  showLearner?: boolean;
  className?: string;
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'Never';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const isExpiringSoon = (expiresAt: string | null): boolean => {
  if (!expiresAt) return false;
  const expiry = new Date(expiresAt);
  const now = new Date();
  const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
};

const isExpired = (expiresAt: string | null): boolean => {
  if (!expiresAt) return false;
  return new Date(expiresAt) < new Date();
};

export const CertificateIssuanceCard: React.FC<CertificateIssuanceCardProps> = ({
  issuance,
  onDownload,
  onShare,
  onVerify,
  showLearner = false,
  className,
}) => {
  const expired = isExpired(issuance.expiresAt);
  const expiringSoon = !expired && isExpiringSoon(issuance.expiresAt);

  return (
    <Card
      className={cn(
        'transition-all',
        issuance.isRevoked && 'border-destructive/50 bg-destructive/5',
        expired && !issuance.isRevoked && 'border-amber-500/50 bg-amber-50/50',
        className
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            {/* Badge icon */}
            <div
              className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10"
            >
              {issuance.credentialGroup.badgeImageUrl ? (
                <img
                  src={issuance.credentialGroup.badgeImageUrl}
                  alt={issuance.credentialGroup.name}
                  className="h-10 w-10"
                />
              ) : (
                <Award className="h-8 w-8 text-primary" />
              )}
            </div>

            <div className="flex-1">
              <CardTitle className="text-lg">
                {issuance.certificateDefinition.title}
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {issuance.credentialGroup.name}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs">
                  {issuance.credentialGroup.code}
                </Badge>
                <Badge variant="outline" className="font-mono text-xs">
                  v{issuance.certificateDefinition.version}
                </Badge>
                {issuance.isRevoked ? (
                  <Badge variant="destructive" className="text-xs">
                    Revoked
                  </Badge>
                ) : expired ? (
                  <Badge variant="secondary" className="text-xs">
                    Expired
                  </Badge>
                ) : expiringSoon ? (
                  <Badge variant="default" className="bg-amber-500 text-xs">
                    Expiring Soon
                  </Badge>
                ) : (
                  <Badge variant="default" className="bg-green-600 text-xs">
                    Valid
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Learner info (optional) */}
        {showLearner && (
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>
              {issuance.learner.firstName} {issuance.learner.lastName}
            </span>
            <span className="text-muted-foreground">({issuance.learner.email})</span>
          </div>
        )}

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Issued</p>
              <p>{formatDate(issuance.issuedAt)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {expired ? (
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            ) : (
              <Calendar className="h-4 w-4 text-muted-foreground" />
            )}
            <div>
              <p className="text-xs text-muted-foreground">Expires</p>
              <p className={cn(expired && 'text-amber-600', expiringSoon && 'text-amber-600')}>
                {formatDate(issuance.expiresAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Verification code */}
        <div className="rounded-lg border bg-muted/50 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Verification Code</span>
            </div>
            <code className="rounded bg-background px-2 py-1 font-mono text-sm">
              {issuance.verificationCode}
            </code>
          </div>
        </div>

        {/* Revoked notice */}
        {issuance.isRevoked && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            <AlertTriangle className="h-4 w-4" />
            <span>This certificate has been revoked and is no longer valid.</span>
          </div>
        )}

        {/* Actions */}
        {!issuance.isRevoked && (
          <div className="flex flex-wrap gap-2">
            {onDownload && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDownload(issuance)}
                disabled={expired}
              >
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
            )}
            {onShare && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onShare(issuance)}
                disabled={expired}
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            )}
            {onVerify && (
              <Button variant="outline" size="sm" onClick={() => onVerify(issuance)}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Verify Online
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
