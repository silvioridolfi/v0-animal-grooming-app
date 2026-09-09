"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import { PRIMARY_NAV_ITEMS, SECONDARY_NAV_ITEMS, isActiveHref } from "@/lib/config/nav"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import type { ShellKpis } from "@/lib/config/stock"

export function BottomNav({ kpis }: { kpis: ShellKpis }) {
  const pathname = usePathname()
  const [moreOpen, setMoreOpen] = useState(false)

  const isSecondaryActive = SECONDARY_NAV_ITEMS.some((item) => isActiveHref(pathname, item.href))
  const hasSecondaryAlert = SECONDARY_NAV_ITEMS.some((item) => item.kpiKey && kpis[item.kpiKey] > 0)

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card shadow-lg">
        <div className="flex items-center justify-around py-1">
          {PRIMARY_NAV_ITEMS.map((item) => {
            const isActive = isActiveHref(pathname, item.href)
            const badge = item.kpiKey ? kpis[item.kpiKey] : 0
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex flex-col items-center gap-0.5 px-3 py-2 text-xs transition-colors min-w-[60px]",
                  isActive ? "text-primary" : "text-muted-foreground active:text-foreground",
                )}
              >
                <span className="relative">
                  <item.icon className={cn("h-5 w-5", isActive && "stroke-[2.5px]")} />
                  {badge > 0 && (
                    <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
                      {badge}
                    </span>
                  )}
                </span>
                <span className={cn("font-medium", isActive && "font-semibold")}>{item.label}</span>
              </Link>
            )
          })}

          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className={cn(
              "relative flex flex-col items-center gap-0.5 px-3 py-2 text-xs transition-colors min-w-[60px]",
              isSecondaryActive ? "text-primary" : "text-muted-foreground active:text-foreground",
            )}
          >
            <span className="relative">
              <MoreHorizontal className={cn("h-5 w-5", isSecondaryActive && "stroke-[2.5px]")} />
              {hasSecondaryAlert && (
                <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-destructive" />
              )}
            </span>
            <span className={cn("font-medium", isSecondaryActive && "font-semibold")}>Más</span>
          </button>
        </div>
        <div className="h-safe-area-inset-bottom bg-card" />
      </nav>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl pb-8">
          <SheetHeader>
            <SheetTitle>Más opciones</SheetTitle>
          </SheetHeader>
          <div className="grid grid-cols-3 gap-3 px-4 pt-2">
            {SECONDARY_NAV_ITEMS.map((item) => {
              const isActive = isActiveHref(pathname, item.href)
              const badge = item.kpiKey ? kpis[item.kpiKey] : 0
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMoreOpen(false)}
                  className={cn(
                    "relative flex flex-col items-center gap-1.5 rounded-lg border border-border p-3 text-xs transition-colors",
                    isActive ? "border-primary text-primary bg-primary/5" : "text-muted-foreground active:bg-muted",
                  )}
                >
                  <span className="relative">
                    <item.icon className="h-5 w-5" />
                    {badge > 0 && (
                      <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
                        {badge}
                      </span>
                    )}
                  </span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
