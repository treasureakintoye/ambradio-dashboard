"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { BroadcastStatus } from "@/components/broadcasting/broadcast-status"
import { IcecastStatus } from "@/components/broadcasting/icecast-status"
import { StreamerManagement } from "@/components/broadcasting/streamer-management"
import { ConnectionInfo } from "@/components/broadcasting/connection-info"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

export default function BroadcastingPage() {
  const [stationId, setStationId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)

  const loadStation = async () => {
    setIsLoading(true)
    const supabase = createClient()

    try {
      // Get user's first station
      const { data: stations } = await supabase.from("stations").select("id").limit(1)
      if (stations && stations.length > 0) {
        setStationId(stations[0].id)
      }
    } catch (error) {
      console.error("Error loading station:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadStation()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Broadcasting</h2>
          <p className="text-muted-foreground">Manage live streaming, server status, and broadcast settings</p>
        </div>
        <Button onClick={loadStation} disabled={isLoading} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="status" className="space-y-6">
        <TabsList>
          <TabsTrigger value="status">Status & Controls</TabsTrigger>
          <TabsTrigger value="server">Server Status</TabsTrigger>
          <TabsTrigger value="streamers">Streamers & DJs</TabsTrigger>
          <TabsTrigger value="connection">Connection Info</TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="space-y-6">
          <BroadcastStatus stationId={stationId} />
        </TabsContent>

        <TabsContent value="server" className="space-y-6">
          <IcecastStatus />
        </TabsContent>

        <TabsContent value="streamers" className="space-y-6">
          <StreamerManagement stationId={stationId} />
        </TabsContent>

        <TabsContent value="connection" className="space-y-6">
          <ConnectionInfo stationId={stationId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
