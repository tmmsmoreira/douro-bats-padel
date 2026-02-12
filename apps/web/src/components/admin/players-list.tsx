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
    tier: string
    status: string
    createdAt: string
  } | null
}

const tierColors: Record<string, string> = {
  EXPLORERS: "bg-green-500/10 text-green-700 dark:text-green-400",
  NAVIGATORS: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  PIONEERS: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  CHAMPIONS: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
  LEGENDS: "bg-red-500/10 text-red-700 dark:text-red-400",
}

const tierLabels: Record<string, string> = {
  EXPLORERS: "Explorers",
  NAVIGATORS: "Navigators",
  PIONEERS: "Pioneers",
  CHAMPIONS: "Champions",
  LEGENDS: "Legends",
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
                  <Badge className={tierColors[player.player.tier] || ""}>{tierLabels[player.player.tier] || player.player.tier}</Badge>
                  <div className="text-sm font-medium">Rating: {player.player.rating}</div>
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

