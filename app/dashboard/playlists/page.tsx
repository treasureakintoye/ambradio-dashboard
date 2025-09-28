"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { PlaylistCard } from "@/components/playlists/playlist-card"
import { PlaylistCreateDialog } from "@/components/playlists/playlist-create-dialog"
import { PlaylistMediaManager } from "@/components/playlists/playlist-media-manager"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, RefreshCw } from "lucide-react"

interface Playlist {
  id: string
  name: string
  description?: string
  type: string
  is_enabled: boolean
  include_in_automation: boolean
  weight: number
  play_per_songs?: number
  play_per_minutes?: number
  order_type: string
  created_at: string
  media_count?: number
}

export default function PlaylistsPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [stationId, setStationId] = useState<string>("")
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [mediaManagerOpen, setMediaManagerOpen] = useState(false)
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null)

  const loadPlaylists = async () => {
    setIsLoading(true)
    const supabase = createClient()

    try {
      // Get user's first station
      const { data: stations } = await supabase.from("stations").select("id").limit(1)
      if (stations && stations.length > 0) {
        setStationId(stations[0].id)

        // Load playlists with media count
        const { data: playlistsData, error } = await supabase
          .from("playlists")
          .select(
            `
            *,
            playlist_media(count)
          `,
          )
          .eq("station_id", stations[0].id)
          .order("created_at", { ascending: false })

        if (error) throw error

        const playlistsWithCount = (playlistsData || []).map((playlist) => ({
          ...playlist,
          media_count: playlist.playlist_media?.[0]?.count || 0,
        }))

        setPlaylists(playlistsWithCount)
      }
    } catch (error) {
      console.error("Error loading playlists:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadPlaylists()
  }, [])

  const handleEdit = (playlist: Playlist) => {
    setSelectedPlaylist(playlist)
    setMediaManagerOpen(true)
  }

  const handleDelete = async (playlist: Playlist) => {
    if (!confirm(`Are you sure you want to delete "${playlist.name}"?`)) return

    const supabase = createClient()
    try {
      const { error } = await supabase.from("playlists").delete().eq("id", playlist.id)
      if (error) throw error
      loadPlaylists()
    } catch (error) {
      console.error("Error deleting playlist:", error)
    }
  }

  const handleSchedule = (playlist: Playlist) => {
    // TODO: Implement scheduling dialog
    console.log("Schedule playlist:", playlist.name)
  }

  const filteredPlaylists = playlists.filter((playlist) =>
    playlist.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const playlistsByType = {
    all: filteredPlaylists,
    default: filteredPlaylists.filter((p) => p.type === "default"),
    scheduled: filteredPlaylists.filter((p) => p.type !== "default"),
    enabled: filteredPlaylists.filter((p) => p.is_enabled),
    disabled: filteredPlaylists.filter((p) => !p.is_enabled),
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Playlists</h2>
          <p className="text-muted-foreground">Create and manage your radio station playlists</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadPlaylists} disabled={isLoading} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Playlist
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search playlists..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All ({playlistsByType.all.length})</TabsTrigger>
          <TabsTrigger value="default">General Rotation ({playlistsByType.default.length})</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled ({playlistsByType.scheduled.length})</TabsTrigger>
          <TabsTrigger value="enabled">Enabled ({playlistsByType.enabled.length})</TabsTrigger>
          <TabsTrigger value="disabled">Disabled ({playlistsByType.disabled.length})</TabsTrigger>
        </TabsList>

        {Object.entries(playlistsByType).map(([key, playlists]) => (
          <TabsContent key={key} value={key}>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-2">Loading playlists...</p>
              </div>
            ) : playlists.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No playlists found</p>
                {key === "all" && (
                  <Button onClick={() => setCreateDialogOpen(true)} className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Playlist
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {playlists.map((playlist) => (
                  <PlaylistCard
                    key={playlist.id}
                    playlist={playlist}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onSchedule={handleSchedule}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <PlaylistCreateDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        stationId={stationId}
        onSuccess={loadPlaylists}
      />

      {selectedPlaylist && (
        <PlaylistMediaManager
          open={mediaManagerOpen}
          onOpenChange={setMediaManagerOpen}
          playlistId={selectedPlaylist.id}
          playlistName={selectedPlaylist.name}
          stationId={stationId}
        />
      )}
    </div>
  )
}
