'use client';

import { useSession, signOut } from 'next-auth/react';
import { useTranslations, useLocale } from 'next-intl';
import { useUpdateProfile, useProfile, useIsFromBfcache, useLeaderboard } from '@/hooks';
import { useAuthFetch } from '@/hooks/use-api';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel, FieldDescription } from '@/components/ui/field';
import { FieldFeedback } from '@/components/ui/field-feedback';
import { DatePicker } from '@/components/shared/pickers/date-picker';
import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { DataStateWrapper } from '@/components/shared/state/data-state-wrapper';
import { PlayerProfileSkeleton } from '@/components/shared/player';
import { PageHeaderSkeleton } from '@/components/shared/skeletons';
import { PageHeader } from '@/components/shared/layout/page-header';
import { PushNotificationToggle } from '@/components/shared/pwa/push-notification-toggle';
import { EventNotificationsToggle } from '@/components/shared/pwa/event-notifications-toggle';
import { NotificationLanguagePreference } from '@/components/shared/language/notification-language-preference';
import { ConfirmationDialog } from '@/components/shared/confirmation-dialog';
import { PlayerStatsStrip } from './player-stats-strip';
import { WeeklyScoresCard } from './weekly-scores-card';
import { SquarePenIcon, SquarePenIconHandle, LogoutIcon, LogoutIconHandle } from 'lucide-animated';
import { Mail, CheckCircle, XCircle, MailWarning } from 'lucide-react';
import type { PlayerProfileStatus } from '@/components/shared/status-badge';
import type { LeaderboardEntry, UserWithPlayer } from '@padel/types';
import { cn } from '@/lib/utils';

const CARD_EASING: [number, number, number, number] = [0.165, 0.84, 0.44, 1];

interface ValidationErrors {
  name?: string;
  dateOfBirth?: string;
  phoneNumber?: string;
  profilePhoto?: string;
}

