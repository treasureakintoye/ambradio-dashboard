import { NextResponse } from 'next/server'
import { icecastConfig } from '@/lib/config/icecast'

interface IcecastSource {
  mount: string
  listeners: number
  title?: string
  bitrate: number
  format: string
  samplerate: number
}

interface StreamData {
  online: boolean
  listeners: number
  currentSong: {
    title: string
    artist: string
  } | null
  bitrate: number
  format: string
  sampleRate: number
}

export async function GET() {
  try {
    const response = await fetch(`http://${icecastConfig.hostname}:${icecastConfig.port}/status-json.xsl`)
    if (!response.ok) {
      return NextResponse.json({ error: 'Stream is offline' }, { status: 404 })
    }

    const data = await response.json()
    const source = data.icestats.source.find((s: IcecastSource) => s.mount === icecastConfig.mountPoint)

    if (!source) {
      return NextResponse.json({ error: 'Stream not found' }, { status: 404 })
    }

    // Transform the data to a more friendly format
    const streamData: StreamData = {
      online: true,
      listeners: source.listeners || 0,
      currentSong: source.title ? {
        title: source.title.split(' - ')[1] || source.title,
        artist: source.title.split(' - ')[0] || 'Unknown Artist'
      } : null,
      bitrate: source.bitrate,
      format: source.format,
      sampleRate: source.samplerate
    }

    return NextResponse.json(streamData)
  } catch (error) {
    console.error('Error fetching stream data:', error)
    return NextResponse.json({ error: 'Failed to fetch stream data' }, { status: 500 })
  }
}
