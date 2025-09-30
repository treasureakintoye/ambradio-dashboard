import { type NextRequest, NextResponse } from "next/server"

export const dynamic = 'force-dynamic';

import { icecastConfig } from '@/lib/config/icecast'
import { parseStringPromise } from 'xml2js'

export async function GET(request: NextRequest) {
  try {
    const adminUrl = icecastConfig.getAdminUrl()
    const statsUrl = `${adminUrl}/stats.xml`

    const auth = `Basic ${Buffer.from(`source:${icecastConfig.password}`).toString('base64')}`
    const response = await fetch(statsUrl, {
      headers: {
        'Authorization': auth
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch stats: ${response.statusText}`)
    }

    const xml = await response.text()
    const result = await parseStringPromise(xml)

    const icestats = result.icestats
    const admin = icestats.admin[0] || {}
    const sources = icestats.source || []

    const status = {
      server: {
        host: admin.host || icecastConfig.hostname,
        port: icecastConfig.port,
        status: 'online',
        version: admin.ic_version || 'Unknown',
        uptime: parseInt(admin.uptime || '0'),
      },
      sources: sources.map((source: any) => ({
        mount: source.$?.mount || '',
        status: 'connected',
        listeners: parseInt(source.listener_current?.[0] || '0'),
        peak_listeners: parseInt(source.peak?.[0] || '0'),
        bitrate: parseInt(source.bitrate?.[0] || '0'),
        format: source.content_type?.[0]?.split('/')[1]?.toUpperCase() || 'Unknown',
        title: source.title?.[0] || 'No Title',
        description: source.description?.[0] || '',
        genre: source.genre?.[0] || 'Various',
        url: `${icecastConfig.getStreamUrl()}${source.$?.mount || ''}`,
        connected_time: parseInt(source.connected?.[0] || '0'),
      })),
      stats: {
        total_listeners: sources.reduce((sum: number, source: any) => sum + parseInt(source.listener_current?.[0] || '0'), 0),
        peak_listeners: parseInt(admin.peak_listeners?.[0] || '0'),
        sources: sources.length,
        clients: parseInt(admin.clients?.[0] || '0'),
        connections: parseInt(admin.connections?.[0] || '0'),
        file_connections: parseInt(admin.file_connections?.[0] || '0'),
        listener_connections: parseInt(admin.listener_connections?.[0] || '0'),
        source_connections: parseInt(admin.source_connections?.[0] || '0'),
      },
    }

    return NextResponse.json(status)
  } catch (error) {
    console.error("Icecast status error:", error)
    // Fallback to mock data if real connection fails
    const mockStatus = {
      server: {
        host: icecastConfig.hostname,
        port: icecastConfig.port,
        status: "offline",
        version: "Icecast 2.4.4",
        uptime: 0,
      },
      sources: [],
      stats: {
        total_listeners: 0,
        peak_listeners: 0,
        sources: 0,
        clients: 0,
        connections: 0,
        file_connections: 0,
        listener_connections: 0,
        source_connections: 0,
      },
    }
    return NextResponse.json(mockStatus)
  }
}
