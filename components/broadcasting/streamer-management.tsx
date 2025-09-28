"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"
import { Plus, MoreHorizontal, Edit, Trash2, Mic, User } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Streamer {
  id: string
  streamer_username: string
  display_name: string
  comments?: string
  is_active: boolean
  enforce_schedule: boolean
  created_at: string
}

interface StreamerManagementProps {
  stationId: string
}

export function StreamerManagement({ stationId }: StreamerManagementProps) {
  const [streamers, setStreamers] = useState<Streamer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedStreamer, setSelectedStreamer] = useState<Streamer | null>(null)
  const [formData, setFormData] = useState({
    streamer_username: "",
    streamer_password: "",
    display_name: "",
    comments: "",
    is_active: true,
    enforce_schedule: false,
  })

  const loadStreamers = async () => {
    if (!stationId) return

    setIsLoading(true)
    const supabase = createClient()

    try {
      const { data, error } = await supabase
        .from("streamers")
        .select("*")
        .eq("station_id", stationId)
        .order("created_at", { ascending: false })

      if (error) throw error
      setStreamers(data || [])
    } catch (error) {
      console.error("Error loading streamers:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadStreamers()
  }, [stationId])

  const handleCreate = async () => {
    if (!formData.streamer_username || !formData.streamer_password) return

    const supabase = createClient()
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) return

      const { error } = await supabase.from("streamers").insert({
        station_id: stationId,
        user_id: userData.user.id,
        streamer_username: formData.streamer_username,
        streamer_password: formData.streamer_password,
        display_name: formData.display_name || formData.streamer_username,
        comments: formData.comments || null,
        is_active: formData.is_active,
        enforce_schedule: formData.enforce_schedule,
      })

      if (error) throw error

      loadStreamers()
      setCreateDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("Error creating streamer:", error)
    }
  }

  const handleEdit = (streamer: Streamer) => {
    setSelectedStreamer(streamer)
    setFormData({
      streamer_username: streamer.streamer_username,
      streamer_password: "", // Don't populate password for security
      display_name: streamer.display_name,
      comments: streamer.comments || "",
      is_active: streamer.is_active,
      enforce_schedule: streamer.enforce_schedule,
    })
    setEditDialogOpen(true)
  }

  const handleUpdate = async () => {
    if (!selectedStreamer) return

    const supabase = createClient()
    try {
      const updateData: any = {
        display_name: formData.display_name,
        comments: formData.comments || null,
        is_active: formData.is_active,
        enforce_schedule: formData.enforce_schedule,
        updated_at: new Date().toISOString(),
      }

      // Only update password if provided
      if (formData.streamer_password) {
        updateData.streamer_password = formData.streamer_password
      }

      const { error } = await supabase.from("streamers").update(updateData).eq("id", selectedStreamer.id)

      if (error) throw error

      loadStreamers()
      setEditDialogOpen(false)
      setSelectedStreamer(null)
      resetForm()
    } catch (error) {
      console.error("Error updating streamer:", error)
    }
  }

  const handleDelete = async (streamer: Streamer) => {
    if (!confirm(`Are you sure you want to delete streamer "${streamer.display_name}"?`)) return

    const supabase = createClient()
    try {
      const { error } = await supabase.from("streamers").delete().eq("id", streamer.id)
      if (error) throw error
      loadStreamers()
    } catch (error) {
      console.error("Error deleting streamer:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      streamer_username: "",
      streamer_password: "",
      display_name: "",
      comments: "",
      is_active: true,
      enforce_schedule: false,
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Streamers & DJs
            </CardTitle>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Streamer
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading streamers...</div>
          ) : streamers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Mic className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No streamers configured</p>
              <Button onClick={() => setCreateDialogOpen(true)} className="mt-4">
                Add Your First Streamer
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Display Name</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {streamers.map((streamer) => (
                    <TableRow key={streamer.id}>
                      <TableCell className="font-medium">{streamer.display_name}</TableCell>
                      <TableCell className="font-mono text-sm">{streamer.streamer_username}</TableCell>
                      <TableCell>
                        <Badge variant={streamer.is_active ? "default" : "secondary"}>
                          {streamer.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={streamer.enforce_schedule ? "outline" : "secondary"}>
                          {streamer.enforce_schedule ? "Enforced" : "Open"}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(streamer.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(streamer)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(streamer)} className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Streamer Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Streamer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                value={formData.streamer_username}
                onChange={(e) => setFormData({ ...formData, streamer_username: e.target.value })}
                placeholder="dj_username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={formData.streamer_password}
                onChange={(e) => setFormData({ ...formData, streamer_password: e.target.value })}
                placeholder="Secure password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="display_name">Display Name</Label>
              <Input
                id="display_name"
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                placeholder="DJ Sarah"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="comments">Comments</Label>
              <Textarea
                id="comments"
                value={formData.comments}
                onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                placeholder="Optional notes about this streamer"
                rows={3}
              />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="is_active">Active</Label>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="enforce_schedule">Enforce Schedule</Label>
                <Switch
                  id="enforce_schedule"
                  checked={formData.enforce_schedule}
                  onCheckedChange={(checked) => setFormData({ ...formData, enforce_schedule: checked })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create Streamer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Streamer Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Streamer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Username</Label>
              <Input value={formData.streamer_username} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground">Username cannot be changed</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_password">New Password</Label>
              <Input
                id="edit_password"
                type="password"
                value={formData.streamer_password}
                onChange={(e) => setFormData({ ...formData, streamer_password: e.target.value })}
                placeholder="Leave empty to keep current password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_display_name">Display Name</Label>
              <Input
                id="edit_display_name"
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_comments">Comments</Label>
              <Textarea
                id="edit_comments"
                value={formData.comments}
                onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="edit_is_active">Active</Label>
                <Switch
                  id="edit_is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="edit_enforce_schedule">Enforce Schedule</Label>
                <Switch
                  id="edit_enforce_schedule"
                  checked={formData.enforce_schedule}
                  onCheckedChange={(checked) => setFormData({ ...formData, enforce_schedule: checked })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Update Streamer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
