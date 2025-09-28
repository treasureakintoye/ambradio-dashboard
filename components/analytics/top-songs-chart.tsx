"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Music, Play, Heart } from "lucide-react"
import { useState } from "react"

const generateTopSongsData = () => {
  const songs = [
    { title: "Summer Vibes", artist: "The Chill Artists", plays: 342, likes: 89 },
    { title: "Midnight Dreams", artist: "Luna Sound", plays: 298, likes: 76 },
    { title: "Electric Nights", artist: "Neon Pulse", plays: 267, likes: 82 },
    { title: "Ocean Waves", artist: "Coastal Beats", plays: 234, likes: 65 },
    { title: "City Lights", artist: "Urban Flow", plays: 198, likes: 54 },
    { title: "Mountain High", artist: "Peak Sounds", plays: 176, likes: 48 },
    { title: "Desert Wind", artist: "Sand Dunes", plays: 154, likes: 41 },
    { title: "Forest Path", artist: "Nature's Call", plays: 132, likes: 38 },
  ]

  return songs.map((song, index) => ({
    ...song,
    name: `${song.title} - ${song.artist}`,
    rank: index + 1,
  }))
}

export function TopSongsChart() {
  const [metric, setMetric] = useState("plays")
  const [period, setPeriod] = useState("7d")
  const data = generateTopSongsData()

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Top Songs
          </CardTitle>
          <div className="flex gap-2">
            <Select value={metric} onValueChange={setMetric}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="plays">Plays</SelectItem>
                <SelectItem value="likes">Likes</SelectItem>
              </SelectContent>
            </Select>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24h</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis
                type="category"
                dataKey="name"
                stroke="hsl(var(--muted-foreground))"
                fontSize={10}
                width={120}
                tickFormatter={(value) => {
                  const parts = value.split(" - ")
                  return parts[0].length > 15 ? parts[0].substring(0, 15) + "..." : parts[0]
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                  color: "hsl(var(--popover-foreground))",
                }}
                formatter={(value, name) => [value, metric === "plays" ? "Plays" : "Likes"]}
                labelFormatter={(label) => label}
              />
              <Bar dataKey={metric} fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 space-y-2">
          <h4 className="font-medium text-sm">Top Performers</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Play className="h-4 w-4 text-chart-1" />
              <span className="text-muted-foreground">Most Played:</span>
              <span className="font-medium">{data[0]?.title}</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-chart-2" />
              <span className="text-muted-foreground">Most Liked:</span>
              <span className="font-medium">{data.sort((a, b) => b.likes - a.likes)[0]?.title}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
