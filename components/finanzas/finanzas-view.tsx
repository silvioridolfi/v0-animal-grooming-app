"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Plus, TrendingUp, TrendingDown, Wallet } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Egreso } from "@/lib/types"
import type { ResumenFinanciero } from "@/lib/actions/finanzas"
import { EgresosList } from "./egresos-list"
import { EgresoForm } from "./egreso-form"

interface FinanzasViewProps {
  resumenInicial: ResumenFinanciero
  egresosIniciales: Egreso[]
  fechaInicial: string
}

export function FinanzasView({ resumenInicial, egresosIniciales, fechaInicial }: FinanzasViewProps) {
  const [fecha, setFecha] = useState(fechaInicial)
  const [resumen, setResumen] = useState(resumenInicial)
  const [egresos, setEgresos] = useState(egresosIniciales)
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
    const [resumenRes, egresosRes] = await Promise.all([
      fetch(`/api/finanzas/resumen?fecha=${newFecha}`).then((r) => r.json()),
      fetch(`/api/finanzas/egresos?mes=${month}`).then((r) => r.json()),
    ])
    setResumen(resumenRes)
    setEgresos(egresosRes)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(amount)
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

  const handleDelete = () => {
    refreshData(fecha)
  }

  if (showForm) {
    return (
      <div className="flex-1 p-4">
        <EgresoForm
          egreso={editingEgreso}
          onSuccess={handleFormSuccess}
          onCancel={() => {
            setShowForm(false)
            setEditingEgreso(null)
          }}
        />
      </div>
    )
  }

  const ingresos = view === "dia" ? resumen.ingresosDia : resumen.ingresosDelMes
  const egresosTotal = view === "dia" ? resumen.egresosDia : resumen.egresosDelMes
  const balance = view === "dia" ? resumen.balanceDia : resumen.balanceDelMes

  return (
    <div className="flex-1 p-4 space-y-4">
      {/* View Toggle */}
      <div className="flex rounded-lg bg-muted p-1">
        <button
          onClick={() => setView("dia")}
          className={cn(
            "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors",
            view === "dia" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground",
          )}
        >
          Hoy
        </button>
        <button
          onClick={() => setView("mes")}
          className={cn(
            "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors",
            view === "mes" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground",
          )}
        >
          Mes
        </button>
      </div>

      {/* Date Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => (view === "mes" ? navigateMonth(-1) : navigateDay(-1))}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <span className="font-medium text-foreground capitalize">{view === "mes" ? monthName : dayName}</span>
        <Button variant="ghost" size="icon" onClick={() => (view === "mes" ? navigateMonth(1) : navigateDay(1))}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Métricas */}
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
              <span className="flex items-center gap-1 text-green-700">
                <span>✓</span> {view === "dia" ? resumen.turnosRealizadosDia : resumen.turnosRealizados} realizados
              </span>
              <span className="flex items-center gap-1 text-amber-600">
                <span>⏳</span> {view === "dia" ? resumen.turnosPendientesDia : resumen.turnosPendientes} pendientes
              </span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <span>✗</span> {view === "dia" ? resumen.turnosCanceladosDia : resumen.turnosCancelados} cancelados
              </span>
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

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-positive/10 border-positive/20">
          <CardContent className="p-3 text-center">
            <TrendingUp className="h-5 w-5 mx-auto mb-1 text-positive" />
            <p className="text-xs text-muted-foreground">Ingresos</p>
            <p className="font-semibold text-positive">{formatCurrency(ingresos)}</p>
          </CardContent>
        </Card>
        <Card className="bg-destructive/10 border-destructive/20">
          <CardContent className="p-3 text-center">
            <TrendingDown className="h-5 w-5 mx-auto mb-1 text-destructive" />
            <p className="text-xs text-muted-foreground">Egresos</p>
            <p className="font-semibold text-destructive">{formatCurrency(egresosTotal)}</p>
          </CardContent>
        </Card>
        <Card
          className={cn(
            "border",
            balance >= 0 ? "bg-positive/10 border-positive/20" : "bg-destructive/10 border-destructive/20",
          )}
        >
          <CardContent className="p-3 text-center">
            <Wallet className={cn("h-5 w-5 mx-auto mb-1", balance >= 0 ? "text-positive" : "text-destructive")} />
            <p className="text-xs text-muted-foreground">Balance</p>
            <p className={cn("font-semibold", balance >= 0 ? "text-positive" : "text-destructive")}>
              {formatCurrency(balance)}
            </p>
          </CardContent>
        </Card>
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