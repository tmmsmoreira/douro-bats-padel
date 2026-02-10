"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { LeaderboardEntry } from "@padel/types"
import { ArrowUp, ArrowDown, Minus } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

export function Leaderboard() {
  const [tier, setTier] = useState<"MASTERS" | "EXPLORERS" | "ALL">("ALL")
  const { data: session } = useSession()

  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ["leaderboard", tier, session?.accessToken],
    queryFn: async () => {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      }

      // Include auth token if user is logged in
      if (session?.accessToken) {
        headers.Authorization = `Bearer ${session.accessToken}`
      }

      const tierParam = tier === "ALL" ? "" : `?tier=${tier}`
      const res = await fetch(`${API_URL}/rankings/leaderboard${tierParam}`, { headers })

      if (!res.ok) {
        throw new Error(`API Error: ${res.statusText}`)
      }

      return res.json() as Promise<LeaderboardEntry[]>
    },
  })

  if (isLoading) {
    return <div className="text-center py-8">Loading rankings...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button variant={tier === "ALL" ? "default" : "outline"} size="sm" onClick={() => setTier("ALL")}>
          All Players
        </Button>
        <Button variant={tier === "MASTERS" ? "default" : "outline"} size="sm" onClick={() => setTier("MASTERS")}>
          Masters
        </Button>
        <Button variant={tier === "EXPLORERS" ? "default" : "outline"} size="sm" onClick={() => setTier("EXPLORERS")}>
          Explorers
        </Button>
      </div>

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
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {entry.tier}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{entry.weeklyScores.length} weeks played</span>
                    </div>
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

