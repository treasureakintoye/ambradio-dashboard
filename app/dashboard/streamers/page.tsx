"use client"

import { redirect } from "next/navigation"
import { useEffect } from "react"

export default function StreamersPage() {
  useEffect(() => {
    redirect("/dashboard/broadcasting?tab=streamers")
  }, [])

  return null
}
