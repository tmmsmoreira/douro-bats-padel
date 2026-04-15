'use client';

import { use } from 'react';
import { AdminDrawView } from '@/components/admin/admin-draw-view';

export default function AdminDrawPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <AdminDrawView eventId={id} />;
}
