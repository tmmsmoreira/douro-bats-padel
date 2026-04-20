'use client';

import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { PWAPlatform } from '@/hooks/use-pwa-install';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  platform: PWAPlatform;
}

export function PWAInstallInstructions({ open, onOpenChange, platform }: Props) {
  const t = useTranslations('home.connectApp.manualInstall');

  const stepsKey = platformToStepsKey(platform);
  const stepsRaw = t.raw(`${stepsKey}.steps`) as unknown;
  const steps: string[] = Array.isArray(stepsRaw) ? (stepsRaw as string[]) : [];
  const note = t(`${stepsKey}.note`);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t(`${stepsKey}.title`)}</DialogTitle>
          <DialogDescription>{t(`${stepsKey}.description`)}</DialogDescription>
        </DialogHeader>

        <ol className="space-y-3 text-sm">
          {steps.map((step, index) => (
            <li key={index} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                {index + 1}
              </span>
              <span className="pt-0.5 text-muted-foreground">{renderEmphasis(step)}</span>
            </li>
          ))}
        </ol>

        {note ? <p className="text-xs text-muted-foreground border-t pt-4">{note}</p> : null}
      </DialogContent>
    </Dialog>
  );
}

function platformToStepsKey(platform: PWAPlatform): string {
  switch (platform) {
    case 'safari-ios':
      return 'iosSafari';
    case 'ios-other':
      return 'iosOther';
    case 'safari-macos':
      return 'macSafari';
    case 'arc':
      return 'arc';
    case 'firefox':
      return 'firefox';
    case 'chromium-desktop':
      return 'chromiumDesktop';
    case 'chromium-android':
      return 'chromiumAndroid';
    default:
      return 'generic';
  }
}

function renderEmphasis(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <strong key={i} className="font-semibold text-foreground">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}
