import type React from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Footer } from '@/components/public/footer';
import { AdminNavWithContext } from '@/components/shared/admin-nav-with-context';
import { SkipLinks } from '@/components/shared/skip-links';

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
    <div className="min-h-screen bg-background flex flex-col">
      <SkipLinks />
      <AdminNavWithContext />
      <main
        id="main-content"
        className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1 max-w-4xl min-h-[500px]"
      >
        {children}
      </main>
      <Footer />
    </div>
  );
}
