import { EventDetails } from "@/components/admin/event-details"

export default function EventPage({ params }: { params: { id: string } }) {
  return <EventDetails eventId={params.id} />
}
