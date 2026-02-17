"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

interface Player {
  id: string
  name: string
  rating: number
  tier: string
}

interface Assignment {
  id: string
  round: number
  courtId: string
  tier: string
  court?: {
    id: string
    label: string
  }
  teamA: Player[]
  teamB: Player[]
}

interface Draw {
  id: string
  eventId: string
  event: {
    id: string
    title: string
    date: string
    startsAt: string
    endsAt: string
    venue?: {
      id: string
      name: string
      courts: Array<{
        id: string
        label: string
      }>
    }
    tierRules?: {
      mastersTimeSlot?: {
        startsAt: string
        endsAt: string
        courtIds?: string[]
      }
      explorersTimeSlot?: {
        startsAt: string
        endsAt: string
        courtIds?: string[]
      }
    }
  }
  assignments: Assignment[]
}

export function AdminDrawView({ eventId }: { eventId: string }) {
  const { data: session } = useSession()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null)
  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false)

  const { data: draw, isLoading } = useQuery<Draw>({
    queryKey: ["draw", eventId],
    queryFn: async () => {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      }
      if (session?.accessToken) {
        headers.Authorization = `Bearer ${session.accessToken}`
      }
      const res = await fetch(`${API_URL}/draws/events/${eventId}`, { headers })
      if (!res.ok) throw new Error("Failed to fetch draw")
      return res.json()
    },
  })

  const updateAssignmentMutation = useMutation({
    mutationFn: async ({ assignmentId, teamA, teamB }: { assignmentId: string; teamA: string[]; teamB: string[] }) => {
      if (!session?.accessToken) throw new Error("Not authenticated")
      
      const res = await fetch(`${API_URL}/draws/assignments/${assignmentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({ teamA, teamB }),
      })
      
      if (!res.ok) throw new Error("Failed to update assignment")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["draw", eventId] })
      setEditingAssignment(null)
    },
  })

  const publishDrawMutation = useMutation({
    mutationFn: async () => {
      if (!session?.accessToken) throw new Error("Not authenticated")

      const res = await fetch(`${API_URL}/draws/events/${eventId}/publish`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
      })

      if (!res.ok) throw new Error("Failed to publish draw")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["draw", eventId] })
      queryClient.invalidateQueries({ queryKey: ["event", eventId] })
    },
  })

  const deleteDrawMutation = useMutation({
    mutationFn: async () => {
      if (!session?.accessToken) throw new Error("Not authenticated")

      const res = await fetch(`${API_URL}/draws/events/${eventId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
      })

      if (!res.ok) throw new Error("Failed to delete draw")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["draw", eventId] })
      queryClient.invalidateQueries({ queryKey: ["event", eventId] })
      // Redirect to the generate draw page
      router.push(`/admin/events/${eventId}/draw`)
    },
  })

  if (isLoading) {
    return <div className="text-center py-8">Loading draw...</div>
  }

  if (!draw) {
    return <div className="text-center py-8">Draw not available yet</div>
  }

  // Extract courts from tier rules
  const tierRules = draw.event.tierRules || {}
  const mastersCourtIds = tierRules.mastersTimeSlot?.courtIds || []
  const explorersCourtIds = tierRules.explorersTimeSlot?.courtIds || []
  const allCourtIds = [...new Set([...mastersCourtIds, ...explorersCourtIds])]

  const venueCourts = draw.event.venue?.courts || []
  const courts = venueCourts.filter((court) => allCourtIds.includes(court.id))

  // Group assignments by tier and round
  const masterAssignments = draw.assignments.filter((a) => a.tier === "MASTERS")
  const explorerAssignments = draw.assignments.filter((a) => a.tier === "EXPLORERS")

  const groupByRound = (assignments: Assignment[]) => {
    return assignments.reduce((acc, assignment) => {
      if (!acc[assignment.round]) {
        acc[assignment.round] = []
      }
      acc[assignment.round].push(assignment)
      return acc
    }, {} as Record<number, Assignment[]>)
  }

  const mastersRounds = groupByRound(masterAssignments)
  const explorersRounds = groupByRound(explorerAssignments)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manage Draw</h1>
          <p className="text-muted-foreground">{draw.event.title}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/admin/events/${eventId}/draw`)}
          >
            Regenerate Draw
          </Button>
          <Button
            onClick={() => publishDrawMutation.mutate()}
            disabled={publishDrawMutation.isPending}
          >
            {publishDrawMutation.isPending ? "Publishing..." : "Publish Draw"}
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              if (confirm("Are you sure you want to delete this draw? This action cannot be undone.")) {
                deleteDrawMutation.mutate()
              }
            }}
            disabled={deleteDrawMutation.isPending}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {deleteDrawMutation.isPending ? "Deleting..." : "Delete Draw"}
          </Button>
        </div>
      </div>

      {/* Courts Info */}
      <Card>
        <CardHeader>
          <CardTitle>Courts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {courts.map((court) => (
              <Badge key={court.id} variant="outline">
                {court.label}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Masters Assignments */}
      {Object.keys(mastersRounds).length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Masters</h2>
          {Object.entries(mastersRounds).map(([round, assignments]) => (
            <Card key={`masters-${round}`}>
              <CardHeader>
                <CardTitle>Round {round}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {assignments.map((assignment) => (
                    <AssignmentCard
                      key={assignment.id}
                      assignment={assignment}
                      onEdit={() => setEditingAssignment(assignment)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Explorers Assignments */}
      {Object.keys(explorersRounds).length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Explorers</h2>
          {Object.entries(explorersRounds).map(([round, assignments]) => (
            <Card key={`explorers-${round}`}>
              <CardHeader>
                <CardTitle>Round {round}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {assignments.map((assignment) => (
                    <AssignmentCard
                      key={assignment.id}
                      assignment={assignment}
                      onEdit={() => setEditingAssignment(assignment)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      {editingAssignment && (
        <EditAssignmentDialog
          assignment={editingAssignment}
          onClose={() => setEditingAssignment(null)}
          onSave={(teamA, teamB) => {
            updateAssignmentMutation.mutate({
              assignmentId: editingAssignment.id,
              teamA,
              teamB,
            })
          }}
          isSaving={updateAssignmentMutation.isPending}
        />
      )}
    </div>
  )
}

function AssignmentCard({ assignment, onEdit }: { assignment: Assignment; onEdit: () => void }) {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <Badge variant="outline">{assignment.court?.label || `Court ${assignment.courtId}`}</Badge>
        <Button variant="ghost" size="sm" onClick={onEdit}>
          <Pencil className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium mb-2">Team A</p>
          <div className="space-y-1">
            {assignment.teamA.map((player) => (
              <div key={player.id} className="flex items-center justify-between text-sm">
                <span>{player.name}</span>
                <span className="text-xs text-muted-foreground">{player.rating}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm font-medium mb-2">Team B</p>
          <div className="space-y-1">
            {assignment.teamB.map((player) => (
              <div key={player.id} className="flex items-center justify-between text-sm">
                <span>{player.name}</span>
                <span className="text-xs text-muted-foreground">{player.rating}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function EditAssignmentDialog({
  assignment,
  onClose,
  onSave,
  isSaving,
}: {
  assignment: Assignment
  onClose: () => void
  onSave: (teamA: string[], teamB: string[]) => void
  isSaving: boolean
}) {
  const [teamA, setTeamA] = useState<string[]>(assignment.teamA.map((p) => p.id))
  const [teamB, setTeamB] = useState<string[]>(assignment.teamB.map((p) => p.id))

  const allPlayers = [...assignment.teamA, ...assignment.teamB]

  const swapPlayer = (playerId: string) => {
    if (teamA.includes(playerId)) {
      setTeamA(teamA.filter((id) => id !== playerId))
      setTeamB([...teamB, playerId])
    } else {
      setTeamB(teamB.filter((id) => id !== playerId))
      setTeamA([...teamA, playerId])
    }
  }

  const handleSave = () => {
    if (teamA.length !== 2 || teamB.length !== 2) {
      alert("Each team must have exactly 2 players")
      return
    }
    onSave(teamA, teamB)
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Assignment</DialogTitle>
          <DialogDescription>
            Click on a player to swap them between teams. Each team must have exactly 2 players.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <h3 className="font-medium">Team A ({teamA.length}/2)</h3>
            <div className="space-y-2">
              {allPlayers
                .filter((p) => teamA.includes(p.id))
                .map((player) => (
                  <button
                    key={player.id}
                    onClick={() => swapPlayer(player.id)}
                    className="w-full p-3 border rounded-lg hover:bg-accent transition-colors text-left"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{player.name}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {player.tier}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{player.rating}</span>
                      </div>
                    </div>
                  </button>
                ))}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Team B ({teamB.length}/2)</h3>
            <div className="space-y-2">
              {allPlayers
                .filter((p) => teamB.includes(p.id))
                .map((player) => (
                  <button
                    key={player.id}
                    onClick={() => swapPlayer(player.id)}
                    className="w-full p-3 border rounded-lg hover:bg-accent transition-colors text-left"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{player.name}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {player.tier}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{player.rating}</span>
                      </div>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || teamA.length !== 2 || teamB.length !== 2}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

