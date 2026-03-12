"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Dog, Cat, Banknote, ArrowRightLeft } from "lucide-react"

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
              {pago.mascota?.tipo_animal === "Perro" ? (
                <Dog className="h-4 w-4 text-primary" />
              ) : (
                <Cat className="h-4 w-4 text-primary" />
              )}
              <span className="font-medium">{pago.mascota?.nombre}</span>
              <span className="text-sm text-muted-foreground">— {pago.tipo_servicio}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{fecha}</span>
              {pago.mascota?.cliente?.nombre && (
                <span className="text-xs text-muted-foreground">{pago.mascota.cliente.nombre}</span>
              )}
              {pago.metodo_pago && (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs capitalize">
                  {pago.metodo_pago === "efectivo"
                    ? <><Banknote className="h-3 w-3" /> Efectivo</>
                    : <><ArrowRightLeft className="h-3 w-3" /> Transferencia</>
                  }
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