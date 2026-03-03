'use client';

import { useEffect, ReactNode } from 'react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { Plus } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description: string;
  buttonText?: string;
  buttonHref?: string;
  action?: ReactNode;
}

export function PageHeader({
  title,
  description,
  buttonText,
  buttonHref,
  action,
}: PageHeaderProps) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6"
    >
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-base text-muted-foreground">{description}</p>
      </div>
      {(buttonText && buttonHref) || action ? (
        <div>
          {action ? (
            action
          ) : (
            <Link href={buttonHref!} className="shrink-0">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="gradient"
                  className="w-full sm:w-auto gap-2 px-4 py-5 text-base font-medium"
                >
                  <Plus className="w-5 h-5" aria-hidden="true" />
                  {buttonText}
                </Button>
              </motion.div>
            </Link>
          )}
        </div>
      ) : null}
    </motion.div>
  );
}
