"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Activity, Server, Wifi } from "lucide-react"

export function PerformanceMetrics() {
  const metrics = {
    uptime: 99.8,
    cpuUsage: 23.4,
    memoryUsage: 67.2,
    diskUsage: 45.8,
    bandwidth: 2.3, // GB
    connections: 247,
    avgResponseTime: 45, // ms
    errorRate: 0.02, // %
  }

  const getStatusColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return "text-green-500"
    if (value <= thresholds.warning) return "text-yellow-500"
    return "text-red-500"
  }

  const getStatusBadge = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good)
      return (
        <Badge variant="default" className="bg-green-500/10 text-green-500 border-green-500/20">
          Good
        </Badge>
      )
    if (value <= thresholds.warning)
      return (
        <Badge variant="default" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
          Warning
        </Badge>
      )
    return (
      <Badge variant="default" className="bg-red-500/10 text-red-500 border-red-500/20">
        Critical
      </Badge>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Health
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Uptime</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{metrics.uptime}%</span>
                {getStatusBadge(100 - metrics.uptime, { good: 1, warning: 5 })}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">CPU Usage</span>
                <span className={`font-medium ${getStatusColor(metrics.cpuUsage, { good: 50, warning: 80 })}`}>
                  {metrics.cpuUsage}%
                </span>
              </div>
              <Progress value={metrics.cpuUsage} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Memory Usage</span>
                <span className={`font-medium ${getStatusColor(metrics.memoryUsage, { good: 70, warning: 85 })}`}>
                  {metrics.memoryUsage}%
                </span>
              </div>
              <Progress value={metrics.memoryUsage} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Disk Usage</span>
                <span className={`font-medium ${getStatusColor(metrics.diskUsage, { good: 60, warning: 80 })}`}>
                  {metrics.diskUsage}%
                </span>
              </div>
              <Progress value={metrics.diskUsage} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Server Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{metrics.connections}</div>
              <p className="text-sm text-muted-foreground">Active Connections</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{metrics.bandwidth}</div>
              <p className="text-sm text-muted-foreground">GB Bandwidth</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Avg Response Time</span>
              <div className="flex items-center gap-2">
                <span
                  className={`text-sm font-medium ${getStatusColor(metrics.avgResponseTime, { good: 100, warning: 500 })}`}
                >
                  {metrics.avgResponseTime}ms
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Error Rate</span>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${getStatusColor(metrics.errorRate, { good: 0.1, warning: 1 })}`}>
                  {metrics.errorRate}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            Stream Quality
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Stream Status</span>
              <Badge variant="default" className="bg-green-500/10 text-green-500 border-green-500/20">
                Online
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Bitrate</span>
              <span className="text-sm font-medium">128 kbps</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Sample Rate</span>
              <span className="text-sm font-medium">44.1 kHz</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Format</span>
              <span className="text-sm font-medium">MP3</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Buffer Health</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-green-500">Excellent</span>
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
