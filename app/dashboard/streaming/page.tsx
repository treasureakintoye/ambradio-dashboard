import { StreamManager } from "@/components/streaming/stream-manager"

export default function StreamingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Streaming</h1>
        <p className="text-muted-foreground">Manage your audio streams and monitor listener connections</p>
      </div>

      <StreamManager />
    </div>
  )
}
