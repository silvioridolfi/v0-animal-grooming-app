"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { GlobalHeader } from "@/components/global-header"
import { BottomNav } from "@/components/bottom-nav"
import type { ShellKpis } from "@/lib/actions/shell-kpis"

export function AppShell({ kpis, children }: { kpis: ShellKpis; children: React.ReactNode }) {
  const pathname = usePathname()

  // /login vive sola, sin sidebar/header/bottom-nav — es la única pantalla
  // a la que se puede entrar sin sesión, así que no tiene sentido mostrarle
  // el chrome de una app a la que todavía no entraste.
  if (pathname === "/login") {
    return <>{children}</>
  }

  return (
    <SidebarProvider>
      <AppSidebar kpis={kpis} />
      <SidebarInset>
        <GlobalHeader kpis={kpis} />
        <div key={pathname} className="flex-1 pb-20 md:pb-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {children}
        </div>
        <BottomNav kpis={kpis} />
      </SidebarInset>
    </SidebarProvider>
  )
}
