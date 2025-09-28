"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Users, TrendingUp } from "lucide-react"
import { useState } from "react"

const generateListenerData = (period: string) => {
  const now = new Date()
  const data = []

  if (period === "24h") {
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000)
      data.push({
        time: time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        listeners: Math.floor(Math.random() * 200) + 50 + (i < 12 ? 100 : 0), // Higher during day
        unique: Math.floor(Math.random() * 150) + 30 + (i < 12 ? 80 : 0),
      })
    }
  } else if (period === "7d") {
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      data.push({
        time: date.toLocaleDateString([], { weekday: "short" }),
        listeners: Math.floor(Math.random() * 300) + 100,
        unique: Math.floor(Math.random() * 250) + 80,
      })
    }
  } else {
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      data.push({
        time: date.getDate().toString(),
        listeners: Math.floor(Math.random() * 400) + 150,
        unique: Math.floor(Math.random() * 350) + 120,
      })
    }
  }

  return data
}

export function ListenerChart() {
  const [period, setPeriod] = useState("24h")
  const data = generateListenerData(period)

  const currentListeners = data[data.length - 1]?.listeners || 0
  const previousListeners = data[data.length - 2]?.listeners || 0
  const trend = (((currentListeners - previousListeners) / previousListeners) * 100).toFixed(1)
  const isPositive = Number(trend) > 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Listener Statistics
          </CardTitle>
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
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{currentListeners}</div>
            <p className="text-sm text-muted-foreground">Current</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{Math.max(...data.map((d) => d.listeners))}</div>
            <p className="text-sm text-muted-foreground">Peak</p>
          </div>
          <div className="text-center">
            <div
              className={`text-2xl font-bold flex items-center justify-center gap-1 ${isPositive ? "text-green-500" : "text-red-500"}`}
            >
              <TrendingUp className={`h-4 w-4 ${!isPositive ? "rotate-180" : ""}`} />
              {Math.abs(Number(trend))}%
            </div>
            <p className="text-sm text-muted-foreground">Change</p>
          </div>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                  color: "hsl(var(--popover-foreground))",
                }}
              />
              <Line
                type="monotone"
                dataKey="listeners"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                name="Total Listeners"
                dot={{ fill: "hsl(var(--chart-1))", strokeWidth: 2, r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="unique"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                name="Unique Listeners"
                dot={{ fill: "hsl(var(--chart-2))", strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
