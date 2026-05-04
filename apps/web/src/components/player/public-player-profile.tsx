'use client';

import { UseMutationResult } from '@tanstack/react-query';
import { useTranslations, useLocale } from 'next-intl';
import { useSession } from 'next-auth/react';
import { useRouter } from '@/i18n/navigation';
import {
  useDeletePlayer,
  useRevokeInvitation,
  useResendInvitation,
  usePlayer,
  useLeaderboard,
} from '@/hooks';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Badge } from '@/components/ui/badge';
import { Mail, MoreVertical, UserX } from 'lucide-react';
import { DeleteIcon, DeleteIconHandle, CopyIcon, CopyIconHandle } from 'lucide-animated';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { ConfirmationDialog } from '../shared/confirmation-dialog';
import { motion } from 'motion/react';
import { DataStateWrapper } from '@/components/shared/state/data-state-wrapper';
import { PlayerAvatar, PlayerProfileSkeleton } from '@/components/shared/player';
import { PageHeaderSkeleton } from '@/components/shared/skeletons';
import { useIsFromBfcache } from '@/hooks';
import { PageHeader } from '@/components/shared/layout/page-header';
import { StatusBadge } from '@/components/shared/status-badge';
import type { PlayerProfileStatus, InvitationStatus } from '@/components/shared/status-badge';
import { SendIcon, SendIconHandle } from '../icons/send-icon';
import { Spinner } from '../ui/spinner';
import { Invitation, LeaderboardEntry } from '@padel/types';
import { useIsMobile } from '@/hooks/use-media-query';
import { PlayerStatsStrip } from './player-stats-strip';
import { WeeklyScoresCard } from './weekly-scores-card';
import { cn } from '@/lib/utils';
import { parseDateOnly } from '@/lib/date-only';

interface PlayerData {
  id: string;
  name: string | null;
  profilePhoto: string | null;
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
  // Admin/editor-only fields (gated on the backend)
  email?: string;
  emailVerified?: boolean;
  createdAt?: string;
  roles?: string[];
  dateOfBirth?: string | null;
  phoneNumber?: string | null;
  invitation?: Invitation | null;
}

export function PublicPlayerProfile({ playerId }: { playerId: string }) {
  const t = useTranslations('profile');
  const tList = useTranslations('playersList');
  const tActions = useTranslations('playerActions');
  const locale = useLocale();
  const router = useRouter();
  const { data: session } = useSession();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRevokeDialog, setShowRevokeDialog] = useState(false);

  const userRoles = session?.user?.roles || [];
  const isAdminOrEditor = userRoles.includes('ADMIN');

  const {
    data: player,
    isLoading,
    error,
  } = usePlayer(playerId) as ReturnType<typeof usePlayer> & { data: PlayerData | undefined };

  const { data: leaderboard } = useLeaderboard();

  const deleteMutation = useDeletePlayer(playerId, () => {
    router.push('/players');
  });

  const handleDeleteUser = () => {
    setShowDeleteDialog(true);
  };

  const revokeMutation = useRevokeInvitation(playerId, () => {
    router.push('/players');
  });

  const resendMutation = useResendInvitation();

  const copyInvitationLink = (token: string) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const link = `${baseUrl}/register?invitation=${token}`;
    navigator.clipboard.writeText(link);
    toast.success(t('linkCopied'));
  };

  const isBackNav = useIsFromBfcache();

  const emptyComponent = (
    <motion.div
      key="not-found"
      initial={isBackNav ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: isBackNav ? 0 : 0.3 }}
      className="space-y-6"
    >
      <PageHeader
        title={tList('playerProfile')}
        description={tList('playerProfileDescription')}
        showBackButton
        backButtonHref="/players"
        backButtonLabel={tList('backToPlayers')}
      />
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <UserX className="size-6" />
          </EmptyMedia>
          <EmptyTitle>{t('profileNotFound')}</EmptyTitle>
        </EmptyHeader>
      </Empty>
    </motion.div>
  );

  return (
    <DataStateWrapper
      isLoading={isLoading}
      data={player}
      loadingMessage={t('loadingProfile')}
      loadingComponent={
        <div className="space-y-4 sm:space-y-6">
          <PageHeaderSkeleton withBackButton />
          <PlayerProfileSkeleton />
        </div>
      }
      emptyMessage={t('profileNotFound')}
      emptyComponent={emptyComponent}
      error={error as Error}
      errorMessage={`${t('errorLoadingProfile')}: ${(error as Error)?.message || ''}`}
    >
      {(player) => (
        <div className="space-y-4 sm:space-y-6">
          <PageHeader
            title={tList('playerProfile')}
            description={tList('playerProfileDescription')}
            showBackButton
            backButtonHref="/players"
            backButtonLabel={tList('backToPlayers')}
          />
          <PublicPlayerProfileContent
            player={player}
            leaderboard={leaderboard}
            isAdminOrEditor={isAdminOrEditor}
            handleDeleteUser={handleDeleteUser}
            isDeleting={isDeleting}
            showDeleteDialog={showDeleteDialog}
            setShowDeleteDialog={setShowDeleteDialog}
            showRevokeDialog={showRevokeDialog}
            setShowRevokeDialog={setShowRevokeDialog}
            setIsDeleting={setIsDeleting}
            deleteMutation={deleteMutation}
            revokeMutation={revokeMutation}
            resendMutation={resendMutation}
            copyInvitationLink={copyInvitationLink}
            t={t}
            tList={tList}
            tActions={tActions}
            locale={locale}
          />
        </div>
      )}
    </DataStateWrapper>
  );
}

