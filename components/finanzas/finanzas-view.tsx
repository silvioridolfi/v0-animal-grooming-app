"use client"

import { useState } from "react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Plus, BarChart2, ShoppingBag, Trophy, TrendingDown, TrendingUp } from "lucide-react"
import { cn, formatCurrency } from "@/lib/utils"
import { FINANZAS_COLORS as COLORS } from "@/lib/config/finanzas-colors"
import { ESTADO_HEX, ESTADO_BADGE } from "@/lib/config/estado-turno"
import type { Egreso } from "@/lib/types"
import type { ResumenFinanciero, ResumenMes } from "@/lib/actions/finanzas"
import { EgresosList } from "./egresos-list"
import { EgresoForm } from "./egreso-form"

// Recharts pesa bastante (~90kb gzip) y solo hace falta más abajo en la página,
// nunca en el primer render. Se carga en un chunk aparte, después del resto,
// sin SSR (no tiene sentido renderizarlo en el servidor si igual es interactivo).
const FinanzasCharts = dynamic(() => import("./finanzas-charts"), {
  ssr: false,
  loading: () => <div className="h-[220px] rounded-xl bg-muted animate-pulse" />,
})

interface FinanzasViewProps {
  resumenInicial: ResumenFinanciero
  egresosIniciales: Egreso[]
  fechaInicial: string
  historialMesesInicial: ResumenMes[]
}

