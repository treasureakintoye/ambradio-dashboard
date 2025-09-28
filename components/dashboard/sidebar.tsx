"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Radio,
  Music,
  PlayCircle,
  BarChart3,
  Settings,
  Mic,
  Calendar,
  FileAudio,
  Headphones,
  Activity,
  Database,
  Zap,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: BarChart3,
  },
  {
    name: "Station Profile",
    href: "/dashboard/station",
    icon: Radio,
  },
  {
    name: "Media",
    href: "/dashboard/media",
    icon: Music,
  },
  {
    name: "Playlists",
    href: "/dashboard/playlists",
    icon: PlayCircle,
  },
  {
    name: "Schedule",
    href: "/dashboard/schedule",
    icon: Calendar,
  },
  {
    name: "Streamers/DJs",
    href: "/dashboard/streamers",
    icon: Mic,
  },
  {
    name: "Listeners",
    href: "/dashboard/listeners",
    icon: Headphones,
  },
  {
    name: "Reports",
    href: "/dashboard/reports",
    icon: Activity,
  },
  {
    name: "Song Requests",
    href: "/dashboard/requests",
    icon: FileAudio,
  },
  {
    name: "Broadcasting",
    href: "/dashboard/broadcasting",
    icon: Zap,
  },
  {
    name: "Administration",
    href: "/dashboard/admin",
    icon: Database,
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-sidebar border-r border-sidebar-border">
      <div className="flex h-16 items-center border-b border-sidebar-border px-6">
        <div className="flex items-center gap-2">
          <Radio className="h-8 w-8 text-sidebar-primary" />
          <span className="text-xl font-bold text-sidebar-foreground">AmbRadio Automation</span>
        </div>
      </div>
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent",
                    isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Button>
              </Link>
            )
          })}
        </nav>
      </ScrollArea>
    </div>
  )
}
