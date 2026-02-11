"use client"

import { useState, useEffect } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { TimePicker } from "@/components/ui/time-picker"
import { DateTimePicker } from "@/components/ui/datetime-picker"
import type { CreateEventDto } from "@padel/types"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

interface Venue {
  id: string
  name: string
  address?: string
  courts: Court[]
}

interface Court {
  id: string
  label: string
  venueId: string
}

export function EventForm() {
  const { data: session } = useSession()
  const router = useRouter()
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState<{
    title: string
    date?: Date
    startsAt?: Date
    endsAt?: Date
    capacity: string
    rsvpOpensAt?: Date
    rsvpClosesAt?: Date
    venueId: string
    courtIds: string[]
  }>({
    title: "",
    date: undefined,
    startsAt: undefined,
    endsAt: undefined,
    capacity: "0",
    rsvpOpensAt: undefined,
    rsvpClosesAt: undefined,
    venueId: "",
    courtIds: [],
  })

  // Fetch venues with courts
  const { data: venues, isLoading: venuesLoading } = useQuery<Venue[]>({
    queryKey: ["venues"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/venues`)
      if (!res.ok) throw new Error("Failed to fetch venues")
      return res.json()
    },
  })

  const selectedVenue = venues?.find((v) => v.id === formData.venueId)

  // Auto-calculate capacity based on number of courts selected (4 players per court)
  useEffect(() => {
    const calculatedCapacity = formData.courtIds.length * 4
    setFormData((prev) => ({
      ...prev,
      capacity: calculatedCapacity.toString(),
    }))
  }, [formData.courtIds.length])

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

    // Validation
    if (!formData.venueId) {
      alert("Please select a venue")
      return
    }
    if (formData.courtIds.length === 0) {
      alert("Please select at least one court")
      return
    }
    if (!formData.date) {
      alert("Please select an event date")
      return
    }
    if (!formData.startsAt) {
      alert("Please select a start time")
      return
    }
    if (!formData.endsAt) {
      alert("Please select an end time")
      return
    }
    if (!formData.rsvpOpensAt) {
      alert("Please select RSVP opens date/time")
      return
    }
    if (!formData.rsvpClosesAt) {
      alert("Please select RSVP closes date/time")
      return
    }

    // Combine date and time for startsAt and endsAt
    const eventDate = new Date(formData.date)

    const startsAt = new Date(eventDate)
    startsAt.setHours(formData.startsAt.getHours(), formData.startsAt.getMinutes())

    const endsAt = new Date(eventDate)
    endsAt.setHours(formData.endsAt.getHours(), formData.endsAt.getMinutes())

    const dto: CreateEventDto = {
      title: formData.title,
      date: eventDate,
      startsAt,
      endsAt,
      venueId: formData.venueId,
      courtIds: formData.courtIds,
      capacity: parseInt(formData.capacity),
      rsvpOpensAt: formData.rsvpOpensAt,
      rsvpClosesAt: formData.rsvpClosesAt,
    }

    createMutation.mutate(dto)
  }

  const handleCourtToggle = (courtId: string) => {
    setFormData((prev) => ({
      ...prev,
      courtIds: prev.courtIds.includes(courtId)
        ? prev.courtIds.filter((id) => id !== courtId)
        : [...prev.courtIds, courtId],
    }))
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
              <DatePicker
                id="date"
                value={formData.date}
                onChange={(date) => setFormData({ ...formData, date })}
                placeholder="Select event date"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                type="number"
                value={formData.capacity}
                readOnly
                className="bg-muted cursor-not-allowed"
                required
              />
              <p className="text-xs text-muted-foreground">
                Auto-calculated: 4 players per court
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="venue">Venue</Label>
            {venuesLoading ? (
              <div className="text-sm text-muted-foreground">Loading venues...</div>
            ) : (
              <Select
                value={formData.venueId}
                onValueChange={(value) =>
                  setFormData({ ...formData, venueId: value, courtIds: [] })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a venue" />
                </SelectTrigger>
                <SelectContent>
                  {venues?.map((venue) => (
                    <SelectItem key={venue.id} value={venue.id}>
                      {venue.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {selectedVenue && selectedVenue.courts.length > 0 && (
            <div className="space-y-2">
              <Label>Courts (select at least one)</Label>
              <div className="grid grid-cols-2 gap-3 rounded-md border p-4">
                {selectedVenue.courts.map((court) => (
                  <div key={court.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`court-${court.id}`}
                      checked={formData.courtIds.includes(court.id)}
                      onCheckedChange={() => handleCourtToggle(court.id)}
                    />
                    <label
                      htmlFor={`court-${court.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {court.label}
                    </label>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                {formData.courtIds.length} court(s) selected
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startsAt">Start Time</Label>
              <TimePicker
                id="startsAt"
                value={formData.startsAt}
                onChange={(time) => setFormData({ ...formData, startsAt: time })}
                placeholder="Select start time"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endsAt">End Time</Label>
              <TimePicker
                id="endsAt"
                value={formData.endsAt}
                onChange={(time) => setFormData({ ...formData, endsAt: time })}
                placeholder="Select end time"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rsvpOpensAt">RSVP Opens At</Label>
              <DateTimePicker
                id="rsvpOpensAt"
                value={formData.rsvpOpensAt}
                onChange={(datetime) => setFormData({ ...formData, rsvpOpensAt: datetime })}
                placeholder="Select RSVP open date and time"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rsvpClosesAt">RSVP Closes At</Label>
              <DateTimePicker
                id="rsvpClosesAt"
                value={formData.rsvpClosesAt}
                onChange={(datetime) => setFormData({ ...formData, rsvpClosesAt: datetime })}
                placeholder="Select RSVP close date and time"
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


