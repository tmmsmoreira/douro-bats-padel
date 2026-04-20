import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function PlayersListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-4" aria-hidden>
      <div className="flex items-center gap-2 overflow-hidden">
        <Skeleton className="h-9 w-56 rounded-full shrink-0" />
        <Skeleton className="h-9 w-24 rounded-full shrink-0" />
        <Skeleton className="h-9 w-28 rounded-full shrink-0" />
        <Skeleton className="h-9 w-24 rounded-full shrink-0" />
      </div>
      <Card className="glass-card">
        <div className="divide-y divide-border">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export function PlayerProfileSkeleton() {
  return (
    <div className="space-y-6" aria-hidden>
      <Card className="glass-card">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-start gap-4">
            <Skeleton className="h-20 w-20 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
              <div className="flex gap-2 pt-1">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="text-center space-y-2">
                <Skeleton className="h-6 w-1/2 mx-auto" />
                <Skeleton className="h-3 w-3/4 mx-auto" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-40" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
