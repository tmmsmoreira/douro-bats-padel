"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, CheckCircle, XCircle, Search } from "lucide-react"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { useState, useMemo } from "react"

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
  const t = useTranslations("playersList")
  const [searchQuery, setSearchQuery] = useState("")

  const { data: players, isLoading } = useQuery<Player[]>({
    queryKey: ["players"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/players`)
      if (!res.ok) throw new Error("Failed to fetch players")
      return res.json()
    },
  })

  // Filter players based on search query
  const filteredPlayers = useMemo(() => {
    if (!players) return []
    if (!searchQuery.trim()) return players

    const query = searchQuery.toLowerCase()
    return players.filter((player) => {
      const name = player.name?.toLowerCase() || ""
      const email = player.email.toLowerCase()
      return name.includes(query) || email.includes(query)
    })
  }, [players, searchQuery])

  if (isLoading) {
    return <div className="text-center py-8">{t("loadingPlayers")}</div>
  }

  if (!players || players.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">{t("noPlayersFound")}</CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={t("searchPlayers")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Players List */}
      {filteredPlayers.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {t("noPlayersMatchSearch")}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredPlayers.map((player) => (
        <Link key={player.id} href={`/players/${player.id}`} className="block">
          <Card className="transition-all hover:shadow-md hover:border-primary/50 cursor-pointer">
            <CardHeader>
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16 shrink-0">
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
                <div className="flex-1 min-w-0">
                  <CardTitle className="flex items-center gap-2 flex-wrap">
                    {player.name || t("noName")}
                    {player.emailVerified ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground" />
                    )}
                  </CardTitle>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <Mail className="h-3 w-3 shrink-0" />
                    <span className="truncate">{player.email}</span>
                  </div>
                </div>
                {player.player && (
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <div className="text-2xl font-bold text-primary">{player.player.rating}</div>
                    <div className="text-xs text-muted-foreground">{t("rating")}</div>
                  </div>
                )}
              </div>
            </CardHeader>
            {player.player && (
              <CardContent className="pt-0">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">{t("status")}:</span>{" "}
                    <Badge variant={player.player.status === "ACTIVE" ? "default" : "secondary"}>{player.player.status}</Badge>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t("playerSince")}:</span>{" "}
                    {new Date(player.player.createdAt).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t("accountCreated")}:</span> {new Date(player.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </Link>
          ))}
        </div>
      )}
    </div>
  )
}

