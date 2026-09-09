import type { LucideIcon } from "lucide-react"
import { Calendar, Dog, CreditCard, Wallet, Search, ShoppingBag, Settings } from "lucide-react"

export interface NavItem {
  href: string
  label: string
  icon: LucideIcon
  /** Se muestra siempre como tab principal en mobile (bottom-nav) */
  primary?: boolean
}

export interface NavGroup {
  id: string
  label: string
  items: NavItem[]
}

/**
 * Jerarquía única de navegación del sistema.
 * - Operación: lo que pasa en el día a día del local (turnos, mascotas, clientes)
 * - Ventas: mostrador / caja chica de accesorios y cobros
 * - Negocio: números grandes, config
 *
 * Se usa tal cual en el sidebar de desktop (agrupado con headers)
 * y se aplana para el bottom-nav de mobile (4 tabs + resto en "Más").
 */
export const NAV_GROUPS: NavGroup[] = [
  {
    id: "operacion",
    label: "Operación",
    items: [
      { href: "/", label: "Agenda", icon: Calendar, primary: true },
      { href: "/mascotas", label: "Mascotas", icon: Dog, primary: true },
      { href: "/buscar", label: "Buscar", icon: Search },
    ],
  },
  {
    id: "ventas",
    label: "Ventas",
    items: [
      { href: "/accesorios", label: "Accesorios", icon: ShoppingBag, primary: true },
      { href: "/pagos", label: "Pagos", icon: CreditCard },
    ],
  },
  {
    id: "negocio",
    label: "Negocio",
    items: [{ href: "/finanzas", label: "Finanzas", icon: Wallet, primary: true }],
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
