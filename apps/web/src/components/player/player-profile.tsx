'use client';

import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Camera } from 'lucide-react';
import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export function PlayerProfile() {
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();
  const t = useTranslations('profile');
  const [photoUrl, setPhotoUrl] = useState('');
  const [isEditingPhoto, setIsEditingPhoto] = useState(false);

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

  const updatePhotoMutation = useMutation({
    mutationFn: async (profilePhoto: string) => {
      if (!session?.accessToken) {
        throw new Error('No access token');
      }

      const res = await fetch(`${API_URL}/auth/profile-photo`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({ profilePhoto }),
      });

      if (!res.ok) {
        throw new Error(`API Error: ${res.statusText}`);
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setPhotoUrl('');
      setIsEditingPhoto(false);
    },
  });

  const handlePhotoSubmit = () => {
    if (photoUrl.trim()) {
      updatePhotoMutation.mutate(photoUrl);
    }
  };

  const handleCancelEdit = () => {
    setPhotoUrl('');
    setIsEditingPhoto(false);
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

  console.log(
    'Session status:',
    status,
    'Has token:',
    !!session?.accessToken,
    'Profile:',
    profile,
    'Error:',
    error
  );

  if (status === 'loading' || isLoading) {
    return <div className="text-center py-8">{t('loadingProfile')}</div>;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">
          {t('errorLoadingProfile')}: {(error as Error).message}
        </p>
      </div>
    );
  }

  if (!profile) {
    return <div className="text-center py-8">{t('profileNotFound')}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('playerInformation')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile.profilePhoto || undefined} alt={profile.name || 'User'} />
                <AvatarFallback className="text-2xl">
                  {getUserInitials(profile.name, profile.email)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                {!isEditingPhoto ? (
                  // Display mode: Show edit button
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">{t('profilePhoto')}</p>
                    <Button onClick={() => setIsEditingPhoto(true)} variant="outline" size="sm">
                      <Camera className="h-4 w-4 mr-2" />
                      {t('editPhoto')}
                    </Button>
                  </div>
                ) : (
                  // Edit mode: Show input with save/cancel
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">{t('profilePhotoUrl')}</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={photoUrl}
                        onChange={(e) => setPhotoUrl(e.target.value)}
                        placeholder={t('enterImageUrl')}
                        className="flex-1 px-3 py-2 text-sm border rounded-md bg-background"
                      />
                      <Button
                        onClick={handlePhotoSubmit}
                        disabled={updatePhotoMutation.isPending}
                        size="sm"
                      >
                        {updatePhotoMutation.isPending ? t('saving') : t('save')}
                      </Button>
                      <Button onClick={handleCancelEdit} variant="outline" size="sm">
                        {t('cancel')}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('name')}</p>
              <p className="text-lg font-medium">{profile.name || t('notSet')}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('email')}</p>
              <p className="text-lg font-medium">{profile.email}</p>
            </div>
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

        <Card>
          <CardHeader>
            <CardTitle>{t('performanceStats')}</CardTitle>
            <CardDescription>{t('basedOnLastWeeks')}</CardDescription>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
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
    </div>
  );
}
