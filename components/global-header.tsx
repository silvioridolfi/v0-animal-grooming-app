"use client"

import Link from "next/link"
import Image from "next/image"
import { Settings, CalendarClock, PackageX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { ShellKpis } from "@/lib/actions/shell-kpis"

export function GlobalHeader({ kpis }: { kpis: ShellKpis }) {
  const hasKpis = kpis.turnosHoyPendientes > 0 || kpis.stockBajoCount > 0

  return (
    <header className="md:hidden sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 active:opacity-70 transition-opacity">
          <Image src="/patita.png" alt="Logo Andrea Peluquería Canina" width={36} height={36} className="h-9 w-9" />
          <h1 className="text-lg font-semibold font-heading text-foreground leading-tight">
            Andrea | Peluquería Canina
          </h1>
        </Link>
        <Link href="/configuracion">
          <Button variant="ghost" size="icon" className="h-10 w-10">
            <Settings className="h-5 w-5" />
          </Button>
        </Link>
      </div>

      {hasKpis && (
        <div className="flex items-center gap-2 px-4 pb-2 overflow-x-auto">
          {kpis.turnosHoyPendientes > 0 && (
            <Link href="/">
              <Badge variant="secondary" className="gap-1 whitespace-nowrap font-normal">
                <CalendarClock className="h-3.5 w-3.5" />
                {kpis.turnosHoyPendientes} turno{kpis.turnosHoyPendientes === 1 ? "" : "s"} hoy
              </Badge>
            </Link>
          )}
          {kpis.stockBajoCount > 0 && (
            <Link href="/accesorios">
              <Badge variant="destructive" className="gap-1 whitespace-nowrap font-normal">
                <PackageX className="h-3.5 w-3.5" />
                {kpis.stockBajoCount} con stock bajo
              </Badge>
            </Link>
          )}
        </div>
      )}
    </header>
  )
}
