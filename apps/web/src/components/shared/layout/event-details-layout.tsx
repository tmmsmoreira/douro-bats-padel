'use client';

import { ReactNode } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from './page-header';
import { Calendar } from 'lucide-react';

interface EventDetailsLayoutProps {
  /**
   * Event title
   */
  title: string;
  /**
   * Event description or metadata (can be a ReactNode for complex layouts)
   */
  description?: string | ReactNode;
  /**
   * Show back button
   * @default true
   */
  showBackButton?: boolean;
  /**
   * Back button href
   * @default '/'
   */
  backButtonHref?: string;
  /**
   * Back button label
   */
  backButtonLabel?: string;
  /**
   * Actions to display in the header (e.g., edit, delete buttons)
   */
  headerActions?: ReactNode;
  /**
   * Main content
   */
  children: ReactNode;
  /**
   * Whether to animate the content
   * @default true
   */
  animate?: boolean;
  /**
   * Additional className for the container
   */
  className?: string;
}

/**
 * Shared layout component for event details pages (both admin and player views).
 * Provides consistent structure with header, back button, and content area.
 *
 * @example
 * ```tsx
 * <EventDetailsLayout
 *   title="Game Night"
 *   description="Friday, March 15, 2024"
 *   showBackButton
 *   backButtonHref="/events"
 *   backButtonLabel="Back to Events"
 * >
 *   <EventContent />
 * </EventDetailsLayout>
 * ```
 */
export function EventDetailsLayout({
  title,
  description,
  showBackButton = true,
  backButtonHref = '/',
  backButtonLabel,
  headerActions,
  children,
  animate = true,
  className,
}: EventDetailsLayoutProps) {
  const content = (
    <div className={className}>
      <div className="space-y-6">
        <PageHeader
          title={title}
          description={description}
          showBackButton={showBackButton}
          backButtonHref={backButtonHref}
          backButtonLabel={backButtonLabel}
          action={headerActions}
        />
        {children}
      </div>
    </div>
  );

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {content}
      </motion.div>
    );
  }

  return content;
}

/**
 * Helper component for displaying a message card in event details
 * (e.g., "Event published", "Draw not available", etc.)
 */
export function EventDetailsMessage({
  icon: Icon = Calendar,
  title,
  description,
  action,
  animate = true,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: ReactNode;
  animate?: boolean;
}) {
  const content = (
    <Card className="glass-card">
      <CardContent className="pt-6 pb-6">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Icon className="h-8 w-8 text-primary" />
          </div>
          <div className="pt-4 space-y-4">
            <div>
              <p className="text-lg font-medium mb-2">{title}</p>
              {description && <p className="text-muted-foreground">{description}</p>}
            </div>
            {action && <div>{action}</div>}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
      >
        {content}
      </motion.div>
    );
  }

  return content;
}
