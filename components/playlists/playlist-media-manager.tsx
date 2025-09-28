"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Minus } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface MediaFile {
  id: string
  title: string
  artist: string
  album?: string
  length_text?: string
  is_in_playlist?: boolean
}

interface PlaylistMediaManagerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  playlistId: string
  playlistName: string
  stationId: string
}

export function PlaylistMediaManager({
  open,
  onOpenChange,
  playlistId,
  playlistName,
  stationId,
}: PlaylistMediaManagerProps) {
  const [media, setMedia] = useState<MediaFile[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState<Set<string>>(new Set())

  const loadMedia = async () => {
    if (!open || !stationId) return

    setIsLoading(true)
    const supabase = createClient()

    try {
      // Get all media for the station
      const { data: allMedia, error: mediaError } = await supabase
        .from("media")
        .select("id, title, artist, album, length_text")
        .eq("station_id", stationId)
        .eq("is_playable", true)

      if (mediaError) throw mediaError

      // Get media already in this playlist
      const { data: playlistMedia, error: playlistError } = await supabase
        .from("playlist_media")
        .select("media_id")
        .eq("playlist_id", playlistId)

      if (playlistError) throw playlistError

      const playlistMediaIds = new Set(playlistMedia?.map((pm) => pm.media_id) || [])

      const mediaWithPlaylistStatus = (allMedia || []).map((m) => ({
        ...m,
        is_in_playlist: playlistMediaIds.has(m.id),
      }))

      setMedia(mediaWithPlaylistStatus)
    } catch (error) {
      console.error("Error loading media:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadMedia()
  }, [open, stationId, playlistId])

  const filteredMedia = media.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.album?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleToggleMedia = async (mediaId: string, addToPlaylist: boolean) => {
    const supabase = createClient()

    try {
      if (addToPlaylist) {
        const { error } = await supabase.from("playlist_media").insert({
          playlist_id: playlistId,
          media_id: mediaId,
          weight: 1,
        })
        if (error) throw error
      } else {
        const { error } = await supabase
          .from("playlist_media")
          .delete()
          .eq("playlist_id", playlistId)
          .eq("media_id", mediaId)
        if (error) throw error
      }

      // Update local state
      setMedia((prev) => prev.map((m) => (m.id === mediaId ? { ...m, is_in_playlist: addToPlaylist } : m)))
    } catch (error) {
      console.error("Error updating playlist media:", error)
    }
  }

  const handleBulkAdd = async () => {
    if (selectedMedia.size === 0) return

    const supabase = createClient()
    const mediaToAdd = Array.from(selectedMedia).map((mediaId) => ({
      playlist_id: playlistId,
      media_id: mediaId,
      weight: 1,
    }))

    try {
      const { error } = await supabase.from("playlist_media").insert(mediaToAdd)
      if (error) throw error

      // Update local state
      setMedia((prev) => prev.map((m) => (selectedMedia.has(m.id) ? { ...m, is_in_playlist: true } : m)))
      setSelectedMedia(new Set())
    } catch (error) {
      console.error("Error adding media to playlist:", error)
    }
  }

  const handleBulkRemove = async () => {
    if (selectedMedia.size === 0) return

    const supabase = createClient()

    try {
      const { error } = await supabase
        .from("playlist_media")
        .delete()
        .eq("playlist_id", playlistId)
        .in("media_id", Array.from(selectedMedia))

      if (error) throw error

      // Update local state
      setMedia((prev) => prev.map((m) => (selectedMedia.has(m.id) ? { ...m, is_in_playlist: false } : m)))
      setSelectedMedia(new Set())
    } catch (error) {
      console.error("Error removing media from playlist:", error)
    }
  }

  const handleSelectMedia = (mediaId: string, checked: boolean) => {
    const newSelected = new Set(selectedMedia)
    if (checked) {
      newSelected.add(mediaId)
    } else {
      newSelected.delete(mediaId)
    }
    setSelectedMedia(newSelected)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Manage Media - {playlistName}</DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-4 py-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search media..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleBulkAdd} disabled={selectedMedia.size === 0} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Selected
            </Button>
            <Button onClick={handleBulkRemove} disabled={selectedMedia.size === 0} size="sm" variant="outline">
              <Minus className="h-4 w-4 mr-1" />
              Remove Selected
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={selectedMedia.size > 0 && selectedMedia.size === filteredMedia.length}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedMedia(new Set(filteredMedia.map((m) => m.id)))
                      } else {
                        setSelectedMedia(new Set())
                      }
                    }}
                  />
                </TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Artist</TableHead>
                <TableHead>Album</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Loading media...
                  </TableCell>
                </TableRow>
              ) : filteredMedia.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No media files found
                  </TableCell>
                </TableRow>
              ) : (
                filteredMedia.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedMedia.has(item.id)}
                        onCheckedChange={(checked) => handleSelectMedia(item.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell>{item.artist}</TableCell>
                    <TableCell>{item.album || "-"}</TableCell>
                    <TableCell>{item.length_text || "-"}</TableCell>
                    <TableCell>
                      {item.is_in_playlist ? (
                        <Badge variant="default">In Playlist</Badge>
                      ) : (
                        <Badge variant="outline">Available</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant={item.is_in_playlist ? "outline" : "default"}
                        onClick={() => handleToggleMedia(item.id, !item.is_in_playlist)}
                      >
                        {item.is_in_playlist ? (
                          <>
                            <Minus className="h-3 w-3 mr-1" />
                            Remove
                          </>
                        ) : (
                          <>
                            <Plus className="h-3 w-3 mr-1" />
                            Add
                          </>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  )
}
