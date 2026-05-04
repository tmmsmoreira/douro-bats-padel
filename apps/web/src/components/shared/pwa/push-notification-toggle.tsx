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

  // iOS Safari only exposes Web Push inside an installed PWA. We surface the
  // toggle anyway (disabled) so the affordance is consistent with the row
  // above and the explanatory copy makes the unavailable state obvious.
  if (!isSupported && !requiresInstall) return null;

  const isBlocked = permission === 'denied';
  const isUnavailable = requiresInstall || isBlocked;
  const Icon = isUnavailable ? BellOff : Bell;
  const description = requiresInstall
    ? t('pushNotificationsInstallRequired')
    : isBlocked
      ? t('pushNotificationsBlocked')
      : t('pushNotificationsDescription');

  return (
    <div className="flex items-center gap-3">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <div className="flex-1">
        <p className="text-sm font-medium">{t('pushNotifications')}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch
        checked={!isUnavailable && isSubscribed}
        onCheckedChange={async (checked) => {
          const success = checked ? await subscribe() : await unsubscribe();
          if (success) {
            toast.success(checked ? t('pushSubscribed') : t('pushUnsubscribed'));
          } else {
            toast.error(t('pushError'));
          }
        }}
        disabled={isLoading || isUnavailable}
      />
    </div>
  );
}
