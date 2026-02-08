/**
 * CertificateViewPage
 * Full-screen certificate viewer for issued credentials
 */

import React from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useLearnerCertificates, useCertificateIssuance } from '@/entities/credential/hooks/useCredentials';
import { useAuthStore } from '@/features/auth/model/authStore';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { Badge } from '@/shared/ui/badge';
import { Separator } from '@/shared/ui/separator';
import {
  Award,
  Download,
  Printer,
  Share2,
  ArrowLeft,
  Calendar,
  Hash,
  GraduationCap,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { useToast } from '@/shared/ui/use-toast';

// Format date to readable string
const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'N/A';

  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const CertificateViewPage: React.FC = () => {
  const { certificateId } = useParams<{ certificateId: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  // Get list item for display (includes learner, credential group, certificate definition)
  const { data: certificates, isLoading: isLoadingList, error: errorList } = useLearnerCertificates(
    user?._id || '',
    true // Include revoked certificates for viewing
  );
  const listItem = certificates?.find((cert) => cert.id === certificateId);

  // Get full issuance for additional details like pdfUrl
  const { data: fullIssuance, isLoading: isLoadingFull, error: errorFull } = useCertificateIssuance(
    certificateId || '',
    { enabled: !!certificateId }
  );

  const isLoading = isLoadingList || isLoadingFull;
  const error = errorList || errorFull;
  const issuance = listItem; // Use list item for display since it has nested objects
  const pdfUrl = fullIssuance?.pdfUrl; // Get pdfUrl from full issuance

  const handleDownload = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    } else {
      toast({
        title: 'PDF Not Available',
        description: 'Certificate PDF is being generated.',
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (!issuance) return;
    const shareUrl = `${window.location.origin}/verify?code=${issuance.verificationCode}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: 'Link Copied',
        description: 'Certificate verification link copied to clipboard.',
      });
    } catch (error) {
      toast({
        title: 'Failed to Copy',
        description: 'Could not copy link to clipboard.',
        variant: 'destructive',
      });
    }
  };

  const handleVerify = () => {
    if (issuance) {
      navigate(`/verify?code=${issuance.verificationCode}`);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background" data-testid="loading-skeleton">
        <div className="container mx-auto py-8 px-4">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Skeleton className="h-[600px] w-full" />
            </div>
            <div>
              <Skeleton className="h-[400px] w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !issuance) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8 px-4">
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <div className="text-center">
                <Award className="h-16 w-16 mx-auto text-destructive mb-4" />
                <h2 className="text-2xl font-bold text-destructive mb-2">
                  Certificate not found
                </h2>
                <p className="text-muted-foreground mb-4">
                  {error?.message || 'The certificate you are looking for does not exist.'}
                </p>
                <Button asChild>
                  <Link to="/learner/certificates">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Certificates
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Extract certificate data
  const learnerName = `${issuance.learner.firstName} ${issuance.learner.lastName}`;
  const certificateTitle = issuance.certificateDefinition.title;
  const credentialName = issuance.credentialGroup.name;
  const credentialCode = issuance.credentialGroup.code;
  const issueDate = formatDate(issuance.issuedAt);
  const expiryDate = issuance.expiresAt ? formatDate(issuance.expiresAt) : 'Does not expire';
  const verificationCode = issuance.verificationCode;
  const isRevoked = issuance.isRevoked;
  const isExpired = issuance.expiresAt ? new Date(issuance.expiresAt) < new Date() : false;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        {/* Header with Back Button - Hidden on Print */}
        <div className="mb-8 print:hidden">
          <Button variant="ghost" asChild>
            <Link to="/learner/certificates">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Certificates
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Certificate Display */}
          <div className="lg:col-span-2" data-print-optimized>
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-2 border-primary/20">
              <CardContent className="p-12">
                {/* Certificate Header */}
                <div className="text-center mb-8">
                  {issuance.credentialGroup.badgeImageUrl ? (
                    <img
                      src={issuance.credentialGroup.badgeImageUrl}
                      alt={credentialName}
                      className="h-20 w-20 mx-auto mb-4"
                    />
                  ) : (
                    <Award className="h-20 w-20 mx-auto text-primary mb-4" />
                  )}
                  <h1 className="text-4xl font-bold text-primary mb-2">
                    Certificate of Completion
                  </h1>
                  <p className="text-muted-foreground">
                    This certifies that
                  </p>
                </div>

                {/* Learner Name */}
                <div className="text-center mb-8">
                  <h2 className="text-5xl font-serif font-bold text-foreground mb-2">
                    {learnerName}
                  </h2>
                  <p className="text-muted-foreground">
                    has successfully completed
                  </p>
                </div>

                {/* Certificate Title */}
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-bold text-foreground mb-2">
                    {certificateTitle}
                  </h3>
                  <p className="text-lg text-muted-foreground mb-2">{credentialName}</p>
                  <Badge variant="secondary" className="text-lg px-4 py-1">
                    {credentialCode}
                  </Badge>
                  {issuance.certificateDefinition.version && (
                    <Badge variant="outline" className="text-sm px-3 py-1 ml-2">
                      v{issuance.certificateDefinition.version}
                    </Badge>
                  )}
                </div>

                {/* Status Badges */}
                {(isRevoked || isExpired) && (
                  <div className="text-center mb-8">
                    {isRevoked && (
                      <Badge variant="destructive" className="text-lg px-4 py-1">
                        REVOKED
                      </Badge>
                    )}
                    {isExpired && !isRevoked && (
                      <Badge variant="secondary" className="text-lg px-4 py-1">
                        EXPIRED
                      </Badge>
                    )}
                  </div>
                )}

                <Separator className="my-8" />

                {/* Certificate Details Footer */}
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <div>
                    <p className="font-semibold">Issue Date</p>
                    <p>{issueDate}</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold">Certificate ID</p>
                    <p className="font-mono">{verificationCode}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">Credential Type</p>
                    <p className="capitalize">{issuance.credentialGroup.type}</p>
                  </div>
                </div>

                {/* Verification Notice */}
                <div className="mt-8 text-center text-xs text-muted-foreground">
                  <p>
                    This certificate can be verified at{' '}
                    <span className="font-mono">{window.location.origin}/verify</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Certificate Details Sidebar - Hidden on Print */}
          <div className="print:hidden">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-bold mb-4">Certificate Details</h3>

                <div className="space-y-4">
                  {/* Credential Information */}
                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-1">
                      <GraduationCap className="h-4 w-4" />
                      <span>Credential</span>
                    </div>
                    <p className="font-medium">{certificateTitle}</p>
                    <p className="text-sm text-muted-foreground">{credentialName}</p>
                    <p className="text-xs text-muted-foreground font-mono">{credentialCode}</p>
                  </div>

                  <Separator />

                  {/* Issue Date */}
                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-1">
                      <Calendar className="h-4 w-4" />
                      <span>Issue Date</span>
                    </div>
                    <p className="font-medium">{issueDate}</p>
                  </div>

                  {/* Expiry Date */}
                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-1">
                      <Clock className="h-4 w-4" />
                      <span>Expiry Date</span>
                    </div>
                    <p className={`font-medium ${isExpired ? 'text-amber-600' : ''}`}>
                      {expiryDate}
                    </p>
                  </div>

                  {/* Verification Code */}
                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-1">
                      <Hash className="h-4 w-4" />
                      <span>Verification Code</span>
                    </div>
                    <p className="font-mono text-sm">{verificationCode}</p>
                  </div>

                  <Separator />

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    {pdfUrl && (
                      <Button
                        onClick={handleDownload}
                        className="w-full print:hidden"
                        variant="default"
                        disabled={isRevoked}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </Button>
                    )}
                    <Button
                      onClick={handlePrint}
                      className="w-full print:hidden"
                      variant="outline"
                      disabled={isRevoked}
                    >
                      <Printer className="h-4 w-4 mr-2" />
                      Print Certificate
                    </Button>
                    <Button
                      onClick={handleShare}
                      className="w-full print:hidden"
                      variant="outline"
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share Certificate
                    </Button>
                    <Button
                      onClick={handleVerify}
                      className="w-full print:hidden"
                      variant="outline"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Verify Certificate
                    </Button>
                  </div>

                  {/* Revoked Notice */}
                  {isRevoked && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <p className="text-sm text-destructive font-semibold">
                        This certificate has been revoked and is no longer valid.
                      </p>
                    </div>
                  )}

                  {/* Expired Notice */}
                  {isExpired && !isRevoked && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg dark:bg-amber-950/20 dark:border-amber-800">
                      <p className="text-sm text-amber-600 dark:text-amber-400 font-semibold">
                        This certificate has expired.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }

          .print\\:hidden {
            display: none !important;
          }

          [data-print-optimized] {
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
};
