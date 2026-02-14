"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Mail, CheckCircle, XCircle } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

interface Player {
  id: string
  email: string
  name: string | null
  profilePhoto: string | null
  emailVerified: boolean
  createdAt: string
  player: {
    id: string
    rating: number
    tier: string // Still exists in DB but not displayed (used only for event organization)
    status: string
    createdAt: string
  } | null
}

export function PlayersList() {
  const { data: players, isLoading } = useQuery<Player[]>({
    queryKey: ["players"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/players`)
      if (!res.ok) throw new Error("Failed to fetch players")
      return res.json()
    },
  })

  if (isLoading) {
    return <div className="text-center py-8">Loading players...</div>
  }

  if (!players || players.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">No players found.</CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4">
      {players.map((player) => (
        <Card key={player.id}>
          <CardHeader>
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={player.profilePhoto || undefined} alt={player.name || player.email} />
                <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                  {player.name
                    ? player.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)
                    : player.email[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="flex items-center gap-2">
                  {player.name || "No name"}
                  {player.emailVerified ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                  )}
                </CardTitle>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <Mail className="h-3 w-3" />
                  {player.email}
                </div>
              </div>
              {player.player && (
                <div className="flex flex-col items-end gap-2">
                  <div className="text-2xl font-bold text-primary">{player.player.rating}</div>
                  <div className="text-xs text-muted-foreground">Rating</div>
                </div>
              )}
            </div>
          </CardHeader>
          {player.player && (
            <CardContent>
              <div className="flex gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Status:</span>{" "}
                  <Badge variant={player.player.status === "ACTIVE" ? "default" : "secondary"}>{player.player.status}</Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Player since:</span>{" "}
                  {new Date(player.player.createdAt).toLocaleDateString()}
                </div>
                <div>
                  <span className="text-muted-foreground">Account created:</span> {new Date(player.createdAt).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  )
}

