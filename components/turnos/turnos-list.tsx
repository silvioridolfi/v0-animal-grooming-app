"use client"

import { useState } from "react"
import type { Turno } from "@/lib/types"
import { TurnoCard } from "@/components/agenda/turno-card"
import { EmptyState } from "@/components/empty-state"
import { Button } from "@/components/ui/button"
import { CalendarDays } from "lucide-react"

interface TurnosListProps {
  turnosProximos: Turno[]
  turnosPasados: Turno[]
}

export function TurnosList({ turnosProximos, turnosPasados }: TurnosListProps) {
  const [showPasados, setShowPasados] = useState(false)

  if (turnosProximos.length === 0 && turnosPasados.length === 0) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="Sin turnos"
        description="No hay turnos registrados. Crea uno nuevo para comenzar."
      />
    )
  }

  // Group upcoming turnos by date
  const turnosPorFecha: Record<string, Turno[]> = {}
  turnosProximos.forEach((turno) => {
    if (!turnosPorFecha[turno.fecha]) {
      turnosPorFecha[turno.fecha] = []
    }
    turnosPorFecha[turno.fecha].push(turno)
  })

  return (
    <div className="space-y-6">
      {/* Proximos turnos */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Proximos turnos</h2>
        {turnosProximos.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay turnos proximos</p>
        ) : (
          Object.entries(turnosPorFecha).map(([fecha, turnos]) => (
            <div key={fecha} className="space-y-2">
              <h3 className="text-sm font-medium capitalize text-muted-foreground">
                {new Date(fecha + "T12:00:00").toLocaleDateString("es-AR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </h3>
              <div className="space-y-2">
                {turnos
                  .sort((a, b) => a.hora.localeCompare(b.hora))
                  .map((turno) => (
                    <TurnoCard key={turno.id} turno={turno} />
                  ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Turnos pasados */}
      {turnosPasados.length > 0 && (
        <div className="space-y-4">
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground"
            onClick={() => setShowPasados(!showPasados)}
          >
            {showPasados ? "Ocultar" : "Mostrar"} turnos pasados ({turnosPasados.length})
          </Button>
          {showPasados && (
            <div className="space-y-2">
              {turnosPasados.map((turno) => (
                <TurnoCard key={turno.id} turno={turno} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
