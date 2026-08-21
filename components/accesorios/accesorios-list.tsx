"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, Package, EyeOff, Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Accesorio } from "@/lib/types"
import { toggleActivoAccesorio, eliminarAccesorio } from "@/lib/actions/accesorios"
import { EmptyState } from "@/components/empty-state"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface AccesoriosListProps {
  accesorios: Accesorio[]
  onEdit: (accesorio: Accesorio) => void
  onToggle: () => void
}

export function AccesoriosList({ accesorios, onEdit, onToggle }: AccesoriosListProps) {
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Accesorio | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const handleToggle = async (accesorio: Accesorio) => {
    setTogglingId(accesorio.id)
    try {
      await toggleActivoAccesorio(accesorio.id, !accesorio.activo)
      onToggle()
    } finally {
      setTogglingId(null)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    setDeleteError(null)
    try {
      const result = await eliminarAccesorio(deleteTarget.id)
      if (!result.success) {
        setDeleteError(result.error || "No se pudo eliminar")
        return
      }
      setDeleteTarget(null)
      onToggle()
    } finally {
      setIsDeleting(false)
    }
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 0 }).format(amount)

  if (accesorios.length === 0) {
    return <EmptyState icon={Package} title="Sin accesorios" description="Todavía no cargaste ningún accesorio" />
  }

  return (
    <>
      <div className="space-y-2">
        {accesorios.map((accesorio) => {
          const sinStock = accesorio.stock <= 0
          return (
            <Card key={accesorio.id} className={cn(!accesorio.activo && "opacity-50")}>
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{accesorio.nombre}</p>
                    <p className="text-xs text-muted-foreground">
                      {accesorio.categoria ? `${accesorio.categoria} • ` : ""}
                      {formatCurrency(accesorio.precio)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={cn("font-semibold", sinStock ? "text-destructive" : "text-foreground")}>
                      {accesorio.stock} u.
                    </p>
                    <p className="text-xs text-muted-foreground">{sinStock ? "Sin stock" : "en stock"}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(accesorio)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      disabled={togglingId === accesorio.id}
                      onClick={() => handleToggle(accesorio)}
                      title={accesorio.activo ? "Desactivar" : "Activar"}
                    >
                      {accesorio.activo ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => { setDeleteTarget(accesorio); setDeleteError(null) }}
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

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) { setDeleteTarget(null); setDeleteError(null) } }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar {deleteTarget?.nombre}</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Solo se puede eliminar si el accesorio nunca tuvo ventas registradas.
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
    </>
  )
}
