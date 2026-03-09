'use client';

import { useSession, signOut } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/shared/date-picker';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Edit2, X, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { LoadingState } from '@/components/shared/loading-state';
import { useMinimumLoading } from '@/hooks/use-minimum-loading';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export function PlayerProfile() {
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();
  const t = useTranslations('profile');
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

  const {
    data: profile,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['profile', session?.accessToken],
    queryFn: async () => {
      if (!session?.accessToken) {
        throw new Error('No access token');
      }

      console.log('Fetching profile with token:', session.accessToken.substring(0, 20) + '...');

      const res = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.accessToken}`,
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('API Error:', res.status, errorText);
        throw new Error(`API Error: ${res.statusText}`);
      }

      const data = await res.json();
      console.log('Profile data received:', data);
      return data;
    },
    enabled: !!session?.accessToken,
  });

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

  const updateProfileMutation = useMutation({
    mutationFn: async (data: {
      name?: string;
      dateOfBirth?: string;
      phoneNumber?: string;
      profilePhoto?: string;
    }) => {
      if (!session?.accessToken) {
        throw new Error('No access token');
      }

      const res = await fetch(`${API_URL}/auth/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(errorData.message || res.statusText);
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setIsEditingProfile(false);
      setValidationErrors({});
      toast.success('Profile updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update profile');
    },
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

  // Use minimum loading to prevent jarring flashes
  const showLoading = useMinimumLoading(status === 'loading' || isLoading, !!profile);

  return (
    <AnimatePresence mode="wait">
      {showLoading ? (
        <LoadingState message={t('loadingProfile')} />
      ) : error ? (
        <motion.div
          key="error"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center py-8"
        >
          <p className="text-destructive">
            {t('errorLoadingProfile')}: {(error as Error).message}
          </p>
        </motion.div>
      ) : !profile ? (
        <motion.div
          key="not-found"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center py-8"
        >
          {t('profileNotFound')}
        </motion.div>
      ) : (
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
        />
      )}
    </AnimatePresence>
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
}: any) {
  return (
    <motion.div
      key="content"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t('playerInformation')}</CardTitle>
            {!isEditingProfile ? (
              <Button onClick={handleEditProfile} variant="outline" size="sm">
                <Edit2 className="h-4 w-4" />
                {t('edit')}
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={handleSaveProfile}
                  disabled={updateProfileMutation.isPending}
                  size="sm"
                >
                  <Check className="h-4 w-4" />
                  {updateProfileMutation.isPending ? t('saving') : t('save')}
                </Button>
                <Button onClick={handleCancelProfileEdit} variant="outline" size="sm">
                  <X className="h-4 w-4" />
                  {t('cancel')}
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage
                  src={
                    isEditingProfile
                      ? editedProfilePhoto || undefined
                      : profile.profilePhoto || undefined
                  }
                  alt={profile.name || 'User'}
                />
                <AvatarFallback className="gradient-primary text-2xl">
                  {getUserInitials(profile.name, profile.email)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{t('profilePhoto')}</p>
                {isEditingProfile ? (
                  <input
                    type="text"
                    value={editedProfilePhoto}
                    onChange={(e) => setEditedProfilePhoto(e.target.value)}
                    className="w-full px-3 py-2 text-sm border rounded-md bg-background mt-1"
                    placeholder={t('enterImageUrl')}
                  />
                ) : (
                  <p className="text-xs text-muted-foreground mt-1">
                    {profile.profilePhoto ? t('profilePhoto') : t('notSet')}
                  </p>
                )}
              </div>
            </div>

            {/* Name Field */}
            <div>
              <p className="text-sm text-muted-foreground">{t('name')}</p>
              {isEditingProfile ? (
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border rounded-md bg-background mt-1"
                  placeholder={t('name')}
                />
              ) : (
                <p className="text-lg font-medium">{profile.name || t('notSet')}</p>
              )}
            </div>

            {/* Email Field (Read-only) */}
            <div>
              <p className="text-sm text-muted-foreground">{t('email')}</p>
              {isEditingProfile ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <input
                        type="email"
                        value={profile.email}
                        disabled
                        className="w-full px-3 py-2 text-sm border rounded-md bg-muted text-muted-foreground mt-1 cursor-not-allowed"
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t('emailCannotBeChanged')}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <p className="text-lg font-medium">{profile.email}</p>
              )}
            </div>

            {/* Date of Birth Field */}
            <div>
              <p className="text-sm text-muted-foreground mb-1">{t('dateOfBirth')}</p>
              {isEditingProfile ? (
                <DatePicker
                  value={editedDateOfBirth}
                  onChange={setEditedDateOfBirth}
                  placeholder={t('dateOfBirth')}
                />
              ) : (
                <p className="text-lg font-medium">
                  {profile.dateOfBirth
                    ? new Date(profile.dateOfBirth).toLocaleDateString()
                    : t('notSet')}
                </p>
              )}
            </div>

            {/* Phone Number Field */}
            <div>
              <p className="text-sm text-muted-foreground">{t('phoneNumber')}</p>
              {isEditingProfile ? (
                <input
                  type="tel"
                  value={editedPhoneNumber}
                  onChange={(e) => setEditedPhoneNumber(e.target.value)}
                  className="w-full px-3 py-2 text-sm border rounded-md bg-background mt-1"
                  placeholder={t('phoneNumber')}
                />
              ) : (
                <p className="text-lg font-medium">{profile.phoneNumber || t('notSet')}</p>
              )}
            </div>

            {/* Role Field (Read-only) */}
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
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>{t('performanceStats')}</CardTitle>
            <CardDescription>{t('basedOnLastWeeks')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <div>
              <p className="text-sm text-muted-foreground">{t('currentRating')}</p>
              <p className="text-3xl font-bold">{profile.player?.rating || 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('status')}</p>
              <Badge variant="outline">{profile.player?.status || 'ACTIVE'}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
