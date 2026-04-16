'use client';

import { useState, useEffect } from 'react';
import { useVenues } from '@/hooks/use-venues';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingButton } from '@/components/ui/loading-button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Field, FieldLabel, FieldDescription } from '@/components/ui/field';
import { DatePicker } from '@/components/shared/date-picker';
import { TimePicker } from '@/components/shared/time-picker';
import { DateTimePicker } from '@/components/shared/datetime-picker';
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

export function EventForm({ eventId, initialData }: EventFormProps = {}) {
  const router = useRouter();
  const t = useTranslations('eventForm');
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
    format: EventFormat.NON_STOP, // Default format
    duration: 90, // Default 90 minutes
    capacity: '0',
    rsvpOpensAt: undefined,
    rsvpClosesAt: undefined,
    venueId: '',
    tierRuleType: 'auto', // Default to 50/50 auto split
    masterCount: '',
    masterPercentage: '',
    mastersStartTime: undefined,
    mastersCourtIds: [],
    explorersStartTime: undefined,
    explorersCourtIds: [],
  });

  // Fetch venues with courts
  const { data: venues, isLoading: venuesLoading } = useVenues();

  const selectedVenue = venues?.find((v) => v.id === formData.venueId);

  // Populate form with initial data when editing
  useEffect(() => {
    if (initialData && isEditMode) {
      const tierRules = initialData.tierRules || {};

      // Parse time slots
      const mastersTimeSlot = tierRules.mastersTimeSlot;
      const explorersTimeSlot = tierRules.explorersTimeSlot;

      // Parse time strings to Date objects
      const parseTime = (timeStr: string) => {
        if (!timeStr) return undefined;
        const [hours, minutes] = timeStr.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        return date;
      };

      // Determine tier rule type
      let tierRuleType: 'auto' | 'count' | 'percentage' = 'auto';
      if (tierRules.masterCount !== undefined) {
        tierRuleType = 'count';
      } else if (tierRules.masterPercentage !== undefined) {
        tierRuleType = 'percentage';
      }

      // Calculate duration from existing start/end times if not provided
      let duration = 90; // default
      if (mastersTimeSlot?.startsAt && mastersTimeSlot?.endsAt) {
        const start = parseTime(mastersTimeSlot.startsAt);
        const end = parseTime(mastersTimeSlot.endsAt);
        if (start && end) {
          duration = (end.getTime() - start.getTime()) / (1000 * 60); // Convert to minutes
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

  // Auto-calculate capacity based on time slot court assignments
  // Capacity = total players across both time slots (they play at different times)
  useEffect(() => {
    // Calculate capacity as sum of both time slots since they're separate
    // MASTERS courts * 4 + EXPLORERS courts * 4
    const mastersCapacity = formData.mastersCourtIds.length * 4;
    const explorersCapacity = formData.explorersCourtIds.length * 4;
    const calculatedCapacity = mastersCapacity + explorersCapacity;

    setFormData((prev) => ({
      ...prev,
      capacity: calculatedCapacity.toString(),
    }));
  }, [formData.mastersCourtIds, formData.explorersCourtIds]);

  // Use dedicated hooks for create and update
  const createMutation = useCreateEvent();
  const updateMutation = useUpdateEvent(eventId || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.venueId) {
      alert(t('validationSelectVenue'));
      return;
    }
    if (!formData.date) {
      alert(t('validationSelectDate'));
      return;
    }
    if (!formData.rsvpOpensAt) {
      alert(t('validationRsvpOpens'));
      return;
    }
    if (!formData.rsvpClosesAt) {
      alert(t('validationRsvpCloses'));
      return;
    }

    // Validate time slots are provided
    if (!formData.mastersStartTime) {
      alert(t('validationMastersTime'));
      return;
    }
    if (formData.mastersCourtIds.length === 0) {
      alert(t('validationMastersCourts'));
      return;
    }
    if (!formData.explorersStartTime) {
      alert(t('validationExplorersTime'));
      return;
    }
    if (formData.explorersCourtIds.length === 0) {
      alert(t('validationExplorersCourts'));
      return;
    }

    // Derive overall event start/end times from time slots
    const eventDate = new Date(formData.date);

    // Calculate end times based on start time + duration
    const mastersStart = new Date(eventDate);
    mastersStart.setHours(
      formData.mastersStartTime.getHours(),
      formData.mastersStartTime.getMinutes()
    );

    const mastersEnd = new Date(mastersStart.getTime() + formData.duration * 60 * 1000);

    const explorersStart = new Date(eventDate);
    explorersStart.setHours(
      formData.explorersStartTime.getHours(),
      formData.explorersStartTime.getMinutes()
    );

    const explorersEnd = new Date(explorersStart.getTime() + formData.duration * 60 * 1000);

    const startsAt = mastersStart < explorersStart ? mastersStart : explorersStart;
    const endsAt = mastersEnd > explorersEnd ? mastersEnd : explorersEnd;

    // Build tier rules based on selection
    let tierRules: TierRules | undefined = undefined;
    if (formData.tierRuleType === 'count') {
      const masterCount = parseInt(formData.masterCount);
      if (isNaN(masterCount) || masterCount < 0) {
        alert(t('validationMasterCount'));
        return;
      }
      if (masterCount > parseInt(formData.capacity)) {
        alert(
          t('validationMasterCountExceeds', { count: masterCount, capacity: formData.capacity })
        );
        return;
      }
      tierRules = { masterCount };
    } else if (formData.tierRuleType === 'percentage') {
      const masterPercentage = parseFloat(formData.masterPercentage);
      if (isNaN(masterPercentage) || masterPercentage < 0 || masterPercentage > 100) {
        alert(t('validationMasterPercentage'));
        return;
      }
      tierRules = { masterPercentage };
    }

    // Add time slot information (always required now)
    if (!tierRules) {
      tierRules = {};
    }

    // Add MASTERS time slot
    const mastersStartTime = `${String(formData.mastersStartTime.getHours()).padStart(2, '0')}:${String(formData.mastersStartTime.getMinutes()).padStart(2, '0')}`;
    const mastersEndTime = `${String(mastersEnd.getHours()).padStart(2, '0')}:${String(mastersEnd.getMinutes()).padStart(2, '0')}`;
    tierRules.mastersTimeSlot = {
      startsAt: mastersStartTime,
      endsAt: mastersEndTime,
      courtIds: formData.mastersCourtIds,
    };

    // Add EXPLORERS time slot
    const explorersStartTime = `${String(formData.explorersStartTime.getHours()).padStart(2, '0')}:${String(formData.explorersStartTime.getMinutes()).padStart(2, '0')}`;
    const explorersEndTime = `${String(explorersEnd.getHours()).padStart(2, '0')}:${String(explorersEnd.getMinutes()).padStart(2, '0')}`;
    tierRules.explorersTimeSlot = {
      startsAt: explorersStartTime,
      endsAt: explorersEndTime,
      courtIds: formData.explorersCourtIds,
    };

    // Collect all unique court IDs from time slots
    const allCourtIds = Array.from(
      new Set([...formData.mastersCourtIds, ...formData.explorersCourtIds])
    );

    const dto: CreateEventDto = {
      title: formData.title,
      date: eventDate,
      startsAt,
      endsAt,
      format: formData.format,
      duration: formData.duration,
      venueId: formData.venueId,
      courtIds: allCourtIds,
      capacity: parseInt(formData.capacity),
      rsvpOpensAt: formData.rsvpOpensAt,
      rsvpClosesAt: formData.rsvpClosesAt,
      tierRules,
    };

    if (isEditMode) {
      // Check if any field has changed
      if (initialData) {
        // Convert initialData dates to Date objects for comparison
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

  return (
    <Card className="glass-card">
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <Field>
            <FieldLabel htmlFor="title">{t('eventTitle')}</FieldLabel>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={t('eventTitlePlaceholder')}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="date">{t('eventDate')}</FieldLabel>
              <DatePicker
                id="date"
                value={formData.date}
                onChange={(date) => setFormData({ ...formData, date })}
                placeholder={t('selectEventDate')}
              />
              <FieldDescription>Format: DD/MM/YYYY</FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="capacity">{t('capacity')}</FieldLabel>
              <Input
                id="capacity"
                type="number"
                value={formData.capacity}
                readOnly
                className="bg-muted cursor-not-allowed"
                required
              />
              <FieldDescription>{t('autoCalculated')}</FieldDescription>
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor="venue">{t('venue')}</FieldLabel>
            {venuesLoading ? (
              <div className="text-sm text-muted-foreground">{t('loadingVenues')}</div>
            ) : (
              <Select
                value={formData.venueId}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    venueId: value,
                    mastersCourtIds: [],
                    explorersCourtIds: [],
                  })
                }
              >
                <SelectTrigger>
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
          </Field>

          <div className="space-y-4">
            <Field>
              <FieldLabel htmlFor="rsvpOpensAt">{t('rsvpOpensAt')}</FieldLabel>
              <DateTimePicker
                id="rsvpOpensAt"
                value={formData.rsvpOpensAt}
                onChange={(datetime) => setFormData({ ...formData, rsvpOpensAt: datetime })}
                placeholder={t('rsvpOpensAtPlaceholder')}
              />
              <FieldDescription>Format: DD/MM/YYYY HH:MM (24h)</FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="rsvpClosesAt">{t('rsvpClosesAt')}</FieldLabel>
              <DateTimePicker
                id="rsvpClosesAt"
                value={formData.rsvpClosesAt}
                onChange={(datetime) => setFormData({ ...formData, rsvpClosesAt: datetime })}
                placeholder={t('rsvpClosesAtPlaceholder')}
              />
              <FieldDescription>Format: DD/MM/YYYY HH:MM (24h)</FieldDescription>
            </Field>
          </div>

          <div className="space-y-4 rounded-lg border p-4 bg-muted/50">
            <Field>
              <FieldLabel>{t('tierAssignmentRules')}</FieldLabel>
              <FieldDescription>{t('tierAssignmentDescription')}</FieldDescription>
            </Field>

            <RadioGroup
              value={formData.tierRuleType}
              onValueChange={(value: 'auto' | 'count' | 'percentage') =>
                setFormData({ ...formData, tierRuleType: value })
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="auto" id="tier-auto" />
                <FieldLabel htmlFor="tier-auto" className="font-normal cursor-pointer">
                  {t('tierAuto')}
                </FieldLabel>
              </div>

              <div className="flex items-center space-x-2">
                <RadioGroupItem value="count" id="tier-count" />
                <FieldLabel htmlFor="tier-count" className="font-normal cursor-pointer">
                  {t('tierCount')}
                </FieldLabel>
              </div>

              <div className="flex items-center space-x-2">
                <RadioGroupItem value="percentage" id="tier-percentage" />
                <FieldLabel htmlFor="tier-percentage" className="font-normal cursor-pointer">
                  {t('tierPercentage')}
                </FieldLabel>
              </div>
            </RadioGroup>

            {formData.tierRuleType === 'count' && (
              <Field className="ml-6">
                <FieldLabel htmlFor="masterCount">{t('numberOfMastersPlayers')}</FieldLabel>
                <Input
                  id="masterCount"
                  type="number"
                  min="0"
                  max={formData.capacity}
                  value={formData.masterCount}
                  onChange={(e) => setFormData({ ...formData, masterCount: e.target.value })}
                  placeholder={t('numberOfMastersPlaceholder')}
                />
                <FieldDescription>
                  {t('topRatedPlayers', { count: formData.masterCount || 'X' })}
                </FieldDescription>
              </Field>
            )}

            {formData.tierRuleType === 'percentage' && (
              <Field className="pl-6">
                <FieldLabel htmlFor="masterPercentage">{t('mastersPercentage')}</FieldLabel>
                <Input
                  id="masterPercentage"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={formData.masterPercentage}
                  onChange={(e) => setFormData({ ...formData, masterPercentage: e.target.value })}
                  placeholder={t('mastersPercentagePlaceholder')}
                />
                <FieldDescription>
                  {t('topPercentagePlayers', { percentage: formData.masterPercentage || 'X' })}
                </FieldDescription>
              </Field>
            )}

            <div className="space-y-4 pt-4 border-t">
              <Field>
                <FieldLabel>{t('timeSlotsAndCourts')}</FieldLabel>
                <FieldDescription>{t('timeSlotsDescription')}</FieldDescription>
              </Field>

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
                <FieldDescription>{t('durationDescription')}</FieldDescription>
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
                <FieldDescription>{t('gameFormatDescription')}</FieldDescription>
              </Field>

              {/* Game calculation display */}
              {(() => {
                const WARMUP_TIME = 5; // minutes
                const BREAK_TIME = 2; // minutes between rounds
                const MIN_GAME_TIME = 15; // minimum minutes per game

                const totalDuration = formData.duration;
                const availableTime = totalDuration - WARMUP_TIME;

                // Calculate maximum rounds based on available time
                // Formula: (Available Time - Breaks) / Min Game Time
                // Or: Available Time / (Min Game Time + Break)
                const maxRounds = Math.floor(availableTime / (MIN_GAME_TIME + BREAK_TIME));
                const timePerRound = maxRounds > 0 ? Math.floor(availableTime / maxRounds) : 0;
                const gameTime = maxRounds > 0 ? timePerRound - BREAK_TIME : 0;

                // Calculate courts for each tier
                const mastersCourts = formData.mastersCourtIds.length;
                const explorersCourts = formData.explorersCourtIds.length;

                // Calculate total teams (each court has 4 players = 2 teams)
                // Teams play across multiple rounds, so total teams = courts × 2
                const mastersTeams = mastersCourts * 2; // 2 teams per court
                const explorersTeams = explorersCourts * 2;
                const totalTeams = mastersTeams + explorersTeams;

                return (
                  <div className="p-3 rounded-lg border bg-muted/50 space-y-2">
                    <div className="text-sm font-medium">{t('gameCalculation')}</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <div>
                        • {t('duration')}: {totalDuration} min
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
                      <div></div> {/* Spacer for grid alignment */}
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
                        <div className="font-medium pt-1 border-t mt-2 md:col-span-2">
                          • {t('totalTeams')}: {totalTeams}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3 p-3 rounded-lg border bg-card">
                  <FieldLabel className="text-sm font-medium">{t('mastersTimeSlot')}</FieldLabel>
                  <Field>
                    <FieldLabel
                      htmlFor="mastersStartTime"
                      className="text-xs text-muted-foreground"
                    >
                      {t('startTime')}
                    </FieldLabel>
                    <TimePicker
                      id="mastersStartTime"
                      value={formData.mastersStartTime}
                      onChange={(time) => setFormData({ ...formData, mastersStartTime: time })}
                      placeholder={t('startTimePlaceholder')}
                    />
                    <FieldDescription>Format: HH:MM (24h)</FieldDescription>
                  </Field>

                  {selectedVenue && selectedVenue.courts && selectedVenue.courts.length > 0 && (
                    <div className="space-y-2">
                      <FieldLabel className="text-xs text-muted-foreground">
                        {t('courtsAvailable')}
                      </FieldLabel>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedVenue.courts.map((court) => (
                          <div key={court.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`masters-court-${court.id}`}
                              checked={formData.mastersCourtIds.includes(court.id)}
                              onCheckedChange={(checked) => {
                                setFormData((prev) => ({
                                  ...prev,
                                  mastersCourtIds: checked
                                    ? [...prev.mastersCourtIds, court.id]
                                    : prev.mastersCourtIds.filter((id) => id !== court.id),
                                }));
                              }}
                            />
                            <label
                              htmlFor={`masters-court-${court.id}`}
                              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              {court.label}
                            </label>
                          </div>
                        ))}
                      </div>
                      <FieldDescription>
                        {t('courtsSelected', { count: formData.mastersCourtIds.length })}
                      </FieldDescription>
                    </div>
                  )}
                </div>

                <div className="space-y-3 p-3 rounded-lg border bg-card">
                  <FieldLabel className="text-sm font-medium">{t('explorersTimeSlot')}</FieldLabel>
                  <Field>
                    <FieldLabel
                      htmlFor="explorersStartTime"
                      className="text-xs text-muted-foreground"
                    >
                      {t('startTime')}
                    </FieldLabel>
                    <TimePicker
                      id="explorersStartTime"
                      value={formData.explorersStartTime}
                      onChange={(time) => setFormData({ ...formData, explorersStartTime: time })}
                      placeholder={t('explorersStartTimePlaceholder')}
                    />
                    <FieldDescription>Format: HH:MM (24h)</FieldDescription>
                  </Field>

                  {selectedVenue && selectedVenue.courts && selectedVenue.courts.length > 0 && (
                    <div className="space-y-2">
                      <FieldLabel className="text-xs text-muted-foreground">
                        {t('courtsAvailable')}
                      </FieldLabel>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedVenue.courts.map((court) => (
                          <div key={court.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`explorers-court-${court.id}`}
                              checked={formData.explorersCourtIds.includes(court.id)}
                              onCheckedChange={(checked) => {
                                setFormData((prev) => ({
                                  ...prev,
                                  explorersCourtIds: checked
                                    ? [...prev.explorersCourtIds, court.id]
                                    : prev.explorersCourtIds.filter((id) => id !== court.id),
                                }));
                              }}
                            />
                            <label
                              htmlFor={`explorers-court-${court.id}`}
                              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              {court.label}
                            </label>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {t('courtsSelected', { count: formData.explorersCourtIds.length })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {(createMutation.isError || updateMutation.isError) && (
            <div className="text-sm text-destructive">
              {t('error')}: {((createMutation.error || updateMutation.error) as Error)?.message}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex pt-0 justify-end gap-2">
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
