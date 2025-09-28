import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const stationId = formData.get("stationId") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!stationId) {
      return NextResponse.json({ error: "Station ID required" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ["audio/mpeg", "audio/wav", "audio/flac", "audio/aac", "audio/ogg", "audio/mp4"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Only audio files are allowed." }, { status: 400 })
    }

    // Upload to Vercel Blob
    const blob = await put(`media/${stationId}/${Date.now()}-${file.name}`, file, {
      access: "public",
    })

    // Extract metadata from file name
    const fileName = file.name
    const nameWithoutExt = fileName.replace(/\.[^/.]+$/, "")
    const parts = nameWithoutExt.split(" - ")
    const artist = parts.length > 1 ? parts[0] : "Unknown Artist"
    const title = parts.length > 1 ? parts.slice(1).join(" - ") : nameWithoutExt

    // Save to database
    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)

    const { data: mediaData, error } = await supabase
      .from("media")
      .insert({
        station_id: stationId,
        unique_id: `${stationId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title,
        artist,
        path: blob.url,
        length: 0, // Would be extracted from actual audio file metadata
        is_visible: true,
        is_playable: true,
      })
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to save media record" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      url: blob.url,
      filename: file.name,
      size: file.size,
      type: file.type,
      mediaId: mediaData.id,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
