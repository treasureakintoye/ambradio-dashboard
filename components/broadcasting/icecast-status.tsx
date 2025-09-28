"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Server, Radio, Users, Activity, RefreshCw, Play, Pause, SkipForward } from "lucide-react"

interface IcecastSource {
  mount: string
  status: string
  listeners: number
  peak_listeners: number
  bitrate: number
  format: string
  title: string
  description: string
  genre: string
  url: string
  connected_time: number
}

interface IcecastStatus {
  server: {
    host: string
    port: number
    status: string
    version: string
    uptime: number
  }
  sources: IcecastSource[]
  stats: {
    total_listeners: number
    peak_listeners: number
    sources: number
    clients: number
    connections: number
  }
}

export function IcecastStatus() {
  const [status, setStatus] = useState<IcecastStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadStatus = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/icecast/status")
      if (!response.ok) throw new Error("Failed to fetch status")

      const data = await response.json()
      setStatus(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load status")
    } finally {
      setIsLoading(false)
    }
  }

  const controlSource = async (action: string, mount?: string) => {
    try {
      const response = await fetch("/api/icecast/control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, mount }),
      })

      if (!response.ok) throw new Error("Control action failed")

      const result = await response.json()
      console.log(result.message)

      // Refresh status after control action
      setTimeout(loadStatus, 1000)
    } catch (err) {
      console.error("Control error:", err)
    }
  }

  useEffect(() => {
    loadStatus()

    // Auto-refresh every 30 seconds
    const interval = setInterval(loadStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    if (days > 0) return `${days}d ${hours}h ${minutes}m`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          Loading server status...
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={loadStatus}>Retry</Button>
        </CardContent>
      </Card>
    )
  }

  if (!status) return null

  return (
    <div className="space-y-6">
      {/* Server Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Server Status</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant={status.server.status === "online" ? "default" : "destructive"}>
                {status.server.status}
              </Badge>
              <span className="text-sm text-muted-foreground">{status.server.version}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Uptime: {formatUptime(Date.now() / 1000 - status.server.uptime)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Listeners</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{status.stats.total_listeners}</div>
            <p className="text-xs text-muted-foreground">Peak: {status.stats.peak_listeners}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sources</CardTitle>
            <Radio className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{status.stats.sources}</div>
            <p className="text-xs text-muted-foreground">Connected streams</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connections</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{status.stats.connections}</div>
            <p className="text-xs text-muted-foreground">Total served</p>
          </CardContent>
        </Card>
      </div>

      {/* Source Details */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Stream Sources</h3>
          <Button onClick={loadStatus} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {status.sources.map((source) => (
          <Card key={source.mount}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Radio className="h-5 w-5" />
                  {source.mount}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant={source.status === "connected" ? "default" : "secondary"}>{source.status}</Badge>
                  <Badge variant="outline">
                    {source.format} {source.bitrate}kbps
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-2">Stream Info</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Title:</span>
                      <span className="font-medium truncate ml-2">{source.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Genre:</span>
                      <span>{source.genre}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Connected:</span>
                      <span>{formatUptime(Date.now() / 1000 - source.connected_time)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Listener Stats</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Current:</span>
                      <span className="font-medium">{source.listeners}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Peak:</span>
                      <span>{source.peak_listeners}</span>
                    </div>
                    <Progress value={(source.listeners / source.peak_listeners) * 100} className="h-2" />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => controlSource("skip_track", source.mount)}
                  disabled={source.status !== "connected"}
                >
                  <SkipForward className="h-4 w-4 mr-1" />
                  Skip
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => controlSource("stop_source", source.mount)}
                  disabled={source.status !== "connected"}
                >
                  <Pause className="h-4 w-4 mr-1" />
                  Stop
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => controlSource("start_source", source.mount)}
                  disabled={source.status === "connected"}
                >
                  <Play className="h-4 w-4 mr-1" />
                  Start
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
