'use client';

import { usePlayers } from '@/hooks/use-players';
import type { PlayerRecord } from '@/hooks/use-players';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent } from '@/components/ui/card';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Input } from '@/components/ui/input';
import { Mail, UserX, BellOff } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useState, useMemo, useRef, useEffect } from 'react';
import {
  SearchIcon,
  SearchIconHandle,
  TrendingUpIcon,
  TrendingUpIconHandle,
  XIcon,
  XIconHandle,
} from 'lucide-animated';
import { Button } from '@/components/ui/button';
import { DataStateWrapper } from '@/components/shared/state/data-state-wrapper';
import { PlayerAvatar, PlayersListSkeleton } from '@/components/shared/player';
import { ScrollableFadeContainer, Pagination } from '@/components/shared';
import { StatusBadge, statusConfig } from '@/components/shared/status-badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsFromBfcache } from '@/hooks';
import { useIsMobile } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';
import type { PlayerProfileStatus } from '@/components/shared/status-badge';

const PLAYERS_PER_PAGE = 10;

type PlayerState = 'ALL' | 'ACTIVE' | 'INACTIVE' | 'INVITED';

type Player = PlayerRecord;

export function PlayersList() {
  const t = useTranslations('playersList');
  const tErrors = useTranslations('errors');
  const locale = useLocale();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<PlayerState>('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  const { data: players, isLoading, error } = usePlayers();

  // Helper function to get player status
  const getPlayerStatus = (player: Player): PlayerState => {
    if (player.player) {
      return player.player.status as PlayerState;
    }
    // If no player record, check if they have a pending invitation
    if (player.invitation && player.invitation.status === 'PENDING') {
      return 'INVITED';
    }
    return 'ACTIVE'; // Default fallback
  };

  // Filter players based on search query and status
  const filteredPlayers = useMemo(() => {
    if (!players) return [];

    return players.filter((player) => {
      // Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const name = player.name?.toLowerCase() || '';
        const email = player.email.toLowerCase();
        if (!name.includes(query) && !email.includes(query)) {
          return false;
        }
      }

      // Filter by status
      if (statusFilter !== 'ALL') {
        const playerStatus = getPlayerStatus(player);
        if (playerStatus !== statusFilter) {
          return false;
        }
      }

      return true;
    });
  }, [players, searchQuery, statusFilter]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredPlayers.length / PLAYERS_PER_PAGE);
  const startIndex = (currentPage - 1) * PLAYERS_PER_PAGE;
  const endIndex = startIndex + PLAYERS_PER_PAGE;
  const paginatedPlayers = filteredPlayers.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  return (
    <DataStateWrapper
      isLoading={isLoading}
      data={players}
      error={error}
      loadingMessage={t('loadingPlayers')}
      loadingComponent={<PlayersListSkeleton />}
      emptyMessage={t('noPlayersFound')}
      errorMessage={tErrors('unexpectedError')}
    >
      {() => (
        <PlayersListContent
          paginatedPlayers={paginatedPlayers}
          filteredPlayers={filteredPlayers}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
          startIndex={startIndex}
          endIndex={endIndex}
          t={t}
          locale={locale}
        />
      )}
    </DataStateWrapper>
  );
}

