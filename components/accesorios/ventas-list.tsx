"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, ShoppingBag } from "lucide-react"
import type { VentaAccesorio } from "@/lib/types"
import { eliminarVentaAccesorio } from "@/lib/actions/ventas-accesorios"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { EmptyState } from "@/components/empty-state"

interface VentasListProps {
  ventas: VentaAccesorio[]
  onDelete: () => void
}

export function VentasList({ ventas, onDelete }: VentasListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    try {
      await eliminarVentaAccesorio(deleteId)
      onDelete()
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
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
        {ventas.map((venta) => (
          <Card key={venta.id}>
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/20">
                  <ShoppingBag className="h-5 w-5 text-accent-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {venta.accesorio?.nombre || "Accesorio eliminado"} × {venta.cantidad}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(venta.fecha)}
                    {venta.cliente?.nombre ? ` • ${venta.cliente.nombre}` : " • Venta suelta"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-accent-foreground">{formatCurrency(venta.precio_total)}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={() => setDeleteId(venta.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar venta</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El stock del accesorio se va a reponer automáticamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
