"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Upload, File, X, CheckCircle, AlertCircle } from "lucide-react"

interface UploadFile {
  file: File
  id: string
  progress: number
  status: "pending" | "uploading" | "success" | "error"
  error?: string
}

interface MediaUploadProps {
  stationId: string
  onUploadComplete?: () => void
}

export function MediaUpload({ stationId, onUploadComplete }: MediaUploadProps) {
  const [filesToUpload, setFilesToUpload] = useState<UploadFile[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadFile[] = acceptedFiles.map((file) => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      progress: 0,
      status: "pending",
    }))
    setFilesToUpload((prev) => [...prev, ...newFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "audio/*": [".mp3", ".wav", ".flac", ".aac", ".ogg", ".m4a"],
    },
    multiple: true,
  })

  const removeFile = (id: string) => {
    setFilesToUpload((prev) => prev.filter((file) => file.id !== id))
  }

  const uploadSingleFile = async (uploadFile: UploadFile): Promise<void> => {
    return new Promise((resolve, reject) => {
      const formData = new FormData()
      formData.append("file", uploadFile.file)
      formData.append("stationId", stationId)

      const xhr = new XMLHttpRequest()

      // Track upload progress
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100)
          setFilesToUpload((prev) => prev.map((f) => (f.id === uploadFile.id ? { ...f, progress } : f)))
        }
      })

      xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText)
          if (response.success) {
            setFilesToUpload((prev) =>
              prev.map((f) => (f.id === uploadFile.id ? { ...f, status: "success", progress: 100 } : f)),
            )
            resolve()
          } else {
            setFilesToUpload((prev) =>
              prev.map((f) =>
                f.id === uploadFile.id ? { ...f, status: "error", error: response.error || "Upload failed" } : f,
              ),
            )
            reject(new Error(response.error || "Upload failed"))
          }
        } else {
          setFilesToUpload((prev) =>
            prev.map((f) =>
              f.id === uploadFile.id ? { ...f, status: "error", error: `HTTP ${xhr.status}: ${xhr.statusText}` } : f,
            ),
          )
          reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`))
        }
      })

      xhr.addEventListener("error", () => {
        setFilesToUpload((prev) =>
          prev.map((f) => (f.id === uploadFile.id ? { ...f, status: "error", error: "Network error" } : f)),
        )
        reject(new Error("Network error"))
      })

      xhr.open("POST", "/api/media/upload")
      xhr.send(formData)
    })
  }

  const handleUploadFiles = async () => {
    if (filesToUpload.length === 0) return

    setIsUploading(true)

    // Update all pending files to uploading status
    setFilesToUpload((prev) => prev.map((f) => (f.status === "pending" ? { ...f, status: "uploading" } : f)))

    // Upload files sequentially to avoid overwhelming the server
    for (const uploadFile of filesToUpload) {
      if (uploadFile.status !== "uploading") continue

      try {
        await uploadSingleFile(uploadFile)
      } catch (error) {
        console.error(`Failed to upload ${uploadFile.file.name}:`, error)
      }
    }

    setIsUploading(false)
    onUploadComplete?.()
  }

  const getStatusIcon = (status: UploadFile["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <File className="h-4 w-4 text-muted-foreground" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Media Files
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          {isDragActive ? (
            <p className="text-primary">Drop the audio files here...</p>
          ) : (
            <div>
              <p className="text-foreground font-medium">Drag & drop audio files here</p>
              <p className="text-muted-foreground text-sm mt-1">or click to browse</p>
              <p className="text-muted-foreground text-xs mt-2">Supports MP3, WAV, FLAC, AAC, OGG, M4A</p>
            </div>
          )}
        </div>

        {filesToUpload.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-foreground">Files to Upload</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {filesToUpload.map((uploadFile) => (
                <div key={uploadFile.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  {getStatusIcon(uploadFile.status)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{uploadFile.file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(uploadFile.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    {uploadFile.status === "uploading" && <Progress value={uploadFile.progress} className="h-1 mt-1" />}
                    {uploadFile.status === "error" && <p className="text-xs text-red-500 mt-1">{uploadFile.error}</p>}
                  </div>
                  {uploadFile.status === "pending" && (
                    <Button variant="ghost" size="icon" onClick={() => removeFile(uploadFile.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button onClick={handleUploadFiles} disabled={isUploading || filesToUpload.length === 0}>
                {isUploading
                  ? "Uploading..."
                  : `Upload ${filesToUpload.filter((f) => f.status === "pending").length} Files`}
              </Button>
              <Button variant="outline" onClick={() => setFilesToUpload([])} disabled={isUploading}>
                Clear All
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