const formatPesos = (v: number) =>
  v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`

export function FinanzasView({ resumenInicial, egresosIniciales, fechaInicial, historialMesesInicial }: FinanzasViewProps) {
  const [fecha, setFecha] = useState(fechaInicial)
  const [resumen, setResumen] = useState(resumenInicial)
  const [egresos, setEgresos] = useState(egresosIniciales)
  const [historialMeses, setHistorialMeses] = useState(historialMesesInicial)
  const [showForm, setShowForm] = useState(false)
  const [editingEgreso, setEditingEgreso] = useState<Egreso | null>(null)
  const [view, setView] = useState<"dia" | "mes">("mes")

  const currentDate = new Date(fecha + "T12:00:00")
  const monthName = currentDate.toLocaleDateString("es-AR", { month: "long", year: "numeric" })
  const dayName = currentDate.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })

  const navigateMonth = (direction: number) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() + direction)
    const newFecha = newDate.toISOString().split("T")[0]
    setFecha(newFecha)
    refreshData(newFecha)
  }

  const navigateDay = (direction: number) => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + direction)
    const newFecha = newDate.toISOString().split("T")[0]
    setFecha(newFecha)
    refreshData(newFecha)
  }

  const refreshData = async (newFecha: string) => {
    const month = newFecha.substring(0, 7)
    const [resumenRes, egresosRes, historialRes] = await Promise.all([
      fetch(`/api/finanzas/resumen?fecha=${newFecha}`).then((r) => r.json()),
      fetch(`/api/finanzas/egresos?mes=${month}`).then((r) => r.json()),
      fetch(`/api/finanzas/historial-meses?fecha=${month}`).then((r) => r.json()),
    ])
    setResumen(resumenRes)
    setEgresos(egresosRes)
    setHistorialMeses(historialRes)
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingEgreso(null)
    refreshData(fecha)
  }

  const handleEdit = (egreso: Egreso) => {
    setEditingEgreso(egreso)
    setShowForm(true)
  }

  const handleDelete = () => refreshData(fecha)

  if (showForm) {
    return (
      <div className="flex-1 p-4">
        <EgresoForm
          egreso={editingEgreso}
          onSuccess={handleFormSuccess}
          onCancel={() => { setShowForm(false); setEditingEgreso(null) }}
        />
      </div>
    )
  }

  const ingresos = view === "dia" ? resumen.ingresosDia : resumen.ingresosDelMes
  const ingresosAccesorios = view === "dia" ? resumen.ingresosAccesoriosDia : resumen.ingresosAccesoriosMes
  const egresosTotal = view === "dia" ? resumen.egresosDia : resumen.egresosDelMes
  const egresosPersonal = view === "dia" ? resumen.egresosPersonalDia : resumen.egresosPersonalMes
  const balance = view === "dia" ? resumen.balanceDia : resumen.balanceDelMes
  const efectivo = view === "dia" ? resumen.efectivoDia : resumen.efectivoMes
  const transferencia = view === "dia" ? resumen.transferenciaDia : resumen.transferenciaMes

  const turnosRealizados = view === "dia" ? resumen.turnosRealizadosDia : resumen.turnosRealizados
  const turnosPendientes = view === "dia" ? resumen.turnosPendientesDia : resumen.turnosPendientes
  const turnosCancelados = view === "dia" ? resumen.turnosCanceladosDia : resumen.turnosCancelados
  const totalTurnos = turnosRealizados + turnosPendientes + turnosCancelados

  // Datos para los gráficos (el color va adentro de cada dato para que
  // finanzas-charts.tsx no necesite saber nada de la paleta financiera)
  const dataDona = [
    { name: "Efectivo", value: efectivo, color: COLORS.efectivo },
    { name: "Transferencia", value: transferencia, color: COLORS.transferencia },
  ].filter((d) => d.value > 0)

  const dataTurnos = [
    { name: "Realizados", value: turnosRealizados, color: ESTADO_HEX.realizado },
    { name: "Pendientes", value: turnosPendientes, color: ESTADO_HEX.pendiente },
    { name: "Cancelados", value: turnosCancelados, color: ESTADO_HEX.cancelado },
  ].filter((d) => d.value > 0)

  // Comparativa mensual: mejor/peor mes de los últimos 12, y variación %
  // contra el mes inmediatamente anterior. Se excluyen meses sin ningún
  // movimiento (ej: antes de empezar a usar la app) para no ensuciar el
  // "peor mes" con un $0 que en realidad es "no había datos todavía".
  const mesesConDatos = historialMeses.filter((m) => m.ingresos > 0 || m.egresos > 0)
  const mejorMes = mesesConDatos.length > 0
    ? mesesConDatos.reduce((max, m) => (m.balance > max.balance ? m : max), mesesConDatos[0])
    : null
  const peorMes = mesesConDatos.length > 0
    ? mesesConDatos.reduce((min, m) => (m.balance < min.balance ? m : min), mesesConDatos[0])
    : null

  const mesActualData = historialMeses[historialMeses.length - 1]
  const mesAnteriorData = historialMeses[historialMeses.length - 2]

  const calcularVariacion = (actual: number, anterior: number): number | null => {
    if (anterior === 0) return null
    return ((actual - anterior) / anterior) * 100
  }

  const variacionIngresos = mesActualData && mesAnteriorData
    ? calcularVariacion(mesActualData.ingresos, mesAnteriorData.ingresos)
    : null
  const variacionEgresos = mesActualData && mesAnteriorData
    ? calcularVariacion(mesActualData.egresos, mesAnteriorData.egresos)
    : null

  return (
    <div className="flex-1 p-4 space-y-4">

      {/* View Toggle */}
      <div className="flex rounded-lg bg-muted p-1">
        <button
          onClick={() => setView("dia")}
          className={cn("flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors",
            view === "dia" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground")}
        >
          Hoy
        </button>
        <button
          onClick={() => setView("mes")}
          className={cn("flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors",
            view === "mes" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground")}
        >
          Mes
        </button>
      </div>

      {/* Date Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => view === "mes" ? navigateMonth(-1) : navigateDay(-1)}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <span className="font-medium text-foreground capitalize">
          {view === "mes" ? monthName : dayName}
        </span>
        <Button variant="ghost" size="icon" onClick={() => view === "mes" ? navigateMonth(1) : navigateDay(1)}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Acceso a Accesorios */}
      <Link href="/accesorios">
        <Card className="hover:bg-muted/50 transition-colors">
          <CardContent className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Ventas de accesorios</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </CardContent>
        </Card>
      </Link>

      {/* Métricas */}
      <div className="space-y-3">
        <h2 className="font-semibold text-foreground">
          {view === "dia" ? "Métricas del día" : "Métricas del mes"}
        </h2>

        {/* Card total turnos */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-3 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                {view === "dia" ? "Total turnos del día" : "Total turnos del mes"}
              </p>
              <p className="text-2xl font-bold text-primary">{totalTurnos}</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              {/* Mismos colores que el resto de la app para el estado de un turno */}
              <span className={cn("flex items-center gap-1 px-2 py-0.5 rounded-full border border-transparent", ESTADO_BADGE.realizado)}>
                ✓ {turnosRealizados} realizados
              </span>
              <span className={cn("flex items-center gap-1 px-2 py-0.5 rounded-full border border-transparent", ESTADO_BADGE.pendiente)}>
                ⏳ {turnosPendientes} pendientes
              </span>
              <span className={cn("flex items-center gap-1 px-2 py-0.5 rounded-full border border-transparent", ESTADO_BADGE.cancelado)}>
                ✗ {turnosCancelados} cancelados
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Mascotas + Efectivo + Transferencia */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-primary">{resumen.totalMascotas}</p>
              <p className="text-xs text-muted-foreground mt-1">Mascotas</p>
            </CardContent>
          </Card>
          {/* Efectivo — verde */}
          <Card className="bg-green-50 dark:bg-green-900/30 border-green-100 dark:border-green-800">
            <CardContent className="p-3 text-center">
              <p className="text-lg font-bold text-green-700 dark:text-green-300">
                {formatCurrency(efectivo)}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">Efectivo</p>
            </CardContent>
          </Card>
          {/* Transferencia — sky (mismo tono que el gráfico de método de pago) */}
          <Card className="bg-sky-50 dark:bg-sky-900/30 border-sky-100 dark:border-sky-800">
            <CardContent className="p-3 text-center">
              <p className="text-lg font-bold text-sky-700 dark:text-sky-300">
                {formatCurrency(transferencia)}
              </p>
              <p className="text-xs text-sky-600 dark:text-sky-400 mt-1">Transf.</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Balance cards */}
      <div className="grid grid-cols-3 gap-3">
        {/* Ingresos — verde */}
        <Card className="bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800">
          <CardContent className="p-3 text-center">
            <p className="text-xs text-green-600 dark:text-green-400 mb-1">Ingresos</p>
            <p className="font-bold text-green-700 dark:text-green-300">{formatCurrency(ingresos)}</p>
            {ingresosAccesorios > 0 && (
              <p className="text-[10px] text-green-600/70 dark:text-green-400/70 mt-0.5">
                {formatCurrency(ingresosAccesorios)} en accesorios
              </p>
            )}
          </CardContent>
        </Card>
        {/* Egresos — rojo */}
        <Card className="bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800">
          <CardContent className="p-3 text-center">
            <p className="text-xs text-red-600 dark:text-red-400 mb-1">Egresos</p>
            <p className="font-bold text-red-700 dark:text-red-300">{formatCurrency(egresosTotal)}</p>
            {egresosPersonal > 0 && (
              <p className="text-[10px] text-red-600/70 dark:text-red-400/70 mt-0.5">
                + {formatCurrency(egresosPersonal)} personal (no incluido)
              </p>
            )}
          </CardContent>
        </Card>
        {/* Balance — verde o rojo según valor */}
        <Card className={cn(
          "border",
          balance >= 0 ? "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800" : "bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800"
        )}>
          <CardContent className="p-3 text-center">
            <p className={cn("text-xs mb-1", balance >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>
              Balance
            </p>
            <p className={cn("font-bold", balance >= 0 ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300")}>
              {formatCurrency(balance)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Comparativa mensual: mejor/peor mes + variación % */}
      {mesesConDatos.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h2 className="font-semibold text-foreground">Comparativa mensual</h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800">
              <CardContent className="p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Trophy className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Mejor mes</p>
                </div>
                <p className="font-bold text-emerald-700 dark:text-emerald-300">{mejorMes?.label}</p>
                <p className="text-sm text-emerald-700 dark:text-emerald-300/80">{formatCurrency(mejorMes?.balance || 0)}</p>
              </CardContent>
            </Card>
            <Card className="bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800">
              <CardContent className="p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <TrendingDown className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">Peor mes</p>
                </div>
                <p className="font-bold text-amber-700 dark:text-amber-300">{peorMes?.label}</p>
                <p className="text-sm text-amber-700 dark:text-amber-300/80">{formatCurrency(peorMes?.balance || 0)}</p>
              </CardContent>
            </Card>
          </div>

          {variacionIngresos !== null && variacionEgresos !== null && (
            <div className="grid grid-cols-2 gap-3">
              <Card>
                <CardContent className="p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Ingresos vs. mes anterior</p>
                  <p className={cn(
                    "font-bold flex items-center justify-center gap-1",
                    variacionIngresos >= 0 ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"
                  )}>
                    {variacionIngresos >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    {variacionIngresos >= 0 ? "+" : ""}{variacionIngresos.toFixed(0)}%
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Egresos vs. mes anterior</p>
                  <p className={cn(
                    "font-bold flex items-center justify-center gap-1",
                    variacionEgresos <= 0 ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"
                  )}>
                    {variacionEgresos >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    {variacionEgresos >= 0 ? "+" : ""}{variacionEgresos.toFixed(0)}%
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* ── GRÁFICOS ── */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-2">
          <BarChart2 className="h-4 w-4 text-primary" />
          <h2 className="font-semibold text-foreground">Gráficos</h2>
        </div>

        <FinanzasCharts historialMeses={historialMeses} dataDona={dataDona} dataTurnos={dataTurnos} />
      </div>

      {/* Egresos */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Egresos del Mes</h2>
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Nuevo
          </Button>
        </div>
        <EgresosList egresos={egresos} onEdit={handleEdit} onDelete={handleDelete} />
      </div>
    </div>
  )
}