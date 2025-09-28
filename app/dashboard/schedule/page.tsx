"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Plus, RefreshCw } from "lucide-react"

interface ScheduleEntry {
  id: string
  name: string
  start_time: string
  end_time: string
  days: string[]
  is_enabled: boolean
  playlist_id?: string
  streamer_id?: string
  type: "playlist" | "streamer" | "automation"
}

export default function SchedulePage() {
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadSchedule = async () => {
    setIsLoading(true)
    // Mock data for now - in real implementation, load from database
    const mockSchedule: ScheduleEntry[] = [
      {
        id: "1",
        name: "Morning Show",
        start_time: "06:00",
        end_time: "10:00",
        days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        is_enabled: true,
        type: "streamer",
      },
      {
        id: "2",
        name: "Automated Music",
        start_time: "10:00",
        end_time: "18:00",
        days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        is_enabled: true,
        type: "playlist",
      },
      {
        id: "3",
        name: "Weekend Mix",
        start_time: "00:00",
        end_time: "23:59",
        days: ["Saturday", "Sunday"],
        is_enabled: true,
        type: "automation",
      },
    ]

    setTimeout(() => {
      setSchedule(mockSchedule)
      setIsLoading(false)
    }, 500)
  }

  useEffect(() => {
    loadSchedule()
  }, [])

  const getTypeColor = (type: string) => {
    switch (type) {
      case "streamer":
        return "bg-blue-500"
      case "playlist":
        return "bg-green-500"
      case "automation":
        return "bg-purple-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Schedule</h2>
          <p className="text-muted-foreground">Manage your radio station's programming schedule</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadSchedule} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Schedule
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {schedule.map((entry) => (
          <Card key={entry.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {entry.name}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className={getTypeColor(entry.type)}>{entry.type}</Badge>
                  <Badge variant={entry.is_enabled ? "default" : "secondary"}>
                    {entry.is_enabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
              </div>
              <CardDescription className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {entry.start_time} - {entry.end_time}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1">
                {entry.days.map((day) => (
                  <Badge key={day} variant="outline">
                    {day}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {schedule.length === 0 && !isLoading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Schedule Entries</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first schedule entry to start programming your station
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Schedule Entry
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
