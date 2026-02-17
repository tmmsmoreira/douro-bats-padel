"use client"

import { useQuery } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { EventForm } from "@/components/admin/event-form"
import { use } from "react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

export default function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: eventId } = use(params)
  const { data: session } = useSession()

  const { data: event, isLoading } = useQuery({
    queryKey: ["event", eventId, session?.accessToken],
    queryFn: async () => {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      }

      if (session?.accessToken) {
        headers.Authorization = `Bearer ${session.accessToken}`
      }

      const res = await fetch(`${API_URL}/events/${eventId}?includeUnpublished=true`, { headers })

      if (!res.ok) {
        throw new Error(`API Error: ${res.statusText}`)
      }

      return res.json()
    },
    enabled: !!session?.accessToken,
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Edit Event</h1>
          <p className="text-muted-foreground">Loading event data...</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Edit Event</h1>
          <p className="text-muted-foreground text-destructive">Event not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Event</h1>
        <p className="text-muted-foreground">Update event information</p>
      </div>
      <EventForm eventId={eventId} initialData={event} />
    </div>
  )
}

