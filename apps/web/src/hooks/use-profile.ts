import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { Locale } from '@padel/types';
import { useAuthFetch } from './use-api';

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  dateOfBirth?: string | null;
  phoneNumber?: string | null;
  profilePhoto: string | null;
  roles: string[];
  emailVerified: boolean;
  preferredLanguage: Locale;
  createdAt: string;
  profileCompleted: boolean;
  player: {
    id: string;
    rating: number;
    tier: string;
    status: string;
    notificationsPaused: boolean;
    createdAt: string;
  } | null;
}

/**
 * Hook to fetch the current user's profile
 */
export function useProfile() {
  const { data: session } = useSession();
  const authFetch = useAuthFetch();

  return useQuery<UserProfile>({
    queryKey: ['profile', session?.accessToken],
    queryFn: () => authFetch.get('/auth/me'),
    enabled: !!session?.accessToken,
  });
}

interface UpdateProfileData {
  name?: string;
  dateOfBirth?: string;
  phoneNumber?: string;
  profilePhoto?: string;
  notificationsPaused?: boolean;
  preferredLanguage?: Locale;
}

/**
 * Hook to update user profile
 */
export function useUpdateProfile(onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();
  const { data: session, update: updateSession } = useSession();
  const authFetch = useAuthFetch();

  return useMutation({
    mutationFn: async (data: UpdateProfileData) => {
      return authFetch.patch<UserProfile>('/auth/profile', data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile updated successfully');
      onSuccessCallback?.();

      // Push session-backed fields to the JWT in the background so the navbar
      // avatar/name update without a sign-in. We don't await — blocking here
      // flickers `status: 'loading'`, which unmounts the profile form.
      void updateSession({
        ...session,
        user: {
          ...session?.user,
          name: data.name ?? session?.user?.name,
          profilePhoto: data.profilePhoto ?? session?.user?.profilePhoto,
        },
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update profile');
    },
  });
}
