"use client"

import Link from "next/link"
import Image from "next/image"
import { Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"

export function GlobalHeader() {
  const pathname = usePathname()
  const isAgenda = pathname === "/"

  return (
    <header className={`border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-40 ${
      isAgenda ? "sticky top-0" : ""
    }`}>
      <div className="flex items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 active:opacity-70 transition-opacity">
          <Image
            src="/patita.png"
            alt="Logo Andrea Peluquería Canina"
            width={36}
            height={36}
            className="h-9 w-9"
          />
          <div className="flex flex-col leading-tight">
            <span className="text-lg font-bold font-heading" style={{ color: "#1a2e6b" }}>
              Andrea
            </span>
            <span className="text-xs font-semibold font-heading tracking-wide" style={{ color: "#E91E8C" }}>
              Peluquería Canina
            </span>
          </div>
        </Link>
        <Link href="/configuracion">
          <Button variant="ghost" size="icon" className="h-10 w-10">
            <Settings className="h-5 w-5" />
          </Button>
        </Link>
      </div>
    </header>
  )
}