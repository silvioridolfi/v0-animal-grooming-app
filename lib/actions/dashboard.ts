"use server"

import { createClient } from "@/lib/supabase/server"
import { getFechaArgentina } from "@/lib/utils/fecha-argentina"
import { getResumenFinanciero, type ResumenFinanciero } from "@/lib/actions/finanzas"
import { STOCK_BAJO_UMBRAL } from "@/lib/config/stock"
import type { Turno, Accesorio } from "@/lib/types"

export interface DashboardData {
  resumen: ResumenFinanciero
  turnosHoy: Turno[]
  stockBajo: Accesorio[]
  hoy: string
}

export async function getDashboardData(): Promise<DashboardData> {
  const supabase = await createClient()
  const hoy = getFechaArgentina()

  const [resumen, { data: turnosHoy }, { data: stockBajo }] = await Promise.all([
    getResumenFinanciero(hoy),
    supabase
      .from("turnos")
      .select("*, mascota:mascota_id(*, cliente:cliente_id(*))")
      .eq("fecha", hoy)
      .neq("estado", "cancelado")
      .order("hora", { ascending: true })
      .limit(6),
    supabase
      .from("accesorios")
      .select("*")
      .eq("activo", true)
      .lte("stock", STOCK_BAJO_UMBRAL)
      .order("stock", { ascending: true })
      .limit(6),
  ])

  return {
    resumen,
    turnosHoy: (turnosHoy as Turno[]) || [],
    stockBajo: (stockBajo as Accesorio[]) || [],
    hoy,
  }
}
