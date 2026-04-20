import { Card, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function DrawSkeleton() {
  return (
    <div className="space-y-4" aria-hidden>
      <TierSectionSkeleton />
      <TierSectionSkeleton />
    </div>
  );
}

function TierSectionSkeleton() {
  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-5 w-32" />
          </div>
          <Skeleton className="h-5 w-20" />
        </div>
      </CardHeader>
      <div className="px-6 pb-6 space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-md border p-3 flex items-center justify-between gap-3">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-8 w-16 rounded-md" />
          </div>
        ))}
      </div>
    </Card>
  );
}
