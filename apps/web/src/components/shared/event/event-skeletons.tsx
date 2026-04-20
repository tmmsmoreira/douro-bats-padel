import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function EventFormSkeleton() {
  return (
    <div className="space-y-8" aria-hidden>
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <Card className="glass-card">
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-6 pt-0">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-end gap-3">
        <Skeleton className="h-10 w-24 rounded-md" />
        <Skeleton className="h-10 w-28 rounded-md" />
      </div>
    </div>
  );
}

export function EventsListSkeleton({
  count = 3,
  withFilters = false,
}: {
  count?: number;
  withFilters?: boolean;
}) {
  return (
    <div className="space-y-4" aria-hidden>
      {withFilters && <FilterChipsSkeleton chips={6} withDateChip />}
      <div className="grid gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <EventCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function FilterChipsSkeleton({
  chips = 4,
  withDateChip = false,
}: {
  chips?: number;
  withDateChip?: boolean;
}) {
  return (
    <div className="-mx-4 sm:mx-0 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-1 sm:px-0 min-w-max">
        {withDateChip && <Skeleton className="h-9 w-32 rounded-full shrink-0" />}
        {Array.from({ length: chips }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-20 rounded-full shrink-0" />
        ))}
      </div>
    </div>
  );
}

export function EventCardSkeleton() {
  return (
    <Card className="glass-card border-border/50">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <Skeleton className="h-6 w-2/3 sm:w-1/2" />
          <Skeleton className="hidden sm:block h-6 w-24 rounded-full" />
        </div>
        <div className="flex items-start justify-between gap-4 mt-3">
          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-x-4 gap-y-2 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded shrink-0" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded shrink-0" />
              <Skeleton className="h-4 w-28" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded shrink-0" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <Skeleton className="sm:hidden h-6 w-20 rounded-full shrink-0" />
        </div>
      </CardHeader>
      <CardContent className="pt-0 pb-6">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Skeleton className="h-4 w-4 rounded shrink-0" />
          <div className="flex items-center gap-3 text-sm flex-1 sm:flex-none">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-2 flex-1 sm:w-32 rounded-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function EventLayoutSkeleton() {
  return (
    <div className="space-y-4 md:space-y-6" aria-hidden>
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="flex items-center gap-3 flex-wrap justify-between">
          <div className="flex items-center gap-3 flex-wrap">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-7 w-24 rounded-full" />
        </div>
      </div>
      <div className="border-b border-border">
        <div className="flex space-x-8 pb-3 pt-4">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
      <EventDetailsSkeleton />
    </div>
  );
}

export function EventDetailsSkeleton() {
  return (
    <div className="space-y-8" aria-hidden>
      <Card className="glass-card">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-56" />
            </div>
            <Skeleton className="h-10 w-full sm:w-28 rounded-lg" />
          </div>
        </CardHeader>
      </Card>

      <div className="flex items-center justify-center gap-2 flex-wrap">
        <Skeleton className="h-7 w-44 rounded-full" />
        <Skeleton className="h-7 w-44 rounded-full" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <PlayersSectionSkeleton rows={4} />
        <PlayersSectionSkeleton rows={2} />
      </div>
    </div>
  );
}

function PlayersSectionSkeleton({ rows }: { rows: number }) {
  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      </CardHeader>
      <div className="px-6 pb-6 space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