export function PlayerProfile() {
  const { status } = useSession();
  const t = useTranslations('profile');
  const locale = useLocale();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedDateOfBirth, setEditedDateOfBirth] = useState<Date | undefined>(undefined);
  const [editedPhoneNumber, setEditedPhoneNumber] = useState('');
  const [editedProfilePhoto, setEditedProfilePhoto] = useState('');
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const router = useRouter();
  const pathname = usePathname();

  const { data: profile, isLoading, error } = useProfile();
  const { data: leaderboard } = useLeaderboard();

  useEffect(() => {
    if (error && error instanceof Error && error.message.includes('Unauthorized')) {
      const lang = pathname.split('/')[1] || 'en';
      signOut({ redirect: false }).then(() => {
        router.push(`/${lang}/login`);
      });
    }
  }, [error, pathname, router]);

  const updateProfileMutation = useUpdateProfile(() => {
    setIsEditingProfile(false);
    setValidationErrors({});
  });

  const validateForm = () => {
    const errors: ValidationErrors = {};

    if (!editedName || editedName.trim().length === 0) {
      errors.name = 'Name is required';
    } else if (editedName.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    } else if (editedName.trim().length > 100) {
      errors.name = 'Name must be less than 100 characters';
    }

    if (editedDateOfBirth) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (editedDateOfBirth > today) {
        errors.dateOfBirth = 'Date of birth cannot be in the future';
      }

      const minAge = new Date();
      minAge.setFullYear(minAge.getFullYear() - 13);
      if (editedDateOfBirth > minAge) {
        errors.dateOfBirth = 'You must be at least 13 years old';
      }

      const maxAge = new Date();
      maxAge.setFullYear(maxAge.getFullYear() - 120);
      if (editedDateOfBirth < maxAge) {
        errors.dateOfBirth = 'Please enter a valid date of birth';
      }
    }

    if (editedPhoneNumber && editedPhoneNumber.trim().length > 0) {
      const cleanPhone = editedPhoneNumber.replace(/[\s\-\(\)]/g, '');

      if (!/^\+?\d+$/.test(cleanPhone)) {
        errors.phoneNumber =
          'Phone number can only contain digits, spaces, dashes, and parentheses';
      } else if (cleanPhone.replace(/^\+/, '').length < 9) {
        errors.phoneNumber = 'Phone number must be at least 9 digits';
      } else if (cleanPhone.replace(/^\+/, '').length > 15) {
        errors.phoneNumber = 'Phone number must be less than 15 digits';
      }
    }

    if (editedProfilePhoto && editedProfilePhoto.trim().length > 0) {
      try {
        new URL(editedProfilePhoto);
        if (
          !/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(editedProfilePhoto) &&
          !editedProfilePhoto.includes('googleusercontent.com') &&
          !editedProfilePhoto.includes('gravatar.com')
        ) {
          errors.profilePhoto = 'Please enter a valid image URL';
        }
      } catch {
        errors.profilePhoto = 'Please enter a valid URL';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEditProfile = () => {
    setEditedName(profile?.name || '');
    setEditedDateOfBirth(profile?.dateOfBirth ? new Date(profile.dateOfBirth) : undefined);
    setEditedPhoneNumber(profile?.phoneNumber || '');
    setEditedProfilePhoto(profile?.profilePhoto || '');
    setValidationErrors({});
    setIsEditingProfile(true);
  };

  const handleSaveProfile = () => {
    if (!validateForm()) return;

    const nameChanged = editedName.trim() !== (profile?.name || '');
    const dateOfBirthChanged = editedDateOfBirth
      ? editedDateOfBirth.toISOString().split('T')[0] !== profile?.dateOfBirth
      : !!profile?.dateOfBirth;
    const phoneNumberChanged = editedPhoneNumber.trim() !== (profile?.phoneNumber || '');
    const profilePhotoChanged = editedProfilePhoto.trim() !== (profile?.profilePhoto || '');

    const hasChanges =
      nameChanged || dateOfBirthChanged || phoneNumberChanged || profilePhotoChanged;

    if (!hasChanges) {
      toast.info('No changes to save');
      setIsEditingProfile(false);
      return;
    }

    updateProfileMutation.mutate({
      name: editedName.trim(),
      dateOfBirth: editedDateOfBirth ? editedDateOfBirth.toISOString().split('T')[0] : undefined,
      phoneNumber: editedPhoneNumber.trim() || undefined,
      profilePhoto: editedProfilePhoto.trim() || undefined,
    });
  };

  const handleCancelProfileEdit = () => {
    setIsEditingProfile(false);
    setEditedName('');
    setEditedDateOfBirth(undefined);
    setEditedPhoneNumber('');
    setEditedProfilePhoto('');
    setValidationErrors({});
  };

  return (
    <DataStateWrapper
      isLoading={status === 'loading' || isLoading}
      data={profile}
      loadingMessage={t('loadingProfile')}
      loadingComponent={
        <div className="space-y-6">
          <PageHeaderSkeleton />
          <PlayerProfileSkeleton />
        </div>
      }
      emptyMessage={t('profileNotFound')}
      error={error as Error}
      errorMessage={`${t('errorLoadingProfile')}: ${(error as Error)?.message || ''}`}
    >
      {(profile) => (
        <ProfileContent
          profile={profile}
          leaderboard={leaderboard}
          isEditingProfile={isEditingProfile}
          editedName={editedName}
          setEditedName={setEditedName}
          editedDateOfBirth={editedDateOfBirth}
          setEditedDateOfBirth={setEditedDateOfBirth}
          editedPhoneNumber={editedPhoneNumber}
          setEditedPhoneNumber={setEditedPhoneNumber}
          editedProfilePhoto={editedProfilePhoto}
          setEditedProfilePhoto={setEditedProfilePhoto}
          validationErrors={validationErrors}
          handleEditProfile={handleEditProfile}
          handleSaveProfile={handleSaveProfile}
          handleCancelProfileEdit={handleCancelProfileEdit}
          updateProfileMutation={updateProfileMutation}
          t={t}
          locale={locale}
        />
      )}
    </DataStateWrapper>
  );
}

function getUserInitials(name?: string | null, email?: string) {
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

interface ProfileContentProps {
  profile: UserWithPlayer;
  leaderboard: LeaderboardEntry[] | undefined;
  isEditingProfile: boolean;
  editedName: string;
  setEditedName: (value: string) => void;
  editedDateOfBirth: Date | undefined;
  setEditedDateOfBirth: (value: Date | undefined) => void;
  editedPhoneNumber: string;
  setEditedPhoneNumber: (value: string) => void;
  editedProfilePhoto: string;
  setEditedProfilePhoto: (value: string) => void;
  validationErrors: ValidationErrors;
  handleEditProfile: () => void;
  handleSaveProfile: () => void;
  handleCancelProfileEdit: () => void;
  updateProfileMutation: { isPending: boolean };
  t: ReturnType<typeof useTranslations>;
  locale: string;
}

function ProfileContent({
  profile,
  leaderboard,
  isEditingProfile,
  editedName,
  setEditedName,
  editedDateOfBirth,
  setEditedDateOfBirth,
  editedPhoneNumber,
  setEditedPhoneNumber,
  editedProfilePhoto,
  setEditedProfilePhoto,
  validationErrors,
  handleEditProfile,
  handleSaveProfile,
  handleCancelProfileEdit,
  updateProfileMutation,
  t,
  locale,
}: ProfileContentProps) {
  const isBackNav = useIsFromBfcache();

  const leaderboardEntry = profile.player
    ? leaderboard?.find((e) => e.playerId === profile.player!.id)
    : undefined;
  const rank = leaderboardEntry ? leaderboard!.indexOf(leaderboardEntry) + 1 : undefined;
  const weeklyScores = leaderboardEntry?.weeklyScores ?? [];
  const weeksPlayed = weeklyScores.length;

  const hasNonPlayerRole = (profile.roles?.length ?? 0) > 1 || !profile.roles?.includes('PLAYER');

  return (
    <motion.div
      key="content"
      initial={isBackNav ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: isBackNav ? 0 : 0.3 }}
      className="space-y-6"
    >
      <PageHeader title={t('title')} description={t('description')} />

      {!profile.emailVerified && <EmailVerificationBanner email={profile.email} t={t} />}

      <motion.div
        initial={isBackNav ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: isBackNav ? 0 : 0.25, ease: CARD_EASING }}
      >
        <ProfileHeaderCard
          profile={profile}
          isEditingProfile={isEditingProfile}
          editedProfilePhoto={editedProfilePhoto}
          rank={rank}
          weeksPlayed={weeksPlayed}
          onEditProfile={handleEditProfile}
          t={t}
        />
      </motion.div>

      <motion.div
        initial={isBackNav ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: isBackNav ? 0 : 0.25, ease: CARD_EASING }}
        className="grid gap-6 md:grid-cols-2"
      >
        <InformationCard
          profile={profile}
          isEditingProfile={isEditingProfile}
          editedName={editedName}
          setEditedName={setEditedName}
          editedDateOfBirth={editedDateOfBirth}
          setEditedDateOfBirth={setEditedDateOfBirth}
          editedPhoneNumber={editedPhoneNumber}
          setEditedPhoneNumber={setEditedPhoneNumber}
          editedProfilePhoto={editedProfilePhoto}
          setEditedProfilePhoto={setEditedProfilePhoto}
          validationErrors={validationErrors}
          hasNonPlayerRole={hasNonPlayerRole}
          handleSaveProfile={handleSaveProfile}
          handleCancelProfileEdit={handleCancelProfileEdit}
          updateProfileMutation={updateProfileMutation}
          t={t}
          locale={locale}
        />

        <WeeklyScoresCard weeklyScores={weeklyScores} />
      </motion.div>

      <motion.div
        initial={isBackNav ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: isBackNav ? 0 : 0.25, ease: CARD_EASING }}
      >
        <AccountCard t={t} />
      </motion.div>
    </motion.div>
  );
}

