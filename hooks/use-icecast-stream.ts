"use client"

import { useState, useEffect } from 'react'
import { icecastConfig } from '@/lib/config/icecast'

interface UseIcecastStreamResult {
  currentSong: {
    title: string
    artist: string
  } | null
  listeners: number
  isOnline: boolean
}

export function useIcecastStream(): UseIcecastStreamResult {
  const [currentSong, setCurrentSong] = useState<{title: string, artist: string} | null>(null)
  const [listeners, setListeners] = useState(0)
  const [isOnline, setIsOnline] = useState(false)

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const response = await fetch(`http://${icecastConfig.hostname}:${icecastConfig.port}/status-json.xsl`)
        if (!response.ok) {
          setIsOnline(false)
          return
        }

        const data = await response.json()
        const source = data.icestats.source.find((s: { mount: string }) => s.mount === icecastConfig.mountPoint)
        
        if (source) {
          setIsOnline(true)
          setListeners(source.listeners || 0)
          
          if (source.title) {
            const [artist, title] = source.title.split(' - ')
            setCurrentSong({ 
              artist: artist || 'Unknown Artist', 
              title: title || source.title 
            })
          }
        } else {
          setIsOnline(false)
        }
      } catch (error) {
        setIsOnline(false)
      }
    }

    fetchMetadata() // Initial fetch
    const interval = setInterval(fetchMetadata, 10000) // Update every 10 seconds

    return () => clearInterval(interval)
  }, [])

  return {
    currentSong,
    listeners,
    isOnline
  }
}