"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, Volume2, VolumeX } from "lucide-react"
import { useIcecastStream } from "@/hooks/use-icecast-stream"
import { icecastConfig } from "@/lib/config/icecast"

interface AudioPlayerProps {
  stationName: string
}

export function AudioPlayer({ stationName }: AudioPlayerProps) {
  const { currentSong, isOnline } = useIcecastStream()
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState([75])
  const [isMuted, setIsMuted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume[0] / 100
    }
  }, [volume])

  const togglePlay = async () => {
    if (!audioRef.current) return

    setIsLoading(true)
    try {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        await audioRef.current.play()
        setIsPlaying(true)
      }
    } catch (error) {
      console.error("Audio playback error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardContent className="p-6">
        <audio
          ref={audioRef}
          src={icecastConfig.getStreamUrl()}
          onLoadStart={() => setIsLoading(true)}
          onCanPlay={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false)
            setIsPlaying(false)
          }}
        />

        <div className="flex items-center gap-4">
          <Button
            onClick={togglePlay}
            disabled={isLoading}
            size="lg"
            className="h-12 w-12 rounded-full bg-primary hover:bg-primary/90"
          >
            {isLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            ) : isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5 ml-0.5" />
            )}
          </Button>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">{stationName}</h3>
            {currentSong && (
              <p className="text-sm text-muted-foreground truncate">
                {currentSong.artist} - {currentSong.title}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={toggleMute} className="h-8 w-8 p-0">
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            <div className="w-20">
              <Slider value={volume} onValueChange={setVolume} max={100} step={1} className="cursor-pointer" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
