'use client';

import { use } from 'react';
import { GenerateDraw } from '@/components/admin/generate-draw';
import { EditorGuard } from '@/components/shared/editor-guard';

export default function GenerateDrawPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <EditorGuard>
      <GenerateDraw eventId={id} />
    </EditorGuard>
  );
}
