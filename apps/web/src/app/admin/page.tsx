import { EventsList } from "@/components/admin/events-list"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Events Management</h1>
          <p className="text-muted-foreground">Manage game nights, RSVPs, and draws</p>
        </div>
        <Link href="/admin/events/new">
          <Button>Create Event</Button>
        </Link>
      </div>
      <EventsList />
    </div>
  )
}
