"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Plus, BarChart2 } from "lucide-react"
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
  const efectivo = view === "dia" ? resumen.efectivoDia : resumen.efectivoMes
  const transferencia = view === "dia" ? resumen.transferenciaDia : resumen.transferenciaMes

  const turnosRealizados = view === "dia" ? resumen.turnosRealizadosDia : resumen.turnosRealizados
  const turnosPendientes = view === "dia" ? resumen.turnosPendientesDia : resumen.turnosPendientes
  const turnosCancelados = view === "dia" ? resumen.turnosCanceladosDia : resumen.turnosCancelados
  const totalTurnos = turnosRealizados + turnosPendientes + turnosCancelados

  // Datos gráficos
  const dataDona = [
    { name: "Efectivo", value: efectivo },
    { name: "Transferencia", value: transferencia },
  ].filter((d) => d.value > 0)

  const COLORS_DONA = ["#15803d", "#1d4ed8"]

  const dataTurnos = [
    { name: "Realizados", value: turnosRealizados, color: "#15803d" },
    { name: "Pendientes", value: turnosPendientes, color: "#b45309" },
    { name: "Cancelados", value: turnosCancelados, color: "#9ca3af" },
  ].filter((d) => d.value > 0)

  const COLORS_BARRAS = {
    ingresos: "#15803d",
    egresos: "#be123c",
  }

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
              {/* Realizados — verde */}
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
                ✓ {turnosRealizados} realizados
              </span>
              {/* Pendientes — naranja */}
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                ⏳ {turnosPendientes} pendientes
              </span>
              {/* Cancelados — gris */}
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
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
          <Card className="bg-green-50 border-green-100">
            <CardContent className="p-3 text-center">
              <p className="text-lg font-bold text-green-700">
                {formatCurrency(efectivo)}
              </p>
              <p className="text-xs text-green-600 mt-1">Efectivo</p>
            </CardContent>
          </Card>
          {/* Transferencia — azul */}
          <Card className="bg-blue-50 border-blue-100">
            <CardContent className="p-3 text-center">
              <p className="text-lg font-bold text-blue-700">
                {formatCurrency(transferencia)}
              </p>
              <p className="text-xs text-blue-600 mt-1">Transf.</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Balance cards */}
      <div className="grid grid-cols-3 gap-3">
        {/* Ingresos — verde */}
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-3 text-center">
            <p className="text-xs text-green-600 mb-1">Ingresos</p>
            <p className="font-bold text-green-700">{formatCurrency(ingresos)}</p>
          </CardContent>
        </Card>
        {/* Egresos — rojo */}
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-3 text-center">
            <p className="text-xs text-red-600 mb-1">Egresos</p>
            <p className="font-bold text-red-700">{formatCurrency(egresosTotal)}</p>
          </CardContent>
        </Card>
        {/* Balance — verde o rojo según valor */}
        <Card className={cn(
          "border",
          balance >= 0 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
        )}>
          <CardContent className="p-3 text-center">
            <p className={cn("text-xs mb-1", balance >= 0 ? "text-green-600" : "text-red-600")}>
              Balance
            </p>
            <p className={cn("font-bold", balance >= 0 ? "text-green-700" : "text-red-700")}>
              {formatCurrency(balance)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── GRÁFICOS ── */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-2">
          <BarChart2 className="h-4 w-4 text-primary" />
          <h2 className="font-semibold text-foreground">Gráficos</h2>
        </div>

        {/* Ingresos vs Egresos por mes */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ingresos vs Egresos — últimos meses
            </CardTitle>
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
                  <Tooltip formatter={(value: number) => formatCurrency(value)} labelStyle={{ fontWeight: 600 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="ingresos" name="Ingresos" fill={COLORS_BARRAS.ingresos} radius={[3, 3, 0, 0]} />
                  <Bar dataKey="egresos" name="Egresos" fill={COLORS_BARRAS.egresos} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Balance mensual */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Balance mensual</CardTitle>
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
                      <Cell key={index} fill={entry.balance >= 0 ? COLORS_BARRAS.ingresos : COLORS_BARRAS.egresos} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Dona: método de pago + turnos por estado */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    <Pie data={dataDona} cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={3} dataKey="value">
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
                    <Pie data={dataTurnos} cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={3} dataKey="value">
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