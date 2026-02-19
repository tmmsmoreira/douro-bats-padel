'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { useLocale } from 'next-intl';
import { AlertTriangle } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Court {
  id: string;
  label: string;
}

interface EventCourt {
  court: Court;
}

interface Player {
  id: string;
  name: string;
  rating: number;
  tier?: string;
}

interface GenerateDrawProps {
  eventId: string;
}

export function GenerateDraw({ eventId }: GenerateDrawProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const locale = useLocale();

  const [constraints, setConstraints] = useState({
    avoidRecentSessions: 4,
    balanceStrength: true,
    allowTierMixing: false,
  });

  // State for selected courts (initialized after event loads)
  const [selectedMastersCourts, setSelectedMastersCourts] = useState<string[]>([]);
  const [selectedExplorersCourts, setSelectedExplorersCourts] = useState<string[]>([]);

  // Fetch event details
  const { data: event, isLoading: eventLoading } = useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (session?.accessToken) {
        headers.Authorization = `Bearer ${session.accessToken}`;
      }

      const res = await fetch(`${API_URL}/events/${eventId}?includeUnpublished=true`, { headers });

      if (!res.ok) {
        throw new Error(`API Error: ${res.statusText}`);
      }

      return res.json();
    },
  });

  // Check if draw already exists
  const { data: existingDraw } = useQuery({
    queryKey: ['draw', eventId],
    queryFn: async () => {
      try {
        const headers: HeadersInit = {};
        if (session?.accessToken) {
          headers.Authorization = `Bearer ${session.accessToken}`;
        }
        const res = await fetch(`${API_URL}/draws/events/${eventId}`, { headers });
        if (!res.ok) return null;
        return res.json();
      } catch {
        return null;
      }
    },
  });

  // Get available courts from tierRules (must be before useEffect)
  const tierRules = event?.tierRules || {};
  const mastersCourts = useMemo(
    () => tierRules.mastersTimeSlot?.courtIds || [],
    [tierRules.mastersTimeSlot?.courtIds]
  );
  const explorersCourts = useMemo(
    () => tierRules.explorersTimeSlot?.courtIds || [],
    [tierRules.explorersTimeSlot?.courtIds]
  );

  // Initialize selected courts when event loads (must be before early returns)
  useEffect(() => {
    if (mastersCourts.length > 0 && selectedMastersCourts.length === 0) {
      setSelectedMastersCourts(mastersCourts);
    }
    if (explorersCourts.length > 0 && selectedExplorersCourts.length === 0) {
      setSelectedExplorersCourts(explorersCourts);
    }
  }, [
    mastersCourts,
    explorersCourts,
    selectedMastersCourts.length,
    selectedExplorersCourts.length,
  ]);

  const generateDrawMutation = useMutation({
    mutationFn: async () => {
      if (!session?.accessToken) {
        throw new Error('Not authenticated');
      }

      const res = await fetch(`${API_URL}/draws/events/${eventId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({
          constraints,
          selectedCourts: {
            masters: selectedMastersCourts,
            explorers: selectedExplorersCourts,
          },
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to generate draw');
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['draw', eventId] });
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      toast.success('Draw generated successfully!');
      router.push(`/${locale}/admin/events/${eventId}/draw/view`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to generate draw: ${error.message}`);
    },
  });

  if (eventLoading) {
    return <div className="text-center py-8">Loading event...</div>;
  }

  if (!event) {
    return <div className="text-center py-8">Event not found</div>;
  }

  const confirmedCount = event.confirmedCount || 0;

  // Since MASTERS and EXPLORERS play at different times, capacity is additive
  // Even if the same courts are used, they can accommodate different players at different times
  // Use SELECTED courts for capacity calculation
  const mastersCapacity = selectedMastersCourts.length * 4;
  const explorersCapacity = selectedExplorersCourts.length * 4;
  const maxPlayers = mastersCapacity + explorersCapacity;

  // Get unique courts for display purposes
  const allAvailableCourts = [...new Set([...mastersCourts, ...explorersCourts])];
  const maxPlayersPerCourt = 4;

  // Adjust player count to nearest multiple of 4 (round down)
  const adjustedPlayerCount = Math.floor(confirmedCount / 4) * 4;

  // Determine actual players in draw (limited by court capacity)
  const hasExcessPlayers = adjustedPlayerCount > maxPlayers;
  const playersInDraw = hasExcessPlayers ? Math.floor(maxPlayers / 4) * 4 : adjustedPlayerCount;
  const waitlistedPlayers = confirmedCount - playersInDraw;

  // Check if we'll have unused courts
  const courtsNeeded = Math.ceil(playersInDraw / maxPlayersPerCourt);
  const unusedCourts = playersInDraw > 0 ? allAvailableCourts.length - courtsNeeded : 0;

  // Check if we have insufficient players
  const hasInsufficientPlayers =
    confirmedCount > 0 && playersInDraw < confirmedCount && !hasExcessPlayers;

  // Get all courts with details
  const allCourts = event.eventCourts?.map((ec: EventCourt) => ec.court) || [];
  const availableCourts = allCourts.filter((court: Court) => allAvailableCourts.includes(court.id));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Generate Draw</h1>
        <p className="text-muted-foreground">Configure and generate the tournament draw</p>
      </div>

      {existingDraw && (
        <Card
          className={
            event.state === 'PUBLISHED'
              ? 'border-red-500 bg-red-50 dark:bg-red-950/20'
              : 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20'
          }
        >
          <CardHeader>
            <CardTitle
              className={
                event.state === 'PUBLISHED'
                  ? 'text-red-800 dark:text-red-200 flex items-center gap-2'
                  : 'text-yellow-800 dark:text-yellow-200'
              }
            >
              {event.state === 'PUBLISHED' && <AlertTriangle className="h-5 w-5" />}
              Draw Already Exists
            </CardTitle>
            <CardDescription
              className={
                event.state === 'PUBLISHED'
                  ? 'text-red-700 dark:text-red-300'
                  : 'text-yellow-700 dark:text-yellow-300'
              }
            >
              {event.state === 'PUBLISHED' ? (
                <>
                  This draw is currently <strong>published</strong> and visible to players.
                  <br />
                  To generate a new draw, you must first <strong>unpublish or delete</strong> the
                  existing draw from the draw view page.
                </>
              ) : (
                <>
                  A draw has already been generated for this event.
                  <br />
                  To generate a new draw, you must first <strong>delete</strong> the existing draw
                  from the draw view page.
                </>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              onClick={() => router.push(`/${locale}/admin/events/${eventId}/draw/view`)}
            >
              View & Manage Draw
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Insufficient Players Warning (not enough to fill all courts) */}
      {hasInsufficientPlayers && (
        <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
          <CardHeader>
            <CardTitle className="text-yellow-800 dark:text-yellow-200">
              ℹ️ Insufficient Players
            </CardTitle>
            <CardDescription className="text-yellow-700 dark:text-yellow-300">
              You have {confirmedCount} confirmed players, but only {playersInDraw} can form
              complete teams (multiple of 4).
              <br />
              {waitlistedPlayers > 0 && (
                <>
                  <strong>
                    {waitlistedPlayers} player{waitlistedPlayers !== 1 ? 's' : ''}
                  </strong>{' '}
                  will be waitlisted.
                  <br />
                </>
              )}
              You have capacity for {maxPlayers} players ({mastersCourts.length} MASTERS courts +{' '}
              {explorersCourts.length} EXPLORERS courts) but only need {courtsNeeded} courts.
              <br />
              <strong>Consider reducing the number of courts to avoid unnecessary costs.</strong>
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Excess Players Warning (more players than court capacity) */}
      {hasExcessPlayers && (
        <Card className="border-orange-500 bg-orange-50 dark:bg-orange-950/20">
          <CardHeader>
            <CardTitle className="text-orange-800 dark:text-orange-200 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Excess Players Detected
            </CardTitle>
            <CardDescription className="text-orange-700 dark:text-orange-300">
              You have {confirmedCount} confirmed players but only {mastersCourts.length} courts for
              MASTERS and {explorersCourts.length} courts for EXPLORERS (max {maxPlayers} players
              total).
              <br />
              <strong>{playersInDraw} players</strong> (top-rated) will be included in the draw, and{' '}
              <strong>{waitlistedPlayers} players</strong> will be waitlisted.
              <br />
              All courts will be used.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Unused Courts Warning (have players but not using all courts) */}
      {!hasExcessPlayers && unusedCourts > 0 && playersInDraw > 0 && (
        <Card className="border-blue-500 bg-blue-50 dark:bg-blue-950/20">
          <CardHeader>
            <CardTitle className="text-blue-800 dark:text-blue-200">
              💡 Court Optimization
            </CardTitle>
            <CardDescription className="text-blue-700 dark:text-blue-300">
              With {playersInDraw} players, you only need {courtsNeeded} court
              {courtsNeeded !== 1 ? 's' : ''}.
              <br />
              You have {mastersCourts.length} courts for MASTERS and {explorersCourts.length} courts
              for EXPLORERS.
              <br />
              <strong>Consider reducing courts to avoid unnecessary costs.</strong>
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Tier Configuration Card */}
      <Card className="border-blue-500 bg-blue-50 dark:bg-blue-950/20">
        <CardHeader>
          <CardTitle className="text-blue-800 dark:text-blue-200">Tier Configuration</CardTitle>
          <CardDescription className="text-blue-700 dark:text-blue-300">
            How players will be split into MASTERS and EXPLORERS tiers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Tier Split Method */}
          <div>
            <span className="font-medium">Split Method:</span>{' '}
            {tierRules.masterCount !== undefined ? (
              <Badge variant="outline">Fixed Count: {tierRules.masterCount} MASTERS</Badge>
            ) : tierRules.masterPercentage !== undefined ? (
              <Badge variant="outline">
                {tierRules.masterPercentage}% MASTERS / {100 - tierRules.masterPercentage}%
                EXPLORERS
              </Badge>
            ) : (
              <Badge variant="outline">50% MASTERS / 50% EXPLORERS (Default)</Badge>
            )}
          </div>

          {/* Expected Distribution */}
          <div className="grid grid-cols-2 gap-4 p-3 bg-white dark:bg-gray-900 rounded-lg border">
            <div>
              <div className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
                MASTERS
              </div>
              <div className="text-2xl font-bold">
                {Math.floor((playersInDraw * (tierRules.masterPercentage || 50)) / 100)}
              </div>
              <div className="text-xs text-muted-foreground">players expected</div>
            </div>
            <div>
              <div className="text-sm font-medium text-green-700 dark:text-green-400">
                EXPLORERS
              </div>
              <div className="text-2xl font-bold">
                {playersInDraw -
                  Math.floor((playersInDraw * (tierRules.masterPercentage || 50)) / 100)}
              </div>
              <div className="text-xs text-muted-foreground">players expected</div>
            </div>
          </div>

          {/* Time Slots */}
          <div className="grid grid-cols-2 gap-4">
            {tierRules.mastersTimeSlot && (
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <div className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                  MASTERS Time Slot
                </div>
                <div className="text-sm">
                  {tierRules.mastersTimeSlot.startsAt} - {tierRules.mastersTimeSlot.endsAt}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {mastersCourts.length} court{mastersCourts.length !== 1 ? 's' : ''} (capacity:{' '}
                  {mastersCapacity} players)
                </div>
              </div>
            )}
            {tierRules.explorersTimeSlot && (
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <div className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">
                  EXPLORERS Time Slot
                </div>
                <div className="text-sm">
                  {tierRules.explorersTimeSlot.startsAt} - {tierRules.explorersTimeSlot.endsAt}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {explorersCourts.length} court{explorersCourts.length !== 1 ? 's' : ''} (capacity:{' '}
                  {explorersCapacity} players)
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Event Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="font-medium">Title:</span> {event.title || 'Untitled Event'}
            </div>
            <div>
              <span className="font-medium">Confirmed Players:</span> {confirmedCount}
            </div>
            <div>
              <span className="font-medium">Players in Draw:</span>{' '}
              <Badge variant={hasExcessPlayers ? 'destructive' : 'default'}>{playersInDraw}</Badge>
            </div>
            {waitlistedPlayers > 0 && (
              <div>
                <span className="font-medium">Waitlisted Players:</span>{' '}
                <Badge variant="secondary">{waitlistedPlayers}</Badge>
              </div>
            )}
            <div>
              <span className="font-medium">Status:</span>{' '}
              <Badge variant={event.state === 'FROZEN' ? 'default' : 'secondary'}>
                {event.state}
              </Badge>
            </div>
            {event.state !== 'FROZEN' && event.state !== 'DRAWN' && event.state !== 'PUBLISHED' && (
              <div className="text-sm text-destructive mt-2 flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" />
                Event must be frozen to generate draw. Go to event details to freeze it.
              </div>
            )}
            {playersInDraw < 4 && confirmedCount >= 4 && (
              <div className="text-sm text-destructive mt-2 flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" />
                Need at least 4 players to generate draw
              </div>
            )}
            {confirmedCount < 4 && (
              <div className="text-sm text-destructive mt-2 flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" />
                Need at least 4 confirmed players
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Select Courts to Use</CardTitle>
            <CardDescription>
              Choose which courts to use for the draw. Selected: {selectedMastersCourts.length}{' '}
              MASTERS + {selectedExplorersCourts.length} EXPLORERS (capacity: {maxPlayers} players)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {mastersCourts.length > 0 && (
                <div>
                  <div className="text-sm font-medium mb-2 text-yellow-800 dark:text-yellow-200">
                    MASTERS Courts:
                  </div>
                  <div className="space-y-2">
                    {availableCourts
                      .filter((court: Court) => mastersCourts.includes(court.id))
                      .map((court: Court) => {
                        const isSelected = selectedMastersCourts.includes(court.id);
                        return (
                          <div key={court.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`masters-${court.id}`}
                              checked={isSelected}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedMastersCourts([...selectedMastersCourts, court.id]);
                                } else {
                                  setSelectedMastersCourts(
                                    selectedMastersCourts.filter((id) => id !== court.id)
                                  );
                                }
                              }}
                            />
                            <label
                              htmlFor={`masters-${court.id}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              {court.label}
                            </label>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
              {explorersCourts.length > 0 && (
                <div>
                  <div className="text-sm font-medium mb-2 text-green-800 dark:text-green-200">
                    EXPLORERS Courts:
                  </div>
                  <div className="space-y-2">
                    {availableCourts
                      .filter((court: Court) => explorersCourts.includes(court.id))
                      .map((court: Court) => {
                        const isSelected = selectedExplorersCourts.includes(court.id);
                        return (
                          <div key={court.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`explorers-${court.id}`}
                              checked={isSelected}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedExplorersCourts([
                                    ...selectedExplorersCourts,
                                    court.id,
                                  ]);
                                } else {
                                  setSelectedExplorersCourts(
                                    selectedExplorersCourts.filter((id) => id !== court.id)
                                  );
                                }
                              }}
                            />
                            <label
                              htmlFor={`explorers-${court.id}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              {court.label}
                            </label>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Draw Constraints</CardTitle>
            <CardDescription>Configure how the draw should be generated</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="balance-strength">Balance Team Strength</Label>
                <p className="text-sm text-muted-foreground">
                  Create balanced teams based on player ratings
                </p>
              </div>
              <Switch
                id="balance-strength"
                checked={constraints.balanceStrength}
                onCheckedChange={(checked) =>
                  setConstraints({ ...constraints, balanceStrength: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="tier-mixing">Allow Tier Mixing</Label>
                <p className="text-sm text-muted-foreground">
                  Allow Masters and Explorers to play together if needed
                </p>
              </div>
              <Switch
                id="tier-mixing"
                checked={constraints.allowTierMixing}
                onCheckedChange={(checked) =>
                  setConstraints({ ...constraints, allowTierMixing: checked })
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Players in Draw */}
      <Card>
        <CardHeader>
          <CardTitle>Players in Draw ({playersInDraw})</CardTitle>
          <CardDescription>
            {hasExcessPlayers
              ? `Top ${playersInDraw} players by rating will be included in the draw`
              : 'All confirmed players will be included in the draw'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {event.confirmedPlayers
              ?.slice(0, playersInDraw)
              .map((player: Player, index: number) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-2 border rounded"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">#{index + 1}</span>
                    <span className="text-sm">{player.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {player.tier}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{player.rating}</span>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Waitlisted Players */}
      {waitlistedPlayers > 0 && (
        <Card className="border-orange-500">
          <CardHeader>
            <CardTitle>Waitlisted Players ({waitlistedPlayers})</CardTitle>
            <CardDescription>
              These players will not be included in the draw due to court capacity limitations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {event.confirmedPlayers?.slice(playersInDraw).map((player: Player, index: number) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-2 border rounded bg-orange-50 dark:bg-orange-950/20"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      #{playersInDraw + index + 1}
                    </span>
                    <span className="text-sm">{player.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {player.tier}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{player.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button
          onClick={() => generateDrawMutation.mutate()}
          disabled={generateDrawMutation.isPending || playersInDraw < 4 || event.state !== 'FROZEN'}
        >
          {generateDrawMutation.isPending
            ? 'Generating...'
            : existingDraw
              ? 'Generate New Draw'
              : 'Generate Draw'}
        </Button>
      </div>

      {generateDrawMutation.isError && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">
              Error:{' '}
              {generateDrawMutation.error instanceof Error
                ? generateDrawMutation.error.message
                : 'Failed to generate draw'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
