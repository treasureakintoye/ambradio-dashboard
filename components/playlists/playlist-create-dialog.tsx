"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { createClient } from "@/lib/supabase/client"

interface PlaylistCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  stationId: string
  onSuccess?: () => void
}

export function PlaylistCreateDialog({ open, onOpenChange, stationId, onSuccess }: PlaylistCreateDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "default",
    is_enabled: true,
    include_in_automation: true,
    include_in_on_demand: true,
    include_in_requests: true,
    weight: 3,
    play_per_songs: 0,
    play_per_minutes: 0,
    play_per_hour_minute: 0,
    order_type: "shuffle",
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    setIsLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase.from("playlists").insert({
        station_id: stationId,
        name: formData.name,
        description: formData.description || null,
        type: formData.type,
        is_enabled: formData.is_enabled,
        include_in_automation: formData.include_in_automation,
        include_in_on_demand: formData.include_in_on_demand,
        include_in_requests: formData.include_in_requests,
        weight: formData.weight,
        play_per_songs: formData.play_per_songs || null,
        play_per_minutes: formData.play_per_minutes || null,
        play_per_hour_minute: formData.play_per_hour_minute || null,
        order_type: formData.order_type,
      })

      if (error) throw error

      onSuccess?.()
      onOpenChange(false)
      setFormData({
        name: "",
        description: "",
        type: "default",
        is_enabled: true,
        include_in_automation: true,
        include_in_on_demand: true,
        include_in_requests: true,
        weight: 3,
        play_per_songs: 0,
        play_per_minutes: 0,
        play_per_hour_minute: 0,
        order_type: "shuffle",
      })
    } catch (error) {
      console.error("Error creating playlist:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Playlist</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Playlist Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Morning Mix"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Playlist Type</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">General Rotation</SelectItem>
                    <SelectItem value="once_per_x_songs">Once per X Songs</SelectItem>
                    <SelectItem value="once_per_x_minutes">Once per X Minutes</SelectItem>
                    <SelectItem value="once_per_hour">Once per Hour</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description for this playlist"
                rows={3}
              />
            </div>
          </div>

          {/* Playback Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Playback Settings</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (1-25)</Label>
                <Input
                  id="weight"
                  type="number"
                  min="1"
                  max="25"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: Number.parseInt(e.target.value) || 3 })}
                />
                <p className="text-xs text-muted-foreground">Higher weight = plays more often</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="order_type">Play Order</Label>
                <Select
                  value={formData.order_type}
                  onValueChange={(value) => setFormData({ ...formData, order_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="shuffle">Shuffle</SelectItem>
                    <SelectItem value="random">Random</SelectItem>
                    <SelectItem value="sequential">Sequential</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Conditional fields based on playlist type */}
            {formData.type === "once_per_x_songs" && (
              <div className="space-y-2">
                <Label htmlFor="play_per_songs">Play Once Every X Songs</Label>
                <Input
                  id="play_per_songs"
                  type="number"
                  min="1"
                  value={formData.play_per_songs}
                  onChange={(e) => setFormData({ ...formData, play_per_songs: Number.parseInt(e.target.value) || 0 })}
                  placeholder="e.g., 5"
                />
              </div>
            )}

            {formData.type === "once_per_x_minutes" && (
              <div className="space-y-2">
                <Label htmlFor="play_per_minutes">Play Once Every X Minutes</Label>
                <Input
                  id="play_per_minutes"
                  type="number"
                  min="1"
                  value={formData.play_per_minutes}
                  onChange={(e) => setFormData({ ...formData, play_per_minutes: Number.parseInt(e.target.value) || 0 })}
                  placeholder="e.g., 30"
                />
              </div>
            )}

            {formData.type === "once_per_hour" && (
              <div className="space-y-2">
                <Label htmlFor="play_per_hour_minute">Play at Minute of Hour (0-59)</Label>
                <Input
                  id="play_per_hour_minute"
                  type="number"
                  min="0"
                  max="59"
                  value={formData.play_per_hour_minute}
                  onChange={(e) =>
                    setFormData({ ...formData, play_per_hour_minute: Number.parseInt(e.target.value) || 0 })
                  }
                  placeholder="e.g., 0 for top of hour"
                />
              </div>
            )}
          </div>

          {/* Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Options</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="is_enabled">Enable Playlist</Label>
                  <p className="text-sm text-muted-foreground">Allow this playlist to be played</p>
                </div>
                <Switch
                  id="is_enabled"
                  checked={formData.is_enabled}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_enabled: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="include_in_automation">Include in AutoDJ</Label>
                  <p className="text-sm text-muted-foreground">Play automatically when no DJ is live</p>
                </div>
                <Switch
                  id="include_in_automation"
                  checked={formData.include_in_automation}
                  onCheckedChange={(checked) => setFormData({ ...formData, include_in_automation: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="include_in_on_demand">Include in On-Demand</Label>
                  <p className="text-sm text-muted-foreground">Allow listeners to request songs from this playlist</p>
                </div>
                <Switch
                  id="include_in_on_demand"
                  checked={formData.include_in_on_demand}
                  onCheckedChange={(checked) => setFormData({ ...formData, include_in_on_demand: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="include_in_requests">Include in Requests</Label>
                  <p className="text-sm text-muted-foreground">Show songs from this playlist in request system</p>
                </div>
                <Switch
                  id="include_in_requests"
                  checked={formData.include_in_requests}
                  onCheckedChange={(checked) => setFormData({ ...formData, include_in_requests: checked })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Playlist"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
