'use client';

import { useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { useAdminEvents, useAuthFetch } from '@/hooks';
import { EventCard, EventStats } from '@/components/shared';

type EventState = 'ALL' | 'DRAFT' | 'OPEN' | 'FROZEN' | 'DRAWN' | 'PUBLISHED';

const EVENTS_PER_PAGE = 10;

export function EventsList() {
  const queryClient = useQueryClient();
  const authFetch = useAuthFetch();
  const t = useTranslations('eventsList');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<EventState>('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  const { data: events, isLoading } = useAdminEvents();

  const publishDrawMutation = useMutation({
    mutationFn: async (eventId: string) => {
      return authFetch.post(`/draws/events/${eventId}/publish`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      toast.success('Draw published successfully! Players have been notified.');
    },
    onError: (error: Error) => {
      toast.error(`Failed to publish draw: ${error.message}`);
    },
  });

  // Filter events based on selected date and status
  const filteredEvents = useMemo(() => {
    if (!events) return [];

    return events.filter((event) => {
      // Filter by selected date
      if (selectedDate) {
        const eventDate = new Date(event.date);
        // Reset time to start of day for comparison
        eventDate.setHours(0, 0, 0, 0);
        const filterDate = new Date(selectedDate);
        filterDate.setHours(0, 0, 0, 0);

        // Only show events on the exact selected date
        if (eventDate.getTime() !== filterDate.getTime()) return false;
      }

      // Filter by status
      if (statusFilter !== 'ALL' && event.state !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [events, selectedDate, statusFilter]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredEvents.length / EVENTS_PER_PAGE);
  const startIndex = (currentPage - 1) * EVENTS_PER_PAGE;
  const endIndex = startIndex + EVENTS_PER_PAGE;
  const paginatedEvents = filteredEvents.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedDate, statusFilter]);

  if (isLoading) {
    return <div className="text-center py-8">{t('loadingEvents')}</div>;
  }

  if (!events || events.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          {t('noEventsFound')}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center sm:justify-end">
        {/* Date Filter */}
        <div className="w-full sm:w-auto">
          <DatePicker
            id="eventDate"
            value={selectedDate}
            onChange={setSelectedDate}
            placeholder={t('selectDate')}
          />
        </div>

        {/* Status Filter */}
        <div className="w-full sm:w-auto sm:min-w-[200px]">
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as EventState)}
          >
            <SelectTrigger id="status">
              <SelectValue placeholder={t('status')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{t('allStatuses')}</SelectItem>
              <SelectItem value="DRAFT">{t('statusDraft')}</SelectItem>
              <SelectItem value="OPEN">{t('statusOpen')}</SelectItem>
              <SelectItem value="FROZEN">{t('statusFrozen')}</SelectItem>
              <SelectItem value="DRAWN">{t('statusDrawn')}</SelectItem>
              <SelectItem value="PUBLISHED">{t('statusPublished')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSelectedDate(undefined);
            setStatusFilter('ALL');
          }}
          disabled={!selectedDate && statusFilter === 'ALL'}
          title={t('clearFilters')}
        >
          {t('clearFilters')}
        </Button>
      </div>

      {/* Events List */}
      {filteredEvents.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {selectedDate || statusFilter !== 'ALL'
              ? t('noEventsMatchFilters')
              : t('noEventsFound')}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4">
            {paginatedEvents.map((event) => {
              // Check if event has passed
              const eventEndTime = new Date(event.endsAt);
              const hasEventPassed = eventEndTime < new Date();

              return (
                <EventCard
                  key={event.id}
                  event={event}
                  headerActions={
                    <Badge variant={event.state === 'PUBLISHED' ? 'default' : 'secondary'}>
                      {event.state}
                    </Badge>
                  }
                >
                  <div className="flex items-center justify-between">
                    <EventStats
                      event={event}
                      confirmedLabel={t('confirmed')}
                      waitlistedLabel={t('waitlisted')}
                    />
                    <div className="flex gap-2">
                      <Link href={`/admin/events/${event.id}`}>
                        <Button variant="outline" size="sm">
                          {t('manage')}
                        </Button>
                      </Link>
                      {event.state === 'FROZEN' && !hasEventPassed && (
                        <Link href={`/admin/events/${event.id}/draw`}>
                          <Button size="sm">{t('generateDraw')}</Button>
                        </Link>
                      )}
                      {event.state === 'DRAWN' && !hasEventPassed && (
                        <Button
                          size="sm"
                          onClick={() => publishDrawMutation.mutate(event.id)}
                          disabled={publishDrawMutation.isPending}
                        >
                          {publishDrawMutation.isPending ? 'Publishing...' : t('publish')}
                        </Button>
                      )}
                      {event.state === 'PUBLISHED' && hasEventPassed && (
                        <Link href={`/admin/events/${event.id}/results`}>
                          <Button size="sm">{t('enterResults')}</Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </EventCard>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t pt-4">
              <div className="text-sm text-muted-foreground">
                {t('showingResults', {
                  start: startIndex + 1,
                  end: Math.min(endIndex, filteredEvents.length),
                  total: filteredEvents.length,
                })}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  {t('previous')}
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // Show first page, last page, current page, and pages around current
                    const showPage =
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1);

                    if (!showPage) {
                      // Show ellipsis
                      if (page === currentPage - 2 || page === currentPage + 2) {
                        return (
                          <span key={page} className="px-2 text-muted-foreground">
                            ...
                          </span>
                        );
                      }
                      return null;
                    }

                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="min-w-[2.5rem]"
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  {t('next')}
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
