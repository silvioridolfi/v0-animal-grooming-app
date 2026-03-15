"use client"

import Link from "next/link"
import Image from "next/image"
import { Settings } from "lucide-react"
import { Button } from "@/components/ui/button"

export function GlobalHeader() {
  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 active:opacity-70 transition-opacity">
          <Image
            src="/patita.png"
            alt="Logo Andrea Peluquería Canina"
            width={36}
            height={36}
            className="h-9 w-9"
          />
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
    </header>
  )
}