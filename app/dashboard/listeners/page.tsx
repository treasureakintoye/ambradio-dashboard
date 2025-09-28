"use client"

import { redirect } from "next/navigation"
import { useEffect } from "react"

export default function ListenersPage() {
  useEffect(() => {
    redirect("/dashboard/reports?tab=listeners")
  }, [])

  return null
}
