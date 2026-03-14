"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Calendar, Dog, CreditCard, Wallet, Search } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", label: "Agenda", icon: Calendar },
  { href: "/mascotas", label: "Mascotas", icon: Dog },
  { href: "/buscar", label: "Buscar", icon: Search },
  { href: "/pagos", label: "Pagos", icon: CreditCard },
  { href: "/finanzas", label: "Finanzas", icon: Wallet },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card shadow-lg">
      <div className="flex items-center justify-around py-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-2 text-xs transition-colors min-w-[60px]",
                isActive ? "text-primary" : "text-muted-foreground active:text-foreground",
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive && "stroke-[2.5px]")} />
              <span className={cn("font-medium", isActive && "font-semibold")}>{item.label}</span>
            </Link>
          )
        })}
      </div>
      <div className="h-safe-area-inset-bottom bg-card" />
    </nav>
  )
}