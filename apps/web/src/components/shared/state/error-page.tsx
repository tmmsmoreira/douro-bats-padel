'use client';

import { ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { PageLayout } from '@/components/shared/layout/page-layout';
import { UnifiedNav } from '@/components/shared/nav/unified-nav';
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from '@/components/ui/empty';

interface ErrorPageProps {
  title: string;
  description: string;
  actions: ReactNode;
}

export function ErrorPage({ title, description, actions }: ErrorPageProps) {
  return (
    <PageLayout nav={<UnifiedNav />}>
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <AlertCircle className="size-6 text-destructive" />
          </EmptyMedia>
          <EmptyTitle>{title}</EmptyTitle>
          <EmptyDescription>{description}</EmptyDescription>
        </EmptyHeader>
        <div className="flex flex-wrap items-center justify-center gap-2">{actions}</div>
      </Empty>
    </PageLayout>
  );
}