function PublicPlayerProfileContent({
  player,
  leaderboard,
  isAdminOrEditor,
  handleDeleteUser,
  isDeleting,
  showDeleteDialog,
  setShowDeleteDialog,
  showRevokeDialog,
  setShowRevokeDialog,
  setIsDeleting,
  deleteMutation,
  revokeMutation,
  resendMutation,
  copyInvitationLink,
  t,
  tList,
  tActions,
  locale,
}: {
  player: PlayerData;
  leaderboard: LeaderboardEntry[] | undefined;
  isAdminOrEditor: boolean;
  handleDeleteUser: () => void;
  isDeleting: boolean;
  showDeleteDialog: boolean;
  setShowDeleteDialog: (value: boolean) => void;
  showRevokeDialog: boolean;
  setShowRevokeDialog: (value: boolean) => void;
  setIsDeleting: (value: boolean) => void;
  deleteMutation: UseMutationResult<unknown, Error, void, unknown>;
  revokeMutation: UseMutationResult<void, Error, string, unknown>;
  resendMutation: UseMutationResult<void, Error, string, unknown>;
  copyInvitationLink: (token: string) => void;
  t: ReturnType<typeof useTranslations>;
  tList: ReturnType<typeof useTranslations>;
  tActions: ReturnType<typeof useTranslations>;
  locale: string;
}) {
  const isBackNav = useIsFromBfcache();
  const deleteIconRef = useRef<DeleteIconHandle>(null);
  const revokeIconRef = useRef<DeleteIconHandle>(null);
  const copyIconRef = useRef<CopyIconHandle>(null);
  const resendIconRef = useRef<SendIconHandle>(null);

  const leaderboardEntry = player.player
    ? leaderboard?.find((e) => e.playerId === player.player!.id)
    : undefined;
  const rank = leaderboardEntry ? leaderboard!.indexOf(leaderboardEntry) + 1 : undefined;
  const weeklyScores = player.player?.weeklyScores.map((s) => s.score) ?? [];
  const bestRank =
    player.player && player.player.rankingSnapshots.length > 0
      ? Math.min(...player.player.rankingSnapshots.map((s) => s.rank))
      : undefined;

  return (
    <motion.div
      key="content"
      initial={isBackNav ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: isBackNav ? 0 : 0.3 }}
      className="space-y-6"
    >
      {/* Player Header */}
      <Card className="glass-card">
        <CardHeader className="pb-0">
          <div className="flex items-center gap-4">
            <PlayerAvatar
              name={player.name}
              email={player.email}
              profilePhoto={player.profilePhoto}
              emailVerified={player.emailVerified}
              size="xl"
              alt={player.name || t('userAltText')}
            />
            <div className="flex-1 min-w-0">
              <CardTitle className="text-2xl sm:text-3xl truncate">
                {player.name || tList('noName')}
              </CardTitle>
              {player.email && (
                <div className="flex items-start gap-1 text-sm text-muted-foreground mt-2 min-w-0">
                  <Mail className="h-4 w-4 shrink-0 mt-0.5" />
                  <span className="break-all">{player.email}</span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        {player.player && (
          <CardContent className="pt-6">
            <PlayerStatsStrip
              rating={player.player.rating}
              rank={rank}
              weeksPlayed={weeklyScores.length}
              status={player.player.status as PlayerProfileStatus}
            />
          </CardContent>
        )}
      </Card>

      {/* Admin-only Player Details */}
      {isAdminOrEditor && <AdminDetailsCard player={player} t={t} locale={locale} />}

      {/* Invitation Section - Only visible for pending invitations */}
      {player.invitation && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>{t('invitationDetails')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <div className="grid gap-4 grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">{t('invitationStatus')}</p>
                <div className="mt-1">
                  <StatusBadge status={player.invitation.status as InvitationStatus} />
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('expiresAt')}</p>
                <p className="font-medium mt-1">
                  {new Date(player.invitation.expiresAt).toLocaleDateString(locale)}
                </p>
              </div>
              {player.invitation.invitedByUser && (
                <div>
                  <p className="text-sm text-muted-foreground">{t('invitedBy')}</p>
                  <p className="font-medium mt-1">
                    {player.invitation.invitedByUser.name || player.invitation.invitedByUser.email}
                  </p>
                </div>
              )}
              {player.createdAt && (
                <div>
                  <p className="text-sm text-muted-foreground">{t('invitedOn')}</p>
                  <p className="font-medium mt-1">
                    {new Date(player.createdAt).toLocaleDateString(locale)}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="border-t gap-2 ">
            {isAdminOrEditor && player.invitation.status === 'PENDING' && (
              <InvitationActions
                player={player}
                copyInvitationLink={copyInvitationLink}
                resendMutation={resendMutation}
                setShowRevokeDialog={setShowRevokeDialog}
                revokeMutation={revokeMutation}
                copyIconRef={copyIconRef}
                resendIconRef={resendIconRef}
                revokeIconRef={revokeIconRef}
                t={t}
              />
            )}
          </CardFooter>
        </Card>
      )}

      {/* Performance */}
      {player.player && (
        <div className={cn('grid gap-6', bestRank !== undefined && 'md:grid-cols-2')}>
          <WeeklyScoresCard weeklyScores={weeklyScores} />

          {bestRank !== undefined && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>{t('bestRank')}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold font-heading gradient-text">#{bestRank}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Admin Actions - Only for registered users */}
      {isAdminOrEditor && player.player && (
        <Card className="glass-card border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">{tActions('actions')}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">{tActions('actionsDescription')}</p>
            {player.roles?.includes('ADMIN') && (
              <div className="mt-3 text-sm text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/20 p-3 rounded-md border border-yellow-200 dark:border-yellow-800">
                {tActions('adminCannotBeDeleted')}
              </div>
            )}
          </CardContent>
          <CardFooter className="border-t">
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
          </CardFooter>
        </Card>
      )}

      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title={tActions('deleteConfirmation')}
        description={tActions('deleteConfirmationDescription')}
        confirmText={tActions('deleteUser')}
        cancelText={tActions('cancel')}
        variant="destructive"
        onConfirm={() => {
          setIsDeleting(true);
          deleteMutation.mutate();
          setShowDeleteDialog(false);
        }}
      />

      <ConfirmationDialog
        open={showRevokeDialog}
        onOpenChange={setShowRevokeDialog}
        title={t('revokeConfirmation')}
        description={t('revokeConfirmationDescription')}
        confirmText={t('revokeInvitation')}
        cancelText={tActions('cancel')}
        variant="destructive"
        onConfirm={() => {
          revokeMutation.mutate(player.invitation!.id);
          setShowRevokeDialog(false);
        }}
      />
    </motion.div>
  );
}

function AdminDetailsCard({
  player,
  t,
  locale,
}: {
  player: PlayerData;
  t: ReturnType<typeof useTranslations>;
  locale: string;
}) {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>{t('playerInformation')}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid gap-4 sm:grid-cols-2">
          <DetailField
            label={t('phoneNumber')}
            value={player.phoneNumber || t('notSet')}
            muted={!player.phoneNumber}
          />
          <DetailField
            label={t('dateOfBirth')}
            value={parseDateOnly(player.dateOfBirth)?.toLocaleDateString(locale) ?? t('notSet')}
            muted={!player.dateOfBirth}
          />
          <DetailField
            label={t('emailVerifiedLabel')}
            value={player.emailVerified ? t('verified') : t('emailNotVerified')}
            muted={!player.emailVerified}
          />
          {player.player?.createdAt && (
            <DetailField
              label={t('playerSince')}
              value={new Date(player.player.createdAt).toLocaleDateString(locale)}
            />
          )}
          {player.roles && player.roles.length > 0 && (
            <div className="sm:col-span-2">
              <p className="text-sm text-muted-foreground">{t('role')}</p>
              <div className="flex gap-2 mt-1 flex-wrap">
                {player.roles.map((role: string) => (
                  <Badge key={role} variant="outline">
                    {role}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function DetailField({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="min-w-0">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`font-medium truncate ${muted ? 'text-muted-foreground italic' : ''}`}>
        {value}
      </p>
    </div>
  );
}

function InvitationActions({
  player,
  copyInvitationLink,
  resendMutation,
  setShowRevokeDialog,
  revokeMutation,
  copyIconRef,
  resendIconRef,
  revokeIconRef,
  t,
}: {
  player: PlayerData;
  copyInvitationLink: (token: string) => void;
  resendMutation: UseMutationResult<void, Error, string, unknown>;
  setShowRevokeDialog: (value: boolean) => void;
  revokeMutation: UseMutationResult<void, Error, string, unknown>;
  copyIconRef: React.RefObject<CopyIconHandle | null>;
  resendIconRef: React.RefObject<SendIconHandle | null>;
  revokeIconRef: React.RefObject<DeleteIconHandle | null>;
  t: ReturnType<typeof useTranslations>;
}) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <>
        <Button
          variant="outline"
          onClick={() => copyInvitationLink(player.invitation!.token)}
          onMouseEnter={() => copyIconRef.current?.startAnimation()}
          onMouseLeave={() => copyIconRef.current?.stopAnimation()}
          className="flex-1"
        >
          <CopyIcon ref={copyIconRef} size={16} className="h-4 w-4" />
          {t('copyLink')}
        </Button>
        <Button
          variant="outline"
          onClick={() => resendMutation.mutate(player.invitation!.id)}
          disabled={resendMutation.isPending}
          animate={!resendMutation.isPending}
          onMouseEnter={() => !resendMutation.isPending && resendIconRef.current?.startAnimation()}
          onMouseLeave={() => !resendMutation.isPending && resendIconRef.current?.stopAnimation()}
          className="flex-1"
        >
          {resendMutation.isPending ? (
            <Spinner data-icon="inline-start" className="h-4 w-4" />
          ) : (
            <SendIcon ref={resendIconRef} size={16} className="h-4 w-4" />
          )}
          {resendMutation.isPending ? t('sending') : t('resendInvitation')}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setShowRevokeDialog(true)}
              disabled={revokeMutation.isPending}
              className="gap-2"
            >
              <DeleteIcon ref={revokeIconRef} size={16} className="h-4 w-4" />
              {t('revokeInvitation')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </>
    );
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={() => copyInvitationLink(player.invitation!.token)}
        onMouseEnter={() => copyIconRef.current?.startAnimation()}
        onMouseLeave={() => copyIconRef.current?.stopAnimation()}
      >
        <CopyIcon ref={copyIconRef} size={16} className="h-4 w-4" />
        {t('copyLink')}
      </Button>
      <Button
        variant="outline"
        onClick={() => resendMutation.mutate(player.invitation!.id)}
        disabled={resendMutation.isPending}
        animate={!resendMutation.isPending}
        onMouseEnter={() => !resendMutation.isPending && resendIconRef.current?.startAnimation()}
        onMouseLeave={() => !resendMutation.isPending && resendIconRef.current?.stopAnimation()}
      >
        {resendMutation.isPending ? (
          <Spinner data-icon="inline-start" className="h-4 w-4" />
        ) : (
          <SendIcon ref={resendIconRef} size={16} className="h-4 w-4" />
        )}
        {resendMutation.isPending ? t('sending') : t('resendInvitation')}
      </Button>
      <Button
        variant="destructive"
        onClick={() => setShowRevokeDialog(true)}
        disabled={revokeMutation.isPending}
        animate={!revokeMutation.isPending}
        onMouseEnter={() => !revokeMutation.isPending && revokeIconRef.current?.startAnimation()}
        onMouseLeave={() => !revokeMutation.isPending && revokeIconRef.current?.stopAnimation()}
      >
        <DeleteIcon ref={revokeIconRef} size={16} className="h-4 w-4" />
        {t('revokeInvitation')}
      </Button>
    </>
  );
}
