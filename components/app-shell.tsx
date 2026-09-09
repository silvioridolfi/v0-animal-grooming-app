"use client"

import type React from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { GlobalHeader } from "@/components/global-header"
import { BottomNav } from "@/components/bottom-nav"
import type { ShellKpis } from "@/lib/actions/shell-kpis"

export function AppShell({ kpis, children }: { kpis: ShellKpis; children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar kpis={kpis} />
      <SidebarInset>
        <GlobalHeader kpis={kpis} />
        <div className="flex-1 pb-20 md:pb-0">{children}</div>
        <BottomNav kpis={kpis} />
      </SidebarInset>
    </SidebarProvider>
  )
}
