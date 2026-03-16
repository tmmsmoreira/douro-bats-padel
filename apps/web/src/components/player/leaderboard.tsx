'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { LeaderboardEntry } from '@padel/types';
import { Trophy } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { DataStateWrapper } from '@/components/shared';
import { useAuthFetch } from '@/hooks/use-api';
import { PlayerListItem } from '@/components/shared/player-list-item';
import { useIsMobile } from '@/hooks/use-media-query';

export function Leaderboard() {
  const t = useTranslations('leaderboard');
  const authFetch = useAuthFetch();

  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      return authFetch.get<LeaderboardEntry[]>('/rankings/leaderboard');
    },
  });

  return (
    <DataStateWrapper
      isLoading={isLoading}
      data={leaderboard}
      loadingMessage={t('loadingRankings')}
      emptyMessage={t('noRankingsAvailable')}
    >
      {(leaderboard) => <LeaderboardContent leaderboard={leaderboard} t={t} />}
    </DataStateWrapper>
  );
}

// Separate component for leaderboard content
function LeaderboardContent({ leaderboard, t }: { leaderboard: LeaderboardEntry[]; t: any }) {
  const topThree = leaderboard.slice(0, 3);
  const fullLeaderboard = leaderboard;
  const isMobile = useIsMobile();

  // Podium colors for top 3
  const podiumColors = {
    1: {
      bg: 'bg-yellow-500',
      border: 'border-yellow-500',
      text: 'text-yellow-500',
      icon: 'text-yellow-500',
      badgeBg: 'bg-yellow-500',
      badgeText: 'text-white',
    },
    2: {
      bg: 'bg-slate-400',
      border: 'border-slate-400',
      text: 'text-slate-400',
      icon: 'text-slate-400',
      badgeBg: 'bg-slate-400',
      badgeText: 'text-white',
    },
    3: {
      bg: 'bg-orange-500',
      border: 'border-orange-500',
      text: 'text-orange-500',
      icon: 'text-orange-500',
      badgeBg: 'bg-orange-500',
      badgeText: 'text-white',
    },
  };

  return (
    <motion.div
      key="content"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Top 3 Podium */}
      {topThree.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="grid grid-cols-3 gap-4">
            {/* Reorder: 2nd, 1st, 3rd */}
            {[topThree[1], topThree[0], topThree[2]].map((entry, displayIndex) => {
              if (!entry) return null;

              const actualRank = displayIndex === 0 ? 2 : displayIndex === 1 ? 1 : 3;
              const colors = podiumColors[actualRank as 1 | 2 | 3];

              return (
                <motion.div
                  key={entry.playerId}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: displayIndex * 0.1 }}
                >
                  <Card className="glass-card border-border/50 transition-all duration-300 hover:shadow-lg relative overflow-hidden">
                    {/* Top colored border */}
                    <div className={cn('h-1 w-full', colors.bg)} />

                    <CardContent className="p-4 md:p-6 space-y-2 md:space-y-4">
                      {/* Rank Badge */}
                      <div className="flex justify-center">
                        <div
                          className={cn(
                            'flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full font-heading font-bold text-xl md:text-2xl',
                            colors.badgeBg,
                            colors.badgeText
                          )}
                        >
                          {actualRank}
                        </div>
                      </div>

                      {/* Trophy Icon */}
                      <div className="flex justify-center">
                        <Trophy className={cn('h-6 w-6 md:h-8 md:w-8', colors.icon)} />
                      </div>

                      {/* Player Name */}
                      <div className="text-center">
                        <h3 className="font-heading font-semibold text-sm md:text-base truncate">
                          {entry.playerName}
                        </h3>
                      </div>

                      {/* Rating */}
                      <div className="text-center">
                        <p
                          className={cn('text-2xl md:text-4xl font-heading font-bold', colors.text)}
                        >
                          {entry.rating}
                        </p>
                      </div>

                      {/* Weeks Played */}
                      <div className="text-center">
                        <p className="text-xs md:text-sm text-muted-foreground">
                          {t('weeksPlayed', { count: entry.weeklyScores.length })}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Full Leaderboard */}
      {fullLeaderboard.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="glass-card border-border/50">
            <CardHeader>
              <CardTitle className="font-heading">{t('fullLeaderboard')}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <motion.div
                className="space-y-2"
                variants={{
                  show: {
                    transition: {
                      staggerChildren: 0.05,
                    },
                  },
                }}
                initial="hidden"
                animate="show"
              >
                {fullLeaderboard.map((entry, index) => {
                  const rank = index + 1;
                  const rankColor =
                    rank === 1
                      ? 'text-yellow-500'
                      : rank === 2
                        ? 'text-slate-400'
                        : rank === 3
                          ? 'text-orange-500'
                          : 'text-muted-foreground';

                  return (
                    <PlayerListItem
                      key={entry.playerId}
                      id={entry.playerId}
                      name={entry.playerName}
                      rating={entry.rating}
                      profilePhoto={entry.profilePhoto}
                      rank={rank}
                      rankColor={rankColor}
                      subtitle={t('weeksPlayed', { count: entry.weeklyScores.length })}
                      delta={entry.delta}
                      animate={true}
                      variant="leaderboard"
                      avatarSize="lg"
                      largeRank={!isMobile}
                    />
                  );
                })}
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
