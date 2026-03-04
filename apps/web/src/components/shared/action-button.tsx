'use client';

import { useRef } from 'react';
import { motion } from 'motion/react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
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

  return (
    <Link href={href}>
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          variant={variant}
          className="w-full gap-2 px-4 py-5 text-base font-medium"
          onMouseEnter={() => iconRef.current?.startAnimation()}
          onMouseLeave={() => iconRef.current?.stopAnimation()}
        >
          {icon === 'plus' && <PlusIcon size={18} aria-hidden="true" ref={iconRef} />}
          {label}
        </Button>
      </motion.div>
    </Link>
  );
}
