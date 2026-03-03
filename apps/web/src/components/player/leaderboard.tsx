'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { LeaderboardEntry } from '@padel/types';
import { ArrowUp, ArrowDown, Minus, Trophy } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function Leaderboard() {
  const t = useTranslations('leaderboard');

  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/rankings/leaderboard`);
      if (!res.ok) throw new Error('Failed to fetch leaderboard');
      return res.json() as Promise<LeaderboardEntry[]>;
    },
  });

  if (isLoading) {
    return <div className="text-center py-8">{t('loadingRankings')}</div>;
  }

  const topThree = leaderboard?.slice(0, 3) || [];
  const fullLeaderboard = leaderboard || [];

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

  // Helper to get avatar initials
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Top 3 Podium */}
      {topThree.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <motion.div
                      key={entry.playerId}
                      variants={{
                        hidden: { opacity: 0, y: 10 },
                        show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
                      }}
                      className="flex items-center justify-between py-3 px-4 rounded-lg border border-border/50 hover:bg-accent/50 hover:border-primary/30 transition-all duration-300"
                    >
                      <div className="flex items-center gap-4">
                        <span className={cn('text-lg font-heading font-bold w-8', rankColor)}>
                          #{rank}
                        </span>
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="gradient-primary text-sm font-semibold">
                            {getInitials(entry.playerName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{entry.playerName}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {t('weeksPlayed', { count: entry.weeklyScores.length })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        {/* Delta */}
                        <div className="flex items-center gap-1 text-sm min-w-[60px] justify-end">
                          {entry.delta > 0 && (
                            <>
                              <ArrowUp className="h-3.5 w-3.5 text-green-600" />
                              <span className="text-green-600 font-semibold">+{entry.delta}</span>
                            </>
                          )}
                          {entry.delta < 0 && (
                            <>
                              <ArrowDown className="h-3.5 w-3.5 text-red-600" />
                              <span className="text-red-600 font-semibold">{entry.delta}</span>
                            </>
                          )}
                          {entry.delta === 0 && (
                            <>
                              <Minus className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-muted-foreground font-semibold">0</span>
                            </>
                          )}
                        </div>
                        {/* Rating */}
                        <div className="text-right min-w-[60px]">
                          <p className="text-2xl font-heading font-bold">{entry.rating}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
