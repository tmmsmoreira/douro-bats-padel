'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'motion/react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Mail, CheckCircle } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useState, useMemo, useRef } from 'react';
import { SearchIcon, SearchIconHandle, TrendingUpIcon, XIcon, XIconHandle } from 'lucide-animated';
import { Button } from '@/components/ui/button';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface Player {
  id: string;
  email: string;
  name: string | null;
  profilePhoto: string | null;
  emailVerified: boolean;
  createdAt: string;
  player: {
    id: string;
    rating: number;
    tier: string; // Still exists in DB but not displayed (used only for event organization)
    status: string;
    createdAt: string;
  } | null;
}

export function PlayersList() {
  const t = useTranslations('playersList');
  const locale = useLocale();
  const [searchQuery, setSearchQuery] = useState('');
  const searchIconRef = useRef<SearchIconHandle>(null);
  const xIconRef = useRef<XIconHandle>(null);

  const { data: players, isLoading } = useQuery<Player[]>({
    queryKey: ['players'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/players`);
      if (!res.ok) throw new Error('Failed to fetch players');
      return res.json();
    },
  });

  // Filter players based on search query
  const filteredPlayers = useMemo(() => {
    if (!players) return [];
    if (!searchQuery.trim()) return players;

    const query = searchQuery.toLowerCase();
    return players.filter((player) => {
      const name = player.name?.toLowerCase() || '';
      const email = player.email.toLowerCase();
      return name.includes(query) || email.includes(query);
    });
  }, [players, searchQuery]);

  if (isLoading) {
    return <div className="text-center py-8">{t('loadingPlayers')}</div>;
  }

  if (!players || players.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          {t('noPlayersFound')}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="relative">
          <SearchIcon
            ref={searchIconRef}
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
          />
          <Input
            type="text"
            placeholder={t('searchPlayers')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onMouseEnter={() => searchIconRef.current?.startAnimation()}
            className="pl-9 pr-9"
          />
          {searchQuery && (
            <Button
              type="button"
              variant="link"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
              onMouseEnter={() => xIconRef.current?.startAnimation()}
              onMouseLeave={() => xIconRef.current?.stopAnimation()}
            >
              <XIcon ref={xIconRef} size={16} className="h-4 w-4" />
            </Button>
          )}
        </div>
      </motion.div>

      {/* Players List */}
      {filteredPlayers.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="glass-card group transition-all duration-300 border-border/50">
            <CardContent className="py-8 text-center text-muted-foreground">
              {t('noPlayersMatchSearch')}
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
          className="space-y-4"
        >
          {filteredPlayers.map((player) => (
            <motion.div
              key={player.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
              }}
            >
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="cursor-pointer"
              >
                <Link href={`/players/${player.id}`} className="block">
                  <Card className="glass-card group hover:shadow-xl transition-all duration-300 border-border/50">
                    <CardContent className="p-6 space-y-4">
                      {/* Top Section: Avatar, Name, Badge, and Rating */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          {/* Avatar with verified badge */}
                          <div className="relative shrink-0">
                            <Avatar className="h-14 w-14">
                              <AvatarImage
                                src={player.profilePhoto || undefined}
                                alt={player.name || player.email}
                              />
                              <AvatarFallback className="gradient-primary text-lg font-semibold">
                                {player.name
                                  ? player.name
                                      .split(' ')
                                      .map((n) => n[0])
                                      .join('')
                                      .toUpperCase()
                                      .slice(0, 2)
                                  : player.email[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            {player.emailVerified && (
                              <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5">
                                <CheckCircle className="h-4 w-4 text-success" />
                              </div>
                            )}
                          </div>

                          {/* Name, Badge, and Email */}
                          <div className="flex-1 min-w-0 space-y-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="group-hover:text-primary transition-colors font-heading font-semibold text-lg">
                                {player.name || t('noName')}
                              </h3>
                              {player.player && (
                                <Badge
                                  variant={
                                    player.player.status === 'ACTIVE' ? 'default' : 'secondary'
                                  }
                                  className="uppercase text-xs"
                                >
                                  {player.player.status}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                              <Mail className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate">{player.email}</span>
                            </div>
                          </div>
                        </div>

                        {/* Rating */}
                        {player.player && <RatingSection player={player} />}
                      </div>

                      {/* Bottom Section: Player Since and Account Created */}
                      <div className="flex items-center flex-wrap justify-between text-sm text-muted-foreground pt-4 border-t border-border/50">
                        <div className=" gap-x-6 gap-y-1">
                          <div>
                            <span className="font-medium">{t('playerSince')}:</span>{' '}
                            <span className="font-semibold text-foreground">
                              {player.player
                                ? new Date(player.player.createdAt).toLocaleDateString(locale)
                                : new Date(player.createdAt).toLocaleDateString(locale)}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">{t('accountCreated')}:</span>{' '}
                            <span className="font-semibold text-foreground">
                              {new Date(player.createdAt).toLocaleDateString(locale)}
                            </span>
                          </div>
                        </div>
                        {player.player && <RatingSection player={player} isMobile />}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

function RatingSection({ player, isMobile = false }: { player: Player; isMobile?: boolean }) {
  const t = useTranslations('playersList');

  return (
    <div
      className={
        isMobile
          ? 'flex md:hidden flex-col items-end gap-0.5 shrink-0'
          : 'hidden md:flex flex-col items-end gap-0.5 shrink-0'
      }
    >
      <div className="flex items-center gap-1.5 text-3xl font-bold text-primary font-heading">
        <TrendingUpIcon size={20} className="text-primary" />
        <span className="gradient-text">{player.player?.rating}</span>
      </div>
      <div className="text-xs text-muted-foreground font-medium">{t('rating')}</div>
    </div>
  );
}
