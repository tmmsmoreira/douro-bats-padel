'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from '@/components/ui/empty';
import { DataStateWrapper } from '@/components/shared';
import { TierSection, TeamList, WaitlistSection } from '@/components/shared/draw';
import type { Draw } from '@/components/shared/draw';
import type { EventWithPlayersSerialized } from '@padel/types';
import { BadgeAlertIcon } from 'lucide-animated';
import { useDraw, useEventDetails, useIsFromBfcache } from '@/hooks';
import { TierCollapsibleItem } from '@/components/shared/tier-collapsible-item';
import { groupByRound, getUniqueTeamsCount, getFieldsCount, filterByTier } from '@/lib/draw-utils';

export function DrawView({ eventId }: { eventId: string }) {
  const t = useTranslations('drawView');

  const { data: draw, isLoading, error } = useDraw(eventId);
  const { data: event } = useEventDetails(eventId);

  return (
    <DataStateWrapper
      isLoading={isLoading}
      data={draw}
      error={error}
      loadingMessage={t('loadingDraw')}
      errorComponent={
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BadgeAlertIcon className="size-6" />
            </EmptyMedia>
            <EmptyTitle>{t('drawNotAvailable')}</EmptyTitle>
            <EmptyDescription>
              {t('drawNotAvailableDescription')}
              {error && (
                <>
                  <br />
                  <span className="text-xs text-destructive mt-2 block">
                    {t('error')}: {error instanceof Error ? error.message : 'Failed to load draw'}
                  </span>
                </>
              )}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      }
      emptyMessage={t('drawNotAvailable')}
    >
      {(draw) => <DrawContent draw={draw} event={event} t={t} />}
    </DataStateWrapper>
  );
}

// Separate component for draw content
function DrawContent({
  draw,
  event,
  t,
}: {
  draw: Draw;
  event: EventWithPlayersSerialized | null | undefined;
  t: ReturnType<typeof useTranslations>;
}) {
  const isBackNav = useIsFromBfcache();
  const [openTier, setOpenTier] = useState<string | null>(null);

  const masterAssignments = filterByTier(draw.assignments, 'MASTERS');
  const explorerAssignments = filterByTier(draw.assignments, 'EXPLORERS');

  const mastersRounds = groupByRound(masterAssignments);
  const explorersRounds = groupByRound(explorerAssignments);

  const mastersTeamsCount = getUniqueTeamsCount(masterAssignments);
  const explorersTeamsCount = getUniqueTeamsCount(explorerAssignments);
  const mastersFieldsCount = getFieldsCount(masterAssignments);
  const explorersFieldsCount = getFieldsCount(explorerAssignments);

  return (
    <motion.div
      initial={isBackNav ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: isBackNav ? 0 : 0.3 }}
      className="space-y-4"
    >
      {masterAssignments.length > 0 && (
        <TierCollapsibleItem
          open={openTier === 'masters'}
          onOpenChange={(open) => setOpenTier(open ? 'masters' : null)}
          tierName={t('mastersTier')}
          tierColor="bg-yellow-500"
          timeSlot={draw.event.tierRules?.mastersTimeSlot}
          badges={[
            `${mastersTeamsCount} ${t('teams')}`,
            `${Object.keys(mastersRounds).length} ${t('rounds')}`,
            `${mastersFieldsCount} ${t('fields')}`,
          ]}
        >
          <div className="space-y-6">
            <TeamList
              assignments={masterAssignments}
              canEdit={false}
              translations={{
                tierName: t('mastersTier'),
                teamListTitle: t('teamListTitle'),
                teamListDescription: t('teamListDescription'),
                team: t('team'),
                avgRating: t('avgRating'),
              }}
            />
            <TierSection
              tier="MASTERS"
              rounds={mastersRounds}
              assignments={masterAssignments}
              timeSlot={draw.event.tierRules?.mastersTimeSlot}
              eventDate={draw.event.date}
              translations={{
                tierName: t('mastersTier'),
                round: (round) => t('round', { round }),
                courtLabel: (courtId) => t('courtLabel', { courtId }),
                team: t('team'),
              }}
            />
          </div>
        </TierCollapsibleItem>
      )}

      {explorerAssignments.length > 0 && (
        <TierCollapsibleItem
          open={openTier === 'explorers'}
          onOpenChange={(open) => setOpenTier(open ? 'explorers' : null)}
          tierName={t('explorersTier')}
          tierColor="bg-green-500"
          timeSlot={draw.event.tierRules?.explorersTimeSlot}
          badges={[
            `${explorersTeamsCount} ${t('teams')}`,
            `${Object.keys(explorersRounds).length} ${t('rounds')}`,
            `${explorersFieldsCount} ${t('fields')}`,
          ]}
        >
          <div className="space-y-6">
            <TeamList
              assignments={explorerAssignments}
              canEdit={false}
              translations={{
                tierName: t('explorersTier'),
                teamListTitle: t('teamListTitle'),
                teamListDescription: t('teamListDescription'),
                team: t('team'),
                avgRating: t('avgRating'),
              }}
            />
            <TierSection
              tier="EXPLORERS"
              rounds={explorersRounds}
              assignments={explorerAssignments}
              timeSlot={draw.event.tierRules?.explorersTimeSlot}
              eventDate={draw.event.date}
              translations={{
                tierName: t('explorersTier'),
                round: (round) => t('round', { round }),
                courtLabel: (courtId) => t('courtLabel', { courtId }),
                team: t('team'),
              }}
            />
          </div>
        </TierCollapsibleItem>
      )}

      {/* Waitlist Section */}
      <WaitlistSection players={[]} title={t('waitlist', { count: event?.waitlistCount || 0 })} />
    </motion.div>
  );
}
