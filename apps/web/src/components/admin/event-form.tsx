"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { CreateEventDto } from "@padel/types"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

export function EventForm() {
  const { data: session } = useSession()
  const router = useRouter()
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState({
    title: "",
    date: "",
    startsAt: "",
    endsAt: "",
    capacity: "24",
    rsvpOpensAt: "",
    rsvpClosesAt: "",
  })

  const createMutation = useMutation({
    mutationFn: async (data: CreateEventDto) => {
      if (!session?.accessToken) {
        throw new Error("Not authenticated")
      }

      const res = await fetch(`${API_URL}/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: res.statusText }))
        throw new Error(errorData.message || `API Error: ${res.statusText}`)
      }

      return res.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] })
      router.push(`/admin/events/${data.id}`)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Combine date and time for startsAt and endsAt
    const eventDate = new Date(formData.date)
    const [startHours, startMinutes] = formData.startsAt.split(":")
    const [endHours, endMinutes] = formData.endsAt.split(":")

    const startsAt = new Date(eventDate)
    startsAt.setHours(parseInt(startHours), parseInt(startMinutes))

    const endsAt = new Date(eventDate)
    endsAt.setHours(parseInt(endHours), parseInt(endMinutes))

    // Parse RSVP dates
    const rsvpOpensAt = new Date(formData.rsvpOpensAt)
    const rsvpClosesAt = new Date(formData.rsvpClosesAt)

    const dto: CreateEventDto = {
      title: formData.title,
      date: eventDate,
      startsAt,
      endsAt,
      capacity: parseInt(formData.capacity),
      rsvpOpensAt,
      rsvpClosesAt,
    }

    createMutation.mutate(dto)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Event</CardTitle>
        <CardDescription>Fill in the details to create a new game night</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Event Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Friday Night - Explorers & Masters"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Event Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startsAt">Start Time</Label>
              <Input
                id="startsAt"
                type="time"
                value={formData.startsAt}
                onChange={(e) => setFormData({ ...formData, startsAt: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endsAt">End Time</Label>
              <Input
                id="endsAt"
                type="time"
                value={formData.endsAt}
                onChange={(e) => setFormData({ ...formData, endsAt: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rsvpOpensAt">RSVP Opens At</Label>
              <Input
                id="rsvpOpensAt"
                type="datetime-local"
                value={formData.rsvpOpensAt}
                onChange={(e) => setFormData({ ...formData, rsvpOpensAt: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rsvpClosesAt">RSVP Closes At</Label>
              <Input
                id="rsvpClosesAt"
                type="datetime-local"
                value={formData.rsvpClosesAt}
                onChange={(e) => setFormData({ ...formData, rsvpClosesAt: e.target.value })}
                required
              />
            </div>
          </div>

          {createMutation.isError && (
            <div className="text-sm text-destructive">
              Error: {(createMutation.error as Error).message}
            </div>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create Event"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/admin")}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}


