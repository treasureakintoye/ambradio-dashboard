"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { MediaUpload } from "@/components/media/media-upload"
import { MediaTable } from "@/components/media/media-table"
import { MediaEditDialog } from "@/components/media/media-edit-dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RefreshCw } from "lucide-react"

interface MediaFile {
  id: string
  title: string
  artist: string
  album?: string
  genre?: string
  length_text?: string
  play_count: number
  is_visible: boolean
  is_playable: boolean
  created_at: string
  fade_in: number
  fade_out: number
  cue_in: number
  cue_out: number
  amplify: number
  lyrics?: string
}

export default function MediaPage() {
  const [media, setMedia] = useState<MediaFile[]>([])
  const [selectedMedia, setSelectedMedia] = useState<MediaFile | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [stationId, setStationId] = useState<string>("")

  const loadMedia = async () => {
    setIsLoading(true)
    const supabase = createClient()

    try {
      // Get user's first station (in a real app, this would be selected)
      const { data: stations } = await supabase.from("stations").select("id").limit(1)
      if (stations && stations.length > 0) {
        setStationId(stations[0].id)

        // Load media for this station
        const { data: mediaData, error } = await supabase
          .from("media")
          .select("*")
          .eq("station_id", stations[0].id)
          .order("created_at", { ascending: false })

        if (error) throw error
        setMedia(mediaData || [])
      }
    } catch (error) {
      console.error("Error loading media:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadMedia()
  }, [])

  const handleEdit = (mediaFile: MediaFile) => {
    setSelectedMedia(mediaFile)
    setEditDialogOpen(true)
  }

  const handleDelete = async (mediaFile: MediaFile) => {
    if (!confirm("Are you sure you want to delete this media file?")) return

    const supabase = createClient()
    try {
      const { error } = await supabase.from("media").delete().eq("id", mediaFile.id)
      if (error) throw error
      loadMedia()
    } catch (error) {
      console.error("Error deleting media:", error)
    }
  }

  const handlePlay = (mediaFile: MediaFile) => {
    // In a real implementation, this would trigger audio playback
    console.log("Playing:", mediaFile.title)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Media Management</h2>
          <p className="text-muted-foreground">Upload and manage your radio station's music library</p>
        </div>
        <Button onClick={loadMedia} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="library" className="space-y-6">
        <TabsList>
          <TabsTrigger value="library">Media Library</TabsTrigger>
          <TabsTrigger value="upload">Upload Files</TabsTrigger>
        </TabsList>

        <TabsContent value="library" className="space-y-6">
          <MediaTable media={media} onEdit={handleEdit} onDelete={handleDelete} onPlay={handlePlay} />
        </TabsContent>

        <TabsContent value="upload" className="space-y-6">
          {stationId && <MediaUpload stationId={stationId} onUploadComplete={loadMedia} />}
        </TabsContent>
      </Tabs>

      <MediaEditDialog
        media={selectedMedia}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSave={loadMedia}
      />
    </div>
  )
}
