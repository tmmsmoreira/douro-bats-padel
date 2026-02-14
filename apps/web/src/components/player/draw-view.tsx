"use client"

import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PlayerNav } from "./player-nav"
import { Footer } from "@/components/footer"

export function DrawView({ eventId }: { eventId: string }) {
  const { data: draw, isLoading } = useQuery({
    queryKey: ["draw", eventId],
    queryFn: () => apiClient.get(`/draws/events/${eventId}`),
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <PlayerNav />
        <main className="container mx-auto px-4 py-8 flex-1 max-w-4xl">
          <div className="text-center py-8">Loading draw...</div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!draw) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <PlayerNav />
        <main className="container mx-auto px-4 py-8 flex-1 max-w-4xl">
          <div className="text-center py-8">Draw not available yet</div>
        </main>
        <Footer />
      </div>
    )
  }

  // Group assignments by round
  const rounds = draw.assignments.reduce((acc: any, assignment: any) => {
    if (!acc[assignment.round]) {
      acc[assignment.round] = []
    }
    acc[assignment.round].push(assignment)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PlayerNav />
      <main className="container mx-auto px-4 py-8 flex-1 max-w-4xl">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Game Draw</h1>
            <p className="text-muted-foreground">Court assignments and matchups</p>
          </div>

          {Object.entries(rounds).map(([round, assignments]: [string, any]) => (
            <Card key={round}>
              <CardHeader>
                <CardTitle>Round {round}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {assignments.map((assignment: any) => (
                    <div key={assignment.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="outline">{assignment.court?.label || `Court ${assignment.courtId}`}</Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Team A</p>
                          {assignment.teamA.map((player: any) => (
                            <div key={player.id} className="flex items-center justify-between">
                              <span className="text-sm">{player.name}</span>
                              <Badge variant="secondary" className="text-xs">
                                {player.tier}
                              </Badge>
                            </div>
                          ))}
                        </div>
                        <div className="text-center font-bold text-muted-foreground">vs</div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Team B</p>
                          {assignment.teamB.map((player: any) => (
                            <div key={player.id} className="flex items-center justify-between">
                              <span className="text-sm">{player.name}</span>
                              <Badge variant="secondary" className="text-xs">
                                {player.tier}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}
