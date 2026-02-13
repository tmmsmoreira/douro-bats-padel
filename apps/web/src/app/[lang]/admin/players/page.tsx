import { PlayersList } from "@/components/admin/players-list"

export default function PlayersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Players Management</h1>
          <p className="text-muted-foreground">View and manage all players</p>
        </div>
      </div>
      <PlayersList />
    </div>
  )
}

