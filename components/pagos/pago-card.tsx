"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Dog, Cat } from "lucide-react"
import { cn } from "@/lib/utils"
import { METODO_PAGO_BADGE } from "@/lib/config/finanzas-colors"

interface PagoCardProps {
  pago: {
    id: string
    fecha: string
    hora: string
    tipo_servicio: string
    precio_final: number
    metodo_pago: string | null
    monto_reembolsado?: number
    mascota?: {
      nombre: string
      tipo_animal: string
      cliente?: { nombre: string }
    }
  }
}

export function PagoCard({ pago }: PagoCardProps) {
  const fecha = pago.fecha
    ? new Date(pago.fecha + "T12:00:00").toLocaleDateString("es-AR", { day: "numeric", month: "short" })
    : ""
  const estaReembolsado = Number(pago.monto_reembolsado) > 0

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
            {pago.mascota?.tipo_animal === "Gato" ? (
              <Cat className="h-5 w-5 text-primary" />
            ) : (
              <Dog className="h-5 w-5 text-primary" />
            )}
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium truncate">{pago.mascota?.nombre}</span>
              <span className="text-sm text-muted-foreground truncate">— {pago.tipo_servicio}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
              <span>{fecha}</span>
              {pago.mascota?.cliente?.nombre && (
                <span className="text-xs text-muted-foreground truncate">{pago.mascota.cliente.nombre}</span>
              )}
              {pago.metodo_pago && (
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                    METODO_PAGO_BADGE[pago.metodo_pago as "efectivo" | "transferencia"],
                  )}
                >
                  {pago.metodo_pago === "efectivo" ? "Efectivo" : "Transferencia"}
                </span>
              )}
              {estaReembolsado && (
                <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-destructive/10 text-destructive">
                  Reembolsado ${Number(pago.monto_reembolsado).toLocaleString("es-AR")}
                </span>
              )}
            </div>
          </div>

          <span className="shrink-0 text-lg font-bold font-heading text-foreground">
            ${(pago.precio_final || 0).toLocaleString("es-AR")}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
