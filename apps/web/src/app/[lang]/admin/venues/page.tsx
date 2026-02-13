import { VenuesList } from "@/components/admin/venues-list"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function VenuesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Venues Management</h1>
          <p className="text-muted-foreground">Manage venues and courts</p>
        </div>
        <Link href="/admin/venues/new">
          <Button>Create Venue</Button>
        </Link>
      </div>
      <VenuesList />
    </div>
  )
}

