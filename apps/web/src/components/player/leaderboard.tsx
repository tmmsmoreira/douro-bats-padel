"use client"

import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { LeaderboardEntry } from "@padel/types"
import { ArrowUp, ArrowDown, Minus } from "lucide-react"

export function Leaderboard() {
  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: () => {
      return apiClient.get<LeaderboardEntry[]>(`/rankings/leaderboard`)
    },
  })

  if (isLoading) {
    return <div className="text-center py-8">Loading rankings...</div>
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {leaderboard?.map((entry, index) => (
              <div
                key={entry.playerId}
                className="flex items-center justify-between py-3 px-4 border rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-bold text-muted-foreground w-8">#{index + 1}</span>
                  <div>
                    <p className="font-medium">{entry.playerName}</p>
                    <p className="text-xs text-muted-foreground mt-1">{entry.weeklyScores.length} weeks played</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold">{entry.rating}</p>
                    <div className="flex items-center gap-1 text-sm">
                      {entry.delta > 0 && (
                        <>
                          <ArrowUp className="h-3 w-3 text-green-600" />
                          <span className="text-green-600">+{entry.delta}</span>
                        </>
                      )}
                      {entry.delta < 0 && (
                        <>
                          <ArrowDown className="h-3 w-3 text-red-600" />
                          <span className="text-red-600">{entry.delta}</span>
                        </>
                      )}
                      {entry.delta === 0 && (
                        <>
                          <Minus className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">0</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
