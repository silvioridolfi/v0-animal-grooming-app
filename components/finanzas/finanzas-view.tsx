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
const TrendCharts = dynamic(() => import("./finanzas-charts").then((m) => m.TrendCharts), {
  ssr: false,
  loading: () => <div className="h-[220px] rounded-xl bg-muted animate-pulse" />,
})
const DistributionCharts = dynamic(() => import("./finanzas-charts").then((m) => m.DistributionCharts), {
  ssr: false,
  loading: () => <div className="h-[160px] rounded-xl bg-muted animate-pulse" />,
})

interface FinanzasViewProps {
  resumenInicial: ResumenFinanciero
  egresosIniciales: Egreso[]
  fechaInicial: string
  historialMesesInicial: ResumenMes[]
}

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

      {/* ═══ RESUMEN ═══ — los 3 números que importan, arriba y neutros:
          el color vive en el número y en la flechita de variación, no en
          el fondo entero de la card (antes cada card era un bloque sólido
          verde/rojo/azul, competían todas por atención al mismo tiempo) */}
      <div className="space-y-3">
        <h2 className="font-semibold text-foreground">Resumen</h2>

        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground mb-1">Ingresos</p>
              <p className="text-lg font-bold font-heading text-emerald-600 dark:text-emerald-400">
                {formatCurrency(ingresos)}
              </p>
              {view === "mes" && variacionIngresos !== null && (
                <p className={cn(
                  "text-[11px] flex items-center gap-0.5 mt-0.5",
                  variacionIngresos >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"
                )}>
                  {variacionIngresos >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {variacionIngresos >= 0 ? "+" : ""}{variacionIngresos.toFixed(0)}%
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground mb-1">Egresos</p>
              <p className="text-lg font-bold font-heading text-destructive">{formatCurrency(egresosTotal)}</p>
              {view === "mes" && variacionEgresos !== null && (
                <p className={cn(
                  "text-[11px] flex items-center gap-0.5 mt-0.5",
                  variacionEgresos <= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"
                )}>
                  {variacionEgresos >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {variacionEgresos >= 0 ? "+" : ""}{variacionEgresos.toFixed(0)}%
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground mb-1">Balance</p>
              <p className={cn(
                "text-lg font-bold font-heading",
                balance >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"
              )}>
                {formatCurrency(balance)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Desglose fino — antes eran 2 cards propias del mismo tamaño que
            "Ingresos", como si fueran datos aparte en vez de un detalle
            de esa misma plata */}
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Efectivo {formatCurrency(efectivo)}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
            Transferencia {formatCurrency(transferencia)}
          </span>
          {ingresosAccesorios > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
              <ShoppingBag className="h-3 w-3" />
              {formatCurrency(ingresosAccesorios)} en accesorios
            </span>
          )}
          {egresosPersonal > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
              {formatCurrency(egresosPersonal)} personal (no incluido en Egresos)
            </span>
          )}
        </div>

        {/* Turnos + mascotas */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">
                  {view === "dia" ? "Turnos hoy" : "Turnos del mes"}
                </p>
                <p className="text-xl font-bold font-heading text-foreground">{totalTurnos}</p>
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium border border-transparent", ESTADO_BADGE.realizado)}>
                  ✓ {turnosRealizados}
                </span>
                <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium border border-transparent", ESTADO_BADGE.pendiente)}>
                  ⏳ {turnosPendientes}
                </span>
                {turnosCancelados > 0 && (
                  <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium border border-transparent", ESTADO_BADGE.cancelado)}>
                    ✗ {turnosCancelados}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 flex items-center justify-between h-full">
              <p className="text-sm font-medium text-foreground">Mascotas registradas</p>
              <p className="text-xl font-bold font-heading text-foreground">{resumen.totalMascotas}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ═══ TENDENCIAS ═══ — comparativa + gráficos agrupados, separados
          del resumen con una línea divisoria clara. En escritorio se
          reparte en 3 columnas: el gráfico principal ocupa 2/3 del ancho,
          comparativa + donas quedan de barra lateral a la derecha — antes
          todo esto iba apilado a lo ancho completo de la pantalla, con
          mucho espacio vacío adentro de cada card y scroll de sobra. En
          mobile no cambia nada: sigue todo apilado en el mismo orden. */}
      <div className="space-y-3 pt-3 border-t border-border">
        <div className="flex items-center gap-2">
          <BarChart2 className="h-4 w-4 text-primary" />
          <h2 className="font-semibold text-foreground">Tendencias</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:grid-rows-2">
          {mesesConDatos.length > 0 && (
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-1 lg:col-start-3 lg:row-start-1">
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center gap-1.5 mb-1 text-muted-foreground">
                    <Trophy className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    <p className="text-xs font-medium">Mejor mes</p>
                  </div>
                  <p className="font-semibold text-foreground">{mejorMes?.label}</p>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400">{formatCurrency(mejorMes?.balance || 0)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center gap-1.5 mb-1 text-muted-foreground">
                    <TrendingDown className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                    <p className="text-xs font-medium">Peor mes</p>
                  </div>
                  <p className="font-semibold text-foreground">{peorMes?.label}</p>
                  <p className="text-sm text-amber-600 dark:text-amber-400">{formatCurrency(peorMes?.balance || 0)}</p>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="lg:col-start-1 lg:col-span-2 lg:row-start-1 lg:row-span-2">
            <TrendCharts historialMeses={historialMeses} />
          </div>

          <div className="lg:col-start-3 lg:row-start-2">
            <DistributionCharts dataDona={dataDona} dataTurnos={dataTurnos} />
          </div>
        </div>
      </div>

      {/* Egresos */}
      <div className="space-y-3 pt-3 border-t border-border">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Egresos del mes</h2>
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