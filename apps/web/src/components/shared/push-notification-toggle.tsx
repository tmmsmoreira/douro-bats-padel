'use client';

import { useTranslations } from 'next-intl';
import { usePushNotifications } from '@/hooks';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Bell, BellOff } from 'lucide-react';

export function PushNotificationToggle() {
  const {
    isSupported,
    requiresInstall,
    permission,
    isSubscribed,
    isLoading,
    subscribe,
    unsubscribe,
  } = usePushNotifications();
  const t = useTranslations('profile');

  // iOS Safari only exposes Web Push inside an installed PWA. Tell the user
  // explicitly instead of silently hiding the toggle.
  if (requiresInstall) {
    return (
      <div className="flex items-center gap-3">
        <BellOff className="h-4 w-4 text-muted-foreground" />
        <div className="flex-1">
          <p className="text-sm font-medium">{t('pushNotifications')}</p>
          <p className="text-xs text-muted-foreground">{t('pushNotificationsInstallRequired')}</p>
        </div>
      </div>
    );
  }

  if (!isSupported) return null;

  if (permission === 'denied') {
    return (
      <div className="flex items-center gap-3">
        <BellOff className="h-4 w-4 text-muted-foreground" />
        <div className="flex-1">
          <p className="text-sm font-medium">{t('pushNotifications')}</p>
          <p className="text-xs text-muted-foreground">{t('pushNotificationsBlocked')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Bell className="h-4 w-4 text-muted-foreground" />
      <div className="flex-1">
        <p className="text-sm font-medium">{t('pushNotifications')}</p>
        <p className="text-xs text-muted-foreground">{t('pushNotificationsDescription')}</p>
      </div>
      <Switch
        checked={isSubscribed}
        onCheckedChange={async (checked) => {
          const success = checked ? await subscribe() : await unsubscribe();
          if (success) {
            toast.success(checked ? t('pushSubscribed') : t('pushUnsubscribed'));
          } else {
            toast.error(t('pushError'));
          }
        }}
        disabled={isLoading}
      />
    </div>
  );
}
