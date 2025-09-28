import { createClient } from "@/lib/supabase/server"
import { StatsCard } from "@/components/dashboard/stats-card"
import { NowPlaying } from "@/components/dashboard/now-playing"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Music, Radio, Activity, TrendingUp, Clock } from "lucide-react"

export default async function DashboardPage() {
  const supabase = await createClient()

  // Get user's stations
  const { data: stations } = await supabase.from("stations").select("*").limit(5)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h2>
        <p className="text-muted-foreground">Welcome back! Here's what's happening with your radio stations.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Current Listeners"
          value="1,247"
          description="Across all stations"
          icon={Users}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Songs Played Today"
          value="342"
          description="AutoDJ rotation"
          icon={Music}
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard title="Active Stations" value={stations?.length || 0} description="Broadcasting live" icon={Radio} />
        <StatsCard
          title="Uptime"
          value="99.8%"
          description="Last 30 days"
          icon={Activity}
          trend={{ value: 0.2, isPositive: true }}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Now Playing */}
        <NowPlaying />

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">Station "Mix FM" started</p>
                  <p className="text-xs text-muted-foreground">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">New song request received</p>
                  <p className="text-xs text-muted-foreground">5 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-yellow-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">Playlist "Evening Mix" updated</p>
                  <p className="text-xs text-muted-foreground">12 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-purple-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">DJ "Sarah" went live</p>
                  <p className="text-xs text-muted-foreground">1 hour ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Peak Listeners Today</span>
                <span className="text-sm font-medium text-foreground">1,847</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Average Session</span>
                <span className="text-sm font-medium text-foreground">23m 45s</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Song Requests</span>
                <span className="text-sm font-medium text-foreground">47 pending</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Storage Used</span>
                <span className="text-sm font-medium text-foreground">2.4 GB / 10 GB</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stations Overview */}
      {stations && stations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Stations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {stations.map((station) => (
                <Card key={station.id} className="border-muted">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-foreground">{station.name}</h3>
                        <p className="text-sm text-muted-foreground">{station.short_name}</p>
                      </div>
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">{station.description || "No description"}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
