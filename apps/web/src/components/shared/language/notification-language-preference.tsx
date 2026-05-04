'use client';

import { useTranslations } from 'next-intl';
import { Languages } from 'lucide-react';
import { Locale } from '@padel/types';
import { useProfile, useUpdateProfile } from '@/hooks';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { EnFlagIcon, PtFlagIcon } from '@/components/icons';

export function NotificationLanguagePreference() {
  const t = useTranslations('profile');
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();

  if (!profile) return null;

  const current = profile.preferredLanguage;

  return (
    <div className="flex items-center gap-3">
      <Languages className="h-4 w-4 text-muted-foreground" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{t('notificationLanguage')}</p>
        <p className="text-xs text-muted-foreground">{t('notificationLanguageDescription')}</p>
      </div>
      <ToggleGroup
        type="single"
        variant="outline"
        size="sm"
        value={current}
        onValueChange={(value) => {
          if (!value || value === current) return;
          updateProfile.mutate({ preferredLanguage: value as Locale });
        }}
        disabled={updateProfile.isPending}
      >
        <ToggleGroupItem value={Locale.EN} aria-label={t('languages.EN')}>
          <EnFlagIcon size={16} />
        </ToggleGroupItem>
        <ToggleGroupItem value={Locale.PT} aria-label={t('languages.PT')}>
          <PtFlagIcon size={16} />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
