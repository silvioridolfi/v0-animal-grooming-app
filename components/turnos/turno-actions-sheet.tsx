"use client"

import { useState } from "react"
import type { Turno } from "@/lib/types"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
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
import { Check, Trash2, Phone, Edit } from "lucide-react"
import { marcarTurnoRealizado, eliminarTurno } from "@/lib/actions/turnos"
import Link from "next/link"

interface TurnoActionsSheetProps {
  turno: Turno
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function TurnoActionsSheet({ turno, isOpen, onOpenChange }: TurnoActionsSheetProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const mascota = turno.mascota
  const cliente = mascota?.cliente

  const handleMarcarRealizado = async () => {
    setIsLoading(true)
    await marcarTurnoRealizado(turno.id)
    setIsLoading(false)
    onOpenChange(false)
  }

  const handleEliminar = async () => {
    setIsLoading(true)
    await eliminarTurno(turno.id)
    setShowDeleteDialog(false)
    setIsLoading(false)
    onOpenChange(false)
  }

  const handleWhatsApp = () => {
    if (!cliente?.telefono) return

    const fecha = new Date(turno.fecha).toLocaleDateString("es-AR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    })
    const hora = turno.hora.slice(0, 5)
    const mensaje = `Hola! Te recordamos el turno de ${mascota?.nombre} el ${fecha} a las ${hora}.\nCualquier cosa avisame, gracias!`

    const url = `https://wa.me/${cliente.telefono.replace(/\D/g, "")}?text=${encodeURIComponent(mensaje)}`
    window.open(url, "_blank")
  }

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-auto">
          <SheetHeader>
            <SheetTitle>
              {mascota?.nombre} - {turno.hora.slice(0, 5)}
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-2 py-4">
            {turno.estado === "pendiente" && (
              <Button
                onClick={handleMarcarRealizado}
                disabled={isLoading}
                className="w-full h-12 text-base"
                variant="default"
              >
                <Check className="mr-2 h-5 w-5" />
                Marcar como Realizado
              </Button>
            )}

            <Button
              onClick={handleWhatsApp}
              disabled={!cliente?.telefono}
              className="w-full h-12 text-base bg-transparent"
              variant="outline"
            >
              <Phone className="mr-2 h-5 w-5" />
              Enviar Recordatorio
            </Button>

            <Button asChild className="w-full h-12 text-base bg-transparent" variant="outline">
              <Link href={`/turnos/${turno.id}/editar`}>
                <Edit className="mr-2 h-5 w-5" />
                Editar Turno
              </Link>
            </Button>

            <Button onClick={() => setShowDeleteDialog(true)} className="w-full h-12 text-base" variant="destructive">
              <Trash2 className="mr-2 h-5 w-5" />
              Eliminar Turno
            </Button>
          </div>

          <SheetFooter>
            <Button onClick={() => onOpenChange(false)} variant="ghost" className="w-full">
              Cerrar
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar turno</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará el turno de {mascota?.nombre} a las{" "}
              {turno.hora.slice(0, 5)}.
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
