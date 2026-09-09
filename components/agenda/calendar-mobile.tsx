"use client"

import { useState } from "react"
import type { Turno, ConfiguracionNegocio } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Plus, DollarSign, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import { getNombreFeriado } from "@/lib/feriados-argentina-2026"
import { DiaTurnoRow } from "./dia-turno-row"
import { ESTADO_DOT, FERIADO_BANNER, FERIADO_TEXT, FERIADO_DOT } from "@/lib/config/estado-turno"

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
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
]

const MAX_DOTS = 6

const toArgentinaDateStr = (): string => {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Argentina/Buenos_Aires" })
}

export function CalendarMobile({
  turnos,
  config,
  totalCobradoHoy,
  onDayClick,
  onAddTurno,
  onTurnoClick,
  initialSelectedDate,
}: CalendarMobileProps) {
  const today = toArgentinaDateStr()
  const [todayYear, todayMonth] = today.split("-").map(Number)
  const [currentMonth, setCurrentMonth] = useState(todayMonth - 1)
  const [currentYear, setCurrentYear] = useState(todayYear)
  const [selectedDate, setSelectedDate] = useState<string>(initialSelectedDate || today)

  const diasNoLaborables = config?.dias_no_laborables || []

  const turnosPorDia: Record<string, Turno[]> = {}
  turnos.forEach((turno) => {
    if (turno.estado !== "cancelado") {
      if (!turnosPorDia[turno.fecha]) turnosPorDia[turno.fecha] = []
      turnosPorDia[turno.fecha].push(turno)
    }
  })

  const isNonWorking = (dateStr: string) => diasNoLaborables.includes(dateStr)

  const year = currentYear
  const month = currentMonth
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const days = []
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`
    const holidayName = getNombreFeriado(dateStr)
    const turnosDelDia = turnosPorDia[dateStr] || []
    const realizados = turnosDelDia.filter(t => t.estado === "realizado").length
    const pendientes = turnosDelDia.filter(t => t.estado === "pendiente").length
    days.push({
      day: i,
      dateStr,
      turnosDelDia,
      turnosCount: turnosDelDia.length,
      realizados,
      pendientes,
      nonWorking: isNonWorking(dateStr),
      isFeriado: holidayName,
    })
  }

  const selectedTurnos = selectedDate ? turnosPorDia[selectedDate] || [] : []
  const selectedHoliday = selectedDate ? getNombreFeriado(selectedDate) : null

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1) }
    else setCurrentMonth(currentMonth - 1)
  }

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1) }
    else setCurrentMonth(currentMonth + 1)
  }

  const goToToday = () => {
    const t = toArgentinaDateStr()
    const [y, m] = t.split("-").map(Number)
    setCurrentMonth(m - 1)
    setCurrentYear(y)
    setSelectedDate(t)
    onDayClick(t)
  }

  const isCurrentMonth = year === todayYear && month === todayMonth - 1

  const handleDateClick = (dateStr: string) => {
    setSelectedDate(dateStr)
    onDayClick(dateStr)
  }

  const selectedDateObj = selectedDate ? new Date(selectedDate + "T12:00:00") : null
  const selectedDateFormatted = selectedDateObj
    ? selectedDateObj.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })
    : ""

  const calcularPuntos = (realizados: number, pendientes: number) => {
    const total = realizados + pendientes
    if (total === 0) return { dotsRealizados: 0, dotsPendientes: 0 }
    if (total <= MAX_DOTS) return { dotsRealizados: realizados, dotsPendientes: pendientes }
    const dotsRealizados = Math.round((realizados / total) * MAX_DOTS)
    const dotsPendientes = MAX_DOTS - dotsRealizados
    return { dotsRealizados, dotsPendientes }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-lg bg-primary/5 border border-primary/20 px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <DollarSign className="h-4 w-4" />
          <span>Total cobrado hoy</span>
        </div>
        <span className="text-lg font-semibold text-foreground">${totalCobradoHoy.toLocaleString("es-AR")}</span>
      </div>

      <Card className="shadow-sm bg-background">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="icon" onClick={prevMonth}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold">{MESES[month]} {year}</span>
              {!isCurrentMonth && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToToday}
                  className="h-7 px-2 text-xs font-semibold text-primary border-primary/30 hover:bg-primary/10"
                >
                  Hoy
                </Button>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
            <div className="flex items-center gap-1">
              <div className={cn("h-2.5 w-2.5 rounded-full", ESTADO_DOT.realizado)} />
              <span>Realizado</span>
            </div>
            <div className="flex items-center gap-1">
              <div className={cn("h-2.5 w-2.5 rounded-full", ESTADO_DOT.pendiente)} />
              <span>Pendiente</span>
            </div>
            <div className="flex items-center gap-1">
              <div className={cn("h-2.5 w-2.5 rounded-full", FERIADO_DOT)} />
              <span>Feriado</span>
            </div>
          </div>

          <div className="space-y-1.5 max-h-72 overflow-y-auto">
            {days.map(({ day, dateStr, turnosCount, realizados, pendientes, nonWorking }) => {
              const isToday = dateStr === today
              const isSelected = dateStr === selectedDate
              const dayDate = new Date(dateStr + "T12:00:00")
              const dayName = dayDate.toLocaleDateString("es-AR", { weekday: "short" })
              const holidayName = getNombreFeriado(dateStr)
              const { dotsRealizados, dotsPendientes } = calcularPuntos(realizados, pendientes)

              return (
                <button
                  key={dateStr}
                  onClick={() => handleDateClick(dateStr)}
                  className={cn(
                    "w-full flex items-center justify-between rounded-xl p-3 transition-all text-left border",
                    isSelected && "bg-primary/5 border-primary shadow-sm",
                    !isSelected && isToday && "bg-primary/5 border-primary/40 ring-1 ring-primary/30",
                    !isSelected && !isToday && !nonWorking && !holidayName && "bg-muted/30 border-border hover:bg-muted",
                    holidayName && !isSelected && FERIADO_BANNER,
                    nonWorking && !holidayName && !isSelected && "opacity-40",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-center min-w-[44px]">
                      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {dayName}
                      </div>
                      <div className="text-xl font-bold leading-tight text-foreground">{day}</div>
                    </div>
                    {holidayName && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className={cn("h-3.5 w-3.5", FERIADO_TEXT.icon)} />
                        <span className={cn("text-xs font-semibold max-w-[120px] truncate", FERIADO_TEXT.icon)}>
                          {holidayName}
                        </span>
                      </div>
                    )}
                  </div>

                  {turnosCount > 0 && (
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs font-semibold text-foreground">
                        {turnosCount} turno{turnosCount !== 1 ? "s" : ""}
                      </span>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: dotsRealizados }).map((_, i) => (
                          <div key={`r-${i}`} className={cn("h-2.5 w-2.5 rounded-full", ESTADO_DOT.realizado)} />
                        ))}
                        {Array.from({ length: dotsPendientes }).map((_, i) => (
                          <div key={`p-${i}`} className={cn("h-2.5 w-2.5 rounded-full", ESTADO_DOT.pendiente)} />
                        ))}
                      </div>
                    </div>
                  )}
                </button>
              )
            })}
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
            {selectedHoliday && (
              <div className={cn("rounded-lg px-4 py-3 border", FERIADO_BANNER)}>
                <div className="flex items-start gap-3">
                  <Calendar className={cn("h-5 w-5 flex-shrink-0 mt-0.5", FERIADO_TEXT.icon)} />
                  <div className="flex-1">
                    <p className={cn("text-sm font-semibold", FERIADO_TEXT.title)}>{selectedHoliday}</p>
                    <p className={cn("text-xs mt-1", FERIADO_TEXT.body)}>Feriado nacional de Argentina</p>
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
                    <DiaTurnoRow key={turno.id} turno={turno} onClick={() => onTurnoClick?.(turno)} />
                  ))}
              </div>
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