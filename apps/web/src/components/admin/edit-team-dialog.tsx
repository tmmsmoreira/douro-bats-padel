'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Info } from 'lucide-react';
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from '@/components/ui/responsive-dialog';
import type { Assignment } from '@padel/types';
import { PlayerSelectionColumn } from './player-selection-column';
import { ScrollArea } from '../ui/scroll-area';

interface EditTeamDialogProps {
  assignment: Assignment;
  allTierPlayers: Assignment['teamA'];
  allTierAssignments: Assignment[];
  onClose: () => void;
  onSave: (teamPlayers: string[]) => void;
  isSaving: boolean;
  teamNumber?: number;
  teamPlayers?: { id: string; name: string; rating: number }[];
}

export function EditTeamDialog({
  assignment,
  allTierPlayers,
  allTierAssignments,
  onClose,
  onSave,
  isSaving,
  teamNumber,
  teamPlayers: initialTeamPlayers,
}: EditTeamDialogProps) {
  const t = useTranslations('adminDrawView');
  // Only edit the team members (use provided teamPlayers or default to teamA)
  const [teamPlayers, setTeamPlayers] = useState<string[]>(
    initialTeamPlayers ? initialTeamPlayers.map((p) => p.id) : assignment.teamA.map((p) => p.id)
  );

  // Sort players by rating (highest first)
  const sortedPlayers = [...allTierPlayers].sort((a, b) => b.rating - a.rating);

  // Calculate which other team will be affected
  const originalPlayerIds = (initialTeamPlayers || assignment.teamA).map((p) => p.id).sort();
  const editedTeamKey = originalPlayerIds.join('-');

  // Extract all unique teams in the same order as TeamList does
  // This ensures team numbers match between the list view and the edit dialog
  const extractTeams = (): Map<string, number> => {
    const teamsMap = new Map<string, number>();
    let teamIndex = 0;

    allTierAssignments.forEach((assignment) => {
      // Process Team A
      if (assignment.teamA.length === 2) {
        const teamKey = assignment.teamA
          .map((p) => p.id)
          .sort()
          .join('-');
        if (!teamsMap.has(teamKey)) {
          teamIndex++;
          teamsMap.set(teamKey, teamIndex);
        }
      }

      // Process Team B
      if (assignment.teamB.length === 2) {
        const teamKey = assignment.teamB
          .map((p) => p.id)
          .sort()
          .join('-');
        if (!teamsMap.has(teamKey)) {
          teamIndex++;
          teamsMap.set(teamKey, teamIndex);
        }
      }
    });

    return teamsMap;
  };

  const allTeamsMap = extractTeams();

  // Build a map of player ID to team number (excluding players in the team being edited)
  const playerTeamNumberMap = new Map<string, number>();

  for (const assignment of allTierAssignments) {
    // Check teamA
    if (assignment.teamA.length === 2) {
      const teamKey = assignment.teamA
        .map((p) => p.id)
        .sort()
        .join('-');
      const teamNum = allTeamsMap.get(teamKey);
      if (teamNum !== undefined && teamKey !== editedTeamKey) {
        assignment.teamA.forEach((p) => {
          playerTeamNumberMap.set(p.id, teamNum);
        });
      }
    }
    // Check teamB
    if (assignment.teamB.length === 2) {
      const teamKey = assignment.teamB
        .map((p) => p.id)
        .sort()
        .join('-');
      const teamNum = allTeamsMap.get(teamKey);
      if (teamNum !== undefined && teamKey !== editedTeamKey) {
        assignment.teamB.forEach((p) => {
          playerTeamNumberMap.set(p.id, teamNum);
        });
      }
    }
  }

  const togglePlayer = (playerId: string) => {
    if (teamPlayers.includes(playerId)) {
      // Remove player from team
      setTeamPlayers(teamPlayers.filter((id) => id !== playerId));
    } else {
      // Add player to team (only if has space)
      if (teamPlayers.length < 2) {
        setTeamPlayers([...teamPlayers, playerId]);
      }
    }
  };

  const handleSave = () => {
    if (teamPlayers.length !== 2) {
      toast.error(t('teamValidationError'));
      return;
    }

    // Check if team has changed
    const hasChanges =
      JSON.stringify([...teamPlayers].sort()) !==
      JSON.stringify(assignment.teamA.map((p) => p.id).sort());

    if (!hasChanges) {
      toast.info(t('noChangesToSave') || 'No changes to save');
      onClose();
      return;
    }

    onSave(teamPlayers);
  };

  return (
    <ResponsiveDialog open={true} onOpenChange={onClose}>
      <ResponsiveDialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <ResponsiveDialogHeader className="shrink-0">
          <ResponsiveDialogTitle className="flex items-center justify-between md:justify-start gap-2">
            {teamNumber ? t('editTeamMembersWithNumber', { teamNumber }) : t('editTeamMembers')}
            <Badge variant="outline" className="text-xs">
              {assignment.tier}
            </Badge>
          </ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            {t('editTeamMembersDescription')}
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        {/* Scrollable content area */}
        <ScrollArea className="flex-1 overflow-y-auto px-6">
          {/* Warning about affecting other teams */}
          <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
            <p className="text-sm text-blue-900 dark:text-blue-100">{t('editTeamWarning')}</p>
          </div>

          <div className="py-4">
            {/* Single Team Selection */}
            <PlayerSelectionColumn
              teamPlayers={teamPlayers}
              otherTeamPlayers={[]}
              allPlayers={sortedPlayers}
              onTogglePlayer={togglePlayer}
              teamLabel={t('teamMembers')}
              selectedColor="bg-secondary/50 border-secondary"
              playerTeamNumberMap={playerTeamNumberMap}
              teamText={t('team')}
            />
          </div>
        </ScrollArea>

        <ResponsiveDialogFooter className="shrink-0">
          <Button variant="outline" onClick={onClose} disabled={isSaving} className="w-full">
            {t('cancel')}
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || teamPlayers.length !== 2}
            className="w-full"
          >
            {isSaving ? t('saving') : t('saveChanges')}
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
