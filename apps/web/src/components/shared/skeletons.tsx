import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function LeaderboardSkeleton() {
  return (
    <div className="space-y-6" aria-hidden>
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="glass-card overflow-hidden">
            <Skeleton className="h-1 w-full rounded-none" />
            <CardContent className="p-4 md:p-6 space-y-3">
              <div className="flex justify-center">
                <Skeleton className="h-12 w-12 md:h-16 md:w-16 rounded-full" />
              </div>
              <div className="flex justify-center">
                <Skeleton className="h-6 w-6 md:h-8 md:w-8 rounded" />
              </div>
              <Skeleton className="h-4 w-3/4 mx-auto" />
              <Skeleton className="h-8 w-1/2 mx-auto" />
              <Skeleton className="h-3 w-1/2 mx-auto" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="glass-card">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-md">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
              </div>
              <Skeleton className="h-6 w-12" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export function VenuesListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="glass-card">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-start gap-4">
              <Skeleton className="h-16 w-16 rounded-md shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-9 w-9 rounded-md" />
                <Skeleton className="h-9 w-9 rounded-md" />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap pt-2 border-t">
              {Array.from({ length: 4 }).map((_, j) => (
                <Skeleton key={j} className="h-6 w-20 rounded-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
