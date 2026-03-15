"use client"

import { useState, useMemo } from "react"
import type { Turno, ConfiguracionNegocio } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, DollarSign, Plus, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { getNombreFeriado } from "@/lib/feriados-argentina-2026"

interface CalendarAgendaProps {
  turnos: Turno[]
  config: ConfiguracionNegocio | null
  totalCobradoHoy: number
  onDayClick: (fecha: string) => void
  onAddTurno: (fecha: string) => void
  onTurnoClick?: (turno: Turno) => void
  initialSelectedDate?: string
}

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
]

const DIAS_SEMANA_CORTO = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"]

const getBadgeColor = (estado: string, isSelected: boolean) => {
  if (isSelected) return "bg-white/20 text-white"
  switch (estado) {
    case "realizado": return "bg-accent/15 text-accent"
    case "cancelado": return "bg-muted text-muted-foreground"
    default: return "bg-primary/15 text-primary"
  }
}

const getEstadoBadge = (estado: string) => {
  switch (estado) {
    case "realizado": return "bg-accent/15 text-accent"
    case "cancelado": return "bg-muted/80 text-muted-foreground"
    default: return "bg-primary/15 text-primary"
  }
}

const getBorderColor = (estado: string) => {
  switch (estado) {
    case "realizado": return "border-accent"
    case "cancelado": return "border-muted-foreground/30"
    default: return "border-primary"
  }
}

