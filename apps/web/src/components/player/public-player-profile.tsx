'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { useRouter } from '@/i18n/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mail, CheckCircle, XCircle } from 'lucide-react';
import { ArrowLeftIcon, ArrowLeftIconHandle, DeleteIcon, DeleteIconHandle } from 'lucide-animated';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface PlayerData {
  id: string;
  email: string;
  name: string | null;
  profilePhoto: string | null;
  emailVerified: boolean;
  createdAt: string;
  roles: string[];
  player: {
    id: string;
    rating: number;
    status: string;
    createdAt: string;
    weeklyScores: Array<{
      id: string;
      week: string;
      score: number;
      createdAt: string;
    }>;
    rankingSnapshots: Array<{
      id: string;
      rank: number;
      rating: number;
      createdAt: string;
    }>;
  } | null;
}

function getUserInitials(name: string | null, email: string): string {
  if (name) {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
  return email[0].toUpperCase();
}

export function PublicPlayerProfile({ playerId }: { playerId: string }) {
  const t = useTranslations('profile');
  const tList = useTranslations('playersList');
  const tActions = useTranslations('playerActions');
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const arrowLeftIconRef = useRef<ArrowLeftIconHandle>(null);
  const deleteIconRef = useRef<DeleteIconHandle>(null);

  // Check if user is admin or editor
  const userRoles = session?.user?.roles || [];
  const isAdminOrEditor = userRoles.includes('ADMIN') || userRoles.includes('EDITOR');

  const {
    data: player,
    isLoading,
    error,
  } = useQuery<PlayerData>({
    queryKey: ['player', playerId],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/players/${playerId}`);

      if (!res.ok) {
        throw new Error(`API Error: ${res.statusText}`);
      }

      return res.json();
    },
  });

  // Delete user mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const token = session?.accessToken;
      const res = await fetch(`${API_URL}/players/${playerId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to delete user');
      }

      return res.json();
    },
    onSuccess: () => {
      toast.success(tActions('deleteSuccess'));
      queryClient.invalidateQueries({ queryKey: ['players'] });
      router.push('/admin/players');
    },
    onError: (error: Error) => {
      toast.error(tActions('deleteError') + ': ' + error.message);
      setIsDeleting(false);
    },
  });

  const handleDeleteUser = () => {
    setShowDeleteDialog(true);
  };

  if (isLoading) {
    return <div className="text-center py-8">{t('loadingProfile')}</div>;
  }

  if (error || !player) {
    return (
      <div className="space-y-6">
        <Link href="/admin/players" onMouseEnter={() => arrowLeftIconRef.current?.startAnimation()}>
          <Button variant="ghost" size="sm">
            <ArrowLeftIcon ref={arrowLeftIconRef} size={16} />
            {tList('backToPlayers')}
          </Button>
        </Link>
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {t('profileNotFound')}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div>
        <Link href="/admin/players" onMouseEnter={() => arrowLeftIconRef.current?.startAnimation()}>
          <Button variant="ghost" size="sm">
            <ArrowLeftIcon ref={arrowLeftIconRef} size={16} />
            {tList('backToPlayers')}
          </Button>
        </Link>
      </div>

      {/* Player Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Avatar className="h-24 w-24">
              <AvatarImage
                src={player.profilePhoto || undefined}
                alt={player.name || t('userAltText')}
              />
              <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
                {getUserInitials(player.name, player.email)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-2xl sm:text-3xl flex items-center gap-2 flex-wrap">
                {player.name || tList('noName')}
                {player.emailVerified ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-muted-foreground" />
                )}
              </CardTitle>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
                <Mail className="h-4 w-4" />
                {player.email}
              </div>
            </div>
            {player.player && (
              <div className="flex flex-col items-center sm:items-end gap-1 bg-primary/10 px-6 py-4 rounded-lg">
                <div className="text-4xl font-bold text-primary">{player.player.rating}</div>
                <div className="text-sm text-muted-foreground">{t('currentRating')}</div>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Player Information */}
      {player.player && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t('playerInformation')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{tList('status')}</p>
                  <Badge
                    variant={player.player.status === 'ACTIVE' ? 'default' : 'secondary'}
                    className="mt-1"
                  >
                    {player.player.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('currentRating')}</p>
                  <p className="text-2xl font-bold text-primary mt-1">{player.player.rating}</p>
                </div>
              </div>
              <div className="pt-4 border-t">
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">{tList('playerSince')}</p>
                    <p className="font-medium">
                      {new Date(player.player.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{tList('accountCreated')}</p>
                    <p className="font-medium">{new Date(player.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Stats */}
          <Card>
            <CardHeader>
              <CardTitle>{t('performanceStats')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">{t('weeksPlayed')}</p>
                  <p className="text-2xl font-bold">{player.player.weeklyScores.length}</p>
                </div>
                {player.player.rankingSnapshots.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground">{t('bestRank')}</p>
                    <p className="text-2xl font-bold">
                      #{Math.min(...player.player.rankingSnapshots.map((s) => s.rank))}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Performance */}
      {player.player && player.player.weeklyScores.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('recentWeeklyScores')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {player.player.weeklyScores.slice(0, 5).map((score) => (
                <div
                  key={score.id}
                  className="flex justify-between items-center py-2 border-b last:border-0"
                >
                  <div>
                    <p className="font-medium">
                      {t('week')} {new Date(score.week).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(score.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-xl font-bold text-primary">{score.score}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Admin Actions */}
      {isAdminOrEditor && (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">{tActions('actions')}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{tActions('actionsDescription')}</p>
              {player.roles?.includes('ADMIN') && (
                <div className="text-sm text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/20 p-3 rounded-md border border-yellow-200 dark:border-yellow-800">
                  {tActions('adminCannotBeDeleted')}
                </div>
              )}
              <Button
                variant="destructive"
                onClick={handleDeleteUser}
                disabled={isDeleting || player.roles?.includes('ADMIN')}
                className="w-full sm:w-auto"
                onMouseEnter={() => deleteIconRef.current?.startAnimation()}
                onMouseLeave={() => deleteIconRef.current?.stopAnimation()}
              >
                <DeleteIcon ref={deleteIconRef} size={16} />
                {isDeleting ? tActions('deleting') : tActions('deleteUser')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete User Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tActions('deleteConfirmation')}</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this user and all associated data. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                setIsDeleting(true);
                deleteMutation.mutate();
                setShowDeleteDialog(false);
              }}
            >
              {tActions('deleteUser')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
