'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function EventsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Events error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h2 className="text-2xl font-bold">Failed to load events</h2>
      <p className="text-muted-foreground max-w-md">
        There was a problem loading the events. Please try again.
      </p>
      <Button onClick={reset} variant="default">
        Try Again
      </Button>
    </div>
  );
}
