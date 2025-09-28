"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Radio, Mic, Users, Volume2, Play, Pause, SkipForward } from "lucide-react"

interface BroadcastStatusProps {
  stationId: string
}

export function BroadcastStatus({ stationId }: BroadcastStatusProps) {
  const [isLive, setIsLive] = useState(false)
  const [currentDJ, setCurrentDJ] = useState<string | null>("DJ Sarah")
  const [listeners, setListeners] = useState(247)
  const [uptime, setUptime] = useState("2h 34m")
  const [bitrate, setBitrate] = useState("128 kbps")
  const [isAutodjActive, setIsAutodjActive] = useState(!isLive)

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setListeners((prev) => prev + Math.floor(Math.random() * 10 - 5))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const handleToggleAutoDJ = () => {
    setIsAutodjActive(!isAutodjActive)
    if (!isAutodjActive) {
      setIsLive(false)
      setCurrentDJ(null)
    }
  }

  const handleGoLive = () => {
    setIsLive(true)
    setIsAutodjActive(false)
    setCurrentDJ("DJ Sarah")
  }

  const handleStopLive = () => {
    setIsLive(false)
    setCurrentDJ(null)
    setIsAutodjActive(true)
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Station Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radio className="h-5 w-5" />
            Station Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Broadcasting</span>
            <Badge variant={isLive || isAutodjActive ? "default" : "secondary"}>
              {isLive ? "Live DJ" : isAutodjActive ? "AutoDJ" : "Offline"}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Current DJ</span>
            <span className="text-sm font-medium">{currentDJ || "AutoDJ"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Uptime</span>
            <span className="text-sm font-medium">{uptime}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Bitrate</span>
            <span className="text-sm font-medium">{bitrate}</span>
          </div>
        </CardContent>
      </Card>

      {/* Listener Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Listeners
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-foreground">{listeners}</div>
            <p className="text-sm text-muted-foreground">Current Listeners</p>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Peak Today</span>
              <span className="font-medium">342</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Average</span>
              <span className="font-medium">189</span>
            </div>
          </div>
          <Progress value={(listeners / 500) * 100} className="h-2" />
          <p className="text-xs text-muted-foreground text-center">Capacity: {listeners}/500</p>
        </CardContent>
      </Card>

      {/* Broadcasting Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
            Broadcasting Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Button
              onClick={handleToggleAutoDJ}
              variant={isAutodjActive ? "default" : "outline"}
              className="w-full"
              disabled={isLive}
            >
              <Volume2 className="h-4 w-4 mr-2" />
              {isAutodjActive ? "AutoDJ Active" : "Start AutoDJ"}
            </Button>
            {!isLive ? (
              <Button onClick={handleGoLive} className="w-full" disabled={!isAutodjActive}>
                <Mic className="h-4 w-4 mr-2" />
                Go Live
              </Button>
            ) : (
              <Button onClick={handleStopLive} variant="destructive" className="w-full">
                <Pause className="h-4 w-4 mr-2" />
                Stop Live Stream
              </Button>
            )}
          </div>
          {isAutodjActive && (
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground mb-2">AutoDJ Controls</p>
              <div className="flex gap-1">
                <Button size="sm" variant="outline">
                  <Play className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="outline">
                  <Pause className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="outline">
                  <SkipForward className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
