'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Save } from 'lucide-react';
import type { Assignment } from './types';

interface MatchResultEntryProps {
  assignment: Assignment;
  courtLabel: (courtId: string) => string;
  tierBadgeClass?: string;
  result: { setsA: number; setsB: number };
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
  const getPlayerInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const key = `${assignment.courtId}-${assignment.round}`;

  return (
    <div className={`bg-muted/50 rounded-lg p-4 space-y-3 ${isPublished ? 'opacity-75' : ''}`}>
      {/* Court Label and Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {assignment.court?.label || courtLabel(assignment.courtId)}
          </Badge>
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
        </div>
      </div>

      {/* Match Display with Score Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center">
        {/* Team A */}
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground text-center font-semibold">
            {translations.teamA}
          </div>
          <div className="space-y-1 flex flex-col items-center">
            {assignment.teamA.map((player) => (
              <div key={player.id} className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage
                    src={player.profilePhoto || undefined}
                    alt={player.name || 'Player'}
                  />
                  <AvatarFallback className="gradient-primary text-xs">
                    {player.name ? getPlayerInitials(player.name) : '?'}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">{player.name}</span>
                <span className="text-sm text-muted-foreground">{player.rating}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Score Input */}
        <div className="flex items-center justify-center gap-4">
          <div className="space-y-2">
            <Label htmlFor={`${key}-setsA`} className="sr-only">
              {translations.teamASets}
            </Label>
            <Input
              id={`${key}-setsA`}
              type="number"
              min="0"
              max="6"
              value={result.setsA ?? 0}
              onChange={(e) => onScoreChange('A', e.target.value)}
              disabled={isPublished}
              className="w-20 text-center text-lg font-bold"
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
              max="6"
              value={result.setsB ?? 0}
              onChange={(e) => onScoreChange('B', e.target.value)}
              disabled={isPublished}
              className="w-20 text-center text-lg font-bold"
            />
          </div>
        </div>

        {/* Team B */}
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground text-center font-semibold">
            {translations.teamB}
          </div>
          <div className="space-y-1 flex flex-col items-center">
            {assignment.teamB.map((player) => (
              <div key={player.id} className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage
                    src={player.profilePhoto || undefined}
                    alt={player.name || 'Player'}
                  />
                  <AvatarFallback className="gradient-primary text-xs">
                    {player.name ? getPlayerInitials(player.name) : '?'}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">{player.name}</span>
                <span className="text-sm text-muted-foreground">{player.rating}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Save button */}
      {showSaveButton && !isPublished && onSave && (
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
      )}
    </div>
  );
}
