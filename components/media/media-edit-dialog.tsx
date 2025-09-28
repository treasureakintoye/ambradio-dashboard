"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { createClient } from "@/lib/supabase/client"

interface MediaFile {
  id: string
  title: string
  artist: string
  album?: string
  genre?: string
  lyrics?: string
  fade_in: number
  fade_out: number
  cue_in: number
  cue_out: number
  amplify: number
  is_visible: boolean
  is_playable: boolean
}

interface MediaEditDialogProps {
  media: MediaFile | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave?: () => void
}

export function MediaEditDialog({ media, open, onOpenChange, onSave }: MediaEditDialogProps) {
  const [formData, setFormData] = useState<Partial<MediaFile>>({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (media) {
      setFormData(media)
    }
  }, [media])

  const handleSave = async () => {
    if (!media) return

    setIsLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from("media")
        .update({
          title: formData.title,
          artist: formData.artist,
          album: formData.album,
          genre: formData.genre,
          lyrics: formData.lyrics,
          fade_in: formData.fade_in,
          fade_out: formData.fade_out,
          cue_in: formData.cue_in,
          cue_out: formData.cue_out,
          amplify: formData.amplify,
          is_visible: formData.is_visible,
          is_playable: formData.is_playable,
          updated_at: new Date().toISOString(),
        })
        .eq("id", media.id)

      if (error) throw error

      onSave?.()
      onOpenChange(false)
    } catch (error) {
      console.error("Error updating media:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Media File</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title || ""}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="artist">Artist</Label>
                <Input
                  id="artist"
                  value={formData.artist || ""}
                  onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="album">Album</Label>
                <Input
                  id="album"
                  value={formData.album || ""}
                  onChange={(e) => setFormData({ ...formData, album: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="genre">Genre</Label>
                <Input
                  id="genre"
                  value={formData.genre || ""}
                  onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lyrics">Lyrics</Label>
              <Textarea
                id="lyrics"
                value={formData.lyrics || ""}
                onChange={(e) => setFormData({ ...formData, lyrics: e.target.value })}
                rows={4}
              />
            </div>
          </div>

          {/* Audio Processing */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Audio Processing</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fade_in">Fade In (seconds)</Label>
                <Input
                  id="fade_in"
                  type="number"
                  step="0.1"
                  value={formData.fade_in || 0}
                  onChange={(e) => setFormData({ ...formData, fade_in: Number.parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fade_out">Fade Out (seconds)</Label>
                <Input
                  id="fade_out"
                  type="number"
                  step="0.1"
                  value={formData.fade_out || 0}
                  onChange={(e) => setFormData({ ...formData, fade_out: Number.parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cue_in">Cue In (seconds)</Label>
                <Input
                  id="cue_in"
                  type="number"
                  step="0.1"
                  value={formData.cue_in || 0}
                  onChange={(e) => setFormData({ ...formData, cue_in: Number.parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cue_out">Cue Out (seconds)</Label>
                <Input
                  id="cue_out"
                  type="number"
                  step="0.1"
                  value={formData.cue_out || 0}
                  onChange={(e) => setFormData({ ...formData, cue_out: Number.parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amplify">Amplify (dB)</Label>
                <Input
                  id="amplify"
                  type="number"
                  step="0.1"
                  value={formData.amplify || 0}
                  onChange={(e) => setFormData({ ...formData, amplify: Number.parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
          </div>

          {/* Visibility Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Visibility Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="is_playable">Playable</Label>
                  <p className="text-sm text-muted-foreground">Allow this file to be played by AutoDJ</p>
                </div>
                <Switch
                  id="is_playable"
                  checked={formData.is_playable || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_playable: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="is_visible">Visible</Label>
                  <p className="text-sm text-muted-foreground">Show this file in public song lists</p>
                </div>
                <Switch
                  id="is_visible"
                  checked={formData.is_visible || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_visible: checked })}
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
