"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Plus, TrendingUp, TrendingDown, Wallet, BarChart2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Egreso } from "@/lib/types"
import type { ResumenFinanciero, ResumenMes } from "@/lib/actions/finanzas"
import { EgresosList } from "./egresos-list"
import { EgresoForm } from "./egreso-form"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"

interface FinanzasViewProps {
  resumenInicial: ResumenFinanciero
  egresosIniciales: Egreso[]
  fechaInicial: string
  historialMesesInicial: ResumenMes[]
}

const COLORS_DONA = ["#A3B18A", "#E6A4B4"]

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

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 0 }).format(amount)

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
  const egresosTotal = view === "dia" ? resumen.egresosDia : resumen.egresosDelMes
  const balance = view === "dia" ? resumen.balanceDia : resumen.balanceDelMes

  // Datos para gráfico de dona (efectivo vs transferencia)
  const efectivo = view === "dia" ? resumen.efectivoDia : resumen.efectivoMes
  const transferencia = view === "dia" ? resumen.transferenciaDia : resumen.transferenciaMes
  const dataDona = [
    { name: "Efectivo", value: efectivo },
    { name: "Transferencia", value: transferencia },
  ].filter((d) => d.value > 0)

  // Datos para gráfico de turnos por estado
  const dataTurnos = [
    { name: "Realizados", value: view === "dia" ? resumen.turnosRealizadosDia : resumen.turnosRealizados, color: "#A3B18A" },
    { name: "Pendientes", value: view === "dia" ? resumen.turnosPendientesDia : resumen.turnosPendientes, color: "#E6A4B4" },
    { name: "Cancelados", value: view === "dia" ? resumen.turnosCanceladosDia : resumen.turnosCancelados, color: "#d1d5db" },
  ].filter((d) => d.value > 0)

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
        <span className="font-medium text-foreground capitalize">{view === "mes" ? monthName : dayName}</span>
        <Button variant="ghost" size="icon" onClick={() => view === "mes" ? navigateMonth(1) : navigateDay(1)}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Métricas resumen */}
      <div className="space-y-3">
        <h2 className="font-semibold text-foreground">
          {view === "dia" ? "Métricas del día" : "Métricas del mes"}
        </h2>
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-3 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                {view === "dia" ? "Total turnos del día" : "Total turnos del mes"}
              </p>
              <p className="text-2xl font-bold text-primary">
                {view === "dia"
                  ? resumen.turnosRealizadosDia + resumen.turnosPendientesDia + resumen.turnosCanceladosDia
                  : resumen.turnosRealizados + resumen.turnosPendientes + resumen.turnosCancelados}
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-green-700">✓ {view === "dia" ? resumen.turnosRealizadosDia : resumen.turnosRealizados} realizados</span>
              <span className="flex items-center gap-1 text-amber-600">⏳ {view === "dia" ? resumen.turnosPendientesDia : resumen.turnosPendientes} pendientes</span>
              <span className="flex items-center gap-1 text-muted-foreground">✗ {view === "dia" ? resumen.turnosCanceladosDia : resumen.turnosCancelados} cancelados</span>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-green-600">{resumen.totalMascotas}</p>
              <p className="text-xs text-muted-foreground mt-1">Mascotas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-lg font-bold text-green-700">
                ${(view === "dia" ? resumen.efectivoDia : resumen.efectivoMes).toLocaleString("es-AR")}
              </p>
              <p className="text-xs text-muted-foreground mt-1">💵 Efectivo</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-lg font-bold text-blue-600">
                ${(view === "dia" ? resumen.transferenciaDia : resumen.transferenciaMes).toLocaleString("es-AR")}
              </p>
              <p className="text-xs text-muted-foreground mt-1">🔄 Transf.</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Balance cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-3 text-center">
            <TrendingUp className="h-5 w-5 mx-auto mb-1 text-green-600" />
            <p className="text-xs text-muted-foreground">Ingresos</p>
            <p className="font-semibold text-green-600">{formatCurrency(ingresos)}</p>
          </CardContent>
        </Card>
        <Card className="bg-destructive/10 border-destructive/20">
          <CardContent className="p-3 text-center">
            <TrendingDown className="h-5 w-5 mx-auto mb-1 text-destructive" />
            <p className="text-xs text-muted-foreground">Egresos</p>
            <p className="font-semibold text-destructive">{formatCurrency(egresosTotal)}</p>
          </CardContent>
        </Card>
        <Card className={cn("border", balance >= 0 ? "bg-green-50 border-green-200" : "bg-destructive/10 border-destructive/20")}>
          <CardContent className="p-3 text-center">
            <Wallet className={cn("h-5 w-5 mx-auto mb-1", balance >= 0 ? "text-green-600" : "text-destructive")} />
            <p className="text-xs text-muted-foreground">Balance</p>
            <p className={cn("font-semibold", balance >= 0 ? "text-green-600" : "text-destructive")}>{formatCurrency(balance)}</p>
          </CardContent>
        </Card>
      </div>

      {/* ── SECCIÓN GRÁFICOS ── */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-2">
          <BarChart2 className="h-4 w-4 text-primary" />
          <h2 className="font-semibold text-foreground">Gráficos</h2>
        </div>

        {/* Gráfico 1 — Ingresos vs Egresos por mes */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ingresos vs Egresos — últimos meses</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            {historialMeses.every((m) => m.ingresos === 0 && m.egresos === 0) ? (
              <p className="text-sm text-muted-foreground text-center py-6">Sin datos suficientes aún</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={historialMeses} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={formatPesos} tick={{ fontSize: 11 }} width={45} />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    labelStyle={{ fontWeight: 600 }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="ingresos" name="Ingresos" fill="#A3B18A" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="egresos" name="Egresos" fill="#E6A4B4" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Gráfico 2 — Evolución de ingresos (línea) */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Evolución de ingresos</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            {historialMeses.every((m) => m.ingresos === 0) ? (
              <p className="text-sm text-muted-foreground text-center py-6">Sin datos suficientes aún</p>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={historialMeses} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={formatPesos} tick={{ fontSize: 11 }} width={45} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="balance" name="Balance" radius={[3, 3, 0, 0]}>
                    {historialMeses.map((entry, index) => (
                      <Cell key={index} fill={entry.balance >= 0 ? "#A3B18A" : "#E6A4B4"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Gráfico 3 — Efectivo vs Transferencia */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-sm font-medium text-muted-foreground">Método de pago</CardTitle>
            </CardHeader>
            <CardContent className="p-2 pt-0">
              {dataDona.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">Sin cobros</p>
              ) : (
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie
                      data={dataDona}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={55}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {dataDona.map((_, index) => (
                        <Cell key={index} fill={COLORS_DONA[index % COLORS_DONA.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Gráfico 4 — Turnos por estado */}
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-sm font-medium text-muted-foreground">Turnos por estado</CardTitle>
            </CardHeader>
            <CardContent className="p-2 pt-0">
              {dataTurnos.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">Sin turnos</p>
              ) : (
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie
                      data={dataTurnos}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={55}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {dataTurnos.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Egresos List */}
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