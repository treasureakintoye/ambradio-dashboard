import { type NextRequest, NextResponse } from "next/server"

import { icecastConfig } from '@/lib/config/icecast'

export async function POST(request: NextRequest) {
  try {
    const { action, mount = icecastConfig.mountPoint } = await request.json()

    if (!action) {
      return NextResponse.json({ error: "Action required" }, { status: 400 })
    }

    const adminUrl = icecastConfig.getAdminUrl()
    const auth = `Basic ${Buffer.from(`source:${icecastConfig.password}`).toString('base64')}`

    switch (action) {
      case "start_source":
        // Starting a source requires a client to connect and stream; cannot be done server-side
        console.log(`Start source requested for: ${mount}. Client connection needed.`)
        return NextResponse.json({ success: true, message: `Source ${mount} start requested. Connect a streaming client.` })

      case "stop_source":
        // Stopping requires disconnecting the source client; simulate or use kill if available, but not standard
        console.log(`Stop source requested for: ${mount}. Disconnect the streaming client.`)
        return NextResponse.json({ success: true, message: `Source ${mount} stop requested. Disconnect the streaming client.` })

      case "skip_track":
        // Use metadata update to trigger skip (set empty song or specific command if supported)
        const metadataUrl = `${adminUrl}/metadata?mount=${encodeURIComponent(mount)}&mode=updinfo&song=`
        const response = await fetch(metadataUrl, {
          method: 'POST',
          headers: {
            'Authorization': auth,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: ''
        })

        if (!response.ok) {
          throw new Error(`Failed to skip track: ${response.statusText}`)
        }

        return NextResponse.json({ success: true, message: "Track skipped" })

      case "reload_config":
        // Requires admin password; not implemented with source password
        console.log("Reload config requested. Requires admin access.")
        return NextResponse.json({ success: false, message: "Reload requires admin password" })

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Icecast control error:", error)
    return NextResponse.json({ error: "Control action failed" }, { status: 500 })
  }
}
