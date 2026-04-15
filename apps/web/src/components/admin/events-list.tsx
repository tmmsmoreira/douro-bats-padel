'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { useTranslations, useLocale } from 'next-intl';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Button } from '@/components/ui/button';
import { X, FilterX } from 'lucide-react';
import { CalendarDaysIcon, CalendarDaysIconHandle } from 'lucide-animated';
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
import { StatusBadge, type EventStatus } from '@/components/shared/status-badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useIsMobile } from '@/hooks/use-media-query';
import type { EventWithRSVP } from '@padel/types';

type EventState = 'ALL' | EventStatus;

const EVENTS_PER_PAGE = 10;

export function EventsList() {
  const t = useTranslations('eventsList');
  const locale = useLocale();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<EventState>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const isFromBfcache = useIsFromBfcache();

  const { data: events, isLoading } = useAdminEvents();

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
      loadingMessage={t('loadingEvents')}
      emptyMessage={t('noEventsFound')}
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
          showDatePicker={showDatePicker}
          setShowDatePicker={setShowDatePicker}
          locale={locale}
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
  showDatePicker: boolean;
  setShowDatePicker: (show: boolean) => void;
  locale: string;
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
  showDatePicker,
  setShowDatePicker,
  locale,
  t,
  isFromBfcache,
}: EventsListContentProps) {
  // Calculate pagination indices
  const EVENTS_PER_PAGE = 10;
  const startIndex = (currentPage - 1) * EVENTS_PER_PAGE;
  const endIndex = startIndex + EVENTS_PER_PAGE;

  // Check if we're on mobile
  const isMobile = useIsMobile();

  const iconRef = useRef<CalendarDaysIconHandle>(null);

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
            {/* Date Chip */}
            {isMobile ? (
              <>
                <Button
                  variant={selectedDate ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => setShowDatePicker(true)}
                  className="rounded-full gap-2 h-9 px-4"
                >
                  <CalendarDaysIcon className="h-4 w-4" />
                  {selectedDate
                    ? new Date(selectedDate).toLocaleDateString(locale, {
                        month: 'short',
                        day: 'numeric',
                      })
                    : t('selectDate')}
                  {selectedDate && (
                    <span
                      className="ml-1 -mr-1 hover:opacity-70 transition-opacity cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDate(undefined);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </span>
                  )}
                </Button>
                <Dialog open={showDatePicker} onOpenChange={setShowDatePicker}>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>{t('selectDate')}</DialogTitle>
                    </DialogHeader>
                    <div className="flex justify-center py-4">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => {
                          setSelectedDate(date);
                          setShowDatePicker(false);
                        }}
                        captionLayout="dropdown"
                        startMonth={new Date(1900, 0)}
                        endMonth={new Date(2100, 11)}
                      />
                    </div>
                  </DialogContent>
                </Dialog>
              </>
            ) : (
              <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
                <PopoverTrigger asChild>
                  <Button
                    variant={selectedDate ? 'secondary' : 'outline'}
                    size="sm"
                    className="rounded-full gap-2 h-9 px-4"
                    onMouseEnter={() => iconRef.current?.startAnimation()}
                    onMouseLeave={() => iconRef.current?.stopAnimation()}
                    animate={false}
                  >
                    <CalendarDaysIcon ref={iconRef} size={16} className="h-4 w-4" />
                    {selectedDate
                      ? new Date(selectedDate).toLocaleDateString(locale, {
                          month: 'short',
                          day: 'numeric',
                        })
                      : t('selectDate')}
                    {selectedDate && (
                      <button
                        type="button"
                        className="ml-1 -mr-1 hover:opacity-70 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDate(undefined);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date);
                      setShowDatePicker(false);
                    }}
                    captionLayout="dropdown"
                    startMonth={new Date(1900, 0)}
                    endMonth={new Date(2100, 11)}
                  />
                </PopoverContent>
              </Popover>
            )}

            {/* Status Chips */}
            <Button
              variant={statusFilter === 'ALL' ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('ALL')}
              className="rounded-full h-9 px-4"
            >
              {t('allStatuses')}
            </Button>

            <Button
              variant={statusFilter === 'DRAFT' ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('DRAFT')}
              className="rounded-full h-9 px-4"
            >
              {t('statusDraft')}
            </Button>

            <Button
              variant={statusFilter === 'OPEN' ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('OPEN')}
              className="rounded-full h-9 px-4"
            >
              {t('statusOpen')}
            </Button>

            <Button
              variant={statusFilter === 'FROZEN' ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('FROZEN')}
              className="rounded-full h-9 px-4"
            >
              {t('statusFrozen')}
            </Button>

            <Button
              variant={statusFilter === 'DRAWN' ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('DRAWN')}
              className="rounded-full h-9 px-4"
            >
              {t('statusDrawn')}
            </Button>

            <Button
              variant={statusFilter === 'PUBLISHED' ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('PUBLISHED')}
              className="rounded-full h-9 px-4"
            >
              {t('statusPublished')}
            </Button>
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
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <Link href={`/admin/events/${event.id}`} className="block">
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
