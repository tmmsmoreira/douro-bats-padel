'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Assignment } from '@/components/shared/draw';
import { PlayerSelectionColumn } from './player-selection-column';

interface EditAssignmentDialogProps {
  assignment: Assignment;
  allTierPlayers: Assignment['teamA'];
  onClose: () => void;
  onSave: (teamA: string[], teamB: string[]) => void;
  isSaving: boolean;
}

export function EditAssignmentDialog({
  assignment,
  allTierPlayers,
  onClose,
  onSave,
  isSaving,
}: EditAssignmentDialogProps) {
  const t = useTranslations('adminDrawView');
  const [teamA, setTeamA] = useState<string[]>(assignment.teamA.map((p) => p.id));
  const [teamB, setTeamB] = useState<string[]>(assignment.teamB.map((p) => p.id));

  // Sort players by rating (highest first)
  const sortedPlayers = [...allTierPlayers].sort((a, b) => b.rating - a.rating);

  const togglePlayerInTeam = (playerId: string, team: 'A' | 'B') => {
    const currentTeam = team === 'A' ? teamA : teamB;
    const otherTeam = team === 'A' ? teamB : teamA;
    const setCurrentTeam = team === 'A' ? setTeamA : setTeamB;

    if (currentTeam.includes(playerId)) {
      // Remove from current team
      setCurrentTeam(currentTeam.filter((id) => id !== playerId));
    } else {
      // Add to current team (only if not in other team and has space)
      if (!otherTeam.includes(playerId) && currentTeam.length < 2) {
        setCurrentTeam([...currentTeam, playerId]);
      }
    }
  };

  const handleSave = () => {
    if (teamA.length !== 2 || teamB.length !== 2) {
      toast.error(t('teamValidationError'));
      return;
    }

    // Check if teams have changed
    const hasChanges =
      JSON.stringify([...teamA].sort()) !==
        JSON.stringify(assignment.teamA.map((p) => p.id).sort()) ||
      JSON.stringify([...teamB].sort()) !==
        JSON.stringify(assignment.teamB.map((p) => p.id).sort());

    if (!hasChanges) {
      toast.info(t('noChangesToSave') || 'No changes to save');
      onClose();
      return;
    }

    onSave(teamA, teamB);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {t('editAssignment')}
            <Badge variant="outline" className="text-xs">
              {assignment.tier}
            </Badge>
          </DialogTitle>
          <DialogDescription>{t('editAssignmentDescriptionNew')}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
          {/* Team A Selection */}
          <PlayerSelectionColumn
            team="A"
            teamPlayers={teamA}
            otherTeamPlayers={teamB}
            allPlayers={sortedPlayers}
            onTogglePlayer={(playerId) => togglePlayerInTeam(playerId, 'A')}
            teamLabel={t('teamA')}
            bgColor="bg-blue-50 dark:bg-blue-950/30"
            selectedColor="bg-blue-100 dark:bg-blue-900/50 border-blue-500"
          />

          {/* Divider */}
          <div className="hidden md:flex items-center justify-center">
            <div className="text-2xl font-bold text-muted-foreground">vs</div>
          </div>

          {/* Team B Selection */}
          <PlayerSelectionColumn
            team="B"
            teamPlayers={teamB}
            otherTeamPlayers={teamA}
            allPlayers={sortedPlayers}
            onTogglePlayer={(playerId) => togglePlayerInTeam(playerId, 'B')}
            teamLabel={t('teamB')}
            bgColor="bg-green-50 dark:bg-green-950/30"
            selectedColor="bg-green-100 dark:bg-green-900/50 border-green-500"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            {t('cancel')}
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || teamA.length !== 2 || teamB.length !== 2}
          >
            {isSaving ? t('saving') : t('saveChanges')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
