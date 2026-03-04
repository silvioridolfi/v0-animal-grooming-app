"use client"

import { useState } from "react"
import type { Cliente, Mascota } from "@/lib/types"
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
import { Phone, Pencil, Trash2, Dog, Cat } from "lucide-react"
import { eliminarCliente } from "@/lib/actions/clientes"
import Link from "next/link"

interface ClienteWithMascotas extends Cliente {
  mascotas: Mascota[]
}

interface ClienteCardProps {
  cliente: ClienteWithMascotas
}

export function ClienteCard({ cliente }: ClienteCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleEliminar = async () => {
    setIsLoading(true)
    await eliminarCliente(cliente.id)
    setShowDeleteDialog(false)
    setIsLoading(false)
  }

  return (
    <>
      <Link href={`/clientes/${cliente.id}`}>
        <Card className="cursor-pointer transition-all hover:shadow-md active:shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">{cliente.nombre}</span>
                </div>

                {cliente.telefono && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    <span>{cliente.telefono}</span>
                  </div>
                )}

                {cliente.mascotas.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    {cliente.mascotas.map((mascota) => (
                      <span
                        key={mascota.id}
                        className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs"
                      >
                        {mascota.tipo_animal === "Perro" ? <Dog className="h-3 w-3" /> : <Cat className="h-3 w-3" />}
                        {mascota.nombre}
                      </span>
                    ))}
                  </div>
                )}

                {cliente.notas && <p className="text-sm text-muted-foreground">{cliente.notas}</p>}
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>

      <div className="flex gap-1 mt-2">
        <Link href={`/clientes/${cliente.id}/editar`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full gap-1 bg-transparent">
            <Pencil className="h-4 w-4" />
            <span className="hidden sm:inline">Editar</span>
          </Button>
        </Link>
        <Button
          variant="destructive"
          size="sm"
          className="gap-1"
          onClick={() => setShowDeleteDialog(true)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar cliente</AlertDialogTitle>
            <AlertDialogDescription>
              Esta accion no se puede deshacer. Se eliminara a {cliente.nombre} y todas sus mascotas asociadas.
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
