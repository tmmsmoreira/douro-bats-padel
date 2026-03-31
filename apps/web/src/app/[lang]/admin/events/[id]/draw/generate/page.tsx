import { GenerateDraw } from '@/components/admin/generate-draw';

export default async function GenerateDrawPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <GenerateDraw eventId={id} />;
}
