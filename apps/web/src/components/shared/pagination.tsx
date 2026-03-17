'use client';

import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-media-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showResultsText?: string;
  previousLabel?: string;
  nextLabel?: string;
  className?: string;
}

/**
 * Responsive pagination component optimized for mobile and desktop
 *
 * Features:
 * - Compact mobile view with icons only
 * - Full desktop view with page numbers
 * - Smart ellipsis for many pages
 * - Accessible and touch-friendly
 *
 * @example
 * ```tsx
 * <Pagination
 *   currentPage={currentPage}
 *   totalPages={totalPages}
 *   onPageChange={setCurrentPage}
 *   showResultsText={t('showingResults', { start: 1, end: 10, total: 100 })}
 *   previousLabel={t('previous')}
 *   nextLabel={t('next')}
 * />
 * ```
 */
export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showResultsText,
  previousLabel = 'Previous',
  nextLabel = 'Next',
  className,
}: PaginationProps) {
  const isMobile = useIsMobile();

  if (totalPages <= 1) {
    return null;
  }

  const renderPageNumbers = () => {
    const pages = [];

    for (let i = 1; i <= totalPages; i++) {
      // On mobile, only show current page
      if (isMobile) {
        if (i === currentPage) {
          pages.push(
            <div
              key={i}
              className="flex items-center justify-center min-w-10 h-8 px-3 text-sm font-medium"
            >
              {i} / {totalPages}
            </div>
          );
        }
        continue;
      }

      // On desktop, show first, last, current, and pages around current
      const showPage =
        i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1);

      if (!showPage) {
        // Show ellipsis
        if (i === currentPage - 2 || i === currentPage + 2) {
          pages.push(
            <span key={i} className="px-2 text-muted-foreground">
              ...
            </span>
          );
        }
        continue;
      }

      pages.push(
        <Button
          key={i}
          variant={currentPage === i ? 'default' : 'outline'}
          size="sm"
          onClick={() => onPageChange(i)}
          className="min-w-10"
        >
          {i}
        </Button>
      );
    }

    return pages;
  };

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row items-center justify-between border-t pt-4 gap-4',
        className
      )}
    >
      {/* Results text - hidden on mobile */}
      {showResultsText && (
        <div className="text-sm text-muted-foreground hidden sm:block">{showResultsText}</div>
      )}

      {/* Pagination controls - centered on mobile, right-aligned on desktop */}
      <div className={cn('flex items-center gap-2', showResultsText ? 'sm:ml-auto' : 'mx-auto')}>
        {/* Previous button */}
        <Button
          variant="outline"
          size={isMobile ? 'icon-sm' : 'sm'}
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          aria-label={previousLabel}
        >
          <ChevronLeft className="h-4 w-4" />
          {!isMobile && <span className="ml-1">{previousLabel}</span>}
        </Button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">{renderPageNumbers()}</div>

        {/* Next button */}
        <Button
          variant="outline"
          size={isMobile ? 'icon-sm' : 'sm'}
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          aria-label={nextLabel}
        >
          {!isMobile && <span className="mr-1">{nextLabel}</span>}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
