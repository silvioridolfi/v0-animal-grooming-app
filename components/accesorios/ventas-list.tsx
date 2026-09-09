"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2, ShoppingBag, Undo2 } from "lucide-react"
import type { VentaAccesorio } from "@/lib/types"
import { eliminarVentaAccesorio, reembolsarVentaAccesorio } from "@/lib/actions/ventas-accesorios"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { EmptyState } from "@/components/empty-state"

interface VentasListProps {
  ventas: VentaAccesorio[]
  onDelete: () => void
}

export function VentasList({ ventas, onDelete }: VentasListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const [reembolsoTarget, setReembolsoTarget] = useState<VentaAccesorio | null>(null)
  const [montoReembolso, setMontoReembolso] = useState("")
  const [reponerStock, setReponerStock] = useState(true)
  const [isReembolsando, setIsReembolsando] = useState(false)
  const [reembolsoError, setReembolsoError] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    setDeleteError(null)
    try {
      const result = await eliminarVentaAccesorio(deleteId)
      if (!result.success) {
        setDeleteError(result.error || "No se pudo eliminar")
        return
      }
      setDeleteId(null)
      onDelete()
    } finally {
      setIsDeleting(false)
    }
  }

  const abrirReembolso = (venta: VentaAccesorio) => {
    setReembolsoTarget(venta)
    setMontoReembolso(String(venta.precio_total))
    setReponerStock(true)
    setReembolsoError(null)
  }

  const handleReembolsar = async () => {
    if (!reembolsoTarget) return
    const monto = Number.parseFloat(montoReembolso)
    setIsReembolsando(true)
    setReembolsoError(null)
    try {
      const result = await reembolsarVentaAccesorio(reembolsoTarget.id, monto, reponerStock)
      if (!result.success) {
        setReembolsoError(result.error || "No se pudo registrar el reembolso")
        return
      }
      setReembolsoTarget(null)
      onDelete()
    } finally {
      setIsReembolsando(false)
    }
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 0 }).format(amount)

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T12:00:00")
    return date.toLocaleDateString("es-AR", { day: "numeric", month: "short" })
  }

  if (ventas.length === 0) {
    return <EmptyState icon={ShoppingBag} title="Sin ventas" description="Todavía no hay ventas registradas este mes" />
  }

  return (
    <>
      <div className="space-y-2">
        {ventas.map((venta) => {
          const estaReembolsada = Number(venta.monto_reembolsado) > 0
          return (
            <Card key={venta.id}>
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <ShoppingBag className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {venta.accesorio?.nombre || "Accesorio eliminado"} × {venta.cantidad}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(venta.fecha)}
                      {venta.cliente?.nombre ? ` • ${venta.cliente.nombre}` : " • Venta suelta"}
                    </p>
                    {estaReembolsada && (
                      <span className="inline-flex mt-1 items-center rounded-full px-2 py-0.5 text-xs font-medium bg-destructive/10 text-destructive">
                        Reembolsado {formatCurrency(venta.monto_reembolsado)}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">{formatCurrency(venta.precio_total)}</p>
                  </div>
                  <div className="flex gap-1">
                    {!estaReembolsada && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => abrirReembolso(venta)}
                        title="Reembolsar"
                      >
                        <Undo2 className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => { setDeleteId(venta.id); setDeleteError(null) }}
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => { if (!open) { setDeleteId(null); setDeleteError(null) } }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar venta</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El stock del accesorio se va a reponer automáticamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && <p className="text-sm text-destructive">{deleteError}</p>}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <Button
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!reembolsoTarget} onOpenChange={(open) => { if (!open) setReembolsoTarget(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reembolsar venta</DialogTitle>
            <DialogDescription>
              {reembolsoTarget?.accesorio?.nombre} × {reembolsoTarget?.cantidad}. Esto registra un egreso por el
              monto devuelto; la venta original no se borra.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="monto-reembolso-venta">Monto a devolver ($)</Label>
              <Input
                id="monto-reembolso-venta"
                type="number"
                step="0.01"
                min="0"
                max={reembolsoTarget?.precio_total}
                value={montoReembolso}
                onChange={(e) => setMontoReembolso(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Total de la venta: {reembolsoTarget ? formatCurrency(reembolsoTarget.precio_total) : ""}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="reponer-stock" checked={reponerStock} onCheckedChange={(v) => setReponerStock(!!v)} />
              <Label htmlFor="reponer-stock" className="text-sm font-normal cursor-pointer">
                El producto vuelve al stock (se devolvió en buen estado)
              </Label>
            </div>
          </div>
          {reembolsoError && <p className="text-sm text-destructive">{reembolsoError}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setReembolsoTarget(null)}>
              Cancelar
            </Button>
            <Button
              onClick={handleReembolsar}
              disabled={isReembolsando}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isReembolsando ? "Procesando..." : "Confirmar reembolso"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