export function CalendarAgenda({
  turnos,
  config,
  totalCobradoHoy,
  onDayClick,
  onAddTurno,
  onTurnoClick,
  initialSelectedDate,
}: CalendarAgendaProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string>(
    initialSelectedDate || new Date().toISOString().split("T")[0],
  )
  const [expandedDay, setExpandedDay] = useState<string | null>(null)

  const selectedFeriado = useMemo(() => getNombreFeriado(selectedDate), [selectedDate])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  let startDay = firstDayOfMonth.getDay() - 1
  if (startDay < 0) startDay = 6
  const daysInMonth = lastDayOfMonth.getDate()

  const diasNoLaborables = config?.dias_no_laborables || []

  const turnosPorDia: Record<string, Turno[]> = {}
  turnos.forEach((turno) => {
    if (turno.estado !== "cancelado") {
      if (!turnosPorDia[turno.fecha]) turnosPorDia[turno.fecha] = []
      turnosPorDia[turno.fecha].push(turno)
    }
  })

  const isNonWorking = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0]
    return diasNoLaborables.includes(dateStr)
  }

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  const handleDateClick = (day: number) => {
    const date = new Date(year, month, day)
    const dateStr = date.toISOString().split("T")[0]
    setSelectedDate(dateStr)
    onDayClick(dateStr)
  }

  const today = new Date().toISOString().split("T")[0]
  const selectedTurnos = selectedDate ? turnosPorDia[selectedDate] || [] : []
  const selectedIsNonWorking = selectedDate ? isNonWorking(new Date(selectedDate + "T12:00:00")) : false

  const totalTurnosDelMes = Object.values(turnosPorDia).reduce((sum, t) => {
    return sum + t.filter((turno) => {
      const d = new Date(turno.fecha + "T12:00:00")
      return d.getFullYear() === year && d.getMonth() === month
    }).length
  }, 0)

  const selectedDateObj = selectedDate ? new Date(selectedDate + "T12:00:00") : null
  const selectedDateFormatted = selectedDateObj
    ? selectedDateObj.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })
    : ""

  const days = []

  for (let i = 0; i < startDay; i++) {
    days.push(<div key={`empty-${i}`} className="aspect-square" />)
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    const dateStr = date.toISOString().split("T")[0]
    const isToday = dateStr === today
    const isSelected = dateStr === selectedDate
    const nonWorking = isNonWorking(date)
    const dayOfWeekIndex = date.getDay()
    const dayName = DIAS_SEMANA_CORTO[dayOfWeekIndex === 0 ? 6 : dayOfWeekIndex - 1]
    const turnosDelDia = turnosPorDia[dateStr] || []

    days.push(
      <div
        key={day}
        onClick={() => handleDateClick(day)}
        className={cn(
          "relative group flex flex-col aspect-square rounded-lg border-2 transition-all active:scale-95 cursor-pointer p-3 overflow-hidden",
          isSelected && "border-primary bg-primary text-white shadow-lg",
          isToday && !isSelected && "ring-2 ring-primary ring-offset-1 border-primary/40",
          !isSelected && "border-border hover:bg-muted/50 hover:border-primary/30",
        )}
      >
        <div className={cn(
          "text-center text-xs font-semibold mb-1 uppercase tracking-wide",
          isSelected ? "text-white/70" : "text-muted-foreground"
        )}>
          {dayName}
        </div>

        {getNombreFeriado(dateStr) && (
          <div className="mb-1 flex items-center justify-center gap-1 px-1 py-0.5 rounded bg-amber-100/80 border border-amber-200">
            <Calendar className="h-2.5 w-2.5 text-amber-700" />
            <span className="text-xs font-semibold text-amber-700 truncate">{getNombreFeriado(dateStr)}</span>
          </div>
        )}

        <div className="flex-1 flex flex-col gap-1 mb-2 pb-1 overflow-hidden">
          {turnosDelDia.slice(0, 2).map((turno, idx) => (
            <div
              key={idx}
              onClick={(e) => { e.stopPropagation(); onTurnoClick?.(turno) }}
              className={cn(
                "text-xs rounded-md px-2 py-1 font-medium cursor-pointer hover:opacity-80 transition-opacity truncate",
                isSelected
                  ? "bg-white/20 text-white"
                  : turno.estado === "realizado"
                  ? "bg-accent/15 text-accent"
                  : "bg-primary/15 text-primary"
              )}
              title={`${turno.hora.slice(0, 5)} - ${turno.mascota?.nombre}`}
            >
              <span className="font-semibold">{turno.hora.slice(0, 5)}</span>
              <span className="ml-1">{turno.mascota?.nombre}</span>
            </div>
          ))}
          {turnosDelDia.length > 2 && (
            <button
              onClick={(e) => { e.stopPropagation(); setExpandedDay(dateStr) }}
              className={cn(
                "text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity text-left px-2 py-1",
                isSelected ? "text-white/80" : "text-primary hover:text-primary/80",
              )}
            >
              +{turnosDelDia.length - 2} más
            </button>
          )}
        </div>

        <div className={cn(
          "text-2xl font-bold leading-none",
          isSelected ? "text-white" : "text-foreground/80"
        )}>
          {day}
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); onAddTurno(dateStr) }}
          className={cn(
            "absolute bottom-2 right-2 h-8 w-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:scale-110",
            isSelected
              ? "bg-white text-primary opacity-100"
              : "bg-primary text-primary-foreground"
          )}
          title="Agregar turno"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>,
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-lg bg-accent/20 px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <DollarSign className="h-4 w-4" />
          <span>Total cobrado hoy</span>
        </div>
        <span className="text-lg font-semibold text-foreground">${totalCobradoHoy.toLocaleString("es-AR")}</span>
      </div>

      <Card className="shadow-sm bg-background">
        <CardContent className="p-4">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <Button variant="ghost" size="icon" onClick={prevMonth} className="h-10 w-10">
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <span className="text-lg font-semibold font-heading">{MESES[month]} {year}</span>
              <Button variant="ghost" size="icon" onClick={nextMonth} className="h-10 w-10">
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
            {selectedDate && (
              <div className="text-center text-sm text-muted-foreground mb-3 capitalize">
                Viendo: {selectedDateFormatted}
              </div>
            )}
          </div>

          <div className="grid grid-cols-7 gap-1">{days}</div>

          <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full bg-amber-100 ring-1 ring-amber-300" />
              <span>Feriado</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-md bg-primary/15" />
              <span>Pendiente</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-md bg-accent/15" />
              <span>Realizado</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-5 w-5 flex items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {totalTurnosDelMes}
              </div>
              <span>Turnos</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedDate && (
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base capitalize">{selectedDateFormatted}</CardTitle>
              <span className="text-xs text-muted-foreground">{selectedTurnos.length} turno(s)</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {getNombreFeriado(selectedDate) && (
              <div className="rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 px-4 py-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-amber-900">{getNombreFeriado(selectedDate)}</p>
                    <p className="text-xs text-amber-700 mt-1">Feriado nacional de Argentina</p>
                    <p className="text-xs text-amber-600 mt-2 italic">Puedes agendar turnos normalmente en esta fecha</p>
                  </div>
                </div>
              </div>
            )}
            {selectedIsNonWorking && !getNombreFeriado(selectedDate) ? (
              <div className="rounded-lg bg-muted px-4 py-3 text-center">
                <p className="text-sm text-muted-foreground">Día no laborable</p>
              </div>
            ) : selectedTurnos.length === 0 ? (
              <div className="rounded-lg bg-muted/30 px-4 py-6 text-center">
                <p className="text-sm text-muted-foreground mb-3">Sin turnos agendados</p>
                <Button size="sm" variant="outline" className="w-full bg-transparent" onClick={() => onAddTurno(selectedDate)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar turno
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {selectedTurnos
                  .sort((a, b) => a.hora.localeCompare(b.hora))
                  .map((turno) => (
                    <div
                      key={turno.id}
                      onClick={() => onTurnoClick?.(turno)}
                      className={cn(
                        "rounded-lg bg-muted/50 p-3 border-l-4 cursor-pointer hover:bg-muted transition-colors",
                        getBorderColor(turno.estado)
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">{turno.hora.slice(0, 5)}</span>
                            <span className={cn("text-xs px-2 py-0.5 rounded", getEstadoBadge(turno.estado))}>
                              {turno.estado}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            <p>{turno.mascota?.nombre} ({turno.mascota?.cliente?.nombre})</p>
                            <p>{turno.tipo_servicio}</p>
                          </div>
                          <div className="text-xs font-semibold mt-1 text-foreground">
                            {turno.estado === "realizado"
                              ? `$${turno.precio_final?.toLocaleString("es-AR")}`
                              : "Pendiente"}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Dialog open={expandedDay !== null} onOpenChange={(open) => !open && setExpandedDay(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              Turnos del{" "}
              {expandedDay ? new Date(expandedDay + "T12:00:00").toLocaleDateString("es-AR", {
                weekday: "long", day: "numeric", month: "long",
              }) : ""}
            </DialogTitle>
            <DialogDescription>
              Lista de turnos programados para esta fecha.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {expandedDay && turnosPorDia[expandedDay]?.map((turno) => (
              <div
                key={turno.id}
                onClick={() => { onTurnoClick?.(turno); setExpandedDay(null) }}
                className={cn(
                  "rounded-lg bg-muted/50 p-3 border-l-4 cursor-pointer hover:bg-muted/70 transition-colors",
                  getBorderColor(turno.estado)
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{turno.hora.slice(0, 5)}</span>
                      <span className={cn("text-xs px-2 py-0.5 rounded", getEstadoBadge(turno.estado))}>
                        {turno.estado}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      <p>{turno.mascota?.nombre} ({turno.mascota?.cliente?.nombre})</p>
                      <p>{turno.tipo_servicio}</p>
                    </div>
                    <div className="text-xs font-semibold mt-1 text-foreground">
                      ${turno.precio_final?.toLocaleString("es-AR")}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}