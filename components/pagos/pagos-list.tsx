"use client"

import type { Pago } from "@/lib/types"
import { PagoCard } from "./pago-card"
import { EmptyState } from "@/components/empty-state"
import { CreditCard, DollarSign, Banknote, ArrowRightLeft } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface PagosListProps {
  pagos: Pago[]
  totalHoy: number
  efectivoHoy: number
  transferenciaHoy: number
}

export function PagosList({ pagos, totalHoy, efectivoHoy, transferenciaHoy }: PagosListProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3">
        <Card className="bg-accent/20">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2 text-sm text-foreground">
              <DollarSign className="h-4 w-4" />
              <span>Total cobrado hoy</span>
            </div>
            <span className="text-xl font-bold text-foreground">${totalHoy.toLocaleString("es-AR")}</span>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Banknote className="h-4 w-4" />
                <span>Efectivo</span>
              </div>
              <p className="mt-1 font-semibold text-foreground">${efectivoHoy.toLocaleString("es-AR")}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ArrowRightLeft className="h-4 w-4" />
                <span>Transferencia</span>
              </div>
              <p className="mt-1 font-semibold text-foreground">${transferenciaHoy.toLocaleString("es-AR")}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {pagos.length === 0 ? (
        <EmptyState icon={CreditCard} title="Sin pagos" description="Los pagos registrados apareceran aqui." />
      ) : (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Historial de pagos</h3>
          {pagos.map((pago) => (
            <PagoCard key={pago.id} pago={pago} />
          ))}
        </div>
      )}
    </div>
  )
}
