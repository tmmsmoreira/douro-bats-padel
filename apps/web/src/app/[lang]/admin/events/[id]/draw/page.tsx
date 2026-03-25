import { AdminDrawView } from '@/components/admin/admin-draw-view';

export default async function AdminDrawPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminDrawView eventId={id} />;
}
