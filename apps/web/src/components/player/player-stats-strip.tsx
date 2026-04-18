'use client';

import { useTranslations } from 'next-intl';
import { TrendingUp, Hash } from 'lucide-react';
import { StatusBadge } from '@/components/shared/status-badge';
import type { PlayerProfileStatus } from '@/components/shared/status-badge';

interface PlayerStatsStripProps {
  rating: number;
  rank: number | undefined;
  weeksPlayed: number;
  status: PlayerProfileStatus;
}

export function PlayerStatsStrip({ rating, rank, weeksPlayed, status }: PlayerStatsStripProps) {
  const t = useTranslations('profile');

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-lg bg-primary/5 p-4">
      <StatTile
        label={t('currentRating')}
        value={
          <span className="inline-flex items-center gap-1 gradient-text">
            <TrendingUp className="h-4 w-4 text-primary" />
            {rating}
          </span>
        }
      />
      <StatTile
        label={t('rank')}
        value={
          rank !== undefined ? (
            <span className="inline-flex items-center gap-1">
              <Hash className="h-4 w-4 text-muted-foreground" />
              {rank}
            </span>
          ) : (
            <span className="text-muted-foreground">{t('noRank')}</span>
          )
        }
      />
      <StatTile label={t('weeksPlayed')} value={weeksPlayed} />
      <StatTile
        label={t('status')}
        value={<StatusBadge status={status} className="text-[11px]" />}
      />
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 min-w-0">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">
        {label}
      </p>
      <div className="text-xl sm:text-2xl font-bold font-heading text-primary min-h-8 flex items-center">
        {value}
      </div>
    </div>
  );
}
