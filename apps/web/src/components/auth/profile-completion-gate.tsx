'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useProfile } from '@/hooks/use-profile';

/**
 * Redirects signed-in users with incomplete profiles (missing name, dateOfBirth,
 * or phoneNumber) to /complete-profile. Email/password signups always come back
 * complete; this gate exists so Google OAuth users who lack DOB/phone get prompted
 * once before reaching the rest of the app.
 */
export function ProfileCompletionGate() {
  const { data: session } = useSession();
  const { data: profile } = useProfile();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!session?.accessToken) return;
    if (!profile) return;
    if (profile.profileCompleted) return;
    if (pathname === '/complete-profile') return;
    router.replace('/complete-profile');
  }, [session?.accessToken, profile, pathname, router]);

  return null;
}
