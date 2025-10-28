"use client"

import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDate, formatTime } from "@/lib/utils"
import Link from "next/link"
import type { EventWithRSVP } from "@padel/types"

export function EventsList() {
  const { data: events, isLoading } = useQuery({
    queryKey: ["admin-events"],
    queryFn: () => apiClient.get<EventWithRSVP[]>("/events"),
  })

  if (isLoading) {
    return <div className="text-center py-8">Loading events...</div>
  }

  if (!events || events.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No events found. Create your first event to get started.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4">
      {events.map((event) => (
        <Card key={event.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>{event.title || "Untitled Event"}</CardTitle>
                <CardDescription>
                  {formatDate(event.date)} • {formatTime(event.startsAt)} - {formatTime(event.endsAt)}
                </CardDescription>
              </div>
              <Badge variant={event.state === "PUBLISHED" ? "default" : "secondary"}>{event.state}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex gap-4 text-sm">
                <span>
                  <strong>{event.confirmedCount}</strong> / {event.capacity} confirmed
                </span>
                {event.waitlistCount > 0 && (
                  <span className="text-muted-foreground">{event.waitlistCount} waitlisted</span>
                )}
              </div>
              <div className="flex gap-2">
                <Link href={`/admin/events/${event.id}`}>
                  <Button variant="outline" size="sm">
                    Manage
                  </Button>
                </Link>
                {event.state === "FROZEN" && (
                  <Link href={`/admin/events/${event.id}/draw`}>
                    <Button size="sm">Generate Draw</Button>
                  </Link>
                )}
                {event.state === "DRAWN" && (
                  <Link href={`/admin/events/${event.id}/results`}>
                    <Button size="sm">Enter Results</Button>
                  </Link>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
