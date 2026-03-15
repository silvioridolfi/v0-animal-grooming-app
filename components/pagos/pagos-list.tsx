"use client"

import { useState, useMemo } from "react"
import { PagoCard } from "./pago-card"
import { EmptyState } from "@/components/empty-state"
import { CreditCard, DollarSign, Banknote, ArrowRightLeft, Download } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface PagosListProps {
  pagos: any[]
  totalHoy: number
  efectivoHoy: number
  transferenciaHoy: number
}

function exportarPagosExcel(pagos: any[], filtroMetodo: string, filtroDesde: string, filtroHasta: string) {
  import("xlsx").then((XLSX) => {
    const datos = pagos.map((pago) => ({
      Fecha: pago.fecha
        ? new Date(pago.fecha + "T12:00:00").toLocaleDateString("es-AR")
        : "",
      Hora: pago.hora ? pago.hora.slice(0, 5) : "",
      Mascota: pago.mascota?.nombre || "",
      "Dueño": pago.mascota?.cliente?.nombre || "",
      Servicio: pago.tipo_servicio || "",
      "Método de pago":
        pago.metodo_pago === "efectivo"
          ? "Efectivo"
          : pago.metodo_pago === "transferencia"
          ? "Transferencia"
          : "",
      "Monto ($)": pago.precio_final || 0,
    }))

    const totalMonto = pagos.reduce((sum, p) => sum + (p.precio_final || 0), 0)
    datos.push({
      Fecha: "",
      Hora: "",
      Mascota: "",
      "Dueño": "",
      Servicio: "",
      "Método de pago": "TOTAL",
      "Monto ($)": totalMonto,
    })

    const worksheet = XLSX.utils.json_to_sheet(datos)

    worksheet["!cols"] = [
      { wch: 12 },
      { wch: 8 },
      { wch: 16 },
      { wch: 20 },
      { wch: 14 },
      { wch: 18 },
      { wch: 12 },
    ]

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Pagos")

    let nombreArchivo = "pagos"
    if (filtroDesde) nombreArchivo += `_desde-${filtroDesde}`
    if (filtroHasta) nombreArchivo += `_hasta-${filtroHasta}`
    if (filtroMetodo !== "todos") nombreArchivo += `_${filtroMetodo}`
    nombreArchivo += ".xlsx"

    XLSX.writeFile(workbook, nombreArchivo)
  })
}

export function PagosList({ pagos, totalHoy, efectivoHoy, transferenciaHoy }: PagosListProps) {
  const [filtroMetodo, setFiltroMetodo] = useState<"todos" | "efectivo" | "transferencia">("todos")
  const [filtroDesde, setFiltroDesde] = useState("")
  const [filtroHasta, setFiltroHasta] = useState("")

  const pagosFiltrados = useMemo(() => {
    return pagos.filter((pago) => {
      if (filtroMetodo !== "todos" && pago.metodo_pago !== filtroMetodo) return false
      if (filtroDesde && pago.fecha < filtroDesde) return false
      if (filtroHasta && pago.fecha > filtroHasta) return false
      return true
    })
  }, [pagos, filtroMetodo, filtroDesde, filtroHasta])

  const hayFiltros = filtroMetodo !== "todos" || filtroDesde || filtroHasta

  return (
    <div className="space-y-4">
      <div className="grid gap-3">
        <Card className="bg-accent/20">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4" />
              <span>Total cobrado hoy</span>
            </div>
            <span className="text-xl font-bold">${totalHoy.toLocaleString("es-AR")}</span>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Banknote className="h-4 w-4" />
                <span>Efectivo</span>
              </div>
              <p className="mt-1 font-semibold">${efectivoHoy.toLocaleString("es-AR")}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ArrowRightLeft className="h-4 w-4" />
                <span>Transferencia</span>
              </div>
              <p className="mt-1 font-semibold">${transferenciaHoy.toLocaleString("es-AR")}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filtros */}
      <div className="space-y-2">
        <div className="flex gap-2">
          {(["todos", "efectivo", "transferencia"] as const).map((m) => (
            <Button
              key={m}
              variant={filtroMetodo === m ? "default" : "outline"}
              size="sm"
              className="flex-1 capitalize"
              onClick={() => setFiltroMetodo(m)}
            >
              {m === "todos" ? "Todos" : m === "efectivo" ? "💵 Efectivo" : "🔄 Transf."}
            </Button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Desde</p>
            <Input
              type="date"
              value={filtroDesde}
              onChange={(e) => setFiltroDesde(e.target.value)}
              className="h-9"
            />
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Hasta</p>
            <Input
              type="date"
              value={filtroHasta}
              onChange={(e) => setFiltroHasta(e.target.value)}
              className="h-9"
            />
          </div>
        </div>
        <div className="flex gap-2">
          {hayFiltros && (
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 text-muted-foreground"
              onClick={() => {
                setFiltroMetodo("todos")
                setFiltroDesde("")
                setFiltroHasta("")
              }}
            >
              Limpiar filtros
            </Button>
          )}
          {pagosFiltrados.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className={hayFiltros ? "flex-1" : "w-full"}
              onClick={() =>
                exportarPagosExcel(pagosFiltrados, filtroMetodo, filtroDesde, filtroHasta)
              }
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar Excel ({pagosFiltrados.length})
            </Button>
          )}
        </div>
      </div>

      {pagosFiltrados.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="Sin pagos"
          description={
            hayFiltros
              ? "No hay pagos que coincidan con los filtros."
              : "Los pagos registrados aparecerán aquí."
          }
        />
      ) : (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">
            {pagosFiltrados.length} pago{pagosFiltrados.length !== 1 ? "s" : ""}
            {hayFiltros ? " (filtrados)" : ""}
          </h3>
          {pagosFiltrados.map((pago) => (
            <PagoCard key={pago.id} pago={pago} />
          ))}
        </div>
      )}
    </div>
  )
}