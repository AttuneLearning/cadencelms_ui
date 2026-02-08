/**
 * CertificatesPage
 * Display learner's earned certificates from the credential system
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLearnerCertificates } from '@/entities/credential/hooks/useCredentials';
import { CertificateIssuanceCard } from '@/features/credential-management';
import type { CertificateIssuanceListItem } from '@/entities/credential';
import { useAuthStore } from '@/features/auth/model/authStore';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { Label } from '@/shared/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { Award, Search as SearchIcon } from 'lucide-react';
import { useToast } from '@/shared/ui/use-toast';
import { ErrorPanel } from '@/shared/ui/error-panel';
import { PageHeader } from '@/shared/ui/page-header';


export const CertificatesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('issuedAt:desc');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const { toast } = useToast();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  // Get learner's certificates from credential system
  const { data: certificates, isLoading, error, refetch } = useLearnerCertificates(
    user?._id || '',
    false // Don't include revoked certificates
  );

  // Client-side filter for search and date range
  const filteredCertificates = (certificates || []).filter((certificate) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesTitle = certificate.certificateDefinition.title.toLowerCase().includes(query);
      const matchesGroupName = certificate.credentialGroup.name.toLowerCase().includes(query);
      const matchesCode = certificate.credentialGroup.code.toLowerCase().includes(query);
      const matchesVerificationCode = certificate.verificationCode.toLowerCase().includes(query);
      if (!matchesTitle && !matchesGroupName && !matchesCode && !matchesVerificationCode) {
        return false;
      }
    }

    // Date range filter
    if (fromDate || toDate) {
      const issuedDate = certificate.issuedAt ? new Date(certificate.issuedAt) : null;
      if (!issuedDate) return false;

      if (fromDate) {
        const from = new Date(fromDate);
        from.setHours(0, 0, 0, 0);
        if (issuedDate < from) return false;
      }

      if (toDate) {
        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999);
        if (issuedDate > to) return false;
      }
    }

    return true;
  });

  // Sort certificates
  const sortedCertificates = [...filteredCertificates].sort((a, b) => {
    switch (sortBy) {
      case 'issuedAt:desc':
        return new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime();
      case 'issuedAt:asc':
        return new Date(a.issuedAt).getTime() - new Date(b.issuedAt).getTime();
      case 'title:asc':
        return a.certificateDefinition.title.localeCompare(b.certificateDefinition.title);
      case 'title:desc':
        return b.certificateDefinition.title.localeCompare(a.certificateDefinition.title);
      case 'expiresAt:asc':
        if (!a.expiresAt) return 1;
        if (!b.expiresAt) return -1;
        return new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime();
      case 'expiresAt:desc':
        if (!a.expiresAt) return 1;
        if (!b.expiresAt) return -1;
        return new Date(b.expiresAt).getTime() - new Date(a.expiresAt).getTime();
      default:
        return 0;
    }
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
  };

  const handleDownload = () => {
    // TODO: Implement PDF download when backend provides pdfUrl
    toast({
      title: 'Download Started',
      description: 'Your certificate PDF is being downloaded.',
    });
  };

  const handleShare = async (certificate: CertificateIssuanceListItem) => {
    const shareUrl = `${window.location.origin}/verify?code=${certificate.verificationCode}`;
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

  const handleVerify = (certificate: CertificateIssuanceListItem) => {
    navigate(`/verify?code=${certificate.verificationCode}`);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <PageHeader
        title="My Certificates"
        description="View and download your earned certificates"
        className="mb-8"
      />

      {/* Search and Sort */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search certificates by title, code, or verification code..."
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
                <SelectItem value="issuedAt:desc">Issue Date (Newest)</SelectItem>
                <SelectItem value="issuedAt:asc">Issue Date (Oldest)</SelectItem>
                <SelectItem value="title:asc">Certificate Title (A-Z)</SelectItem>
                <SelectItem value="title:desc">Certificate Title (Z-A)</SelectItem>
                <SelectItem value="expiresAt:asc">Expiry Date (Soonest)</SelectItem>
                <SelectItem value="expiresAt:desc">Expiry Date (Latest)</SelectItem>
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
              onChange={(e) => setFromDate(e.target.value)}
              className="mt-1"
            />
          </div>
          <div className="flex-1">
            <Label htmlFor="to-date">To Date</Label>
            <Input
              id="to-date"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
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
          }}
          onRetry={() => refetch()}
          links={[
            { label: 'Back to Dashboard', to: '/learner/dashboard' },
            { label: 'Browse Courses', to: '/learner/catalog' },
          ]}
        />
      )}


      {/* Loading State */}
      {isLoading && (
        <div data-testid="loading-skeleton">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-3" />
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
      {!isLoading && !error && sortedCertificates.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Award className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery || fromDate || toDate
                  ? 'No certificates found'
                  : 'No certificates earned yet'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || fromDate || toDate
                  ? 'Try adjusting your search or date filters'
                  : 'Complete courses to earn certificates and showcase your achievements'}
              </p>
              {!searchQuery && !fromDate && !toDate && (
                <Button asChild>
                  <Link to="/learner/catalog">Browse Course Catalog</Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Certificate Grid */}
      {!isLoading && !error && sortedCertificates.length > 0 && (
        <>
          <div className="mb-4 text-sm text-muted-foreground">
            Showing {sortedCertificates.length} {sortedCertificates.length === 1 ? 'certificate' : 'certificates'}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedCertificates.map((certificate) => (
              <CertificateIssuanceCard
                key={certificate.id}
                issuance={certificate}
                onDownload={handleDownload}
                onShare={handleShare}
                onVerify={handleVerify}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
