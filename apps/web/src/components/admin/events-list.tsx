'use client';

import { useEffect } from 'react';
import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Button } from '@/components/ui/button';
import { FilterX } from 'lucide-react';
import { CalendarDaysIcon } from 'lucide-animated';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import { useAdminEvents, useIsFromBfcache } from '@/hooks';
import {
  EventCard,
  EventStats,
  DataStateWrapper,
  ScrollableFadeContainer,
  Pagination,
} from '@/components/shared';
import { StatusBadge, statusConfig, type EventStatus } from '@/components/shared/status-badge';
import { cn } from '@/lib/utils';
import { EventsListSkeleton } from '@/components/shared/event/event-skeletons';
import { DatePicker } from '@/components/shared/pickers/date-picker';
import type { EventWithRSVP } from '@padel/types';

type EventState = 'ALL' | EventStatus;

const EVENTS_PER_PAGE = 10;

export function EventsList() {
  const t = useTranslations('eventsList');
  const tErrors = useTranslations('errors');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<EventState>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const isFromBfcache = useIsFromBfcache();

  const { data: events, isLoading, error } = useAdminEvents();

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

  return (
    <DataStateWrapper
      isLoading={isLoading}
      data={events}
      error={error}
      loadingMessage={t('loadingEvents')}
      loadingComponent={<EventsListSkeleton count={5} withFilters />}
      emptyMessage={t('noEventsFound')}
      errorMessage={tErrors('failedToLoadEvents')}
    >
      {() => (
        <EventsListContent
          paginatedEvents={paginatedEvents}
          filteredEvents={filteredEvents}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
          t={t}
          isFromBfcache={isFromBfcache}
        />
      )}
    </DataStateWrapper>
  );
}

interface EventsListContentProps {
  paginatedEvents: EventWithRSVP[];
  filteredEvents: EventWithRSVP[];
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  statusFilter: EventState;
  setStatusFilter: (status: EventState) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  t: ReturnType<typeof useTranslations>;
  isFromBfcache: boolean;
}

// Separate component for events list content
function EventsListContent({
  paginatedEvents,
  filteredEvents,
  selectedDate,
  setSelectedDate,
  statusFilter,
  setStatusFilter,
  currentPage,
  setCurrentPage,
  totalPages,
  t,
  isFromBfcache,
}: EventsListContentProps) {
  const EVENTS_PER_PAGE = 10;
  const startIndex = (currentPage - 1) * EVENTS_PER_PAGE;
  const endIndex = startIndex + EVENTS_PER_PAGE;

  return (
    <motion.div
      key="content"
      initial={isFromBfcache ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: isFromBfcache ? 0 : 0.3 }}
      className="space-y-4"
    >
      {/* Filter Chips */}
      <motion.div
        initial={isFromBfcache ? false : { opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: isFromBfcache ? 0 : 0.3 }}
        className="-mx-4 sm:mx-0"
      >
        <ScrollableFadeContainer className="px-4 py-1 sm:mx-0 sm:px-0" fadeWidth={70}>
          <div className="flex items-center gap-2 min-w-max">
            <DatePicker
              variant="pill"
              value={selectedDate}
              onChange={setSelectedDate}
              placeholder={t('selectDate')}
            />

            {/* Status Chips */}
            <Button
              variant={statusFilter === 'ALL' ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('ALL')}
              className="rounded-full h-9 px-4"
            >
              {t('allStatuses')}
            </Button>

            {(
              [
                { value: 'DRAFT', label: t('statusDraft') },
                { value: 'OPEN', label: t('statusOpen') },
                { value: 'FROZEN', label: t('statusFrozen') },
                { value: 'DRAWN', label: t('statusDrawn') },
                { value: 'PUBLISHED', label: t('statusPublished') },
                { value: 'CANCELLED', label: t('statusCancelled') },
              ] as const
            ).map(({ value, label }) => {
              const config = statusConfig[value];
              const isSelected = statusFilter === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setStatusFilter(value)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border h-9 px-4 text-xs font-semibold uppercase transition-colors',
                    isSelected
                      ? config.className
                      : 'border-border bg-background text-muted-foreground hover:bg-muted'
                  )}
                >
                  <span
                    className={cn(
                      'w-1.5 h-1.5 rounded-full',
                      isSelected ? config.dotColor : 'bg-muted-foreground/40'
                    )}
                  />
                  {label}
                </button>
              );
            })}
          </div>
        </ScrollableFadeContainer>
      </motion.div>

      {/* Events List */}
      {filteredEvents.length === 0 ? (
        <motion.div
          initial={isFromBfcache ? false : { opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: isFromBfcache ? 0 : 0.3 }}
        >
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                {selectedDate || statusFilter !== 'ALL' ? (
                  <FilterX className="size-6" />
                ) : (
                  <CalendarDaysIcon className="size-6" />
                )}
              </EmptyMedia>
              <EmptyTitle>
                {selectedDate || statusFilter !== 'ALL'
                  ? t('noEventsMatchFilters')
                  : t('noEventsFound')}
              </EmptyTitle>
            </EmptyHeader>
          </Empty>
        </motion.div>
      ) : (
        <>
          <motion.div
            key={`${statusFilter}-${selectedDate?.toISOString() || 'all'}-${currentPage}`}
            initial={isFromBfcache ? false : 'hidden'}
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: isFromBfcache ? 0 : 0.1,
                },
              },
            }}
            className="space-y-6"
          >
            {paginatedEvents.map((event) => {
              return (
                <motion.div
                  key={event.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: { opacity: 1, y: 0, transition: { duration: isFromBfcache ? 0 : 0.4 } },
                  }}
                >
                  <Link href={`/events/${event.id}`} className="block">
                    <EventCard
                      event={event}
                      animate={false}
                      headerActions={<StatusBadge status={event.state as EventStatus} />}
                    >
                      <EventStats
                        event={event}
                        confirmedLabel={t('confirmed')}
                        waitlistedLabel={t('waitlisted')}
                      />
                    </EventCard>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            showResultsText={t('showingResults', {
              start: startIndex + 1,
              end: Math.min(endIndex, filteredEvents.length),
              total: filteredEvents.length,
            })}
            previousLabel={t('previous')}
            nextLabel={t('next')}
          />
        </>
      )}
    </motion.div>
  );
}
