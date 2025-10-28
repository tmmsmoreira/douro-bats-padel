import { ResultsView } from "@/components/player/results-view"

export default function ResultsPage({ params }: { params: { id: string } }) {
  return <ResultsView eventId={params.id} />
}
