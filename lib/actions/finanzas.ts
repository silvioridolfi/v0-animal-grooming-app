"use server"

import { createClient } from "@/lib/supabase/server"

export interface ResumenFinanciero {
  ingresosDia: number
  ingresosDelMes: number
  egresosDia: number
  egresosDelMes: number
  balanceDia: number
  balanceDelMes: number
}

export async function getResumenFinanciero(fecha: string): Promise<ResumenFinanciero> {
  const supabase = await createClient()

  const [year, month, day] = fecha.split("-")
  const startOfMonth = `${year}-${month}-01`
  const endOfMonth = new Date(Number.parseInt(year), Number.parseInt(month), 0).toISOString().split("T")[0]

  const { data: turnosDia } = await supabase
    .from("turnos")
    .select("precio_final")
    .eq("fecha", fecha)
    .eq("estado", "realizado")

  const ingresosDia = turnosDia?.reduce((sum, t) => sum + Number(t.precio_final), 0) || 0

  const { data: turnosMes } = await supabase
    .from("turnos")
    .select("precio_final")
    .gte("fecha", startOfMonth)
    .lte("fecha", endOfMonth)
    .eq("estado", "realizado")

  const ingresosDelMes = turnosMes?.reduce((sum, t) => sum + Number(t.precio_final), 0) || 0

  // Get day's expenses
  const { data: egresosDiaData } = await supabase.from("egresos").select("monto").eq("fecha", fecha)

  const egresosDia = egresosDiaData?.reduce((sum, e) => sum + Number(e.monto), 0) || 0

  // Get month's expenses
  const { data: egresosMesData } = await supabase
    .from("egresos")
    .select("monto")
    .gte("fecha", startOfMonth)
    .lte("fecha", endOfMonth)

  const egresosDelMes = egresosMesData?.reduce((sum, e) => sum + Number(e.monto), 0) || 0

  return {
    ingresosDia,
    ingresosDelMes,
    egresosDia,
    egresosDelMes,
    balanceDia: ingresosDia - egresosDia,
    balanceDelMes: ingresosDelMes - egresosDelMes,
  }
}
