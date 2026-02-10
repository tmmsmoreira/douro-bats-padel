import { DrawView } from "@/components/player/draw-view"

export default async function DrawPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <DrawView eventId={id} />
}
