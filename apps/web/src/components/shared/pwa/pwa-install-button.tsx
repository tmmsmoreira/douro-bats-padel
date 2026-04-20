'use client';

import { Download } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { usePWAInstall } from '@/hooks/use-pwa-install';

/**
 * PWA Install Button Component
 * Shows an install button when the app can be installed as a PWA
 * Automatically hides when the app is already installed or not installable
 */
export function PWAInstallButton() {
  const { canPromptInstall, installApp } = usePWAInstall();
  const tFooter = useTranslations('footer');

  if (!canPromptInstall) {
    return null;
  }

  return (
    <Button
      onClick={installApp}
      variant="outline"
      size="sm"
      className="gap-2 w-full sm:w-auto"
      aria-label={tFooter('installApp')}
    >
      <Download className="h-4 w-4" />
      <span>{tFooter('installApp')}</span>
    </Button>
  );
}
