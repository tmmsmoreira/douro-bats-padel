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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { TimePicker } from "@/components/ui/time-picker"
import { DateTimePicker } from "@/components/ui/datetime-picker"
import type { CreateEventDto, TierRules, TierTimeSlot } from "@padel/types"

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
    capacity: string
    rsvpOpensAt?: Date
    rsvpClosesAt?: Date
    venueId: string
    tierRuleType: "auto" | "count" | "percentage"
    masterCount: string
    masterPercentage: string
    mastersStartTime?: Date
    mastersEndTime?: Date
    mastersCourtIds: string[]
    explorersStartTime?: Date
    explorersEndTime?: Date
    explorersCourtIds: string[]
  }>({
    title: "",
    date: undefined,
    capacity: "0",
    rsvpOpensAt: undefined,
    rsvpClosesAt: undefined,
    venueId: "",
    tierRuleType: "auto",
    masterCount: "",
    masterPercentage: "",
    mastersStartTime: undefined,
    mastersEndTime: undefined,
    mastersCourtIds: [],
    explorersStartTime: undefined,
    explorersEndTime: undefined,
    explorersCourtIds: [],
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

  // Auto-calculate capacity based on time slot court assignments
  // Capacity = max players that can play across all time slots
  useEffect(() => {
    // Use unique courts from both time slots
    const allTimeSlotCourts = new Set([...formData.mastersCourtIds, ...formData.explorersCourtIds])
    const totalCourts = allTimeSlotCourts.size

    const calculatedCapacity = totalCourts * 4
    setFormData((prev) => ({
      ...prev,
      capacity: calculatedCapacity.toString(),
    }))
  }, [formData.mastersCourtIds.length, formData.explorersCourtIds.length])

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
    if (!formData.date) {
      alert("Please select an event date")
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

    // Validate time slots are provided
    if (!formData.mastersStartTime || !formData.mastersEndTime) {
      alert("Please configure MASTERS time slot (start and end time)")
      return
    }
    if (formData.mastersCourtIds.length === 0) {
      alert("Please select at least one court for MASTERS time slot")
      return
    }
    if (!formData.explorersStartTime || !formData.explorersEndTime) {
      alert("Please configure EXPLORERS time slot (start and end time)")
      return
    }
    if (formData.explorersCourtIds.length === 0) {
      alert("Please select at least one court for EXPLORERS time slot")
      return
    }

    // Derive overall event start/end times from time slots
    const eventDate = new Date(formData.date)

    // Find the earliest start time and latest end time from both time slots
    const mastersStart = new Date(eventDate)
    mastersStart.setHours(formData.mastersStartTime.getHours(), formData.mastersStartTime.getMinutes())

    const mastersEnd = new Date(eventDate)
    mastersEnd.setHours(formData.mastersEndTime.getHours(), formData.mastersEndTime.getMinutes())

    const explorersStart = new Date(eventDate)
    explorersStart.setHours(formData.explorersStartTime.getHours(), formData.explorersStartTime.getMinutes())

    const explorersEnd = new Date(eventDate)
    explorersEnd.setHours(formData.explorersEndTime.getHours(), formData.explorersEndTime.getMinutes())

    const startsAt = mastersStart < explorersStart ? mastersStart : explorersStart
    const endsAt = mastersEnd > explorersEnd ? mastersEnd : explorersEnd

    // Build tier rules based on selection
    let tierRules: TierRules | undefined = undefined
    if (formData.tierRuleType === "count") {
      const masterCount = parseInt(formData.masterCount)
      if (isNaN(masterCount) || masterCount < 0) {
        alert("Please enter a valid master count (non-negative number)")
        return
      }
      if (masterCount > parseInt(formData.capacity)) {
        alert(`Master count (${masterCount}) cannot exceed event capacity (${formData.capacity})`)
        return
      }
      tierRules = { masterCount }
    } else if (formData.tierRuleType === "percentage") {
      const masterPercentage = parseFloat(formData.masterPercentage)
      if (isNaN(masterPercentage) || masterPercentage < 0 || masterPercentage > 100) {
        alert("Please enter a valid master percentage (0-100)")
        return
      }
      tierRules = { masterPercentage }
    }

    // Add time slot information (always required now)
    if (!tierRules) {
      tierRules = {}
    }

    // Add MASTERS time slot
    const mastersStartTime = `${String(formData.mastersStartTime.getHours()).padStart(2, "0")}:${String(formData.mastersStartTime.getMinutes()).padStart(2, "0")}`
    const mastersEndTime = `${String(formData.mastersEndTime.getHours()).padStart(2, "0")}:${String(formData.mastersEndTime.getMinutes()).padStart(2, "0")}`
    tierRules.mastersTimeSlot = {
      startsAt: mastersStartTime,
      endsAt: mastersEndTime,
      courtIds: formData.mastersCourtIds,
    }

    // Add EXPLORERS time slot
    const explorersStartTime = `${String(formData.explorersStartTime.getHours()).padStart(2, "0")}:${String(formData.explorersStartTime.getMinutes()).padStart(2, "0")}`
    const explorersEndTime = `${String(formData.explorersEndTime.getHours()).padStart(2, "0")}:${String(formData.explorersEndTime.getMinutes()).padStart(2, "0")}`
    tierRules.explorersTimeSlot = {
      startsAt: explorersStartTime,
      endsAt: explorersEndTime,
      courtIds: formData.explorersCourtIds,
    }

    // Collect all unique court IDs from time slots
    const allCourtIds = Array.from(new Set([...formData.mastersCourtIds, ...formData.explorersCourtIds]))

    const dto: CreateEventDto = {
      title: formData.title,
      date: eventDate,
      startsAt,
      endsAt,
      venueId: formData.venueId,
      courtIds: allCourtIds,
      capacity: parseInt(formData.capacity),
      rsvpOpensAt: formData.rsvpOpensAt,
      rsvpClosesAt: formData.rsvpClosesAt,
      tierRules,
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
                  setFormData({ ...formData, venueId: value, mastersCourtIds: [], explorersCourtIds: [] })
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

          <div className="space-y-4 rounded-lg border p-4 bg-muted/50">
            <div className="space-y-2">
              <Label>Tier Assignment Rules</Label>
              <p className="text-sm text-muted-foreground">
                Configure how players are split into MASTERS and EXPLORERS tiers based on their ratings
              </p>
            </div>

            <RadioGroup
              value={formData.tierRuleType}
              onValueChange={(value: "auto" | "count" | "percentage") =>
                setFormData({ ...formData, tierRuleType: value })
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="auto" id="tier-auto" />
                <Label htmlFor="tier-auto" className="font-normal cursor-pointer">
                  Auto (50/50 split) - Top 50% of players assigned to MASTERS
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <RadioGroupItem value="count" id="tier-count" />
                <Label htmlFor="tier-count" className="font-normal cursor-pointer">
                  Fixed Count - Specify exact number of MASTERS players
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <RadioGroupItem value="percentage" id="tier-percentage" />
                <Label htmlFor="tier-percentage" className="font-normal cursor-pointer">
                  Percentage - Specify percentage of players for MASTERS tier
                </Label>
              </div>
            </RadioGroup>

            {formData.tierRuleType === "count" && (
              <div className="space-y-2 ml-6">
                <Label htmlFor="masterCount">Number of MASTERS Players</Label>
                <Input
                  id="masterCount"
                  type="number"
                  min="0"
                  max={formData.capacity}
                  value={formData.masterCount}
                  onChange={(e) => setFormData({ ...formData, masterCount: e.target.value })}
                  placeholder="e.g., 12"
                />
                <p className="text-xs text-muted-foreground">
                  Top {formData.masterCount || "X"} rated players will be assigned to MASTERS tier
                </p>
              </div>
            )}

            {formData.tierRuleType === "percentage" && (
              <div className="space-y-2 ml-6">
                <Label htmlFor="masterPercentage">MASTERS Percentage (%)</Label>
                <Input
                  id="masterPercentage"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={formData.masterPercentage}
                  onChange={(e) => setFormData({ ...formData, masterPercentage: e.target.value })}
                  placeholder="e.g., 40"
                />
                <p className="text-xs text-muted-foreground">
                  Top {formData.masterPercentage || "X"}% of players will be assigned to MASTERS tier
                </p>
              </div>
            )}

            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-2">
                <Label className="text-base">Time Slots & Court Assignment</Label>
                <p className="text-sm text-muted-foreground">
                  Configure when each tier plays and which courts are available. Both MASTERS and EXPLORERS time slots are required.
                </p>
              </div>

              <div className="space-y-3 p-3 rounded-lg border bg-card">
                <Label className="text-sm font-medium">MASTERS Time Slot</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="mastersStartTime" className="text-xs text-muted-foreground">
                      Start Time
                    </Label>
                    <TimePicker
                      id="mastersStartTime"
                      value={formData.mastersStartTime}
                      onChange={(time) => setFormData({ ...formData, mastersStartTime: time })}
                      placeholder="e.g., 8:00 PM"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mastersEndTime" className="text-xs text-muted-foreground">
                      End Time
                    </Label>
                    <TimePicker
                      id="mastersEndTime"
                      value={formData.mastersEndTime}
                      onChange={(time) => setFormData({ ...formData, mastersEndTime: time })}
                      placeholder="e.g., 9:30 PM"
                    />
                  </div>
                </div>

                {selectedVenue && selectedVenue.courts.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Courts Available</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedVenue.courts.map((court) => (
                        <div key={court.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`masters-court-${court.id}`}
                            checked={formData.mastersCourtIds.includes(court.id)}
                            onCheckedChange={(checked) => {
                              setFormData((prev) => ({
                                ...prev,
                                mastersCourtIds: checked
                                  ? [...prev.mastersCourtIds, court.id]
                                  : prev.mastersCourtIds.filter((id) => id !== court.id),
                              }))
                            }}
                          />
                          <label
                            htmlFor={`masters-court-${court.id}`}
                            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {court.label}
                          </label>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formData.mastersCourtIds.length} court(s) selected
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-3 p-3 rounded-lg border bg-card">
                <Label className="text-sm font-medium">EXPLORERS Time Slot</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="explorersStartTime" className="text-xs text-muted-foreground">
                      Start Time
                    </Label>
                    <TimePicker
                      id="explorersStartTime"
                      value={formData.explorersStartTime}
                      onChange={(time) => setFormData({ ...formData, explorersStartTime: time })}
                      placeholder="e.g., 9:30 PM"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="explorersEndTime" className="text-xs text-muted-foreground">
                      End Time
                    </Label>
                    <TimePicker
                      id="explorersEndTime"
                      value={formData.explorersEndTime}
                      onChange={(time) => setFormData({ ...formData, explorersEndTime: time })}
                      placeholder="e.g., 11:00 PM"
                    />
                  </div>
                </div>

                {selectedVenue && selectedVenue.courts.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Courts Available</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedVenue.courts.map((court) => (
                        <div key={court.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`explorers-court-${court.id}`}
                            checked={formData.explorersCourtIds.includes(court.id)}
                            onCheckedChange={(checked) => {
                              setFormData((prev) => ({
                                ...prev,
                                explorersCourtIds: checked
                                  ? [...prev.explorersCourtIds, court.id]
                                  : prev.explorersCourtIds.filter((id) => id !== court.id),
                              }))
                            }}
                          />
                          <label
                            htmlFor={`explorers-court-${court.id}`}
                            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {court.label}
                          </label>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formData.explorersCourtIds.length} court(s) selected
                    </p>
                  </div>
                )}
              </div>
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


