"use client"

import { useSession } from "next-auth/react"
import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function PlayerProfile() {
  const { data: session } = useSession()

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () => apiClient.get("/auth/me"),
    enabled: !!session,
  })

  if (isLoading) {
    return <div className="text-center py-8">Loading profile...</div>
  }

  if (!profile) {
    return <div className="text-center py-8">Profile not found</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground">Your player stats and history</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Player Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="text-lg font-medium">{profile.name || "Not set"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="text-lg font-medium">{profile.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Role</p>
              <div className="flex gap-2 mt-1">
                {profile.roles?.map((role: string) => (
                  <Badge key={role} variant="outline">
                    {role}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Stats</CardTitle>
            <CardDescription>Based on last 5 weeks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Current Rating</p>
              <p className="text-3xl font-bold">{profile.player?.rating || 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tier</p>
              <Badge
                variant={profile.player?.tier === "MASTERS" ? "default" : "secondary"}
                className="text-lg px-3 py-1"
              >
                {profile.player?.tier || "EXPLORERS"}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant="outline">{profile.player?.status || "ACTIVE"}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
