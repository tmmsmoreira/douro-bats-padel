'use client';

import { useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/shared/pickers/date-picker';
import { useProfile, useUpdateProfile } from '@/hooks/use-profile';
import { Loader2 } from 'lucide-react';

export function CompleteProfileForm() {
  const t = useTranslations('auth.completeProfile');
  const router = useRouter();
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();

  const [name, setName] = useState(profile?.name ?? '');
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(
    profile?.dateOfBirth ? new Date(profile.dateOfBirth) : undefined
  );
  const [phoneNumber, setPhoneNumber] = useState(profile?.phoneNumber ?? '');
  const [error, setError] = useState('');

  if (isLoading || !profile) {
    return (
      <Card className="glass-card w-full max-w-md">
        <CardContent className="py-12 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError(t('nameRequired'));
      return;
    }
    if (!dateOfBirth) {
      setError(t('dateOfBirthRequired'));
      return;
    }
    if (!phoneNumber.trim()) {
      setError(t('phoneNumberRequired'));
      return;
    }

    try {
      await updateProfile.mutateAsync({
        name: name.trim(),
        dateOfBirth: dateOfBirth.toISOString().split('T')[0],
        phoneNumber: phoneNumber.trim(),
      });
      router.replace('/');
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : t('errorGeneric'));
    }
  };

  return (
    <Card className="glass-card w-full max-w-md border-0 shadow-none sm:border sm:shadow-sm">
      <CardHeader className="space-y-1 px-4 sm:px-6 pt-6">
        <CardTitle className="text-2xl sm:text-3xl font-bold">{t('title')}</CardTitle>
        <CardDescription className="text-sm">{t('description')}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0 px-4 sm:px-6 pb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('name')}</Label>
            <Input
              id="name"
              type="text"
              placeholder={t('namePlaceholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11"
              required
              autoComplete="name"
              aria-invalid={!!error}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">{t('dateOfBirth')}</Label>
            <DatePicker
              id="dateOfBirth"
              value={dateOfBirth}
              onChange={setDateOfBirth}
              placeholder={t('dateOfBirthPlaceholder')}
              aria-invalid={!!error}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">{t('phoneNumber')}</Label>
            <Input
              id="phoneNumber"
              type="tel"
              placeholder={t('phoneNumberPlaceholder')}
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="h-11"
              required
              autoComplete="tel"
              aria-invalid={!!error}
            />
          </div>
          {error && (
            <div
              role="alert"
              aria-live="assertive"
              className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md text-sm"
            >
              {error}
            </div>
          )}
          <Button
            type="submit"
            variant="gradient"
            className="w-full h-11 text-base"
            disabled={updateProfile.isPending}
          >
            {updateProfile.isPending ? t('saving') : t('submit')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
