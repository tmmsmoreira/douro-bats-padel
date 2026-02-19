import { EventForm } from '@/components/admin/event-form';

export default function NewEventPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create Event</h1>
        <p className="text-muted-foreground">Create a new game night event</p>
      </div>
      <EventForm />
    </div>
  );
}
