import { Card, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function ResultsSkeleton() {
  return (
    <div className="space-y-6" aria-hidden>
      <div className="flex items-center justify-between gap-2">
        <Skeleton className="h-5 w-40" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24 rounded-lg" />
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <div className="px-6 pb-6 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <MatchRowSkeleton key={i} />
          ))}
        </div>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <div className="px-6 pb-6 space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <MatchRowSkeleton key={i} />
          ))}
        </div>
      </Card>
    </div>
  );
}

export function PlayerResultsSkeleton() {
  return (
    <div className="space-y-4" aria-hidden>
      {Array.from({ length: 2 }).map((_, i) => (
        <Card key={i} className="glass-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-5 w-28" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}

function MatchRowSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-md border p-3">
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
      <Skeleton className="h-9 w-14 rounded-md" />
      <Skeleton className="h-4 w-3" />
      <Skeleton className="h-9 w-14 rounded-md" />
    </div>
  );
}
