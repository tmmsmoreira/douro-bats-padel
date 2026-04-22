'use client';

import { useTranslations } from 'next-intl';
import { Languages } from 'lucide-react';
import { Locale } from '@padel/types';
import { useProfile, useUpdateProfile } from '@/hooks';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EnFlagIcon, PtFlagIcon } from '@/components/icons';

const FLAGS: Record<Locale, React.ComponentType<{ size?: number }>> = {
  [Locale.EN]: EnFlagIcon,
  [Locale.PT]: PtFlagIcon,
};

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
      <Select
        value={current}
        onValueChange={(value) => {
          updateProfile.mutate({ preferredLanguage: value as Locale });
        }}
        disabled={updateProfile.isPending}
      >
        <SelectTrigger size="sm" className="w-auto min-w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(FLAGS) as Locale[]).map((locale) => {
            const Flag = FLAGS[locale];
            return (
              <SelectItem key={locale} value={locale}>
                <span className="flex items-center gap-2">
                  <Flag size={16} />
                  <span>{t(`languages.${locale}` as const)}</span>
                </span>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