function EmailVerificationBanner({
  email,
  t,
}: {
  email: string;
  t: ReturnType<typeof useTranslations>;
}) {
  const [isSending, setIsSending] = useState(false);
  const authFetch = useAuthFetch();

  const handleResend = async () => {
    setIsSending(true);
    try {
      await authFetch.post('/auth/resend-verification', { email });
      toast.success(t('verificationEmailSent'));
    } catch {
      toast.error(t('verificationEmailError'));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="glass-card border-warning/40 bg-warning/5">
      <CardContent className="flex flex-col sm:flex-row sm:items-center gap-4 p-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="rounded-full bg-warning/15 p-2 shrink-0">
            <MailWarning className="h-5 w-5 text-warning" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm">{t('emailNotVerified')}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t('emailNotVerifiedDescription')}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleResend}
          disabled={isSending}
          className="w-full sm:w-auto shrink-0"
        >
          {isSending ? t('sending') : t('resendVerification')}
        </Button>
      </CardContent>
    </Card>
  );
}

function ProfileHeaderCard({
  profile,
  isEditingProfile,
  editedProfilePhoto,
  rank,
  weeksPlayed,
  onEditProfile,
  t,
}: {
  profile: UserWithPlayer;
  isEditingProfile: boolean;
  editedProfilePhoto: string;
  rank: number | undefined;
  weeksPlayed: number;
  onEditProfile: () => void;
  t: ReturnType<typeof useTranslations>;
}) {
  const squarePenIconRef = useRef<SquarePenIconHandle>(null);

  return (
    <Card className="glass-card">
      <CardHeader className="pb-0">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20 sm:h-24 sm:w-24 shrink-0">
            <AvatarImage
              src={
                isEditingProfile
                  ? editedProfilePhoto || undefined
                  : profile.profilePhoto || undefined
              }
              alt={profile.name || t('userAltText')}
            />
            <AvatarFallback className="gradient-primary text-3xl">
              {getUserInitials(profile.name, profile.email)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-2xl sm:text-3xl flex items-center gap-2 flex-wrap">
              <span className="truncate">{profile.name || t('noName')}</span>
              {profile.emailVerified ? (
                <CheckCircle className="h-5 w-5 text-green-600 shrink-0" aria-hidden />
              ) : (
                <XCircle
                  className="h-5 w-5 text-muted-foreground shrink-0"
                  aria-label={t('emailNotVerified')}
                />
              )}
            </CardTitle>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2 min-w-0">
              <Mail className="h-4 w-4 shrink-0" />
              <span className="truncate">{profile.email}</span>
            </div>
          </div>
          {!isEditingProfile && (
            <Button
              onClick={onEditProfile}
              variant="outline"
              size="icon"
              onMouseEnter={() => squarePenIconRef.current?.startAnimation()}
              onMouseLeave={() => squarePenIconRef.current?.stopAnimation()}
              aria-label={t('editProfile')}
              className="shrink-0"
              animate
            >
              <SquarePenIcon ref={squarePenIconRef} size={16} className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      {profile.player && (
        <CardContent className="pt-6">
          <PlayerStatsStrip
            rating={profile.player.rating}
            rank={rank}
            weeksPlayed={weeksPlayed}
            status={profile.player.status as PlayerProfileStatus}
          />
        </CardContent>
      )}
    </Card>
  );
}

function InformationCard({
  profile,
  isEditingProfile,
  editedName,
  setEditedName,
  editedDateOfBirth,
  setEditedDateOfBirth,
  editedPhoneNumber,
  setEditedPhoneNumber,
  editedProfilePhoto,
  setEditedProfilePhoto,
  validationErrors,
  hasNonPlayerRole,
  handleSaveProfile,
  handleCancelProfileEdit,
  updateProfileMutation,
  t,
  locale,
}: {
  profile: UserWithPlayer;
  isEditingProfile: boolean;
  editedName: string;
  setEditedName: (value: string) => void;
  editedDateOfBirth: Date | undefined;
  setEditedDateOfBirth: (value: Date | undefined) => void;
  editedPhoneNumber: string;
  setEditedPhoneNumber: (value: string) => void;
  editedProfilePhoto: string;
  setEditedProfilePhoto: (value: string) => void;
  validationErrors: ValidationErrors;
  hasNonPlayerRole: boolean;
  handleSaveProfile: () => void;
  handleCancelProfileEdit: () => void;
  updateProfileMutation: { isPending: boolean };
  t: ReturnType<typeof useTranslations>;
  locale: string;
}) {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>{t('playerInformation')}</CardTitle>
      </CardHeader>
      <CardContent className={cn('pt-0', isEditingProfile ? 'space-y-4' : 'space-y-6')}>
        {isEditingProfile ? (
          <>
            <Field data-invalid={!!validationErrors.profilePhoto}>
              <FieldLabel htmlFor="profilePhoto">{t('profilePhoto')}</FieldLabel>
              <Input
                id="profilePhoto"
                type="text"
                value={editedProfilePhoto}
                onChange={(e) => setEditedProfilePhoto(e.target.value)}
                placeholder={t('enterImageUrl')}
                aria-invalid={!!validationErrors.profilePhoto}
              />
              <FieldFeedback
                description={t('profilePhotoDescription')}
                error={validationErrors.profilePhoto}
              />
            </Field>

            <Field data-invalid={!!validationErrors.name}>
              <FieldLabel htmlFor="name">{t('name')}</FieldLabel>
              <Input
                id="name"
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                placeholder={t('name')}
                required
                aria-invalid={!!validationErrors.name}
              />
              <FieldFeedback error={validationErrors.name} />
            </Field>

            <Field>
              <FieldLabel htmlFor="email">{t('email')}</FieldLabel>
              <Input
                id="email"
                type="email"
                value={profile.email}
                disabled
                className="bg-muted cursor-not-allowed"
              />
              <FieldDescription>{t('emailCannotBeChanged')}</FieldDescription>
            </Field>

            <Field data-invalid={!!validationErrors.dateOfBirth}>
              <FieldLabel htmlFor="dateOfBirth">{t('dateOfBirth')}</FieldLabel>
              <DatePicker
                id="dateOfBirth"
                value={editedDateOfBirth}
                onChange={setEditedDateOfBirth}
                placeholder={t('dateOfBirth')}
                aria-invalid={!!validationErrors.dateOfBirth}
              />
              <FieldFeedback
                description={t('dateOfBirthHint')}
                error={validationErrors.dateOfBirth}
              />
            </Field>

            <Field data-invalid={!!validationErrors.phoneNumber}>
              <FieldLabel htmlFor="phoneNumber">{t('phoneNumber')}</FieldLabel>
              <Input
                id="phoneNumber"
                type="tel"
                value={editedPhoneNumber}
                onChange={(e) => setEditedPhoneNumber(e.target.value)}
                placeholder={t('phoneNumber')}
                aria-invalid={!!validationErrors.phoneNumber}
              />
              <FieldFeedback error={validationErrors.phoneNumber} />
            </Field>
          </>
        ) : (
          <>
            <ReadField label={t('name')} value={profile.name || t('notSet')} />
            <ReadField label={t('email')} value={profile.email} />
            <ReadField
              label={t('dateOfBirth')}
              value={
                profile.dateOfBirth
                  ? new Date(profile.dateOfBirth).toLocaleDateString(locale)
                  : t('notSet')
              }
            />
            <ReadField label={t('phoneNumber')} value={profile.phoneNumber || t('notSet')} />
            {profile.player?.createdAt && (
              <ReadField
                label={t('playerSince')}
                value={new Date(profile.player.createdAt).toLocaleDateString(locale)}
              />
            )}
            {hasNonPlayerRole && (
              <div>
                <p className="text-sm text-muted-foreground">{t('role')}</p>
                <div className="flex gap-2 mt-1 flex-wrap">
                  {profile.roles?.map((role: string) => (
                    <Badge key={role} variant="outline">
                      {role}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
      {isEditingProfile && (
        <CardFooter className="border-t gap-2 justify-end">
          <Button onClick={handleCancelProfileEdit} variant="outline" size="sm" animate>
            {t('cancel')}
          </Button>
          <Button
            onClick={handleSaveProfile}
            disabled={updateProfileMutation.isPending}
            size="sm"
            animate
          >
            {updateProfileMutation.isPending ? t('saving') : t('save')}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

function ReadField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-lg font-medium truncate">{value}</p>
    </div>
  );
}

function AccountCard({ t }: { t: ReturnType<typeof useTranslations> }) {
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const logoutIconRef = useRef<LogoutIconHandle>(null);

  const handleSignOut = () => {
    setIsSigningOut(true);
    signOut();
  };

  return (
    <>
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>{t('account')}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          <EventNotificationsToggle />
          <PushNotificationToggle />
          <NotificationLanguagePreference />
        </CardContent>
        <CardFooter className="border-t">
          <Button
            variant="destructive"
            onClick={() => setShowSignOutDialog(true)}
            disabled={isSigningOut}
            onMouseEnter={() => logoutIconRef.current?.startAnimation()}
            onMouseLeave={() => logoutIconRef.current?.stopAnimation()}
            className="w-full sm:w-auto"
          >
            <LogoutIcon ref={logoutIconRef} size={16} />
            {t('signOut')}
          </Button>
        </CardFooter>
      </Card>

      <ConfirmationDialog
        open={showSignOutDialog}
        onOpenChange={setShowSignOutDialog}
        title={t('signOutConfirmation')}
        description={t('signOutConfirmationDescription')}
        confirmText={t('signOut')}
        cancelText={t('cancel')}
        variant="destructive"
        isLoading={isSigningOut}
        onConfirm={handleSignOut}
      />
    </>
  );
}
