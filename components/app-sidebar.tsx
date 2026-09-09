"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { NAV_GROUPS, CONFIG_ITEM, isActiveHref } from "@/lib/config/nav"
import type { ShellKpis } from "@/lib/actions/shell-kpis"

const KPI_BADGE_BY_HREF: Record<string, keyof ShellKpis> = {
  "/": "turnosHoyPendientes",
  "/accesorios": "stockBajoCount",
}

export function AppSidebar({ kpis }: { kpis: ShellKpis }) {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon" className="hidden md:flex">
      <SidebarHeader>
        <Link href="/" className="flex items-center gap-2 px-2 py-1.5 active:opacity-70 transition-opacity">
          <Image src="/patita.png" alt="Logo" width={28} height={28} className="h-7 w-7 shrink-0" />
          <span className="font-heading font-semibold text-sidebar-foreground leading-tight truncate group-data-[collapsible=icon]:hidden">
            Andrea | Peluquería
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {NAV_GROUPS.map((group) => (
          <SidebarGroup key={group.id}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const active = isActiveHref(pathname, item.href)
                  const kpiKey = KPI_BADGE_BY_HREF[item.href]
                  const kpiValue = kpiKey ? kpis[kpiKey] : 0

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={active} tooltip={item.label}>
                        <Link href={item.href}>
                          <item.icon />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                      {kpiValue > 0 && (
                        <SidebarMenuBadge
                          className={item.href === "/accesorios" ? "bg-destructive text-destructive-foreground" : undefined}
                        >
                          {kpiValue}
                        </SidebarMenuBadge>
                      )}
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActiveHref(pathname, CONFIG_ITEM.href)} tooltip={CONFIG_ITEM.label}>
              <Link href={CONFIG_ITEM.href}>
                <CONFIG_ITEM.icon />
                <span>{CONFIG_ITEM.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
