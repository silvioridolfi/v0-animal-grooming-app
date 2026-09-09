"use client"

import type { HistorialServicio } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Scissors, Droplet, Calendar, DollarSign, TrendingUp } from "lucide-react"
import { METODO_PAGO_BADGE } from "@/lib/config/finanzas-colors"
import { cn } from "@/lib/utils"

interface HistorialServiciosProps {
  historial: HistorialServicio[]
  isLoading?: boolean
}

export function HistorialServicios({ historial, isLoading }: HistorialServiciosProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Historial de servicios</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Cargando...</p>
        </CardContent>
      </Card>
    )
  }

  if (!historial || historial.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Historial de servicios</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Sin servicios registrados</p>
        </CardContent>
      </Card>
    )
  }

  const getServiceIcon = (tipo: string) => {
    switch (tipo) {
      case "Corte":
        return <Scissors className="h-4 w-4 text-primary" />
      case "Baño":
        return <Droplet className="h-4 w-4 text-primary" />
      case "Corte y Baño":
        return <Scissors className="h-4 w-4 text-primary" />
      default:
        return null
    }
  }

  const totalGastado = historial.reduce((sum, h) => sum + h.precio, 0)
  const serviciosMasComun = historial.reduce(
    (acc, h) => {
      acc[h.tipo_servicio] = (acc[h.tipo_servicio] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )
  const tipoMasComun = Object.entries(serviciosMasComun).sort(([, a], [, b]) => b - a)[0]?.[0]

  return (
    <div className="space-y-4">
      {/* Resumen del historial */}
      <div className="grid grid-cols-2 gap-2">
        <Card>
          <CardContent className="pt-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Total gastado</p>
              <p className="text-lg font-bold flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                ${totalGastado.toLocaleString("es-AR")}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Servicios</p>
              <p className="text-lg font-bold flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                {historial.length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Listado de servicios */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Últimos servicios</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {historial.slice(0, 10).map((item) => (
            <div key={item.id} className="flex items-start justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {getServiceIcon(item.tipo_servicio)}
                  <span className="font-medium">{item.tipo_servicio}</span>
                  {item.monto_reembolsado > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded font-medium bg-destructive/10 text-destructive">
                      Reembolsado ${item.monto_reembolsado.toLocaleString("es-AR")}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(item.fecha_servicio + "T12:00:00").toLocaleDateString("es-AR")}
                </div>
              </div>
              <div className="text-right space-y-1">
                <p className="font-semibold">${item.precio.toLocaleString("es-AR")}</p>
                <span
                  className={cn(
                    "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                    item.metodo_pago ? METODO_PAGO_BADGE[item.metodo_pago] : "bg-muted text-muted-foreground",
                  )}
                >
                  {item.metodo_pago === "efectivo" ? "Efectivo" : item.metodo_pago === "transferencia" ? "Transf." : "N/A"}
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {tipoMasComun && (
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Servicio más frecuente</p>
            <p className="text-lg font-semibold flex items-center gap-2 mt-1">
              {getServiceIcon(tipoMasComun)}
              {tipoMasComun}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
