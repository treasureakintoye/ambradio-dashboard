"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { PlayCircle, MoreHorizontal, Edit, Trash2, Calendar, Music, Clock } from "lucide-react"

interface Playlist {
  id: string
  name: string
  description?: string
  type: string
  is_enabled: boolean
  include_in_automation: boolean
  weight: number
  play_per_songs?: number
  play_per_minutes?: number
  order_type: string
  created_at: string
  media_count?: number
}

interface PlaylistCardProps {
  playlist: Playlist
  onEdit?: (playlist: Playlist) => void
  onDelete?: (playlist: Playlist) => void
  onSchedule?: (playlist: Playlist) => void
}

export function PlaylistCard({ playlist, onEdit, onDelete, onSchedule }: PlaylistCardProps) {
  const getTypeLabel = (type: string) => {
    switch (type) {
      case "default":
        return "General Rotation"
      case "once_per_x_songs":
        return "Once per X Songs"
      case "once_per_x_minutes":
        return "Once per X Minutes"
      case "once_per_hour":
        return "Once per Hour"
      case "advanced":
        return "Advanced"
      default:
        return type
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "default":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      case "once_per_x_songs":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "once_per_x_minutes":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
      case "once_per_hour":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20"
      case "advanced":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20"
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg flex items-center gap-2">
              <PlayCircle className="h-5 w-5 text-primary" />
              <span className="truncate">{playlist.name}</span>
            </CardTitle>
            {playlist.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{playlist.description}</p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit?.(playlist)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSchedule?.(playlist)}>
                <Calendar className="mr-2 h-4 w-4" />
                Schedule
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete?.(playlist)} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge className={getTypeColor(playlist.type)}>{getTypeLabel(playlist.type)}</Badge>
          <Badge variant={playlist.is_enabled ? "default" : "secondary"}>
            {playlist.is_enabled ? "Enabled" : "Disabled"}
          </Badge>
          {playlist.include_in_automation && <Badge variant="outline">AutoDJ</Badge>}
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Music className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Songs:</span>
            <span className="font-medium">{playlist.media_count || 0}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Weight:</span>
            <span className="font-medium">{playlist.weight}</span>
          </div>
        </div>

        {playlist.type === "once_per_x_songs" && playlist.play_per_songs && (
          <div className="text-sm text-muted-foreground">Plays once every {playlist.play_per_songs} songs</div>
        )}

        {playlist.type === "once_per_x_minutes" && playlist.play_per_minutes && (
          <div className="text-sm text-muted-foreground">Plays once every {playlist.play_per_minutes} minutes</div>
        )}

        <div className="text-xs text-muted-foreground">
          Order: {playlist.order_type} • Created {new Date(playlist.created_at).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  )
}
