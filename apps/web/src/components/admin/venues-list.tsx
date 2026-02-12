"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

interface Venue {
  id: string
  name: string
  address?: string
  logo?: string
  courts: Court[]
}

interface Court {
  id: string
  label: string
  venueId: string
}

export function VenuesList() {
  const { data: venues, isLoading } = useQuery<Venue[]>({
    queryKey: ["venues"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/venues`)
      if (!res.ok) throw new Error("Failed to fetch venues")
      return res.json()
    },
  })

  if (isLoading) {
    return <div className="text-center py-8">Loading venues...</div>
  }

  if (!venues || venues.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">No venues available.</CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4">
      {venues.map((venue) => (
        <Card key={venue.id}>
          <CardHeader>
            <div className="flex items-start gap-4">
              {venue.logo && (
                <img
                  src={venue.logo}
                  alt={`${venue.name} logo`}
                  className="h-16 w-16 object-contain rounded border"
                  onError={(e) => {
                    e.currentTarget.style.display = "none"
                  }}
                />
              )}
              <div className="flex-1">
                <CardTitle>{venue.name}</CardTitle>
                {venue.address && <p className="text-sm text-muted-foreground mt-1">{venue.address}</p>}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div>
              <p className="text-sm font-medium mb-2">Courts:</p>
              {venue.courts.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {venue.courts.map((court) => (
                    <Badge key={court.id} variant="outline">
                      {court.label}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No courts available</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

