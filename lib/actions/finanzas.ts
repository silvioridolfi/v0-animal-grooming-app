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

export interface ResumenMes {
  mes: string // "2026-03"
  label: string // "Mar"
  ingresos: number
  egresos: number
  balance: number
  turnos: number
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

const MESES_CORTO = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

export async function getResumenMultiMes(fechaActual: string, cantidadMeses = 6): Promise<ResumenMes[]> {
  const supabase = await createClient()

  // Generar los últimos N meses hacia atrás desde fechaActual
  const meses: { year: number; month: number; key: string; label: string }[] = []
  const base = new Date(fechaActual + "-01T12:00:00")

  for (let i = cantidadMeses - 1; i >= 0; i--) {
    const d = new Date(base.getFullYear(), base.getMonth() - i, 1)
    const y = d.getFullYear()
    const m = d.getMonth() + 1
    meses.push({
      year: y,
      month: m,
      key: `${y}-${String(m).padStart(2, "0")}`,
      label: `${MESES_CORTO[m - 1]} ${y !== base.getFullYear() ? y : ""}`.trim(),
    })
  }

  const startDate = `${meses[0].year}-${String(meses[0].month).padStart(2, "0")}-01`
  const lastMes = meses[meses.length - 1]
  const endDate = new Date(lastMes.year, lastMes.month, 0).toISOString().split("T")[0]

  const [{ data: turnos }, { data: egresos }] = await Promise.all([
    supabase
      .from("turnos")
      .select("fecha, precio_final, estado")
      .gte("fecha", startDate)
      .lte("fecha", endDate)
      .eq("estado", "realizado"),
    supabase
      .from("egresos")
      .select("fecha, monto")
      .gte("fecha", startDate)
      .lte("fecha", endDate),
  ])

  return meses.map(({ key, label }) => {
    const ingresos = (turnos || [])
      .filter((t) => t.fecha?.startsWith(key))
      .reduce((sum, t) => sum + Number(t.precio_final || 0), 0)

    const egresosTotal = (egresos || [])
      .filter((e) => e.fecha?.startsWith(key))
      .reduce((sum, e) => sum + Number(e.monto || 0), 0)

    const turnosCount = (turnos || []).filter((t) => t.fecha?.startsWith(key)).length

    return {
      mes: key,
      label,
      ingresos,
      egresos: egresosTotal,
      balance: ingresos - egresosTotal,
      turnos: turnosCount,
    }
  })
}