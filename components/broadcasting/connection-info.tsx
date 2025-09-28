"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Copy, Eye, EyeOff, Server, Key, Globe } from "lucide-react"

interface ConnectionInfoProps {
  stationId: string
}

export function ConnectionInfo({ stationId }: ConnectionInfoProps) {
  const [showPasswords, setShowPasswords] = useState(false)

  // In a real implementation, these would come from the station configuration
  const connectionDetails = {
    server: "stream.example.com",
    port: 8000,
    mountPoint: "/live",
    adminPassword: "admin_password_123",
    sourcePassword: "source_password_456",
    djPassword: "dj_password_789",
    publicUrl: "https://stream.example.com:8000/live",
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // In a real app, you'd show a toast notification here
  }

  const ConnectionField = ({
    label,
    value,
    isSensitive = false,
  }: { label: string; value: string; isSensitive?: boolean }) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex gap-2">
        <Input value={isSensitive && !showPasswords ? "••••••••••••" : value} readOnly className="font-mono text-sm" />
        <Button variant="outline" size="icon" onClick={() => copyToClipboard(value)} title="Copy to clipboard">
          <Copy className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Icecast Connection Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Icecast Server
            </CardTitle>
            <Badge variant="default">Active</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <ConnectionField label="Server Address" value={connectionDetails.server} />
          <ConnectionField label="Port" value={connectionDetails.port.toString()} />
          <ConnectionField label="Mount Point" value={connectionDetails.mountPoint} />
          <ConnectionField label="Admin Password" value={connectionDetails.adminPassword} isSensitive />
          <ConnectionField label="Source Password" value={connectionDetails.sourcePassword} isSensitive />

          <div className="flex items-center justify-between pt-2">
            <Button variant="outline" size="sm" onClick={() => setShowPasswords(!showPasswords)}>
              {showPasswords ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              {showPasswords ? "Hide" : "Show"} Passwords
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* DJ/Streamer Connection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            DJ Connection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Streaming Software Settings</Label>
            <div className="bg-muted p-3 rounded-md font-mono text-sm space-y-1">
              <div>Server: {connectionDetails.server}</div>
              <div>Port: {connectionDetails.port}</div>
              <div>Mount: {connectionDetails.mountPoint}</div>
              <div>Username: source</div>
              <div>Password: {showPasswords ? connectionDetails.sourcePassword : "••••••••••••"}</div>
            </div>
          </div>

          <ConnectionField label="DJ Password" value={connectionDetails.djPassword} isSensitive />

          <div className="space-y-2">
            <Label className="text-sm font-medium">Recommended Settings</Label>
            <div className="text-sm text-muted-foreground space-y-1">
              <div>• Format: MP3</div>
              <div>• Bitrate: 128 kbps</div>
              <div>• Sample Rate: 44100 Hz</div>
              <div>• Channels: Stereo</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Public Stream URLs */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Public Stream URLs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <ConnectionField label="Direct Stream URL" value={connectionDetails.publicUrl} />
            <ConnectionField label="M3U Playlist" value={`${connectionDetails.publicUrl}.m3u`} />
            <ConnectionField label="PLS Playlist" value={`${connectionDetails.publicUrl}.pls`} />
            <ConnectionField label="XSPF Playlist" value={`${connectionDetails.publicUrl}.xspf`} />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Embed Code</Label>
            <div className="bg-muted p-3 rounded-md">
              <code className="text-sm">
                {`<audio controls>
  <source src="${connectionDetails.publicUrl}" type="audio/mpeg">
  Your browser does not support the audio element.
</audio>`}
              </code>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                copyToClipboard(
                  `<audio controls><source src="${connectionDetails.publicUrl}" type="audio/mpeg">Your browser does not support the audio element.</audio>`,
                )
              }
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Embed Code
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
