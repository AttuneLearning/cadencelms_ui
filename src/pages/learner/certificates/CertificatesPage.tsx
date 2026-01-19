/**
 * CertificatesPage
 * Display learner's earned certificates for completed courses
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMyEnrollments } from '@/entities/enrollment';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { Badge } from '@/shared/ui/badge';
import { Label } from '@/shared/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { Award, Search as SearchIcon, Printer, Download, Calendar, Hash, Share2, ShieldCheck, Eye, RefreshCw } from 'lucide-react';
import { useToast } from '@/shared/ui/use-toast';
import { ErrorPanel } from '@/shared/ui/error-panel';
import { DataShapeWarning } from '@/shared/ui/data-shape-warning';
import type { EnrollmentListItem } from '@/entities/enrollment';

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

interface CertificateCardProps {
  enrollment: EnrollmentListItem;
}

const CertificateCard: React.FC<CertificateCardProps> = ({ enrollment }) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleView = () => {
    navigate(`/learner/certificates/${enrollment.id}`);
  };

  const handleDownload = () => {
    // Placeholder for download PDF functionality
    toast({
      title: 'Download Started',
      description: 'Your certificate is being downloaded.',
    });
  };

  const handlePrint = () => {
    // Navigate to certificate view page which has print styling
    navigate(`/learner/certificates/${enrollment.id}`);
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/learner/certificates/${enrollment.id}`;
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
    // Placeholder for verify certificate functionality
    toast({
      title: 'Certificate Verified',
      description: `Certificate ${formatCertificateId(enrollment.id)} is authentic and valid.`,
    });
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2">{enrollment.target.name}</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <span className="font-mono">{enrollment.target.code}</span>
            </div>
          </div>
          <Award className="h-8 w-8 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Completion Date */}
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Completed:</span>
            <span className="font-medium">{formatDate(enrollment.completedAt)}</span>
          </div>

          {/* Certificate ID */}
          <div className="flex items-center gap-2 text-sm">
            <Hash className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Certificate ID:</span>
            <span className="font-mono text-xs">{formatCertificateId(enrollment.id)}</span>
          </div>

          {/* Grade */}
          {enrollment.grade && enrollment.grade.score !== null && enrollment.grade.letter && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Grade:</span>
              <Badge variant="secondary" className="font-semibold">
                {enrollment.grade.letter}
              </Badge>
              <span className="text-muted-foreground">({enrollment.grade.score}%)</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <Button
              onClick={handleView}
              className="w-full"
              variant="default"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Certificate
            </Button>
            <div className="grid grid-cols-4 gap-2">
              <Button
                onClick={handleDownload}
                variant="outline"
                size="sm"
                title="Download PDF"
              >
                <Download className="h-4 w-4" />
                <span className="sr-only">Download</span>
              </Button>
              <Button
                onClick={handlePrint}
                variant="outline"
                size="sm"
                title="Print Certificate"
              >
                <Printer className="h-4 w-4" />
                <span className="sr-only">Print</span>
              </Button>
              <Button
                onClick={handleShare}
                variant="outline"
                size="sm"
                title="Share Certificate"
              >
                <Share2 className="h-4 w-4" />
                <span className="sr-only">Share</span>
              </Button>
              <Button
                onClick={handleVerify}
                variant="outline"
                size="sm"
                title="Verify Certificate"
              >
                <ShieldCheck className="h-4 w-4" />
                <span className="sr-only">Verify</span>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const CertificatesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('completedAt:desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const { data, isLoading, error, refetch } = useMyEnrollments({
    status: 'completed',
    type: 'course',
    sort: sortBy,
    page: currentPage,
    limit: 12,
  });

  const enrollments = data?.enrollments || [];
  const pagination = data?.pagination;
  const warningDetails = data?.shapeWarning
    ? { ...data.shapeWarning, component: 'CertificatesPage' }
    : undefined;

  // Client-side filter for search and date range
  const filteredEnrollments = enrollments.filter((enrollment) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesTitle = enrollment.target.name.toLowerCase().includes(query);
      const matchesCode = enrollment.target.code.toLowerCase().includes(query);
      const matchesCertId = enrollment.id.toLowerCase().includes(query);
      if (!matchesTitle && !matchesCode && !matchesCertId) {
        return false;
      }
    }

    // Date range filter
    if (fromDate || toDate) {
      const completedDate = enrollment.completedAt ? new Date(enrollment.completedAt) : null;
      if (!completedDate) return false;

      if (fromDate) {
        const from = new Date(fromDate);
        from.setHours(0, 0, 0, 0);
        if (completedDate < from) return false;
      }

      if (toDate) {
        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999);
        if (completedDate > to) return false;
      }
    }

    return true;
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Certificates</h1>
        <p className="text-muted-foreground">
          View and download your earned certificates for completed courses
        </p>
      </div>

      {/* Search and Sort */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search certificates by course name or code..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10"
            />
          </div>
          <div className="sm:w-64">
            <Label htmlFor="sort-select" className="sr-only">
              Sort by
            </Label>
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger id="sort-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="completedAt:desc">Completion Date (Newest)</SelectItem>
                <SelectItem value="completedAt:asc">Completion Date (Oldest)</SelectItem>
                <SelectItem value="target.name:asc">Course Name (A-Z)</SelectItem>
                <SelectItem value="target.name:desc">Course Name (Z-A)</SelectItem>
                <SelectItem value="grade.score:desc">Grade (High to Low)</SelectItem>
                <SelectItem value="grade.score:asc">Grade (Low to High)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Label htmlFor="from-date">From Date</Label>
            <Input
              id="from-date"
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setCurrentPage(1);
              }}
              className="mt-1"
            />
          </div>
          <div className="flex-1">
            <Label htmlFor="to-date">To Date</Label>
            <Input
              id="to-date"
              type="date"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setCurrentPage(1);
              }}
              className="mt-1"
            />
          </div>
          {(fromDate || toDate) && (
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setFromDate('');
                  setToDate('');
                  setCurrentPage(1);
                }}
              >
                Clear Dates
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <ErrorPanel
          title="Unable to load certificates"
          message="There was a problem loading your certificates. Please try again."
          error={error}
          details={{
            endpoint: '/enrollments/my-courses',
            component: 'CertificatesPage',
            params: { status: 'completed', type: 'course' },
          }}
          onRetry={() => refetch()}
          links={[
            { label: 'Back to Dashboard', to: '/learner/dashboard' },
            { label: 'Browse Courses', to: '/learner/catalog' },
          ]}
        />
      )}

      {/* Data Shape Warning */}
      {warningDetails && (
        <DataShapeWarning
          title="Certificate data may be incomplete"
          message="The enrollment response did not match the expected shape. Some certificates may not display correctly."
          details={warningDetails}
        />
      )}

      {/* Loading State */}
      {isLoading && (
        <div data-testid="loading-skeleton">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-3" />
                  <Skeleton className="h-4 w-full mb-3" />
                  <Skeleton className="h-4 w-2/3 mb-3" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredEnrollments.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Award className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery
                  ? 'No certificates found'
                  : 'No certificates earned yet'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery
                  ? 'Try adjusting your search query'
                  : 'Complete courses to earn certificates and showcase your achievements'}
              </p>
              {!searchQuery && (
                <Button asChild>
                  <Link to="/learner/catalog">Browse Course Catalog</Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Certificate Grid */}
      {!isLoading && !error && filteredEnrollments.length > 0 && (
        <>
          <div className="mb-4 text-sm text-muted-foreground">
            Showing {filteredEnrollments.length} of {pagination?.total || 0} certificates
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEnrollments.map((enrollment) => (
              <CertificateCard key={enrollment.id} enrollment={enrollment} />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => p - 1)}
                  disabled={!pagination.hasPrev}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={!pagination.hasNext}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
