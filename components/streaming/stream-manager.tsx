"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Radio, Settings, Users, Activity } from "lucide-react"
import { icecastConfig } from "@/lib/config/icecast"

interface StreamConfig {
  id: string
  name: string
  hostname: string
  port: number
  mountPoint: string
  bitrate: number
  format: string
  maxListeners: number
  isActive: boolean
  currentListeners: number
}

export function StreamManager() {
  const [stream, setStream] = useState<StreamConfig>({
    id: "1",
    name: "Main Stream",
    hostname: icecastConfig.hostname,
    port: icecastConfig.port,
    mountPoint: icecastConfig.mountPoint,
    bitrate: 128,
    format: "MP3",
    maxListeners: 100,
    isActive: true,
    currentListeners: 0,
  })

  const [streamStatus, setStreamStatus] = useState<'connected' | 'disconnected'>('disconnected')

  useEffect(() => {
    // Check stream status periodically
    const checkStatus = async () => {
      try {
        const response = await fetch(icecastConfig.getStreamUrl())
        setStreamStatus(response.ok ? 'connected' : 'disconnected')
        
        // Update listener count if connected
        if (response.ok) {
          const statsResponse = await fetch(`http://${stream.hostname}:${stream.port}/status-json.xsl`)
          const stats = await statsResponse.json()
          const mountStats = stats.icestats.source.find((s: { mount: string }) => s.mount === stream.mountPoint)
          if (mountStats) {
            setStream((prev: StreamConfig) => ({
              ...prev,
              currentListeners: mountStats.listeners
            }))
          }
        }
      } catch (error) {
        setStreamStatus('disconnected')
      }
    }

    const interval = setInterval(checkStatus, 30000) // Check every 30 seconds
    checkStatus() // Initial check

    return () => clearInterval(interval)
  }, [stream.hostname, stream.port, stream.mountPoint])

  const toggleStream = async () => {
    setStream((prev: StreamConfig) => ({ ...prev, isActive: !prev.isActive }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Stream Management</span>
          <Badge variant={streamStatus === 'connected' ? "success" : "destructive"}>
            {streamStatus === 'connected' ? "Connected" : "Disconnected"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="info">
          <TabsList>
            <TabsTrigger value="info">
              <Radio className="mr-2 h-4 w-4" />
              Stream Info
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="listeners">
              <Users className="mr-2 h-4 w-4" />
              Listeners
            </TabsTrigger>
          </TabsList>
          <TabsContent value="info" className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>Stream URL</Label>
                <Input value={icecastConfig.getStreamUrl()} readOnly />
              </div>
              <div className="grid gap-2">
                <Label>Mount Point</Label>
                <Input value={stream.mountPoint} readOnly />
              </div>
              <div className="grid gap-2">
                <Label>Format</Label>
                <Input value={stream.format} readOnly />
              </div>
              <div className="grid gap-2">
                <Label>Bitrate</Label>
                <Input value={`${stream.bitrate} kbps`} readOnly />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="settings" className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Stream Active</Label>
              <Switch 
                checked={stream.isActive} 
                onCheckedChange={toggleStream}
              />
            </div>
          </TabsContent>
          <TabsContent value="listeners" className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Current Listeners</Label>
              <Badge variant="secondary">{stream.currentListeners}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <Label>Max Listeners</Label>
              <Badge variant="secondary">{stream.maxListeners}</Badge>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
