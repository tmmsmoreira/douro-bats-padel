'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface WeeklyScoresCardProps {
  weeklyScores: number[];
  limit?: number;
}

export function WeeklyScoresCard({ weeklyScores, limit = 5 }: WeeklyScoresCardProps) {
  const t = useTranslations('profile');
  const recent = weeklyScores.slice(0, limit);
  const maxScore = Math.max(1, ...recent);

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>{t('recentWeeklyScores')}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {recent.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
            {t('noWeeklyScores')}
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">
              {limit === 5 ? t('lastFiveWeeks') : `${t('week')} 1–${recent.length}`}
            </p>
            <div className="space-y-2">
              {recent.map((score, idx) => {
                const pct = (score / maxScore) * 100;
                return (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-10 shrink-0">
                      {t('week')} {recent.length - idx}
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-primary/10 overflow-hidden">
                      <div
                        className="h-full gradient-primary rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold font-heading text-primary w-10 text-right tabular-nums">
                      {score}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
