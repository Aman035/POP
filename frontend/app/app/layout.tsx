import type React from "react"
import { AppHeader } from "@/components/layout/app-header"
import { AppSidebar } from "@/components/layout/app-sidebar"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="flex">
        <AppSidebar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
