"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatDate, formatTime } from "@/lib/utils"
import Link from "next/link"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

export function EventDetails({ eventId }: { eventId: string }) {
  const { data: session } = useSession()
  const queryClient = useQueryClient()

  const { data: event, isLoading } = useQuery({
    queryKey: ["event", eventId, session?.accessToken],
    queryFn: async () => {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      }

      if (session?.accessToken) {
        headers.Authorization = `Bearer ${session.accessToken}`
      }

      // Add includeUnpublished=true query parameter for admin view
      const res = await fetch(`${API_URL}/events/${eventId}?includeUnpublished=true`, { headers })

      if (!res.ok) {
        throw new Error(`API Error: ${res.statusText}`)
      }

      return res.json()
    },
  })

  const freezeMutation = useMutation({
    mutationFn: async () => {
      if (!session?.accessToken) {
        throw new Error("Not authenticated")
      }

      const res = await fetch(`${API_URL}/events/${eventId}/freeze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
      })

      if (!res.ok) {
        throw new Error(`API Error: ${res.statusText}`)
      }

      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event", eventId] })
    },
  })

  const publishMutation = useMutation({
    mutationFn: async () => {
      if (!session?.accessToken) {
        throw new Error("Not authenticated")
      }

      const res = await fetch(`${API_URL}/events/${eventId}/publish`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
      })

      if (!res.ok) {
        throw new Error(`API Error: ${res.statusText}`)
      }

      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event", eventId] })
    },
  })

  if (isLoading) {
    return <div className="text-center py-8">Loading event...</div>
  }

  if (!event) {
    return <div className="text-center py-8">Event not found</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{event.title || "Untitled Event"}</h1>
          <p className="text-muted-foreground">
            {formatDate(event.date)} • {formatTime(event.startsAt)} - {formatTime(event.endsAt)}
          </p>
        </div>
        <div className="flex gap-2">
          {event.state === "DRAFT" && <Button onClick={() => publishMutation.mutate()}>Publish Event</Button>}
          {event.state === "OPEN" && <Button onClick={() => freezeMutation.mutate()}>Freeze RSVPs</Button>}
          {event.state === "FROZEN" && (
            <Link href={`/admin/events/${eventId}/draw`}>
              <Button>Generate Draw</Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Confirmed Players ({event.confirmedCount})</CardTitle>
            <CardDescription>{event.capacity - event.confirmedCount} spots remaining</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {event.confirmedPlayers?.map((player: any) => (
                <div key={player.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <span>{player.name}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{player.tier}</Badge>
                    <span className="text-sm text-muted-foreground">{player.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Waitlist ({event.waitlistCount})</CardTitle>
            <CardDescription>Players waiting for a spot</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {event.waitlistedPlayers?.map((player: any) => (
                <div key={player.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">#{player.position}</Badge>
                    <span>{player.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{player.tier}</Badge>
                    <span className="text-sm text-muted-foreground">{player.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
