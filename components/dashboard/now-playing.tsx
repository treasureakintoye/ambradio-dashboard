"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Play, Pause, SkipForward, Volume2 } from "lucide-react"
import { useState } from "react"

export function NowPlaying() {
  const [isPlaying, setIsPlaying] = useState(true)
  const [progress, setProgress] = useState(65)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="h-5 w-5" />
          Now Playing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
            <Volume2 className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground truncate">Summer Vibes</p>
            <p className="text-sm text-muted-foreground truncate">The Chill Artists</p>
            <p className="text-xs text-muted-foreground">Electronic • 2024</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>2:15</span>
            <span>3:42</span>
          </div>
          <Progress value={progress} className="h-1" />
        </div>

        <div className="flex items-center justify-center gap-2">
          <Button variant="ghost" size="icon">
            <SkipForward className="h-4 w-4 rotate-180" />
          </Button>
          <Button variant="default" size="icon" onClick={() => setIsPlaying(!isPlaying)}>
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon">
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>

        <div className="text-center">
          <p className="text-xs text-muted-foreground">Next: "Midnight Dreams" by Luna Sound</p>
        </div>
      </CardContent>
    </Card>
  )
}
