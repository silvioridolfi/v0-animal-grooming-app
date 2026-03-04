"use client"

import type { Pago } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Dog, Cat, Banknote, ArrowRightLeft } from "lucide-react"
import { cn } from "@/lib/utils"

interface PagoCardProps {
  pago: Pago
}

export function PagoCard({ pago }: PagoCardProps) {
  const turno = pago.turno
  const mascota = turno?.mascota
  const servicio = turno?.servicio

  const fecha = turno?.fecha
    ? new Date(turno.fecha).toLocaleDateString("es-AR", {
        day: "numeric",
        month: "short",
      })
    : ""

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              {mascota?.tipo_animal === "Perro" ? (
                <Dog className="h-4 w-4 text-primary" />
              ) : (
                <Cat className="h-4 w-4 text-primary" />
              )}
              <span className="font-medium text-foreground">{mascota?.nombre}</span>
              <span className="text-sm text-muted-foreground">- {servicio?.nombre}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{fecha}</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs">
                {pago.metodo === "efectivo" ? <Banknote className="h-3 w-3" /> : <ArrowRightLeft className="h-3 w-3" />}
                {pago.metodo}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-lg font-semibold text-foreground">${Number(pago.monto).toLocaleString("es-AR")}</span>
            <p className={cn("text-xs", pago.estado === "pagado" ? "text-accent" : "text-amber-600")}>{pago.estado}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
