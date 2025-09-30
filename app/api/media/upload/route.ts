import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

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

    // Save file locally
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filename = Date.now() + '-' + file.name
    const uploadDir = path.join(process.cwd(), 'public/media', stationId)
    await fs.promises.mkdir(uploadDir, { recursive: true })
    const filepath = path.join(uploadDir, filename)
    await fs.promises.writeFile(filepath, buffer)

    // Extract metadata from file name
    const fileName = file.name
    const nameWithoutExt = path.basename(fileName, path.extname(fileName))
    const parts = nameWithoutExt.split(" - ")
    const artist = parts.length > 1 ? parts[0] : "Unknown Artist"
    const title = parts.length > 1 ? parts.slice(1).join(" - ") : nameWithoutExt

    const media = await prisma.media.create({
      data: {
        stationId,
        uniqueId: `${stationId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title,
        artist,
        path: `/media/${stationId}/${filename}`,
        length: 0, // Could use music-metadata library to extract
        isVisible: true,
        isPlayable: true,
      },
      select: {
        id: true,
        title: true,
        artist: true,
        path: true,
      }
    })

    return NextResponse.json({
      success: true,
      url: media.path,
      filename: file.name,
      size: file.size,
      type: file.type,
      mediaId: media.id,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
