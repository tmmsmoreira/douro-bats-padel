"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDate, formatTime } from "@/lib/utils"
import Link from "next/link"
import type { EventWithRSVP } from "@padel/types"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

export function EventsList() {
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const { data: events, isLoading } = useQuery({
    queryKey: ["events", session?.accessToken],
    queryFn: async () => {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      }

      // Include auth token if user is logged in
      if (session?.accessToken) {
        headers.Authorization = `Bearer ${session.accessToken}`
      }

      const res = await fetch(`${API_URL}/events`, { headers })

      if (!res.ok) {
        throw new Error(`API Error: ${res.statusText}`)
      }

      return res.json() as Promise<EventWithRSVP[]>
    },
  })

  const rsvpMutation = useMutation({
    mutationFn: async ({ eventId, status }: { eventId: string; status: "IN" | "OUT" }) => {
      if (!session?.accessToken) {
        throw new Error("Not authenticated")
      }

      const res = await fetch(`${API_URL}/events/${eventId}/rsvp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({ status }),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: res.statusText }))
        throw new Error(errorData.message || `API Error: ${res.statusText}`)
      }

      return res.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["events"] })
      setFeedbackMessage({ type: "success", text: data.message || "RSVP updated successfully" })
      setTimeout(() => setFeedbackMessage(null), 5000)
    },
    onError: (error: Error) => {
      setFeedbackMessage({ type: "error", text: error.message || "Failed to update RSVP" })
      setTimeout(() => setFeedbackMessage(null), 5000)
    },
  })

  if (isLoading) {
    return <div className="text-center py-8">Loading events...</div>
  }

  if (!events || events.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No upcoming events available.
        </CardContent>
      </Card>
    )
  }

  const handleRSVP = (eventId: string, status: "IN" | "OUT") => {
    rsvpMutation.mutate({ eventId, status })
  }

  return (
    <div className="space-y-4">
      {feedbackMessage && (
        <div
          className={`p-4 rounded-lg border ${
            feedbackMessage.type === "success"
              ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-200"
              : "bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-200"
          }`}
        >
          {feedbackMessage.text}
        </div>
      )}
      <div className="grid gap-4">
      {events.map((event) => {
        const userStatus = event.userRSVP?.status
        const isConfirmed = userStatus === "CONFIRMED"
        const isWaitlisted = userStatus === "WAITLISTED"
        const isFull = event.confirmedCount >= event.capacity
        const canRegister =
          session &&
          new Date() >= new Date(event.rsvpOpensAt) &&
          new Date() <= new Date(event.rsvpClosesAt)

        // Debug logging
        if (session && process.env.NODE_ENV === "development") {
          console.log(`Event ${event.id}:`, {
            userRSVP: event.userRSVP,
            isConfirmed,
            isWaitlisted,
            isFull,
            canRegister,
          })
        }

        return (
          <Card key={event.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle>{event.title || "Game Night"}</CardTitle>
                  <CardDescription>
                    {formatDate(event.date)} • {formatTime(event.startsAt)} - {formatTime(event.endsAt)}
                  </CardDescription>
                  {event.venue && <p className="text-sm text-muted-foreground mt-1">{event.venue.name}</p>}
                </div>
                <div className="flex flex-col items-end gap-2">
                  {isConfirmed && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">Registered ✓</span>
                      <Badge variant="default">Confirmed</Badge>
                    </div>
                  )}
                  {isWaitlisted && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-orange-600 dark:text-orange-400">Registered</span>
                      <Badge variant="secondary">Waitlisted #{event.userRSVP?.position}</Badge>
                    </div>
                  )}
                </div>
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
                  {session ? (
                    <>
                      {canRegister && !isConfirmed && !isWaitlisted && (
                        <Button
                          size="sm"
                          onClick={() => handleRSVP(event.id, "IN")}
                          disabled={rsvpMutation.isPending}
                        >
                          {isFull ? "Register to Waitlist" : "Register"}
                        </Button>
                      )}
                      {(isConfirmed || isWaitlisted) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRSVP(event.id, "OUT")}
                          disabled={rsvpMutation.isPending}
                        >
                          Cancel
                        </Button>
                      )}
                    </>
                  ) : (
                    <Link href="/login">
                      <Button size="sm">Sign In to Register</Button>
                    </Link>
                  )}
                  {event.state === "DRAWN" && (
                    <Link href={`/events/${event.id}/draw`}>
                      <Button size="sm" variant="outline">
                        View Draw
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
      </div>
    </div>
  )
}

