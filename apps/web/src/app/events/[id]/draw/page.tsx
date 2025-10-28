import { DrawView } from "@/components/player/draw-view"

export default function DrawPage({ params }: { params: { id: string } }) {
  return <DrawView eventId={params.id} />
}
