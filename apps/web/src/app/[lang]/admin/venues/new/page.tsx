import { VenueForm } from "@/components/admin/venue-form"

export default function NewVenuePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create Venue</h1>
        <p className="text-muted-foreground">Add a new venue with courts</p>
      </div>
      <VenueForm />
    </div>
  )
}

