"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { RefreshCw, Save } from "lucide-react"

interface Station {
  id: string
  name: string
  description?: string
  genre?: string
  url?: string
  is_enabled: boolean
  frontend_type: string
  backend_type: string
  listen_url?: string
  admin_pw?: string
  source_pw?: string
  relay_pw?: string
  created_at: string
}

export default function StationProfilePage() {
  const [station, setStation] = useState<Station | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const loadStation = async () => {
    setIsLoading(true)
    const supabase = createClient()

    try {
      const { data: stations } = await supabase.from("stations").select("*").limit(1)
      if (stations && stations.length > 0) {
        setStation(stations[0])
      }
    } catch (error) {
      console.error("Error loading station:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const saveStation = async () => {
    if (!station) return

    setIsSaving(true)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from("stations")
        .update({
          name: station.name,
          description: station.description,
          genre: station.genre,
          url: station.url,
          is_enabled: station.is_enabled,
        })
        .eq("id", station.id)

      if (error) throw error
      alert("Station profile updated successfully!")
    } catch (error) {
      console.error("Error saving station:", error)
      alert("Error saving station profile")
    } finally {
      setIsSaving(false)
    }
  }

  useEffect(() => {
    loadStation()
  }, [])

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  if (!station) {
    return <div className="text-center text-muted-foreground">No station found</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Station Profile</h2>
          <p className="text-muted-foreground">Configure your radio station settings and information</p>
        </div>
        <Button onClick={loadStation} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Configure your station's basic details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Station Name</Label>
              <Input
                id="name"
                value={station.name}
                onChange={(e) => setStation({ ...station, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={station.description || ""}
                onChange={(e) => setStation({ ...station, description: e.target.value })}
                placeholder="Describe your radio station..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="genre">Genre</Label>
              <Input
                id="genre"
                value={station.genre || ""}
                onChange={(e) => setStation({ ...station, genre: e.target.value })}
                placeholder="e.g., Rock, Pop, Jazz"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="url">Website URL</Label>
              <Input
                id="url"
                value={station.url || ""}
                onChange={(e) => setStation({ ...station, url: e.target.value })}
                placeholder="https://yourstation.com"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="enabled"
                checked={station.is_enabled}
                onCheckedChange={(checked) => setStation({ ...station, is_enabled: checked })}
              />
              <Label htmlFor="enabled">Station Enabled</Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Technical Information</CardTitle>
            <CardDescription>View your station's technical configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Frontend Type</Label>
                <p className="text-sm text-muted-foreground">{station.frontend_type}</p>
              </div>
              <div>
                <Label>Backend Type</Label>
                <p className="text-sm text-muted-foreground">{station.backend_type}</p>
              </div>
            </div>
            {station.listen_url && (
              <div>
                <Label>Listen URL</Label>
                <p className="text-sm text-muted-foreground">{station.listen_url}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={saveStation} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  )
}
