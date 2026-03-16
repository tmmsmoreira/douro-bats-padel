'use client';

import { useEffect, ReactNode, useRef } from 'react';
import { motion } from 'motion/react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon, ArrowLeftIconHandle } from 'lucide-animated';
import { useIsMobile } from '@/hooks';

interface PageHeaderProps {
  title: string;
  description?: string | ReactNode;
  action?: ReactNode;
  showBackButton?: boolean;
  backButtonHref?: string;
  backButtonLabel?: string;
}

export function PageHeader({
  title,
  description,
  action,
  showBackButton = false,
  backButtonHref = '/admin',
  backButtonLabel = 'Back',
}: PageHeaderProps) {
  const arrowLeftIconRef = useRef<ArrowLeftIconHandle>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="space-y-4">
      {/* Back Button */}
      {showBackButton && !isMobile && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          whileTap={{ scale: 0.95 }}
          onMouseEnter={() => arrowLeftIconRef.current?.startAnimation()}
          onMouseLeave={() => arrowLeftIconRef.current?.stopAnimation()}
          style={{ display: 'inline-block' }}
        >
          <Button variant="ghost" size="sm" asChild>
            <Link href={backButtonHref}>
              <ArrowLeftIcon ref={arrowLeftIconRef} size={16} />
              {backButtonLabel}
            </Link>
          </Button>
        </motion.div>
      )}

      {/* Header Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
      >
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>
          {description && (
            <div className="text-base text-muted-foreground md:mt-2">
              {typeof description === 'string' ? <p>{description}</p> : description}
            </div>
          )}
        </div>
        {action && <div className="w-full sm:w-auto shrink-0">{action}</div>}
      </motion.div>
    </div>
  );
}
