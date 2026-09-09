"use server"

import { createClient } from "@/lib/supabase/server"
import { getFechaArgentina } from "@/lib/utils/fecha-argentina"
import { STOCK_BAJO_UMBRAL } from "@/lib/config/stock"
import type { ShellKpis } from "@/lib/config/stock"

export type { ShellKpis } from "@/lib/config/stock"

/**
 * Consultas mínimas (count-only, sin traer filas) pensadas para correr
 * en cada navegación desde el layout raíz sin pesar en el bundle de datos.
 */
export async function getShellKpis(): Promise<ShellKpis> {
  const supabase = await createClient()
  const hoy = getFechaArgentina()

  const [{ count: turnosHoyPendientes }, { count: stockBajoCount }] = await Promise.all([
    supabase
      .from("turnos")
      .select("*", { count: "exact", head: true })
      .eq("fecha", hoy)
      .eq("estado", "pendiente"),
    supabase
      .from("accesorios")
      .select("*", { count: "exact", head: true })
      .eq("activo", true)
      .lte("stock", STOCK_BAJO_UMBRAL),
  ])

  return {
    turnosHoyPendientes: turnosHoyPendientes ?? 0,
    stockBajoCount: stockBajoCount ?? 0,
  }
}
