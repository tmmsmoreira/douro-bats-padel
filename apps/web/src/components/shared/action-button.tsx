'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { PlusIcon, PlusIconHandle } from 'lucide-animated';

interface ActionButtonProps {
  href: string;
  label: string;
  icon?: 'plus';
  variant?: 'default' | 'gradient' | 'outline' | 'ghost';
}

export function ActionButton({
  href,
  label,
  icon = 'plus',
  variant = 'gradient',
}: ActionButtonProps) {
  const iconRef = useRef<PlusIconHandle>(null);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsNavigating(true);
    startTransition(() => {
      router.push(href);
    });
  };

  const showLoading = isPending || isNavigating;

  return (
    <Button
      variant={variant}
      className="gap-2 px-4 py-5 text-base font-medium"
      onMouseEnter={() => iconRef.current?.startAnimation()}
      onMouseLeave={() => iconRef.current?.stopAnimation()}
      onClick={handleClick}
      disabled={showLoading}
      animate
    >
      {showLoading ? (
        <div aria-hidden="true">
          <Spinner />
        </div>
      ) : (
        icon === 'plus' && <PlusIcon size={18} aria-hidden="true" ref={iconRef} />
      )}
      {label}
    </Button>
  );
}
