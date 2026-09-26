"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { GlobalHeader } from "@/components/global-header"
import { BottomNav } from "@/components/bottom-nav"
import { InactivityLogout } from "@/components/auth/inactivity-logout"
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
      <InactivityLogout />
      <AppSidebar kpis={kpis} />
      <SidebarInset>
        <GlobalHeader kpis={kpis} />
        {/* fill-mode-none es crítico: sin esto, Tailwind deja el "transform"
            de la animación aplicado (identity, pero no "none") incluso
            después de terminar — eso convierte a este div en containing
            block de cualquier hijo "position: fixed" (el "+" flotante de
            la agenda en mobile, el carrito flotante del POS), y quedan
            pegados al fondo del contenido de la página en vez de al
            viewport, invisibles hasta scrollear hasta el final. */}
        <div key={pathname} className="flex-1 pb-20 md:pb-0 animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-none">
          {children}
        </div>
        <BottomNav kpis={kpis} />
      </SidebarInset>
    </SidebarProvider>
  )
}
