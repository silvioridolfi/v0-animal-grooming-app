import type { LucideIcon } from "lucide-react"
import { Calendar, Dog, CreditCard, Wallet, Search, ShoppingBag, Settings, Home } from "lucide-react"
import type { ShellKpis } from "@/lib/config/stock"

export interface NavItem {
  href: string
  label: string
  icon: LucideIcon
  /** Se muestra siempre como tab principal en mobile (bottom-nav) */
  primary?: boolean
  /** Si está seteado, sidebar/bottom-nav muestran ese KPI como badge numérico */
  kpiKey?: keyof ShellKpis
}

export interface NavGroup {
  id: string
  label: string
  items: NavItem[]
}

/**
 * Jerarquía única de navegación del sistema.
 * - Inicio: dashboard con el pulso del negocio (turnos hoy, ingresos, stock)
 * - Operación: lo que pasa en el día a día del local (turnos, mascotas, clientes)
 * - Ventas: mostrador / caja chica de accesorios y cobros
 * - Negocio: números grandes, config
 *
 * Se usa tal cual en el sidebar de desktop (agrupado con headers)
 * y se aplana para el bottom-nav de mobile (4 tabs + resto en "Más").
 */
export const NAV_GROUPS: NavGroup[] = [
  {
    id: "inicio",
    label: "Inicio",
    items: [{ href: "/", label: "Inicio", icon: Home, primary: true }],
  },
  {
    id: "operacion",
    label: "Operación",
    items: [
      { href: "/agenda", label: "Agenda", icon: Calendar, primary: true, kpiKey: "turnosHoyPendientes" },
      { href: "/mascotas", label: "Mascotas", icon: Dog, primary: true },
      { href: "/buscar", label: "Buscar", icon: Search },
    ],
  },
  {
    id: "ventas",
    label: "Ventas",
    items: [
      { href: "/accesorios", label: "Accesorios", icon: ShoppingBag, primary: true, kpiKey: "stockBajoCount" },
      { href: "/pagos", label: "Pagos", icon: CreditCard },
    ],
  },
  {
    id: "negocio",
    label: "Negocio",
    items: [{ href: "/finanzas", label: "Finanzas", icon: Wallet }],
  },
]

export const CONFIG_ITEM: NavItem = { href: "/configuracion", label: "Configuración", icon: Settings }

export const ALL_NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((g) => g.items)

export const PRIMARY_NAV_ITEMS: NavItem[] = ALL_NAV_ITEMS.filter((item) => item.primary)

export const SECONDARY_NAV_ITEMS: NavItem[] = [
  ...ALL_NAV_ITEMS.filter((item) => !item.primary),
  CONFIG_ITEM,
]

export function isActiveHref(pathname: string, href: string): boolean {
  return pathname === href || (href !== "/" && pathname.startsWith(href))
}
