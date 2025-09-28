"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { FileAudio, Search, RefreshCw, Check, X } from "lucide-react"

interface SongRequest {
  id: string
  title: string
  artist: string
  requester_name: string
  requester_message?: string
  status: "pending" | "approved" | "rejected" | "played"
  requested_at: string
}

export default function RequestsPage() {
  const [requests, setRequests] = useState<SongRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  const loadRequests = async () => {
    setIsLoading(true)
    // Mock data for now - in real implementation, load from database
    const mockRequests: SongRequest[] = [
      {
        id: "1",
        title: "Bohemian Rhapsody",
        artist: "Queen",
        requester_name: "John Doe",
        requester_message: "Please play this classic!",
        status: "pending",
        requested_at: new Date().toISOString(),
      },
      {
        id: "2",
        title: "Hotel California",
        artist: "Eagles",
        requester_name: "Jane Smith",
        status: "approved",
        requested_at: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: "3",
        title: "Stairway to Heaven",
        artist: "Led Zeppelin",
        requester_name: "Mike Johnson",
        requester_message: "My favorite song ever!",
        status: "played",
        requested_at: new Date(Date.now() - 7200000).toISOString(),
      },
    ]

    setTimeout(() => {
      setRequests(mockRequests)
      setIsLoading(false)
    }, 500)
  }

  useEffect(() => {
    loadRequests()
  }, [])

  const updateRequestStatus = (id: string, status: SongRequest["status"]) => {
    setRequests(requests.map((req) => (req.id === id ? { ...req, status } : req)))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500"
      case "approved":
        return "bg-green-500"
      case "rejected":
        return "bg-red-500"
      case "played":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  const filteredRequests = requests.filter(
    (request) =>
      request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.requester_name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Song Requests</h2>
          <p className="text-muted-foreground">Manage listener song requests and dedications</p>
        </div>
        <Button onClick={loadRequests} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search requests..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="grid gap-4">
        {filteredRequests.map((request) => (
          <Card key={request.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileAudio className="h-5 w-5" />
                  {request.title} - {request.artist}
                </CardTitle>
                <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
              </div>
              <CardDescription>
                Requested by {request.requester_name} • {new Date(request.requested_at).toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {request.requester_message && (
                <p className="text-sm text-muted-foreground mb-4">"{request.requester_message}"</p>
              )}
              {request.status === "pending" && (
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => updateRequestStatus(request.id, "approved")}>
                    <Check className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => updateRequestStatus(request.id, "rejected")}>
                    <X className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </div>
              )}
              {request.status === "approved" && (
                <Button size="sm" onClick={() => updateRequestStatus(request.id, "played")}>
                  Mark as Played
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRequests.length === 0 && !isLoading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileAudio className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Song Requests</h3>
            <p className="text-muted-foreground text-center">
              {searchTerm ? "No requests match your search" : "No song requests have been submitted yet"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