// Separate component for players list content
function PlayersListContent({
  paginatedPlayers,
  filteredPlayers,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  currentPage,
  setCurrentPage,
  totalPages,
  startIndex,
  endIndex,
  t,
  locale,
}: {
  paginatedPlayers: Player[];
  filteredPlayers: Player[];
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  statusFilter: PlayerState;
  setStatusFilter: (value: PlayerState) => void;
  currentPage: number;
  setCurrentPage: (value: number | ((prev: number) => number)) => void;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  t: ReturnType<typeof useTranslations>;
  locale: string;
}) {
  const isBackNav = useIsFromBfcache();
  const isMobile = useIsMobile();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const isSearchExpanded = isMobile && isSearchFocused;
  // Create refs for each player's trending icon
  const trendingUpIconRefs = useRef<Map<string, TrendingUpIconHandle>>(new Map());

  const xIconRef = useRef<XIconHandle>(null);
  const searchIconRef = useRef<SearchIconHandle>(null);

  const setTrendingUpIconRef = (playerId: string) => (el: TrendingUpIconHandle | null) => {
    if (el) {
      trendingUpIconRefs.current.set(playerId, el);
    } else {
      trendingUpIconRefs.current.delete(playerId);
    }
  };

  return (
    <motion.div
      key="content"
      initial={isBackNav ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: isBackNav ? 0 : 0.3 }}
      className="space-y-4"
    >
      {/* Search and Filter Chips */}
      <motion.div
        initial={isBackNav ? false : { opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: isBackNav ? 0 : 0.3 }}
        className="-mx-4 sm:mx-0"
      >
        <ScrollableFadeContainer className="px-4 py-1 sm:mx-0 sm:px-0" fadeWidth={70}>
          <div className="flex items-center gap-2 min-w-max">
            {/* Search Input Chip */}
            <motion.div
              animate={{ width: isSearchExpanded ? '100%' : 'auto' }}
              transition={{ duration: 0.25, ease: [0.645, 0.045, 0.355, 1] }}
              className="relative"
            >
              <SearchIcon
                ref={searchIconRef}
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
              />
              <Input
                type="text"
                placeholder={isMobile ? t('searchPlayersShort') : t('searchPlayers')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                onMouseEnter={() => searchIconRef.current?.startAnimation()}
                className={cn(
                  'pl-9 pr-9 h-9 rounded-full w-full',
                  !isSearchExpanded && 'min-w-[200px] md:min-w-[250px]'
                )}
              />
              {searchQuery && (
                <Button
                  type="button"
                  variant="link"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setSearchQuery('');
                  }}
                  aria-label="Clear search"
                  onMouseEnter={() => xIconRef.current?.startAnimation()}
                  onMouseLeave={() => xIconRef.current?.stopAnimation()}
                >
                  <XIcon ref={xIconRef} size={16} className="h-4 w-4" />
                </Button>
              )}
            </motion.div>

            {/* Status Filter Chips */}
            <AnimatePresence initial={false} mode="popLayout">
              {!isSearchExpanded && (
                <motion.div
                  key="ALL"
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 32 }}
                  transition={{ duration: 0.25, ease: [0.645, 0.045, 0.355, 1] }}
                  className="shrink-0"
                >
                  <Button
                    variant={statusFilter === 'ALL' ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('ALL')}
                    className="rounded-full h-9 px-4"
                  >
                    {t('allStatuses')}
                  </Button>
                </motion.div>
              )}
              {!isSearchExpanded &&
                (
                  [
                    { value: 'ACTIVE', label: t('statusActive') },
                    { value: 'INACTIVE', label: t('statusInactive') },
                    { value: 'INVITED', label: t('statusInvited') },
                  ] as const
                ).map(({ value, label }) => {
                  const config = statusConfig[value];
                  const isSelected = statusFilter === value;
                  return (
                    <motion.div
                      key={value}
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 32 }}
                      transition={{ duration: 0.25, ease: [0.645, 0.045, 0.355, 1] }}
                      className="shrink-0"
                    >
                      <button
                        type="button"
                        onClick={() => setStatusFilter(value)}
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-full border h-9 px-4 text-xs font-semibold uppercase transition-colors',
                          isSelected
                            ? config.className
                            : 'border-border bg-background text-muted-foreground hover:bg-muted'
                        )}
                      >
                        <span
                          className={cn(
                            'w-1.5 h-1.5 rounded-full',
                            isSelected ? config.dotColor : 'bg-muted-foreground/40'
                          )}
                        />
                        {label}
                      </button>
                    </motion.div>
                  );
                })}
            </AnimatePresence>
          </div>
        </ScrollableFadeContainer>
      </motion.div>

      {/* Players List */}
      {filteredPlayers.length === 0 ? (
        <motion.div
          initial={isBackNav ? false : { opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: isBackNav ? 0 : 0.3 }}
        >
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <UserX className="size-6" />
              </EmptyMedia>
              <EmptyTitle>{t('noPlayersMatchSearch')}</EmptyTitle>
            </EmptyHeader>
          </Empty>
        </motion.div>
      ) : (
        <>
          <motion.div
            key={`${searchQuery}-${statusFilter}-${currentPage}`}
            initial={isBackNav ? false : 'hidden'}
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: isBackNav ? 0 : 0.05,
                },
              },
            }}
            className="space-y-4"
          >
            {paginatedPlayers.map((player) => {
              const playerStatusKey: PlayerProfileStatus | 'INVITED' | undefined = player.invitation
                ? 'INVITED'
                : (player.player?.status as PlayerProfileStatus | undefined);

              return (
                <motion.div
                  key={player.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: { opacity: 1, y: 0, transition: { duration: isBackNav ? 0 : 0.4 } },
                  }}
                >
                  <Link
                    href={`/players/${player.id}`}
                    className="block"
                    onMouseEnter={() => trendingUpIconRefs.current.get(player.id)?.startAnimation()}
                  >
                    <Card className="glass-card group hover:shadow-xl transition-shadow duration-200 ease-out border-border/50">
                      <CardContent className="p-6 space-y-4">
                        {/* Top Section: Avatar, Name, Email, and Status Badge */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <PlayerAvatar
                              name={player.name}
                              email={player.email}
                              profilePhoto={player.profilePhoto}
                              emailVerified={player.emailVerified}
                              size="lg"
                            />

                            <div className="flex-1 min-w-0 space-y-1.5">
                              <h3 className="group-hover:text-primary transition-colors font-heading font-semibold text-lg truncate">
                                {player.name || t('noName')}
                              </h3>
                              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                <Mail className="h-3.5 w-3.5 shrink-0" />
                                <span className="truncate">{player.email}</span>
                              </div>
                            </div>
                          </div>

                          {/* Status Badge - Top Right */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            {player.player?.notificationsPaused && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span
                                    className="inline-flex shrink-0"
                                    tabIndex={0}
                                    aria-label={t('notificationsPaused')}
                                  >
                                    <BellOff className="h-4 w-4 text-muted-foreground" />
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>{t('notificationsPaused')}</TooltipContent>
                              </Tooltip>
                            )}
                            {playerStatusKey && (
                              <StatusBadge status={playerStatusKey as PlayerProfileStatus} />
                            )}
                          </div>
                        </div>

                        {/* Bottom: meta + rating (or invited details) */}
                        {player.invitation ? (
                          <div className="flex items-end justify-between text-sm text-muted-foreground pt-4 border-t border-border/50">
                            <div className="space-y-1">
                              <div>
                                <span className="font-medium">{t('invitedOn')}:</span>{' '}
                                <span className="font-semibold text-foreground">
                                  {new Date(player.createdAt).toLocaleDateString(locale)}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium">{t('expiresOn')}:</span>{' '}
                                <span className="font-semibold text-foreground">
                                  {new Date(player.invitation.expiresAt).toLocaleDateString(locale)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-end justify-between text-sm text-muted-foreground pt-4 border-t border-border/50">
                            <div className="space-y-1">
                              {player.player && (
                                <div>
                                  <span className="font-medium">{t('playerSince')}:</span>{' '}
                                  <span className="font-semibold text-foreground">
                                    {new Date(player.player.createdAt).toLocaleDateString(locale)}
                                  </span>
                                </div>
                              )}
                            </div>
                            {player.player && (
                              <div className="flex flex-col items-end gap-1 shrink-0">
                                <div className="flex items-center gap-1.5">
                                  <TrendingUpIcon
                                    ref={setTrendingUpIconRef(player.id)}
                                    size={18}
                                    className="text-primary"
                                  />
                                  <span className="text-4xl font-bold gradient-text font-heading leading-none tracking-tight tabular-nums">
                                    {player.player.rating}
                                  </span>
                                </div>
                                <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">
                                  {t('rating')}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            showResultsText={t('showingResults', {
              start: startIndex + 1,
              end: Math.min(endIndex, filteredPlayers.length),
              total: filteredPlayers.length,
            })}
            previousLabel={t('previous')}
            nextLabel={t('next')}
          />
        </>
      )}
    </motion.div>
  );
}
