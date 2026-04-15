'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Save } from 'lucide-react';
import { MatchCard } from './match-card';
import type { Assignment } from './types';

interface MatchResultEntryProps {
  assignment: Assignment;
  courtLabel: (courtId: string) => string;
  tierBadgeClass?: string;
  result: { setsA: number | ''; setsB: number | '' };
  onScoreChange: (team: 'A' | 'B', value: string) => void;
  onSave?: () => void;
  isSaving?: boolean;
  isSaved?: boolean;
  isPublished?: boolean;
  showSaveButton?: boolean;
  translations: {
    teamA: string;
    teamB: string;
    teamASets: string;
    teamBSets: string;
    save?: string;
    update?: string;
    saved: string;
    published: string;
  };
}

export function MatchResultEntry({
  assignment,
  courtLabel,
  result,
  onScoreChange,
  onSave,
  isSaving,
  isSaved,
  isPublished,
  showSaveButton = true,
  translations,
}: MatchResultEntryProps) {
  const key = `${assignment.courtId}-${assignment.round}`;

  return (
    <MatchCard
      courtLabel={assignment.court?.label || courtLabel(assignment.courtId)}
      teamA={assignment.teamA}
      teamB={assignment.teamB}
      teamALabel={translations.teamA}
      teamBLabel={translations.teamB}
      className={isPublished ? 'opacity-75' : ''}
      headerExtra={
        <>
          {isSaved && !isPublished && (
            <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950">
              {translations.saved}
            </Badge>
          )}
          {isPublished && (
            <Badge variant="default" className="gap-1">
              <Lock className="h-3 w-3" />
              {translations.published}
            </Badge>
          )}
        </>
      }
      centerContent={
        <div className="flex items-center gap-4">
          <div className="space-y-2">
            <Label htmlFor={`${key}-setsA`} className="sr-only">
              {translations.teamASets}
            </Label>
            <Input
              id={`${key}-setsA`}
              type="number"
              min="0"
              max="20"
              value={result.setsA}
              onChange={(e) => onScoreChange('A', e.target.value)}
              disabled={isPublished}
              className="w-12 text-center text-lg font-bold bg-white dark:bg-white dark:text-foreground [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
          <span className="text-2xl font-bold">-</span>
          <div className="space-y-2">
            <Label htmlFor={`${key}-setsB`} className="sr-only">
              {translations.teamBSets}
            </Label>
            <Input
              id={`${key}-setsB`}
              type="number"
              min="0"
              max="20"
              value={result.setsB}
              onChange={(e) => onScoreChange('B', e.target.value)}
              disabled={isPublished}
              className="w-12 text-center text-lg font-bold bg-white dark:bg-white dark:text-foreground [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
        </div>
      }
      footer={
        showSaveButton && !isPublished && onSave ? (
          <div className="flex justify-end pt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onSave}
              disabled={isSaving}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {isSaved ? translations.update : translations.save}
            </Button>
          </div>
        ) : undefined
      }
    />
  );
}
