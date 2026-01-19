/**
 * Certificate Verification Page (Public)
 * Public page for verifying certificate authenticity
 */

import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Separator } from '@/shared/ui/separator';
import { client } from '@/shared/api/client';
import {
  CheckCircle,
  XCircle,
  Search,
  Loader2,
  AlertCircle,
  Download,
  ExternalLink,
} from 'lucide-react';
import { format } from 'date-fns';

// Format date string for display
const formatDate = (dateString: string): string => {
  try {
    return format(new Date(dateString), 'MMMM d, yyyy');
  } catch {
    return dateString;
  }
};

interface CertificateVerificationResult {
  valid: boolean;
  certificate?: {
    id: string;
    learnerName: string;
    courseName: string;
    courseCode: string;
    issueDate: string;
    expiryDate?: string;
    grade?: string;
    gradePercentage?: number;
    verificationCode: string;
    certificateId: string;
    pdfUrl?: string;
  };
  error?: string;
}

async function verifyCertificate(code: string): Promise<CertificateVerificationResult> {
  const response = await client.get<CertificateVerificationResult>(
    `/certificates/verify/${code}`
  );
  return response.data;
}

export const CertificateVerificationPage: React.FC = () => {
  const { certificateId } = useParams<{ certificateId?: string }>();
  const [searchParams] = useSearchParams();
  const codeFromUrl = certificateId || searchParams.get('code') || '';

  const [verificationCode, setVerificationCode] = React.useState(codeFromUrl);
  const [searchCode, setSearchCode] = React.useState('');

  // Query
  const {
    data: result,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['certificate-verification', verificationCode],
    queryFn: () => verifyCertificate(verificationCode),
    enabled: !!verificationCode && verificationCode.length > 0,
    retry: false,
  });

  const handleSearch = () => {
    if (searchCode.trim()) {
      setVerificationCode(searchCode.trim().toUpperCase());
      refetch();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container max-w-4xl mx-auto p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            Certificate Verification
          </h1>
          <p className="text-muted-foreground">
            Verify the authenticity of issued certificates
          </p>
        </div>

        {/* Search Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Enter Verification Code</CardTitle>
            <CardDescription>
              Enter the verification code found on the certificate to verify its authenticity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="e.g., CERT-12345-ABCDE"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                className="font-mono uppercase"
              />
              <Button onClick={handleSearch} disabled={!searchCode.trim() || isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Search className="mr-2 h-4 w-4" />
                )}
                Verify
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Verifying certificate...</p>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card className="border-destructive">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <h3 className="text-lg font-semibold mb-2">Verification Failed</h3>
              <p className="text-sm text-muted-foreground text-center">
                Unable to verify certificate. Please check the code and try again.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Invalid Certificate */}
        {result && !result.valid && !isLoading && (
          <Card className="border-destructive">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <XCircle className="h-16 w-16 text-destructive mb-4" />
              <h3 className="text-xl font-bold mb-2">Invalid Certificate</h3>
              <p className="text-muted-foreground text-center max-w-md">
                {result.error || 'This certificate could not be verified. It may be invalid, expired, or revoked.'}
              </p>
              <Badge variant="destructive" className="mt-4">
                Not Verified
              </Badge>
            </CardContent>
          </Card>
        )}

        {/* Valid Certificate */}
        {result && result.valid && result.certificate && !isLoading && (
          <Card className="border-green-600">
            <CardHeader className="bg-green-50 dark:bg-green-900/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div>
                    <CardTitle className="text-green-900 dark:text-green-100">
                      Valid Certificate
                    </CardTitle>
                    <CardDescription>
                      This certificate has been verified as authentic
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="border-green-600 text-green-600 bg-green-50">
                  Verified
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {/* Recipient Information */}
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">
                    Recipient Information
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Name:</span>
                      <span className="text-sm font-medium">
                        {result.certificate.learnerName}
                      </span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Course Information */}
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">
                    Course Information
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Course Name:</span>
                      <span className="text-sm font-medium">
                        {result.certificate.courseName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Course Code:</span>
                      <span className="text-sm font-mono">
                        {result.certificate.courseCode}
                      </span>
                    </div>
                    {result.certificate.grade && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Grade:</span>
                        <span className="text-sm font-medium">
                          {result.certificate.grade}
                          {result.certificate.gradePercentage &&
                            ` (${result.certificate.gradePercentage}%)`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Certificate Details */}
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">
                    Certificate Details
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Certificate ID:</span>
                      <span className="text-sm font-mono">
                        {result.certificate.certificateId}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Verification Code:</span>
                      <span className="text-sm font-mono">
                        {result.certificate.verificationCode}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Issue Date:</span>
                      <span className="text-sm font-medium">
                        {formatDate(result.certificate.issueDate)}
                      </span>
                    </div>
                    {result.certificate.expiryDate && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Expiry Date:</span>
                        <span className="text-sm font-medium">
                          {formatDate(result.certificate.expiryDate)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {result.certificate.pdfUrl && (
                  <>
                    <Separator />
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => window.open(result.certificate!.pdfUrl, '_blank')}
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View Certificate
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = result.certificate!.pdfUrl!;
                          link.download = `certificate-${result.certificate!.certificateId}.pdf`;
                          link.click();
                        }}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Information Card */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">About Certificate Verification</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              This verification system allows you to confirm the authenticity of certificates
              issued by our learning management system.
            </p>
            <p>
              Each certificate contains a unique verification code that can be checked against
              our database to ensure it is genuine and has not been altered.
            </p>
            <p>
              If you have questions about a certificate or the verification process, please
              contact our support team.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
