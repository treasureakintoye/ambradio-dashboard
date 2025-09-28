import { del } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function DELETE(request: NextRequest) {
  try {
    const { mediaId, blobUrl } = await request.json()

    if (!mediaId || !blobUrl) {
      return NextResponse.json({ error: "Media ID and blob URL required" }, { status: 400 })
    }

    // Delete from Vercel Blob
    await del(blobUrl)

    // Delete from database
    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)

    const { error } = await supabase.from("media").delete().eq("id", mediaId)

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to delete media record" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete error:", error)
    return NextResponse.json({ error: "Delete failed" }, { status: 500 })
  }
}
