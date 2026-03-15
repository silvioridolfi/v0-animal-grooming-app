"use client"

import { Card, CardContent } from "@/components/ui/card"

interface PagoCardProps {
  pago: {
    id: string
    fecha: string
    hora: string
    tipo_servicio: string
    precio_final: number
    metodo_pago: string | null
    mascota?: {
      nombre: string
      tipo_animal: string
      cliente?: { nombre: string }
    }
  }
}

export function PagoCard({ pago }: PagoCardProps) {
  const fecha = pago.fecha
    ? new Date(pago.fecha).toLocaleDateString("es-AR", { day: "numeric", month: "short" })
    : ""

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">{pago.mascota?.nombre}</span>
              <span className="text-sm text-muted-foreground">— {pago.tipo_servicio}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{fecha}</span>
              {pago.mascota?.cliente?.nombre && (
                <span className="text-xs text-muted-foreground">{pago.mascota.cliente.nombre}</span>
              )}
              {pago.metodo_pago && (
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                  pago.metodo_pago === "efectivo"
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-blue-50 text-blue-700 border border-blue-200"
                }`}>
                  {pago.metodo_pago === "efectivo" ? "Efectivo" : "Transferencia"}
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <span className="text-lg font-semibold">${(pago.precio_final || 0).toLocaleString("es-AR")}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}