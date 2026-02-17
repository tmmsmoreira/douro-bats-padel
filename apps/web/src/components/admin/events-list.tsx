"use client"

import { useQuery } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDate, formatTime } from "@/lib/utils"
import Link from "next/link"
import type { EventWithRSVP } from "@padel/types"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

export function EventsList() {
  const { data: session } = useSession()
  const t = useTranslations("eventsList")

  const { data: events, isLoading } = useQuery({
    queryKey: ["admin-events", session?.accessToken],
    queryFn: async () => {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      }

      if (session?.accessToken) {
        headers.Authorization = `Bearer ${session.accessToken}`
      }

      // Add includeUnpublished=true query parameter for admin view
      const res = await fetch(`${API_URL}/events?includeUnpublished=true`, { headers })

      if (!res.ok) {
        throw new Error(`API Error: ${res.statusText}`)
      }

      return res.json() as Promise<EventWithRSVP[]>
    },
  })

  if (isLoading) {
    return <div className="text-center py-8">{t("loadingEvents")}</div>
  }

  if (!events || events.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          {t("noEventsFound")}
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
                <CardTitle>{event.title || t("untitledEvent")}</CardTitle>
                <CardDescription>
                  {formatDate(event.date)} • {formatTime(event.startsAt)} - {formatTime(event.endsAt)}
                </CardDescription>
              </div>
              <Badge variant={event.state === "PUBLISHED" ? "default" : "secondary"}>{event.state}</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              <div className="flex gap-4 text-sm">
                <span>
                  <strong>{event.confirmedCount}</strong> / {event.capacity} {t("confirmed")}
                </span>
                {event.waitlistCount > 0 && (
                  <span className="text-muted-foreground">{event.waitlistCount} {t("waitlisted")}</span>
                )}
              </div>
              <div className="flex gap-2">
                <Link href={`/admin/events/${event.id}`}>
                  <Button variant="outline" size="sm">
                    {t("manage")}
                  </Button>
                </Link>
                {event.state === "FROZEN" && (
                  <Link href={`/admin/events/${event.id}/draw`}>
                    <Button size="sm">{t("generateDraw")}</Button>
                  </Link>
                )}
                {event.state === "DRAWN" && (
                  <Link href={`/admin/events/${event.id}/results`}>
                    <Button size="sm">{t("enterResults")}</Button>
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
