'use client';

import { useSession, signOut } from 'next-auth/react';
import { useTranslations, useLocale } from 'next-intl';
import { useUpdateProfile, useProfile } from '@/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel, FieldDescription, FieldError } from '@/components/ui/field';
import { DatePicker } from '@/components/shared/date-picker';
import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { DataStateWrapper } from '@/components/shared/data-state-wrapper';
import { useIsFromBfcache } from '@/hooks';
import { SquarePenIcon, SquarePenIconHandle } from 'lucide-animated';
import { PageHeader } from '@/components/shared/page-header';
import { Mail, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import { StatusBadge } from '@/components/shared/status-badge';
import { PushNotificationToggle } from '@/components/shared/push-notification-toggle';
import type { PlayerProfileStatus } from '@/components/shared/status-badge';
import type { UserWithPlayer } from '@padel/types';

export function PlayerProfile() {
  const { data: session, status } = useSession();
  const t = useTranslations('profile');
  const locale = useLocale();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedDateOfBirth, setEditedDateOfBirth] = useState<Date | undefined>(undefined);
  const [editedPhoneNumber, setEditedPhoneNumber] = useState('');
  const [editedProfilePhoto, setEditedProfilePhoto] = useState('');
  const [validationErrors, setValidationErrors] = useState<{
    name?: string;
    dateOfBirth?: string;
    phoneNumber?: string;
    profilePhoto?: string;
  }>({});
  const router = useRouter();
  const pathname = usePathname();

  const { data: profile, isLoading, error } = useProfile();

  // Handle unauthorized errors by signing out and redirecting to login
  useEffect(() => {
    if (error && error instanceof Error && error.message.includes('Unauthorized')) {
      console.log('Unauthorized error detected, signing out...');
      const locale = pathname.split('/')[1] || 'en';
      signOut({ redirect: false }).then(() => {
        router.push(`/${locale}/login`);
      });
    }
  }, [error, pathname, router]);

  // Use custom hook for updating profile
  const updateProfileMutation = useUpdateProfile(() => {
    setIsEditingProfile(false);
    setValidationErrors({});
  });

  const validateForm = () => {
    const errors: {
      name?: string;
      dateOfBirth?: string;
      phoneNumber?: string;
      profilePhoto?: string;
    } = {};

    // Name validation
    if (!editedName || editedName.trim().length === 0) {
      errors.name = 'Name is required';
    } else if (editedName.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    } else if (editedName.trim().length > 100) {
      errors.name = 'Name must be less than 100 characters';
    }

    // Date of birth validation
    if (editedDateOfBirth) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (editedDateOfBirth > today) {
        errors.dateOfBirth = 'Date of birth cannot be in the future';
      }

      // Check if user is at least 13 years old
      const minAge = new Date();
      minAge.setFullYear(minAge.getFullYear() - 13);
      if (editedDateOfBirth > minAge) {
        errors.dateOfBirth = 'You must be at least 13 years old';
      }

      // Check if date is reasonable (not more than 120 years ago)
      const maxAge = new Date();
      maxAge.setFullYear(maxAge.getFullYear() - 120);
      if (editedDateOfBirth < maxAge) {
        errors.dateOfBirth = 'Please enter a valid date of birth';
      }
    }

    // Phone number validation
    if (editedPhoneNumber && editedPhoneNumber.trim().length > 0) {
      // Remove spaces, dashes, and parentheses for validation
      const cleanPhone = editedPhoneNumber.replace(/[\s\-\(\)]/g, '');

      // Check if it contains only digits and optional + at the start
      if (!/^\+?\d+$/.test(cleanPhone)) {
        errors.phoneNumber =
          'Phone number can only contain digits, spaces, dashes, and parentheses';
      } else if (cleanPhone.replace(/^\+/, '').length < 9) {
        errors.phoneNumber = 'Phone number must be at least 9 digits';
      } else if (cleanPhone.replace(/^\+/, '').length > 15) {
        errors.phoneNumber = 'Phone number must be less than 15 digits';
      }
    }

    // Profile photo URL validation
    if (editedProfilePhoto && editedProfilePhoto.trim().length > 0) {
      try {
        new URL(editedProfilePhoto);
        // Check if it's a valid image URL (basic check)
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
    if (!validateForm()) {
      return;
    }

    // Check if any field has changed
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

  const getUserInitials = (name?: string | null, email?: string) => {
    if (name) {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return email?.[0]?.toUpperCase() || 'U';
  };

  return (
    <DataStateWrapper
      isLoading={status === 'loading' || isLoading}
      data={profile}
      loadingMessage={t('loadingProfile')}
      emptyMessage={t('profileNotFound')}
      error={error as Error}
      errorMessage={`${t('errorLoadingProfile')}: ${(error as Error)?.message || ''}`}
    >
      {(profile) => (
        <ProfileContent
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
          handleEditProfile={handleEditProfile}
          handleSaveProfile={handleSaveProfile}
          handleCancelProfileEdit={handleCancelProfileEdit}
          updateProfileMutation={updateProfileMutation}
          getUserInitials={getUserInitials}
          t={t}
          locale={locale}
        />
      )}
    </DataStateWrapper>
  );
}

// Separate component for profile content
function ProfileContent({
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
  handleEditProfile,
  handleSaveProfile,
  handleCancelProfileEdit,
  updateProfileMutation,
  getUserInitials,
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
  validationErrors: Record<string, string>;
  handleEditProfile: () => void;
  handleSaveProfile: () => void;
  handleCancelProfileEdit: () => void;
  updateProfileMutation: {
    isPending: boolean;
  };
  getUserInitials: (name?: string | null, email?: string) => string;
  t: (key: string) => string;
  locale: string;
}) {
  const squarePenIconRef = useRef<SquarePenIconHandle>(null);
  const isBackNav = useIsFromBfcache();

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

      {/* Player Header */}
      <motion.div
        initial={isBackNav ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: isBackNav ? 0 : 0.25, ease: [0.165, 0.84, 0.44, 1] }}
      >
        <Card className="glass-card">
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Avatar className="h-24 w-24">
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
                  {profile.name || t('noName')}
                  {profile.emailVerified ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-muted-foreground" />
                  )}
                </CardTitle>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
                  <Mail className="h-4 w-4" />
                  {profile.email}
                </div>
              </div>
              {profile.player && (
                <div className="flex flex-col items-center sm:items-end gap-1 bg-primary/10 px-6 py-4 rounded-lg">
                  <div className="flex items-center gap-1.5 text-3xl font-bold text-primary font-heading">
                    <TrendingUp size={20} className="text-primary" />
                    <span className="gradient-text">{profile.player.rating}</span>
                  </div>
                  <div className="text-xs text-muted-foreground font-medium">
                    {t('currentRating')}
                  </div>
                </div>
              )}
            </div>
          </CardHeader>
          {isEditingProfile && (
            <CardContent className="border-t pt-6">
              <Field>
                <FieldLabel htmlFor="profilePhoto">{t('profilePhoto')}</FieldLabel>
                <Input
                  id="profilePhoto"
                  type="text"
                  value={editedProfilePhoto}
                  onChange={(e) => setEditedProfilePhoto(e.target.value)}
                  placeholder={t('enterImageUrl')}
                />
                <FieldDescription>{t('profilePhotoDescription')}</FieldDescription>
                {validationErrors.profilePhoto && (
                  <FieldError>{validationErrors.profilePhoto}</FieldError>
                )}
              </Field>
            </CardContent>
          )}
        </Card>
      </motion.div>

      {/* Player Information and Edit Form */}
      <motion.div
        initial={isBackNav ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: isBackNav ? 0 : 0.25, ease: [0.165, 0.84, 0.44, 1] }}
        className="grid gap-6 md:grid-cols-2"
      >
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t('playerInformation')}</CardTitle>
            <div className="flex gap-2">
              {!isEditingProfile ? (
                <Button
                  onClick={handleEditProfile}
                  variant="outline"
                  size="icon"
                  onMouseEnter={() => squarePenIconRef.current?.startAnimation()}
                  onMouseLeave={() => squarePenIconRef.current?.stopAnimation()}
                  animate
                >
                  <SquarePenIcon ref={squarePenIconRef} size={16} className="h-4 w-4" />
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleSaveProfile}
                    disabled={updateProfileMutation.isPending}
                    size="sm"
                    animate
                  >
                    {updateProfileMutation.isPending ? t('saving') : t('save')}
                  </Button>

                  <Button onClick={handleCancelProfileEdit} variant="outline" size="sm" animate>
                    {t('cancel')}
                  </Button>
                </>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-0">
            {/* Name Field */}
            {isEditingProfile ? (
              <Field>
                <FieldLabel htmlFor="name">{t('name')}</FieldLabel>
                <Input
                  id="name"
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  placeholder={t('name')}
                  required
                />
                {validationErrors.name && <FieldError>{validationErrors.name}</FieldError>}
              </Field>
            ) : (
              <div>
                <p className="text-sm text-muted-foreground">{t('name')}</p>
                <p className="text-lg font-medium">{profile.name || t('notSet')}</p>
              </div>
            )}

            {/* Email Field (Read-only) */}
            {isEditingProfile ? (
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
            ) : (
              <div>
                <p className="text-sm text-muted-foreground">{t('email')}</p>
                <p className="text-lg font-medium">{profile.email}</p>
              </div>
            )}

            {/* Date of Birth Field */}
            {isEditingProfile ? (
              <Field>
                <FieldLabel htmlFor="dateOfBirth">{t('dateOfBirth')}</FieldLabel>
                <DatePicker
                  id="dateOfBirth"
                  value={editedDateOfBirth}
                  onChange={setEditedDateOfBirth}
                  placeholder={t('dateOfBirth')}
                />
                <FieldDescription>Format: DD/MM/YYYY</FieldDescription>
                {validationErrors.dateOfBirth && (
                  <FieldError>{validationErrors.dateOfBirth}</FieldError>
                )}
              </Field>
            ) : (
              <div>
                <p className="text-sm text-muted-foreground">{t('dateOfBirth')}</p>
                <p className="text-lg font-medium">
                  {profile.dateOfBirth
                    ? new Date(profile.dateOfBirth).toLocaleDateString(locale)
                    : t('notSet')}
                </p>
              </div>
            )}

            {/* Phone Number Field */}
            {isEditingProfile ? (
              <Field>
                <FieldLabel htmlFor="phoneNumber">{t('phoneNumber')}</FieldLabel>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={editedPhoneNumber}
                  onChange={(e) => setEditedPhoneNumber(e.target.value)}
                  placeholder={t('phoneNumber')}
                />
                {validationErrors.phoneNumber && (
                  <FieldError>{validationErrors.phoneNumber}</FieldError>
                )}
              </Field>
            ) : (
              <div>
                <p className="text-sm text-muted-foreground">{t('phoneNumber')}</p>
                <p className="text-lg font-medium">{profile.phoneNumber || t('notSet')}</p>
              </div>
            )}

            {/* Role Field (Read-only) - Hidden for PLAYER role */}
            {profile.roles?.length > 1 || !profile.roles?.includes('PLAYER') ? (
              <div>
                <p className="text-sm text-muted-foreground">{t('role')}</p>
                <div className="flex gap-2 mt-1">
                  {profile.roles?.map((role: string) => (
                    <Badge key={role} variant="outline">
                      {role}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>{t('performanceStats')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            {profile.player && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('status')}</p>
                    <div className="mt-1">
                      <StatusBadge status={profile.player.status as PlayerProfileStatus} />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('currentRating')}</p>
                    <div className="flex items-center gap-1.5 text-2xl font-bold text-primary font-heading mt-1">
                      <TrendingUp size={16} className="text-primary" />
                      <span className="gradient-text">{profile.player.rating}</span>
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('playerSince')}</p>
                    <p className="font-medium">
                      {profile.player.createdAt
                        ? new Date(profile.player.createdAt).toLocaleDateString(locale)
                        : t('notSet')}
                    </p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
      {/* Notifications */}
      <motion.div
        initial={isBackNav ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: isBackNav ? 0 : 0.25, ease: [0.165, 0.84, 0.44, 1] }}
      >
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>{t('notifications')}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <PushNotificationToggle />
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
