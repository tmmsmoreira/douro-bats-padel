'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { CheckCircle, XCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useIsMobile } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';

export type PlayerAvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const avatarSizeClasses: Record<PlayerAvatarSize, string> = {
  xs: 'h-6 w-6',
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-14 w-14',
  xl: 'h-20 w-20 sm:h-24 sm:w-24',
};

const fallbackTextClasses: Record<PlayerAvatarSize, string> = {
  xs: 'text-[10px]',
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-lg',
  xl: 'text-3xl',
};

const markerSizeClasses: Record<PlayerAvatarSize, string> = {
  xs: 'h-3 w-3',
  sm: 'h-3 w-3',
  md: 'h-3.5 w-3.5',
  lg: 'h-4 w-4',
  xl: 'h-5 w-5',
};

export function getPlayerInitials(name?: string | null, email?: string | null): string {
  if (name) {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
  return email?.[0]?.toUpperCase() || 'U';
}

interface PlayerAvatarProps {
  name?: string | null;
  email?: string | null;
  profilePhoto?: string | null;
  emailVerified?: boolean | null;
  size?: PlayerAvatarSize;
  /**
   * Skip the verified marker — useful for tight avatar stacks (e.g. -space-x-2)
   * where the corner badge would clash with the overlap.
   */
  stack?: boolean;
  /**
   * Disable the verified-email tooltip (e.g. when nested inside another tooltip
   * or interactive trigger that shouldn't add a focus stop).
   */
  noTooltip?: boolean;
  className?: string;
  alt?: string;
}

export function PlayerAvatar({
  name,
  email,
  profilePhoto,
  emailVerified,
  size = 'md',
  stack = false,
  noTooltip = false,
  className,
  alt,
}: PlayerAvatarProps) {
  const t = useTranslations('profile');
  const isMobile = useIsMobile();

  const verifiedState: 'verified' | 'unverified' | 'none' = stack
    ? 'none'
    : emailVerified === true
      ? 'verified'
      : emailVerified === false
        ? 'unverified'
        : 'none';

  const markerLabel =
    verifiedState === 'verified' ? t('emailVerifiedLabel') : t('emailNotVerified');

  const MarkerIcon = verifiedState === 'verified' ? CheckCircle : XCircle;
  const markerColor = verifiedState === 'verified' ? 'text-success' : 'text-muted-foreground';

  const showOverlay = verifiedState !== 'none' && !noTooltip;

  const markerClasses =
    'absolute -bottom-1 -right-1 bg-card rounded-full p-0.5 inline-flex outline-none focus-visible:ring-2 focus-visible:ring-ring/50';
  const markerIcon = (
    <MarkerIcon className={cn(markerColor, markerSizeClasses[size])} aria-hidden />
  );

  // Radix Tooltip is hover/focus only — Popover responds to taps. Use Tooltip on
  // desktop (instant on hover) and Popover on touch (tap to reveal, tap-outside
  // to dismiss). Both use a real <button> so screen readers and keyboard users
  // get a proper trigger. `noTooltip` is for callers where the avatar already
  // sits inside a Link/menu trigger and the marker shouldn't add a focus stop.
  const markerButton = (
    <button type="button" className={markerClasses} aria-label={markerLabel}>
      {markerIcon}
    </button>
  );

  const markerStatic = (
    <span className={markerClasses} aria-label={markerLabel}>
      {markerIcon}
    </span>
  );

  return (
    <div className={cn('relative shrink-0', className)}>
      <Avatar className={avatarSizeClasses[size]}>
        <AvatarImage src={profilePhoto || undefined} alt={alt || name || email || 'User'} />
        <AvatarFallback className={cn('gradient-primary font-semibold', fallbackTextClasses[size])}>
          {getPlayerInitials(name, email)}
        </AvatarFallback>
      </Avatar>
      {verifiedState !== 'none' &&
        (showOverlay ? (
          isMobile ? (
            <Popover>
              <PopoverTrigger asChild>{markerButton}</PopoverTrigger>
              <PopoverContent
                className="w-auto max-w-xs p-2 text-xs"
                align="end"
                side="bottom"
                sideOffset={6}
              >
                {markerLabel}
              </PopoverContent>
            </Popover>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>{markerButton}</TooltipTrigger>
              <TooltipContent>{markerLabel}</TooltipContent>
            </Tooltip>
          )
        ) : (
          markerStatic
        ))}
    </div>
  );
}
