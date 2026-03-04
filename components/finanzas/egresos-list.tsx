"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, Wrench, Package, Scissors, MoreHorizontal, Receipt } from "lucide-react"
import type { Egreso } from "@/lib/types"
import { eliminarEgreso } from "@/lib/actions/egresos"
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

interface EgresosListProps {
  egresos: Egreso[]
  onEdit: (egreso: Egreso) => void
  onDelete: () => void
}

const categoriaIcons = {
  mantenimiento: Wrench,
  insumos: Package,
  herramientas: Scissors,
  otros: MoreHorizontal,
}

const categoriaLabels = {
  mantenimiento: "Mantenimiento",
  insumos: "Insumos",
  herramientas: "Herramientas",
  otros: "Otros",
}

export function EgresosList({ egresos, onEdit, onDelete }: EgresosListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    try {
      await eliminarEgreso(deleteId)
      onDelete()
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T12:00:00")
    return date.toLocaleDateString("es-AR", { day: "numeric", month: "short" })
  }

  if (egresos.length === 0) {
    return <EmptyState icon={Receipt} title="Sin egresos" description="No hay egresos registrados este mes" />
  }

  return (
    <>
      <div className="space-y-2">
        {egresos.map((egreso) => {
          const Icon = categoriaIcons[egreso.categoria]
          return (
            <Card key={egreso.id}>
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                    <Icon className="h-5 w-5 text-destructive" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{egreso.concepto}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(egreso.fecha)} • {categoriaLabels[egreso.categoria]}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-destructive">{formatCurrency(egreso.monto)}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(egreso)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => setDeleteId(egreso.id)}
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

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar egreso</AlertDialogTitle>
            <AlertDialogDescription>
              Esta accion no se puede deshacer. El egreso sera eliminado permanentemente.
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
