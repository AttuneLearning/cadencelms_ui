/**
 * CertificatesPage
 * Display learner's earned certificates for completed courses
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
import { Award, Search as SearchIcon, Printer, Download, Calendar, Hash } from 'lucide-react';
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
  const handleView = () => {
    // Placeholder for view certificate functionality
    console.log('View certificate:', enrollment.id);
  };

  const handlePrint = () => {
    // Placeholder for print functionality
    console.log('Print certificate:', enrollment.id);
    window.print();
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
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleView}
              className="flex-1"
              variant="default"
            >
              <Download className="h-4 w-4 mr-2" />
              View Certificate
            </Button>
            <Button
              onClick={handlePrint}
              variant="outline"
              size="icon"
            >
              <Printer className="h-4 w-4" />
            </Button>
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

  const { data, isLoading, error } = useMyEnrollments({
    status: 'completed',
    type: 'course',
    sort: sortBy,
    page: currentPage,
    limit: 12,
  });

  const enrollments = data?.enrollments || [];
  const pagination = data?.pagination;

  // Client-side filter for search
  const filteredEnrollments = enrollments.filter((enrollment) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesTitle = enrollment.target.name.toLowerCase().includes(query);
      const matchesCode = enrollment.target.code.toLowerCase().includes(query);
      const matchesCertId = enrollment.id.toLowerCase().includes(query);
      return matchesTitle || matchesCode || matchesCertId;
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
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
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

      {/* Error State */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-center text-destructive">
              <p className="font-semibold">Error loading certificates</p>
              <p className="text-sm mt-1">
                {error instanceof Error ? error.message : 'An error occurred'}
              </p>
            </div>
          </CardContent>
        </Card>
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
