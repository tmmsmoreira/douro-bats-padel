'use client';

import { useState, useEffect, useMemo } from 'react';
import { useVenues } from '@/hooks/use-venues';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { toast } from 'sonner';
import { ChevronDown, Info } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingButton } from '@/components/ui/loading-button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Field, FieldLabel, FieldDescription } from '@/components/ui/field';
import { FieldFeedback } from '@/components/ui/field-feedback';
import { DatePicker } from '@/components/shared/pickers/date-picker';
import { TimePicker } from '@/components/shared/pickers/time-picker';
import { DateTimePicker } from '@/components/shared/pickers/datetime-picker';
import { cn } from '@/lib/utils';
import type { CreateEventDto, TierRules } from '@padel/types';
import { EventFormat } from '@padel/types';
import { useCreateEvent, useUpdateEvent } from '@/hooks/use-events';

interface EventFormData {
  title?: string;
  date: Date;
  startsAt: Date;
  endsAt: Date;
  venueId: string;
  courtIds: string[];
  capacity: number;
  rsvpOpensAt: Date;
  rsvpClosesAt: Date;
  tierRules?: TierRules;
}

interface EventFormProps {
  eventId?: string;
  initialData?: EventFormData;
}

function SectionHeading({
  title,
  hint,
  className,
}: {
  title: string;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      {hint && (
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label={`${title} info`}
              className="text-muted-foreground/70 hover:text-foreground transition-colors"
            >
              <Info className="size-3.5" />
            </button>
          </PopoverTrigger>
          <PopoverContent side="top" className="w-64 text-xs leading-relaxed">
            {hint}
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}

export function EventForm({ eventId, initialData }: EventFormProps = {}) {
  const router = useRouter();
  const t = useTranslations('eventForm');
  const locale = useLocale();
  const isEditMode = !!eventId;

  const [formData, setFormData] = useState<{
    title: string;
    date?: Date;
    format: EventFormat;
    duration: number;
    capacity: string;
    rsvpOpensAt?: Date;
    rsvpClosesAt?: Date;
    venueId: string;
    tierRuleType: 'auto' | 'count' | 'percentage';
    masterCount: string;
    masterPercentage: string;
    mastersStartTime?: Date;
    mastersCourtIds: string[];
    explorersStartTime?: Date;
    explorersCourtIds: string[];
  }>({
    title: '',
    date: undefined,
    format: EventFormat.NON_STOP,
    duration: 90,
    capacity: '0',
    rsvpOpensAt: undefined,
    rsvpClosesAt: undefined,
    venueId: '',
    tierRuleType: 'auto',
    masterCount: '',
    masterPercentage: '',
    mastersStartTime: undefined,
    mastersCourtIds: [],
    explorersStartTime: undefined,
    explorersCourtIds: [],
  });

  const { data: venues, isLoading: venuesLoading } = useVenues();

  const selectedVenue = venues?.find((v) => v.id === formData.venueId);

  useEffect(() => {
    if (initialData && isEditMode) {
      const tierRules = initialData.tierRules || {};

      const mastersTimeSlot = tierRules.mastersTimeSlot;
      const explorersTimeSlot = tierRules.explorersTimeSlot;

      const parseTime = (timeStr: string) => {
        if (!timeStr) return undefined;
        const [hours, minutes] = timeStr.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        return date;
      };

      let tierRuleType: 'auto' | 'count' | 'percentage' = 'auto';
      if (tierRules.masterCount !== undefined) {
        tierRuleType = 'count';
      } else if (tierRules.masterPercentage !== undefined) {
        tierRuleType = 'percentage';
      }

      let duration = 90;
      if (mastersTimeSlot?.startsAt && mastersTimeSlot?.endsAt) {
        const start = parseTime(mastersTimeSlot.startsAt);
        const end = parseTime(mastersTimeSlot.endsAt);
        if (start && end) {
          duration = (end.getTime() - start.getTime()) / (1000 * 60);
        }
      }

      setFormData({
        title: initialData.title || '',
        date: initialData.date ? new Date(initialData.date) : undefined,
        format: EventFormat.NON_STOP,
        duration,
        capacity: initialData.capacity?.toString() || '0',
        rsvpOpensAt: initialData.rsvpOpensAt ? new Date(initialData.rsvpOpensAt) : undefined,
        rsvpClosesAt: initialData.rsvpClosesAt ? new Date(initialData.rsvpClosesAt) : undefined,
        venueId: initialData.venueId || '',
        tierRuleType,
        masterCount: tierRules.masterCount?.toString() || '',
        masterPercentage: tierRules.masterPercentage?.toString() || '',
        mastersStartTime: mastersTimeSlot?.startsAt
          ? parseTime(mastersTimeSlot.startsAt)
          : undefined,
        mastersCourtIds: mastersTimeSlot?.courtIds || [],
        explorersStartTime: explorersTimeSlot?.startsAt
          ? parseTime(explorersTimeSlot.startsAt)
          : undefined,
        explorersCourtIds: explorersTimeSlot?.courtIds || [],
      });
    }
  }, [initialData, isEditMode]);

  useEffect(() => {
    const mastersCapacity = formData.mastersCourtIds.length * 4;
    const explorersCapacity = formData.explorersCourtIds.length * 4;
    const calculatedCapacity = mastersCapacity + explorersCapacity;

    setFormData((prev) => ({
      ...prev,
      capacity: calculatedCapacity.toString(),
    }));
  }, [formData.mastersCourtIds, formData.explorersCourtIds]);

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!formData.venueId) e.venueId = t('validationSelectVenue');
    if (!formData.date) e.date = t('validationSelectDate');
    if (!formData.rsvpOpensAt) e.rsvpOpensAt = t('validationRsvpOpens');
    if (!formData.rsvpClosesAt) e.rsvpClosesAt = t('validationRsvpCloses');
    if (!formData.mastersStartTime) e.mastersStartTime = t('validationMastersTime');
    if (formData.mastersCourtIds.length === 0) e.mastersCourtIds = t('validationMastersCourts');
    if (!formData.explorersStartTime) e.explorersStartTime = t('validationExplorersTime');
    if (formData.explorersCourtIds.length === 0)
      e.explorersCourtIds = t('validationExplorersCourts');

    if (formData.tierRuleType === 'count') {
      const masterCount = parseInt(formData.masterCount);
      if (isNaN(masterCount) || masterCount < 0) {
        e.masterCount = t('validationMasterCount');
      } else if (masterCount > parseInt(formData.capacity)) {
        e.masterCount = t('validationMasterCountExceeds', {
          count: masterCount,
          capacity: formData.capacity,
        });
      }
    } else if (formData.tierRuleType === 'percentage') {
      const masterPercentage = parseFloat(formData.masterPercentage);
      if (isNaN(masterPercentage) || masterPercentage < 0 || masterPercentage > 100) {
        e.masterPercentage = t('validationMasterPercentage');
      }
    }
    return e;
  }, [formData, t]);

  const showError = (field: string): string | undefined =>
    touched[field] || submitAttempted ? errors[field] : undefined;

  const markTouched = (field: string) => {
    setTouched((prev) => (prev[field] ? prev : { ...prev, [field]: true }));
  };

  const createMutation = useCreateEvent();
  const updateMutation = useUpdateEvent(eventId || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);

    if (Object.keys(errors).length > 0) {
      return;
    }

    const date = formData.date!;
    const rsvpOpensAt = formData.rsvpOpensAt!;
    const rsvpClosesAt = formData.rsvpClosesAt!;
    const mastersStartTimeDate = formData.mastersStartTime!;
    const explorersStartTimeDate = formData.explorersStartTime!;

    const eventDate = new Date(date);

    const mastersStart = new Date(eventDate);
    mastersStart.setHours(mastersStartTimeDate.getHours(), mastersStartTimeDate.getMinutes());
    const mastersEnd = new Date(mastersStart.getTime() + formData.duration * 60 * 1000);

    const explorersStart = new Date(eventDate);
    explorersStart.setHours(explorersStartTimeDate.getHours(), explorersStartTimeDate.getMinutes());
    const explorersEnd = new Date(explorersStart.getTime() + formData.duration * 60 * 1000);

    const startsAt = mastersStart < explorersStart ? mastersStart : explorersStart;
    const endsAt = mastersEnd > explorersEnd ? mastersEnd : explorersEnd;

    const tierRules: TierRules = {};
    if (formData.tierRuleType === 'count') {
      tierRules.masterCount = parseInt(formData.masterCount);
    } else if (formData.tierRuleType === 'percentage') {
      tierRules.masterPercentage = parseFloat(formData.masterPercentage);
    }

    const mastersStartTime = `${String(mastersStartTimeDate.getHours()).padStart(2, '0')}:${String(mastersStartTimeDate.getMinutes()).padStart(2, '0')}`;
    const mastersEndTime = `${String(mastersEnd.getHours()).padStart(2, '0')}:${String(mastersEnd.getMinutes()).padStart(2, '0')}`;
    tierRules.mastersTimeSlot = {
      startsAt: mastersStartTime,
      endsAt: mastersEndTime,
      courtIds: formData.mastersCourtIds,
    };

    const explorersStartTime = `${String(explorersStartTimeDate.getHours()).padStart(2, '0')}:${String(explorersStartTimeDate.getMinutes()).padStart(2, '0')}`;
    const explorersEndTime = `${String(explorersEnd.getHours()).padStart(2, '0')}:${String(explorersEnd.getMinutes()).padStart(2, '0')}`;
    tierRules.explorersTimeSlot = {
      startsAt: explorersStartTime,
      endsAt: explorersEndTime,
      courtIds: formData.explorersCourtIds,
    };

    const allCourtIds = Array.from(
      new Set([...formData.mastersCourtIds, ...formData.explorersCourtIds])
    );

    const formatLabel =
      formData.format === EventFormat.NON_STOP ? t('nonStopFormat') : formData.format;
    const dateLabel = eventDate.toLocaleDateString(locale, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
    const timeLabel = `${String(startsAt.getHours()).padStart(2, '0')}:${String(startsAt.getMinutes()).padStart(2, '0')}`;
    const generatedTitle = `${formatLabel} · ${dateLabel} · ${timeLabel}`;

    const dto: CreateEventDto = {
      title: formData.title.trim() || generatedTitle,
      date: eventDate,
      startsAt,
      endsAt,
      format: formData.format,
      duration: formData.duration,
      venueId: formData.venueId,
      courtIds: allCourtIds,
      capacity: parseInt(formData.capacity),
      rsvpOpensAt,
      rsvpClosesAt,
      tierRules,
    };

    if (isEditMode) {
      if (initialData) {
        const initialDate = initialData.date ? new Date(initialData.date) : null;
        const initialStartsAt = initialData.startsAt ? new Date(initialData.startsAt) : null;
        const initialEndsAt = initialData.endsAt ? new Date(initialData.endsAt) : null;
        const initialRsvpOpensAt = initialData.rsvpOpensAt
          ? new Date(initialData.rsvpOpensAt)
          : null;
        const initialRsvpClosesAt = initialData.rsvpClosesAt
          ? new Date(initialData.rsvpClosesAt)
          : null;

        const hasChanges =
          formData.title !== initialData.title ||
          formData.date?.getTime() !== initialDate?.getTime() ||
          startsAt.getTime() !== initialStartsAt?.getTime() ||
          endsAt.getTime() !== initialEndsAt?.getTime() ||
          formData.venueId !== initialData.venueId ||
          parseInt(formData.capacity) !== initialData.capacity ||
          formData.rsvpOpensAt?.getTime() !== initialRsvpOpensAt?.getTime() ||
          formData.rsvpClosesAt?.getTime() !== initialRsvpClosesAt?.getTime() ||
          JSON.stringify([...allCourtIds].sort()) !==
            JSON.stringify([...(initialData.courtIds || [])].sort()) ||
          JSON.stringify(tierRules) !== JSON.stringify(initialData.tierRules);

        if (!hasChanges) {
          toast.info(t('noChangesToSave') || 'No changes to save');
          router.push(`/events/${eventId}`);
          return;
        }
      }
      updateMutation.mutate(dto);
    } else {
      createMutation.mutate(dto);
    }
  };

  const WARMUP_TIME = 5;
  const BREAK_TIME = 2;
  const MIN_GAME_TIME = 15;
  const availableTime = formData.duration - WARMUP_TIME;
  const maxRounds = Math.floor(availableTime / (MIN_GAME_TIME + BREAK_TIME));
  const timePerRound = maxRounds > 0 ? Math.floor(availableTime / maxRounds) : 0;
  const gameTime = maxRounds > 0 ? timePerRound - BREAK_TIME : 0;
  const mastersCourts = formData.mastersCourtIds.length;
  const explorersCourts = formData.explorersCourtIds.length;
  const mastersTeams = mastersCourts * 2;
  const explorersTeams = explorersCourts * 2;
  const totalTeams = mastersTeams + explorersTeams;

  return (
    <Card className="glass-card">
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <section className="space-y-4">
            <SectionHeading title={t('sectionBasics')} />

            <Field data-invalid={!!showError('date')}>
              <FieldLabel htmlFor="date">{t('eventDate')}</FieldLabel>
              <DatePicker
                id="date"
                value={formData.date}
                onChange={(date) => setFormData({ ...formData, date })}
                onBlur={() => markTouched('date')}
                placeholder={t('selectEventDate')}
                aria-invalid={!!showError('date')}
              />
              <FieldFeedback error={showError('date')} />
            </Field>

            <Field data-invalid={!!showError('venueId')}>
              <FieldLabel htmlFor="venue">{t('venue')}</FieldLabel>
              {venuesLoading ? (
                <div className="text-sm text-muted-foreground">{t('loadingVenues')}</div>
              ) : (
                <Select
                  value={formData.venueId}
                  onOpenChange={(open) => {
                    if (!open) markTouched('venueId');
                  }}
                  onValueChange={(value) => {
                    markTouched('venueId');
                    setFormData({
                      ...formData,
                      venueId: value,
                      mastersCourtIds: [],
                      explorersCourtIds: [],
                    });
                  }}
                >
                  <SelectTrigger aria-invalid={!!showError('venueId')}>
                    <SelectValue placeholder={t('selectVenue')} />
                  </SelectTrigger>
                  <SelectContent>
                    {venues?.map((venue) => (
                      <SelectItem key={venue.id} value={venue.id}>
                        {venue.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <FieldFeedback error={showError('venueId')} />
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Badge variant="secondary" className="tabular-nums">
                  {t('capacity')}: {formData.capacity || 0}
                </Badge>
                <span className="text-xs text-muted-foreground">{t('autoCalculated')}</span>
              </div>
            </Field>
          </section>

          <Separator />

          {/* RSVP WINDOW */}
          <section className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <SectionHeading title={t('sectionRsvp')} />
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                DD/MM/YYYY HH:MM
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field data-invalid={!!showError('rsvpOpensAt')}>
                <FieldLabel htmlFor="rsvpOpensAt">{t('rsvpOpensAt')}</FieldLabel>
                <DateTimePicker
                  id="rsvpOpensAt"
                  value={formData.rsvpOpensAt}
                  onChange={(datetime) => setFormData({ ...formData, rsvpOpensAt: datetime })}
                  onBlur={() => markTouched('rsvpOpensAt')}
                  placeholder={t('rsvpOpensAtPlaceholder')}
                  aria-invalid={!!showError('rsvpOpensAt')}
                />
                <FieldFeedback error={showError('rsvpOpensAt')} />
              </Field>

              <Field data-invalid={!!showError('rsvpClosesAt')}>
                <FieldLabel htmlFor="rsvpClosesAt">{t('rsvpClosesAt')}</FieldLabel>
                <DateTimePicker
                  id="rsvpClosesAt"
                  value={formData.rsvpClosesAt}
                  onChange={(datetime) => setFormData({ ...formData, rsvpClosesAt: datetime })}
                  onBlur={() => markTouched('rsvpClosesAt')}
                  placeholder={t('rsvpClosesAtPlaceholder')}
                  aria-invalid={!!showError('rsvpClosesAt')}
                />
                <FieldFeedback error={showError('rsvpClosesAt')} />
              </Field>
            </div>
          </section>

          <Separator />

          {/* TIER ASSIGNMENT */}
          <section className="space-y-4">
            <SectionHeading
              title={t('tierAssignmentRules')}
              hint={t('tierAssignmentDescription')}
            />

            <ToggleGroup
              type="single"
              value={formData.tierRuleType}
              onValueChange={(value) => {
                if (value) {
                  setFormData({
                    ...formData,
                    tierRuleType: value as 'auto' | 'count' | 'percentage',
                  });
                }
              }}
              variant="outline"
              className="w-full grid grid-cols-3"
            >
              <ToggleGroupItem value="auto" className="text-xs sm:text-sm">
                {t('tierAutoShort')}
              </ToggleGroupItem>
              <ToggleGroupItem value="count" className="text-xs sm:text-sm">
                {t('tierCountShort')}
              </ToggleGroupItem>
              <ToggleGroupItem value="percentage" className="text-xs sm:text-sm">
                {t('tierPercentageShort')}
              </ToggleGroupItem>
            </ToggleGroup>

            <p className="text-xs text-muted-foreground">
              {formData.tierRuleType === 'auto' && t('tierAuto')}
              {formData.tierRuleType === 'count' && t('tierCount')}
              {formData.tierRuleType === 'percentage' && t('tierPercentage')}
            </p>

            {formData.tierRuleType === 'count' && (
              <Field data-invalid={!!showError('masterCount')}>
                <FieldLabel htmlFor="masterCount">{t('numberOfMastersPlayers')}</FieldLabel>
                <Input
                  id="masterCount"
                  type="number"
                  min="0"
                  max={formData.capacity}
                  value={formData.masterCount}
                  onChange={(e) => setFormData({ ...formData, masterCount: e.target.value })}
                  onBlur={() => markTouched('masterCount')}
                  placeholder={t('numberOfMastersPlaceholder')}
                  aria-invalid={!!showError('masterCount')}
                />
                <FieldFeedback
                  description={t('topRatedPlayers', { count: formData.masterCount || 'X' })}
                  error={showError('masterCount')}
                />
              </Field>
            )}

            {formData.tierRuleType === 'percentage' && (
              <Field data-invalid={!!showError('masterPercentage')}>
                <FieldLabel htmlFor="masterPercentage">{t('mastersPercentage')}</FieldLabel>
                <Input
                  id="masterPercentage"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={formData.masterPercentage}
                  onChange={(e) => setFormData({ ...formData, masterPercentage: e.target.value })}
                  onBlur={() => markTouched('masterPercentage')}
                  placeholder={t('mastersPercentagePlaceholder')}
                  aria-invalid={!!showError('masterPercentage')}
                />
                <FieldFeedback
                  description={t('topPercentagePlayers', {
                    percentage: formData.masterPercentage || 'X',
                  })}
                  error={showError('masterPercentage')}
                />
              </Field>
            )}
          </section>

          <Separator />

          {/* SCHEDULE */}
          <section className="space-y-4">
            <SectionHeading title={t('timeSlotsAndCourts')} hint={t('timeSlotsDescription')} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="duration">{t('duration')}</FieldLabel>
                <Select
                  value={formData.duration.toString()}
                  onValueChange={(value) => setFormData({ ...formData, duration: parseInt(value) })}
                >
                  <SelectTrigger id="duration">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="60">{t('60minutes')}</SelectItem>
                    <SelectItem value="90">{t('90minutes')}</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel htmlFor="format">{t('gameFormat')}</FieldLabel>
                <Select
                  value={formData.format}
                  onValueChange={(value: EventFormat) =>
                    setFormData({ ...formData, format: value })
                  }
                >
                  <SelectTrigger id="format">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={EventFormat.NON_STOP}>{t('nonStopFormat')}</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <Collapsible>
              <CollapsibleTrigger className="group flex w-full items-center justify-between rounded-md border bg-muted/30 px-3 py-2 text-xs hover:bg-muted/50 transition-colors">
                <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground">
                  <span className="font-medium text-foreground">{t('gameCalculation')}</span>
                  <span>
                    {maxRounds} {t('rounds').toLowerCase()}
                  </span>
                  <span aria-hidden>·</span>
                  <span>~{gameTime} min</span>
                  {totalTeams > 0 && (
                    <>
                      <span aria-hidden>·</span>
                      <span>
                        {totalTeams} {t('teams').toLowerCase()}
                      </span>
                    </>
                  )}
                </span>
                <ChevronDown className="size-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-2 rounded-md border bg-muted/30 p-3 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <div>
                    • {t('duration')}: {formData.duration} min
                  </div>
                  <div>
                    • {t('warmup')}: {WARMUP_TIME} min
                  </div>
                  <div>
                    • {t('availableTime')}: {availableTime} min
                  </div>
                  <div>
                    • {t('maxRounds')}: {maxRounds}
                  </div>
                  <div>
                    • {t('gameTime')}: ~{gameTime} min
                  </div>
                  <div />
                  {mastersCourts > 0 && (
                    <div>
                      • Masters: {mastersCourts} {t('courts').toLowerCase()} × {maxRounds}{' '}
                      {t('rounds').toLowerCase()} = {mastersCourts * maxRounds}{' '}
                      {t('games').toLowerCase()} ({mastersTeams} {t('teams').toLowerCase()})
                    </div>
                  )}
                  {explorersCourts > 0 && (
                    <div>
                      • Explorers: {explorersCourts} {t('courts').toLowerCase()} × {maxRounds}{' '}
                      {t('rounds').toLowerCase()} = {explorersCourts * maxRounds}{' '}
                      {t('games').toLowerCase()} ({explorersTeams} {t('teams').toLowerCase()})
                    </div>
                  )}
                  {totalTeams > 0 && (
                    <div className="font-medium pt-1 border-t mt-2 sm:col-span-2">
                      • {t('totalTeams')}: {totalTeams}
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="text-sm font-semibold">{t('mastersTimeSlot')}</div>
                <Field data-invalid={!!showError('mastersStartTime')}>
                  <FieldLabel
                    htmlFor="mastersStartTime"
                    className="text-xs text-muted-foreground font-normal"
                  >
                    {t('startTime')}
                  </FieldLabel>
                  <TimePicker
                    id="mastersStartTime"
                    value={formData.mastersStartTime}
                    onChange={(time) => setFormData({ ...formData, mastersStartTime: time })}
                    onBlur={() => markTouched('mastersStartTime')}
                    placeholder={t('startTimePlaceholder')}
                    aria-invalid={!!showError('mastersStartTime')}
                  />
                  <FieldFeedback error={showError('mastersStartTime')} />
                </Field>

                {selectedVenue && selectedVenue.courts && selectedVenue.courts.length > 0 && (
                  <Field data-invalid={!!showError('mastersCourtIds')}>
                    <FieldLabel className="text-xs text-muted-foreground font-normal">
                      {t('courtsAvailable')}
                    </FieldLabel>
                    <ToggleGroup
                      type="multiple"
                      value={formData.mastersCourtIds}
                      onValueChange={(values) => {
                        markTouched('mastersCourtIds');
                        setFormData((prev) => ({ ...prev, mastersCourtIds: values }));
                      }}
                      variant="outline"
                      size="sm"
                      spacing={2}
                      className="flex w-full flex-wrap justify-start"
                    >
                      {selectedVenue.courts.map((court) => (
                        <ToggleGroupItem key={court.id} value={court.id}>
                          {court.label}
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                    <FieldFeedback
                      description={t('courtsSelected', {
                        count: formData.mastersCourtIds.length,
                      })}
                      error={showError('mastersCourtIds')}
                    />
                  </Field>
                )}
              </div>

              <div className="space-y-3">
                <div className="text-sm font-semibold">{t('explorersTimeSlot')}</div>
                <Field data-invalid={!!showError('explorersStartTime')}>
                  <FieldLabel
                    htmlFor="explorersStartTime"
                    className="text-xs text-muted-foreground font-normal"
                  >
                    {t('startTime')}
                  </FieldLabel>
                  <TimePicker
                    id="explorersStartTime"
                    value={formData.explorersStartTime}
                    onChange={(time) => setFormData({ ...formData, explorersStartTime: time })}
                    onBlur={() => markTouched('explorersStartTime')}
                    placeholder={t('explorersStartTimePlaceholder')}
                    aria-invalid={!!showError('explorersStartTime')}
                  />
                  <FieldFeedback error={showError('explorersStartTime')} />
                </Field>

                {selectedVenue && selectedVenue.courts && selectedVenue.courts.length > 0 && (
                  <Field data-invalid={!!showError('explorersCourtIds')}>
                    <FieldLabel className="text-xs text-muted-foreground font-normal">
                      {t('courtsAvailable')}
                    </FieldLabel>
                    <ToggleGroup
                      type="multiple"
                      value={formData.explorersCourtIds}
                      onValueChange={(values) => {
                        markTouched('explorersCourtIds');
                        setFormData((prev) => ({ ...prev, explorersCourtIds: values }));
                      }}
                      variant="outline"
                      size="sm"
                      spacing={2}
                      className="flex w-full flex-wrap justify-start"
                    >
                      {selectedVenue.courts.map((court) => (
                        <ToggleGroupItem key={court.id} value={court.id}>
                          {court.label}
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                    <FieldFeedback
                      description={t('courtsSelected', {
                        count: formData.explorersCourtIds.length,
                      })}
                      error={showError('explorersCourtIds')}
                    />
                  </Field>
                )}
              </div>
            </div>
          </section>

          <Separator />

          {/* OPTIONAL TITLE */}
          <Field>
            <FieldLabel htmlFor="title" className="text-xs text-muted-foreground font-normal">
              {t('eventTitle')}
            </FieldLabel>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={t('eventTitlePlaceholder')}
            />
            <FieldDescription>{t('eventTitleHint')}</FieldDescription>
          </Field>
        </CardContent>
        <CardFooter className="sticky bottom-0 z-10 flex justify-end gap-2 border-t border-border/50 bg-card/95 px-6 py-3 backdrop-blur-sm sm:static sm:border-t-0 sm:bg-transparent sm:py-4 sm:backdrop-blur-none">
          <Button
            className="w-full"
            type="button"
            variant="outline"
            onClick={() => router.push(isEditMode ? `/events/${eventId}` : '/events')}
            animate
          >
            {t('cancel')}
          </Button>
          <LoadingButton
            className="w-full"
            type="submit"
            isLoading={createMutation.isPending || updateMutation.isPending}
            loadingText={isEditMode ? t('updating') : t('creating')}
            animate
          >
            {isEditMode ? t('updateEvent') : t('createEvent')}
          </LoadingButton>
        </CardFooter>
      </form>
    </Card>
  );
}
