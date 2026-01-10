/**
 * CertificateViewPage
 * Full-screen certificate viewer with print-optimized layout
 */

import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useEnrollment } from '@/entities/enrollment';
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
  ShieldCheck,
  ArrowLeft,
  Calendar,
  Hash,
  GraduationCap,
  Clock,
} from 'lucide-react';
import { useToast } from '@/shared/ui/use-toast';

// Format date to readable string
const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'N/A';

  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Format certificate ID
const formatCertificateId = (enrollmentId: string): string => {
  return enrollmentId.toUpperCase();
};

export const CertificateViewPage: React.FC = () => {
  const { certificateId } = useParams<{ certificateId: string }>();
  const { toast } = useToast();

  const { data: enrollment, isLoading, error } = useEnrollment(certificateId || '');

  const handleDownload = () => {
    toast({
      title: 'Download Started',
      description: 'Your certificate PDF is being generated.',
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/learner/certificates/${certificateId}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: 'Link Copied',
        description: 'Certificate link copied to clipboard.',
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
    if (enrollment) {
      toast({
        title: 'Certificate Verified',
        description: `Certificate ${formatCertificateId(enrollment.id)} is authentic and valid.`,
      });
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
  if (error || !enrollment) {
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

  const learnerName = `${enrollment.learner.firstName} ${enrollment.learner.lastName}`;
  const courseName = enrollment.target.name;
  const courseCode = enrollment.target.code;
  const issueDate = formatDate(enrollment.completedAt);
  const expiryDate = enrollment.expiresAt ? formatDate(enrollment.expiresAt) : 'Does not expire';
  const verificationCode = formatCertificateId(enrollment.id);

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
                  <Award className="h-20 w-20 mx-auto text-primary mb-4" />
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

                {/* Course Name */}
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-bold text-foreground mb-2">
                    {courseName}
                  </h3>
                  <Badge variant="secondary" className="text-lg px-4 py-1">
                    {courseCode}
                  </Badge>
                </div>

                {/* Grade Display */}
                {enrollment.grade && enrollment.grade.score !== null && enrollment.grade.letter && (
                  <div className="text-center mb-8">
                    <p className="text-muted-foreground mb-2">with a grade of</p>
                    <div className="inline-flex items-center gap-3">
                      <Badge variant="default" className="text-2xl px-6 py-2 font-bold">
                        {enrollment.grade.letter}
                      </Badge>
                      <span className="text-xl text-muted-foreground">
                        ({enrollment.grade.score}%)
                      </span>
                    </div>
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
                    <p className="font-semibold">Department</p>
                    <p>{enrollment.department.name}</p>
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
                  {/* Course Information */}
                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-1">
                      <GraduationCap className="h-4 w-4" />
                      <span>Course</span>
                    </div>
                    <p className="font-medium">{courseName}</p>
                    <p className="text-sm text-muted-foreground">{courseCode}</p>
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
                    <p className="font-medium">{expiryDate}</p>
                  </div>

                  {/* Grade */}
                  {enrollment.grade && enrollment.grade.score !== null && enrollment.grade.letter && (
                    <div>
                      <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-1">
                        <Award className="h-4 w-4" />
                        <span>Grade</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="font-bold">
                          {enrollment.grade.letter}
                        </Badge>
                        <span className="text-muted-foreground">
                          ({enrollment.grade.score}%)
                        </span>
                      </div>
                    </div>
                  )}

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
                    <Button
                      onClick={handleDownload}
                      className="w-full print:hidden"
                      variant="default"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                    <Button
                      onClick={handlePrint}
                      className="w-full print:hidden"
                      variant="outline"
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
                      <ShieldCheck className="h-4 w-4 mr-2" />
                      Verify Certificate
                    </Button>
                  </div>
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
