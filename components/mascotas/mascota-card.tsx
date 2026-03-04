"use client"

import { useState } from "react"
import type { Mascota } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import { Pencil, Trash2, Dog, Cat } from "lucide-react"
import { eliminarMascota } from "@/lib/actions/mascotas"
import Link from "next/link"

interface MascotaCardProps {
  mascota: Mascota
  compact?: boolean
}

const tamanoLabels = {
  S: "Chico",
  M: "Mediano",
  L: "Grande",
}

const getSexoSymbol = (sexo?: string | null) => {
  if (sexo === "Macho") return { symbol: "♂", color: "text-blue-500" }
  if (sexo === "Hembra") return { symbol: "♀", color: "text-pink-500" }
  return null
}

export function MascotaCard({ mascota, compact = false }: MascotaCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleEliminar = async () => {
    setIsLoading(true)
    await eliminarMascota(mascota.id)
    setShowDeleteDialog(false)
    setIsLoading(false)
  }

  const sexoInfo = getSexoSymbol(mascota.sexo)

  if (compact) {
    return (
      <>
        <div className="flex items-center justify-between rounded-lg bg-background p-3">
          <div className="flex items-center gap-3">
            {mascota.tipo_animal === "Perro" ? (
              <Dog className="h-5 w-5 text-primary" />
            ) : (
              <Cat className="h-5 w-5 text-primary" />
            )}
            <div>
              <p className="font-medium text-foreground">{mascota.nombre}</p>
              <p className="text-xs text-muted-foreground">
                {mascota.tipo_animal} - {tamanoLabels[mascota.tamano || "M"]}
                {mascota.raza && ` - ${mascota.raza}`}
                {sexoInfo && <span className={`ml-1 ${sexoInfo.color}`}>{sexoInfo.symbol}</span>}
              </p>
            </div>
          </div>
          <div className="flex gap-1">
            <Link href={`/mascotas/${mascota.id}/editar`}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Pencil className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Eliminar mascota</AlertDialogTitle>
              <AlertDialogDescription>
                Esta accion no se puede deshacer. Se eliminara a {mascota.nombre} y todos sus turnos asociados.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleEliminar}
                disabled={isLoading}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isLoading ? "Eliminando..." : "Eliminar"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    )
  }

  // Full card version (unchanged)
  return (
    <>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                {mascota.tipo_animal === "Perro" ? (
                  <Dog className="h-5 w-5 text-primary" />
                ) : (
                  <Cat className="h-5 w-5 text-primary" />
                )}
                <span className="font-semibold text-foreground">{mascota.nombre}</span>
                <span className="text-sm text-muted-foreground">({mascota.tipo_animal})</span>
                {sexoInfo && <span className={`text-lg ${sexoInfo.color}`}>{sexoInfo.symbol}</span>}
              </div>

              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                {mascota.raza && <span>{mascota.raza}</span>}
                {mascota.tamano && (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{tamanoLabels[mascota.tamano]}</span>
                )}
              </div>

              {mascota.cliente && <p className="text-sm text-muted-foreground">Dueño: {mascota.cliente.nombre}</p>}

              {mascota.notas && <p className="text-sm text-muted-foreground">{mascota.notas}</p>}
            </div>

            <div className="flex gap-1">
              <Link href={`/mascotas/${mascota.id}/editar`}>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Pencil className="h-4 w-4" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar mascota</AlertDialogTitle>
            <AlertDialogDescription>
              Esta accion no se puede deshacer. Se eliminara a {mascota.nombre} y todos sus turnos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEliminar}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
