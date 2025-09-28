import { AudioPlayer } from "@/components/streaming/audio-player"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createServerClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"

interface PageProps {
  params: {
    stationId: string
  }
}

export default async function ListenPage({ params }: PageProps) {
  const supabase = createServerClient()

  // Get station information
  const { data: station, error } = await supabase
    .from("stations")
    .select(`
      *,
      profiles!stations_user_id_fkey(display_name)
    `)
    .eq("id", params.stationId)
    .single()

  if (error || !station) {
    notFound()
  }

  // Get current playing song (mock data for demo)
  const currentSong = {
    title: "Summer Breeze",
    artist: "The Radio Stars",
    album: "Greatest Hits",
  }

  const streamUrl = `http://localhost:8000/stream`

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Station Header */}
          <Card className="bg-card/80 backdrop-blur-sm border-border/50">
            <CardHeader className="text-center">
              <div className="mx-auto w-24 h-24 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-primary-foreground">
                  {station.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <CardTitle className="text-2xl">{station.name}</CardTitle>
              <p className="text-muted-foreground">{station.description}</p>
              <div className="flex justify-center gap-2 mt-2">
                <Badge variant="secondary">{station.genre}</Badge>
                <Badge variant="outline">Live</Badge>
              </div>
            </CardHeader>
          </Card>

          {/* Audio Player */}
          <AudioPlayer streamUrl={streamUrl} stationName={station.name} currentSong={currentSong} />

          {/* Station Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Now Playing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-semibold">{currentSong.title}</p>
                  <p className="text-muted-foreground">{currentSong.artist}</p>
                  {currentSong.album && <p className="text-sm text-muted-foreground">from "{currentSong.album}"</p>}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Station Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Listeners</span>
                    <span className="font-semibold">23</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bitrate</span>
                    <span className="font-semibold">128 kbps</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Format</span>
                    <span className="font-semibold">MP3</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Tracks */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Recently Played</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { title: "Midnight Drive", artist: "Electric Dreams", time: "2 min ago" },
                  { title: "Ocean Waves", artist: "Ambient Collective", time: "6 min ago" },
                  { title: "City Lights", artist: "Urban Sounds", time: "10 min ago" },
                  { title: "Mountain High", artist: "Folk Revival", time: "14 min ago" },
                ].map((track, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center py-2 border-b border-border/30 last:border-0"
                  >
                    <div>
                      <p className="font-medium">{track.title}</p>
                      <p className="text-sm text-muted-foreground">{track.artist}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{track.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
