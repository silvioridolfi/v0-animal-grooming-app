"use server"

import { createClient } from "@/lib/supabase/server"

export interface ResumenFinanciero {
  ingresosDia: number
  ingresosDelMes: number
  egresosDia: number
  egresosDelMes: number
  balanceDia: number
  balanceDelMes: number
  turnosRealizados: number
  turnosPendientes: number
  turnosCancelados: number
  efectivoMes: number
  transferenciaMes: number
  totalMascotas: number
  turnosRealizadosDia: number
  turnosPendientesDia: number
  turnosCanceladosDia: number
  efectivoDia: number
  transferenciaDia: number
}

export async function getResumenFinanciero(fecha: string): Promise<ResumenFinanciero> {
  const supabase = await createClient()

  const [year, month] = fecha.split("-")
  const startOfMonth = `${year}-${month}-01`
  const endOfMonth = new Date(Number.parseInt(year), Number.parseInt(month), 0).toISOString().split("T")[0]

  const [
    { data: turnosMes },
    { data: egresosDiaData },
    { data: egresosMesData },
    { data: todosTurnosMes },
    { count: totalMascotas },
  ] = await Promise.all([
    supabase.from("turnos").select("precio_final").gte("fecha", startOfMonth).lte("fecha", endOfMonth).eq("estado", "realizado"),
    supabase.from("egresos").select("monto").eq("fecha", fecha),
    supabase.from("egresos").select("monto").gte("fecha", startOfMonth).lte("fecha", endOfMonth),
    supabase.from("turnos").select("fecha, estado, metodo_pago, precio_final").gte("fecha", startOfMonth).lte("fecha", endOfMonth),
    supabase.from("mascotas").select("id", { count: "exact", head: true }),
  ])

  const ingresosDelMes = turnosMes?.reduce((sum, t) => sum + Number(t.precio_final), 0) || 0
  const egresosDia = egresosDiaData?.reduce((sum, e) => sum + Number(e.monto), 0) || 0
  const egresosDelMes = egresosMesData?.reduce((sum, e) => sum + Number(e.monto), 0) || 0

  const turnosRealizados = todosTurnosMes?.filter((t) => t.estado === "realizado").length || 0
  const turnosPendientes = todosTurnosMes?.filter((t) => t.estado === "pendiente").length || 0
  const turnosCancelados = todosTurnosMes?.filter((t) => t.estado === "cancelado").length || 0
  const efectivoMes = todosTurnosMes?.filter((t) => t.metodo_pago === "efectivo" && t.estado === "realizado").reduce((sum, t) => sum + Number(t.precio_final || 0), 0) || 0
  const transferenciaMes = todosTurnosMes?.filter((t) => t.metodo_pago === "transferencia" && t.estado === "realizado").reduce((sum, t) => sum + Number(t.precio_final || 0), 0) || 0
  const ingresosDia = todosTurnosMes?.filter((t) => t.fecha === fecha && t.estado === "realizado").reduce((sum, t) => sum + Number(t.precio_final || 0), 0) || 0

  const turnosDiaCompletos = todosTurnosMes?.filter((t) => t.fecha === fecha) || []
  const turnosRealizadosDia = turnosDiaCompletos.filter((t) => t.estado === "realizado").length
  const turnosPendientesDia = turnosDiaCompletos.filter((t) => t.estado === "pendiente").length
  const turnosCanceladosDia = turnosDiaCompletos.filter((t) => t.estado === "cancelado").length
  const efectivoDia = turnosDiaCompletos.filter((t) => t.metodo_pago === "efectivo" && t.estado === "realizado").reduce((sum, t) => sum + Number(t.precio_final || 0), 0)
  const transferenciaDia = turnosDiaCompletos.filter((t) => t.metodo_pago === "transferencia" && t.estado === "realizado").reduce((sum, t) => sum + Number(t.precio_final || 0), 0)

  return {
    ingresosDia,
    ingresosDelMes,
    egresosDia,
    egresosDelMes,
    balanceDia: ingresosDia - egresosDia,
    balanceDelMes: ingresosDelMes - egresosDelMes,
    turnosRealizados,
    turnosPendientes,
    turnosCancelados,
    efectivoMes,
    transferenciaMes,
    totalMascotas: totalMascotas || 0,
    turnosRealizadosDia,
    turnosPendientesDia,
    turnosCanceladosDia,
    efectivoDia,
    transferenciaDia,
  }
}