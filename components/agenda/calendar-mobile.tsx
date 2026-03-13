"use client"

import { useState } from "react"
import type { Turno, ConfiguracionNegocio } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Plus, DollarSign, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import { getNombreFeriado } from "@/lib/feriados-argentina-2026"

interface CalendarMobileProps {
  turnos: Turno[]
  config: ConfiguracionNegocio | null
  totalCobradoHoy: number
  onDayClick: (fecha: string) => void
  onAddTurno: (fecha: string) => void
  onTurnoClick?: (turno: Turno) => void
  initialSelectedDate?: string
}

const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
]

export function CalendarMobile({
  turnos,
  config,
  totalCobradoHoy,
  onDayClick,
  onAddTurno,
  onTurnoClick,
  initialSelectedDate,
}: CalendarMobileProps) {
  const today = new Date().toISOString().split("T")[0]
  const [currentMonth, setCurrentMonth] = useState(Number.parseInt(today.split("-")[1]) - 1)
  const [currentYear, setCurrentYear] = useState(Number.parseInt(today.split("-")[0]))
  const [selectedDate, setSelectedDate] = useState<string>(initialSelectedDate || today)

  const diasLaborales = config?.dias_laborales || [1, 2, 3, 4, 5]
  const diasNoLaborables = config?.dias_no_laborables || []

  const turnosPorDia: Record<string, Turno[]> = {}
  turnos.forEach((turno) => {
    if (turno.estado !== "cancelado") {
      if (!turnosPorDia[turno.fecha]) {
        turnosPorDia[turno.fecha] = []
      }
      turnosPorDia[turno.fecha].push(turno)
    }
  })

  const isNonWorking = (dateStr: string) => {
    // Ahora se permite agendar en cualquier día, incluyendo feriados
    // Solo se verifica si no es un día no laborable configurado manualmente
    if (diasNoLaborables.includes(dateStr)) return true
    return false
  }

  const year = currentYear
  const month = currentMonth
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay = new Date(year, month, 1).getDay()

  const days = []
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`
    const isFeriado = getNombreFeriado(dateStr)
    days.push({
      day: i,
      dateStr,
      hasTurnos: !!turnosPorDia[dateStr],
      turnosCount: turnosPorDia[dateStr]?.length || 0,
      nonWorking: isNonWorking(dateStr),
      isFeriado,
    })
  }

  const selectedTurnos = selectedDate ? turnosPorDia[selectedDate] || [] : []
  const selectedHoliday = selectedDate ? getNombreFeriado(selectedDate) : null

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  const handleDateClick = (dateStr: string) => {
    setSelectedDate(dateStr)
    onDayClick(dateStr)
  }

  const selectedDateObj = selectedDate ? new Date(selectedDate + "T12:00:00") : null
  const selectedDateFormatted = selectedDateObj
    ? selectedDateObj.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })
    : ""

  const selectedFeriado = selectedDate ? getNombreFeriado(selectedDate) : ""

  return (
    <div className="space-y-4">
      {/* Total cobrado hoy */}
      <div className="flex items-center justify-between rounded-lg bg-accent/30 px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <DollarSign className="h-4 w-4" />
          <span>Total cobrado hoy</span>
        </div>
        <span className="text-lg font-semibold text-foreground">${totalCobradoHoy.toLocaleString("es-AR")}</span>
      </div>

      {/* Calendar Card */}
      <Card className="shadow-sm bg-background">
        <CardContent className="p-4">
          {/* Month/Year Navigation */}
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="icon" onClick={prevMonth}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <span className="text-lg font-semibold">
              {MESES[month]} {year}
            </span>
            <Button variant="ghost" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

{/* Total turnos del mes */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full bg-amber-100 ring-1 ring-amber-300" />
              <span>Feriado</span>
            </div>
            <div className="flex items-center gap-1 ml-2">
              <div className="h-5 w-5 flex items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {Object.values(turnosPorDia).reduce((sum, t) => {
                  return sum + t.filter(turno => {
                    const d = new Date(turno.fecha + "T12:00:00")
                    return d.getFullYear() === currentYear && d.getMonth() === currentMonth
                  }).length
                }, 0)}
              </div>
              <span>Turnos este mes</span>
            </div>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {days.map(({ day, dateStr, hasTurnos, turnosCount, nonWorking }) => {
              const isToday = dateStr === today
              const isSelected = dateStr === selectedDate
              const dayDate = new Date(dateStr + "T12:00:00")
              const dayName = dayDate.toLocaleDateString("es-AR", { weekday: "short" })
              const holidayName = getNombreFeriado(dateStr)

              return (
                <button
                  key={dateStr}
                  onClick={() => handleDateClick(dateStr)}
                  className={cn(
                    "w-full flex items-center justify-between rounded-lg p-3 transition-all text-left",
                    isSelected && "bg-primary text-primary-foreground",
                    !isSelected && isToday && "bg-primary/10 border-2 border-primary",
                    !isSelected && !isToday && !nonWorking && !holidayName && "bg-muted/50 hover:bg-muted",
                    holidayName && !isSelected && "bg-amber-100 text-amber-900 border border-amber-300",
                    nonWorking && !holidayName && !isSelected && "opacity-40",
                  )}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="text-center">
                      <div className="text-xs font-semibold text-muted-foreground uppercase">{dayName}</div>
                      <div className="text-lg font-bold">{day}</div>
                    </div>
                    {holidayName && (
                      <div className="flex items-center gap-2 ml-auto">
                        <Calendar className="h-3.5 w-3.5 text-amber-600" />
                        <span className="text-xs font-semibold text-amber-700 max-w-[120px] truncate">{holidayName}</span>
                      </div>
                    )}
                    {hasTurnos && !holidayName && (
                      <div className="ml-auto text-sm font-semibold">
                        {turnosCount} turno{turnosCount !== 1 ? "s" : ""}
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Agenda diaria */}
      {selectedDate && (
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base capitalize">{selectedDateFormatted}</CardTitle>
              <span className="text-xs text-muted-foreground">{selectedTurnos.length} turno(s)</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedHoliday && (
              <div className="rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 px-4 py-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-amber-900">{selectedHoliday}</p>
                    <p className="text-xs text-amber-700 mt-1">Feriado nacional de Argentina</p>
                    <p className="text-xs text-amber-600 mt-2 italic">Puedes agendar turnos normalmente en esta fecha</p>
                  </div>
                </div>
              </div>
            )}
            {isNonWorking(selectedDate) && !selectedHoliday ? (
              <div className="rounded-lg bg-muted px-4 py-3 text-center">
                <p className="text-sm text-muted-foreground">Día no laborable</p>
              </div>
            ) : selectedTurnos.length === 0 ? (
              <div className="rounded-lg bg-muted/30 px-4 py-6 text-center">
                <p className="text-sm text-muted-foreground mb-3">Sin turnos agendados</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => onAddTurno(selectedDate)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar turno
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  {selectedTurnos
                    .sort((a, b) => a.hora.localeCompare(b.hora))
                    .map((turno) => (
                      <div
                        key={turno.id}
                        onClick={() => onTurnoClick?.(turno)}
                        className="rounded-lg bg-muted/50 p-3 border-l-2 border-primary cursor-pointer hover:bg-muted"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm">{turno.hora.slice(0, 5)}</span>
                              <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
                                {turno.estado}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              <p>
                                {turno.mascota?.nombre} ({turno.mascota?.cliente?.nombre})
                              </p>
                              <p>{turno.tipo_servicio}</p>
                            </div>
                            <div className="text-xs font-semibold mt-1 text-foreground">
                              {turno.estado === "realizado"
                                ? `$${turno.precio_final?.toLocaleString("es-AR")}`
                                : turno.estado === "cancelado"
                                ? "Cancelado"
                                : "Pendiente"}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      <div className="fixed bottom-24 right-4 z-40">
        <Button
          onClick={() => onAddTurno(selectedDate)}
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg flex items-center justify-center"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  )
}
