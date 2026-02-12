"use client"

import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PlayerNav } from "./player-nav"
import { Footer } from "@/components/footer"

export function ResultsView({ eventId }: { eventId: string }) {
  const { data: matches, isLoading } = useQuery({
    queryKey: ["matches", eventId],
    queryFn: () => apiClient.get(`/matches/events/${eventId}`),
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <PlayerNav />
        <main className="container mx-auto px-4 py-8 flex-1 max-w-4xl">
          <div className="text-center py-8">Loading results...</div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!matches || matches.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <PlayerNav />
        <main className="container mx-auto px-4 py-8 flex-1 max-w-4xl">
          <div className="text-center py-8">Results not available yet</div>
        </main>
        <Footer />
      </div>
    )
  }

  // Group by round
  const rounds = matches.reduce((acc: any, match: any) => {
    if (!acc[match.round]) {
      acc[match.round] = []
    }
    acc[match.round].push(match)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PlayerNav />
      <main className="container mx-auto px-4 py-8 flex-1 max-w-4xl">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Match Results</h1>
            <p className="text-muted-foreground">Final scores and outcomes</p>
          </div>

          {Object.entries(rounds).map(([round, roundMatches]: [string, any]) => (
            <Card key={round}>
              <CardHeader>
                <CardTitle>Round {round}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {roundMatches.map((match: any) => {
                    const teamAWon = match.setsA > match.setsB
                    const teamBWon = match.setsB > match.setsA
                    const tie = match.setsA === match.setsB

                    return (
                      <div key={match.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <Badge variant="outline">{match.court?.label || `Court ${match.courtId}`}</Badge>
                          <Badge variant="secondary">{match.tier}</Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                          <div className={`space-y-1 ${teamAWon ? "font-bold" : ""}`}>
                            <p className="text-sm font-medium">Team A</p>
                            {match.teamA?.map((player: any) => (
                              <p key={player.id} className="text-sm">
                                {player.name}
                              </p>
                            ))}
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold">
                              <span className={teamAWon ? "text-green-600" : ""}>{match.setsA}</span>
                              <span className="mx-2">-</span>
                              <span className={teamBWon ? "text-green-600" : ""}>{match.setsB}</span>
                            </div>
                            {tie && <p className="text-xs text-muted-foreground mt-1">Tie</p>}
                          </div>
                          <div className={`space-y-1 ${teamBWon ? "font-bold" : ""}`}>
                            <p className="text-sm font-medium">Team B</p>
                            {match.teamB?.map((player: any) => (
                              <p key={player.id} className="text-sm">
                                {player.name}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    )
                  })}
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
