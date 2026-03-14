import type React from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { AdminNavWithContext } from '@/components/shared/admin-nav-with-context';
import { PageLayout } from '@/components/shared';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const isEditor = session.user.roles?.includes('EDITOR') || session.user.roles?.includes('ADMIN');

  if (!isEditor) {
    redirect('/');
  }

  return (
    <PageLayout nav={<AdminNavWithContext />} maxWidth="4xl">
      {children}
    </PageLayout>
  );
}
