'use client';

import { useEffect } from 'react';
import { AdminNav } from '@/components/admin/admin-nav';

/**
 * Wrapper component for AdminNav that sets the admin context in sessionStorage
 * when the admin layout mounts. This ensures that when users navigate within
 * the admin section, the admin nav is preserved.
 */
export function AdminNavWithContext() {
  useEffect(() => {
    // Set admin view in sessionStorage when entering admin routes
    sessionStorage.setItem('lastView', 'admin');
  }, []);

  return <AdminNav />;
}
