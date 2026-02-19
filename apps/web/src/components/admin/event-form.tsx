'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { TimePicker } from '@/components/ui/time-picker';
import { DateTimePicker } from '@/components/ui/datetime-picker';
import type { CreateEventDto, TierRules } from '@padel/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Venue {
  id: string;
  name: string;
  address?: string;
  courts: Court[];
}

interface Court {
  id: string;
  label: string;
  venueId: string;
}

interface EventFormProps {
  eventId?: string;
  initialData?: any;
}

export function EventForm({ eventId, initialData }: EventFormProps = {}) {
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const t = useTranslations('eventForm');
  const isEditMode = !!eventId;

  const [formData, setFormData] = useState<{
    title: string;
    date?: Date;
    capacity: string;
    rsvpOpensAt?: Date;
    rsvpClosesAt?: Date;
    venueId: string;
    tierRuleType: 'auto' | 'count' | 'percentage';
    masterCount: string;
    masterPercentage: string;
    mastersStartTime?: Date;
    mastersEndTime?: Date;
    mastersCourtIds: string[];
    explorersStartTime?: Date;
    explorersEndTime?: Date;
    explorersCourtIds: string[];
  }>({
    title: '',
    date: undefined,
    capacity: '0',
    rsvpOpensAt: undefined,
    rsvpClosesAt: undefined,
    venueId: '',
    tierRuleType: 'percentage',
    masterCount: '',
    masterPercentage: '50',
    mastersStartTime: undefined,
    mastersEndTime: undefined,
    mastersCourtIds: [],
    explorersStartTime: undefined,
    explorersEndTime: undefined,
    explorersCourtIds: [],
  });

  // Fetch venues with courts
  const { data: venues, isLoading: venuesLoading } = useQuery<Venue[]>({
    queryKey: ['venues'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/venues`);
      if (!res.ok) throw new Error('Failed to fetch venues');
      return res.json();
    },
  });

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

      setFormData({
        title: initialData.title || '',
        date: initialData.date ? new Date(initialData.date) : undefined,
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
        mastersEndTime: mastersTimeSlot?.endsAt ? parseTime(mastersTimeSlot.endsAt) : undefined,
        mastersCourtIds: mastersTimeSlot?.courtIds || [],
        explorersStartTime: explorersTimeSlot?.startsAt
          ? parseTime(explorersTimeSlot.startsAt)
          : undefined,
        explorersEndTime: explorersTimeSlot?.endsAt
          ? parseTime(explorersTimeSlot.endsAt)
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

  const createMutation = useMutation({
    mutationFn: async (data: CreateEventDto) => {
      if (!session?.accessToken) {
        throw new Error('Not authenticated');
      }

      const res = await fetch(`${API_URL}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(errorData.message || `API Error: ${res.statusText}`);
      }

      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      router.push(`/admin/events/${data.id}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<CreateEventDto>) => {
      if (!session?.accessToken) {
        throw new Error('Not authenticated');
      }

      const res = await fetch(`${API_URL}/events/${eventId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(errorData.message || `API Error: ${res.statusText}`);
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      router.push(`/admin/events/${eventId}`);
    },
  });

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
    if (!formData.mastersStartTime || !formData.mastersEndTime) {
      alert(t('validationMastersTime'));
      return;
    }
    if (formData.mastersCourtIds.length === 0) {
      alert(t('validationMastersCourts'));
      return;
    }
    if (!formData.explorersStartTime || !formData.explorersEndTime) {
      alert(t('validationExplorersTime'));
      return;
    }
    if (formData.explorersCourtIds.length === 0) {
      alert(t('validationExplorersCourts'));
      return;
    }

    // Derive overall event start/end times from time slots
    const eventDate = new Date(formData.date);

    // Find the earliest start time and latest end time from both time slots
    const mastersStart = new Date(eventDate);
    mastersStart.setHours(
      formData.mastersStartTime.getHours(),
      formData.mastersStartTime.getMinutes()
    );

    const mastersEnd = new Date(eventDate);
    mastersEnd.setHours(formData.mastersEndTime.getHours(), formData.mastersEndTime.getMinutes());

    const explorersStart = new Date(eventDate);
    explorersStart.setHours(
      formData.explorersStartTime.getHours(),
      formData.explorersStartTime.getMinutes()
    );

    const explorersEnd = new Date(eventDate);
    explorersEnd.setHours(
      formData.explorersEndTime.getHours(),
      formData.explorersEndTime.getMinutes()
    );

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
    const mastersEndTime = `${String(formData.mastersEndTime.getHours()).padStart(2, '0')}:${String(formData.mastersEndTime.getMinutes()).padStart(2, '0')}`;
    tierRules.mastersTimeSlot = {
      startsAt: mastersStartTime,
      endsAt: mastersEndTime,
      courtIds: formData.mastersCourtIds,
    };

    // Add EXPLORERS time slot
    const explorersStartTime = `${String(formData.explorersStartTime.getHours()).padStart(2, '0')}:${String(formData.explorersStartTime.getMinutes()).padStart(2, '0')}`;
    const explorersEndTime = `${String(formData.explorersEndTime.getHours()).padStart(2, '0')}:${String(formData.explorersEndTime.getMinutes()).padStart(2, '0')}`;
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
      venueId: formData.venueId,
      courtIds: allCourtIds,
      capacity: parseInt(formData.capacity),
      rsvpOpensAt: formData.rsvpOpensAt,
      rsvpClosesAt: formData.rsvpClosesAt,
      tierRules,
    };

    if (isEditMode) {
      updateMutation.mutate(dto);
    } else {
      createMutation.mutate(dto);
    }
  };

  return (
    <Card>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">{t('eventTitle')}</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={t('eventTitlePlaceholder')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">{t('eventDate')}</Label>
              <DatePicker
                id="date"
                value={formData.date}
                onChange={(date) => setFormData({ ...formData, date })}
                placeholder={t('selectEventDate')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">{t('capacity')}</Label>
              <Input
                id="capacity"
                type="number"
                value={formData.capacity}
                readOnly
                className="bg-muted cursor-not-allowed"
                required
              />
              <p className="text-xs text-muted-foreground">{t('autoCalculated')}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="venue">{t('venue')}</Label>
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
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rsvpOpensAt">{t('rsvpOpensAt')}</Label>
              <DateTimePicker
                id="rsvpOpensAt"
                value={formData.rsvpOpensAt}
                onChange={(datetime) => setFormData({ ...formData, rsvpOpensAt: datetime })}
                placeholder={t('rsvpOpensAtPlaceholder')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rsvpClosesAt">{t('rsvpClosesAt')}</Label>
              <DateTimePicker
                id="rsvpClosesAt"
                value={formData.rsvpClosesAt}
                onChange={(datetime) => setFormData({ ...formData, rsvpClosesAt: datetime })}
                placeholder={t('rsvpClosesAtPlaceholder')}
              />
            </div>
          </div>

          <div className="space-y-4 rounded-lg border p-4 bg-muted/50">
            <div className="space-y-2">
              <Label>{t('tierAssignmentRules')}</Label>
              <p className="text-sm text-muted-foreground">{t('tierAssignmentDescription')}</p>
            </div>

            <RadioGroup
              value={formData.tierRuleType}
              onValueChange={(value: 'auto' | 'count' | 'percentage') =>
                setFormData({ ...formData, tierRuleType: value })
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="auto" id="tier-auto" />
                <Label htmlFor="tier-auto" className="font-normal cursor-pointer">
                  {t('tierAuto')}
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <RadioGroupItem value="count" id="tier-count" />
                <Label htmlFor="tier-count" className="font-normal cursor-pointer">
                  {t('tierCount')}
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <RadioGroupItem value="percentage" id="tier-percentage" />
                <Label htmlFor="tier-percentage" className="font-normal cursor-pointer">
                  {t('tierPercentage')}
                </Label>
              </div>
            </RadioGroup>

            {formData.tierRuleType === 'count' && (
              <div className="space-y-2 ml-6">
                <Label htmlFor="masterCount">{t('numberOfMastersPlayers')}</Label>
                <Input
                  id="masterCount"
                  type="number"
                  min="0"
                  max={formData.capacity}
                  value={formData.masterCount}
                  onChange={(e) => setFormData({ ...formData, masterCount: e.target.value })}
                  placeholder={t('numberOfMastersPlaceholder')}
                />
                <p className="text-xs text-muted-foreground">
                  {t('topRatedPlayers', { count: formData.masterCount || 'X' })}
                </p>
              </div>
            )}

            {formData.tierRuleType === 'percentage' && (
              <div className="space-y-2 ml-6">
                <Label htmlFor="masterPercentage">{t('mastersPercentage')}</Label>
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
                <p className="text-xs text-muted-foreground">
                  {t('topPercentagePlayers', { percentage: formData.masterPercentage || 'X' })}
                </p>
              </div>
            )}

            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-2">
                <Label className="text-base">{t('timeSlotsAndCourts')}</Label>
                <p className="text-sm text-muted-foreground">{t('timeSlotsDescription')}</p>
              </div>

              <div className="space-y-3 p-3 rounded-lg border bg-card">
                <Label className="text-sm font-medium">{t('mastersTimeSlot')}</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="mastersStartTime" className="text-xs text-muted-foreground">
                      {t('startTime')}
                    </Label>
                    <TimePicker
                      id="mastersStartTime"
                      value={formData.mastersStartTime}
                      onChange={(time) => setFormData({ ...formData, mastersStartTime: time })}
                      placeholder={t('startTimePlaceholder')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mastersEndTime" className="text-xs text-muted-foreground">
                      {t('endTime')}
                    </Label>
                    <TimePicker
                      id="mastersEndTime"
                      value={formData.mastersEndTime}
                      onChange={(time) => setFormData({ ...formData, mastersEndTime: time })}
                      placeholder={t('endTimePlaceholder')}
                    />
                  </div>
                </div>

                {selectedVenue && selectedVenue.courts.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">{t('courtsAvailable')}</Label>
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
                    <p className="text-xs text-muted-foreground">
                      {t('courtsSelected', { count: formData.mastersCourtIds.length })}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-3 p-3 rounded-lg border bg-card">
                <Label className="text-sm font-medium">{t('explorersTimeSlot')}</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="explorersStartTime" className="text-xs text-muted-foreground">
                      {t('startTime')}
                    </Label>
                    <TimePicker
                      id="explorersStartTime"
                      value={formData.explorersStartTime}
                      onChange={(time) => setFormData({ ...formData, explorersStartTime: time })}
                      placeholder={t('explorersStartTimePlaceholder')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="explorersEndTime" className="text-xs text-muted-foreground">
                      {t('endTime')}
                    </Label>
                    <TimePicker
                      id="explorersEndTime"
                      value={formData.explorersEndTime}
                      onChange={(time) => setFormData({ ...formData, explorersEndTime: time })}
                      placeholder={t('explorersEndTimePlaceholder')}
                    />
                  </div>
                </div>

                {selectedVenue && selectedVenue.courts.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">{t('courtsAvailable')}</Label>
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

          {(createMutation.isError || updateMutation.isError) && (
            <div className="text-sm text-destructive">
              {t('error')}: {((createMutation.error || updateMutation.error) as Error)?.message}
            </div>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {isEditMode
                ? updateMutation.isPending
                  ? t('updating')
                  : t('updateEvent')
                : createMutation.isPending
                  ? t('creating')
                  : t('createEvent')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(isEditMode ? `/admin/events/${eventId}` : '/admin')}
            >
              {t('cancel')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
