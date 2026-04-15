'use client';

import { use } from 'react';
import { GenerateDraw } from '@/components/admin/generate-draw';

export default function GenerateDrawPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <GenerateDraw eventId={id} />;
}
