'use client';

import { useTranslations } from 'next-intl';
import { Switch } from '@/components/ui/switch';
import { Mail } from 'lucide-react';
import { useProfile, useUpdateProfile } from '@/hooks';

export function EventNotificationsToggle() {
  const t = useTranslations('profile');
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();

  if (!profile?.player) return null;

  const enabled = !profile.player.notificationsPaused;

  return (
    <div className="flex items-center gap-3">
      <Mail className="h-4 w-4 text-muted-foreground" />
      <div className="flex-1">
        <p className="text-sm font-medium">{t('eventNotifications')}</p>
        <p className="text-xs text-muted-foreground">{t('eventNotificationsDescription')}</p>
      </div>
      <Switch
        checked={enabled}
        onCheckedChange={(checked) => {
          updateProfile.mutate({ notificationsPaused: !checked });
        }}
        disabled={updateProfile.isPending}
      />
    </div>
  );
}
