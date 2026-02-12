"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import type { CreateVenueDto } from "@padel/types"
import { X } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

export function VenueForm() {
  const { data: session } = useSession()
  const router = useRouter()
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState<{
    name: string
    address: string
    logo: string
    courts: string[]
  }>({
    name: "",
    address: "",
    logo: "",
    courts: [],
  })

  const [courtInput, setCourtInput] = useState("")

  const createMutation = useMutation({
    mutationFn: async (data: CreateVenueDto) => {
      if (!session?.accessToken) {
        throw new Error("Not authenticated")
      }

      const res = await fetch(`${API_URL}/venues`, {
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["venues"] })
      router.push("/admin/venues")
    },
  })

  const handleAddCourt = () => {
    const trimmedCourt = courtInput.trim()
    if (trimmedCourt && !formData.courts.includes(trimmedCourt)) {
      setFormData((prev) => ({
        ...prev,
        courts: [...prev.courts, trimmedCourt],
      }))
      setCourtInput("")
    }
  }

  const handleRemoveCourt = (courtToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      courts: prev.courts.filter((court) => court !== courtToRemove),
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      alert("Please enter a venue name")
      return
    }

    if (formData.courts.length === 0) {
      alert("Please add at least one court")
      return
    }

    const dto: CreateVenueDto = {
      name: formData.name.trim(),
      address: formData.address.trim() || undefined,
      logo: formData.logo.trim() || undefined,
      courts: formData.courts,
    }

    createMutation.mutate(dto)
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Venue Details</CardTitle>
          <CardDescription>Enter the venue information and add courts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Venue Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Clube Dorobats"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
              placeholder="e.g., Rua do Padel, 123, Lisboa"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo">Logo URL</Label>
            <Input
              id="logo"
              value={formData.logo}
              onChange={(e) => setFormData((prev) => ({ ...prev, logo: e.target.value }))}
              placeholder="e.g., https://example.com/logo.png"
              type="url"
            />
            {formData.logo && (
              <div className="mt-2">
                <p className="text-sm text-muted-foreground mb-2">Logo Preview:</p>
                <img
                  src={formData.logo}
                  alt="Venue logo preview"
                  className="h-16 w-16 object-contain border rounded"
                  onError={(e) => {
                    e.currentTarget.style.display = "none"
                  }}
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="court">Courts *</Label>
            <div className="flex gap-2">
              <Input
                id="court"
                value={courtInput}
                onChange={(e) => setCourtInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddCourt()
                  }
                }}
                placeholder="e.g., Court 1, Court A"
              />
              <Button type="button" onClick={handleAddCourt}>
                Add Court
              </Button>
            </div>
            {formData.courts.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.courts.map((court) => (
                  <Badge key={court} variant="secondary" className="flex items-center gap-1">
                    {court}
                    <button
                      type="button"
                      onClick={() => handleRemoveCourt(court)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => router.push("/admin/venues")}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create Venue"}
            </Button>
          </div>

          {createMutation.isError && (
            <div className="text-sm text-destructive">
              Error: {createMutation.error instanceof Error ? createMutation.error.message : "Failed to create venue"}
            </div>
          )}
        </CardContent>
      </Card>
    </form>
  )
}

