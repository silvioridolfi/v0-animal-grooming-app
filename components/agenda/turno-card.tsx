"use client"

import { useState, useEffect } from "react"
import type { Turno, Servicio } from "@/lib/types" // Declare Servicio import
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
import { Check, MoreVertical, Phone, Trash2, Dog, Cat, Pencil, ChevronDown, Scissors, DollarSign, Droplet } from "lucide-react"
import { cn } from "@/lib/utils"
import { marcarTurnoRealizado, eliminarTurno } from "@/lib/actions/turnos"
import Link from "next/link"

interface TurnoCardProps {
  turno: Turno
}

const getSexoSymbol = (sexo?: string | null) => {
  if (sexo === "Macho") return { symbol: "♂", color: "text-blue-500" }
  if (sexo === "Hembra") return { symbol: "♀", color: "text-pink-500" }
  return null
}

export function TurnoCard({ turno }: TurnoCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showExtraActions, setShowExtraActions] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const mascota = turno.mascota
  const cliente = mascota?.cliente
  const sexoInfo = getSexoSymbol(mascota?.sexo)

  const getServiceIcon = () => {
    switch (turno.tipo_servicio) {
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

  const getPaymentMethod = () => {
    switch (turno.metodo_pago) {
      case "efectivo":
        return "Efectivo"
      case "transferencia":
        return "Transferencia"
      default:
        return "Sin especificar"
    }
  }

  const handleMarcarRealizado = async () => {
    setIsLoading(true)
    await marcarTurnoRealizado(turno.id)
    setIsLoading(false)
  }

  const handleEliminar = async () => {
    setIsLoading(true)
    await eliminarTurno(turno.id)
    setShowDeleteDialog(false)
    setIsLoading(false)
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

  const estadoStyles = {
    pendiente: "border-l-amber-500 bg-amber-50",
    realizado: "border-l-accent bg-accent/10",
    cancelado: "border-l-destructive bg-destructive/10",
  }

  return (
    <>
      <Card className={cn("border-l-4 transition-all", estadoStyles[turno.estado])}>
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Información principal */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">{turno.hora.slice(0, 5)}</span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-medium",
                      turno.estado === "pendiente" && "bg-amber-100 text-amber-700",
                      turno.estado === "realizado" && "bg-accent/20 text-accent-foreground",
                      turno.estado === "cancelado" && "bg-destructive/20 text-destructive",
                    )}
                  >
                    {turno.estado}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {mascota?.tipo_animal === "Perro" ? (
                    <Dog className="h-4 w-4 text-primary" />
                  ) : (
                    <Cat className="h-4 w-4 text-primary" />
                  )}
                  <span className="font-medium text-foreground">{mascota?.nombre}</span>
                  {sexoInfo && <span className={`${sexoInfo.color}`}>{sexoInfo.symbol}</span>}
                  <span className="text-sm text-muted-foreground">({cliente?.nombre})</span>
                </div>

                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  {getServiceIcon()}
                  <span>{turno.tipo_servicio}</span>
                  <span className="text-muted-foreground">·</span>
                  <DollarSign className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground text-xs">{getPaymentMethod()}</span>
                </div>

                <div className="pt-1">
                  <span className="text-lg font-semibold text-foreground">
                    ${Number(turno.precio_final).toLocaleString("es-AR")}
                  </span>
                </div>
              </div>
            </div>

            {/* Botones de acción principal */}
            <div className={cn(
              "grid gap-2 pt-2 border-t",
              isMobile ? "grid-cols-1" : "grid-cols-2"
            )}>
              {turno.estado === "pendiente" && (
                <Button
                  onClick={handleMarcarRealizado}
                  disabled={isLoading}
                  variant="outline"
                  size="sm"
                  className="w-full gap-1 bg-transparent"
                >
                  <Check className="h-4 w-4" />
                  <span className="hidden sm:inline">Realizado</span>
                </Button>
              )}
              <Link href={`/turnos/${turno.id}/editar`} className="w-full">
                <Button variant="outline" size="sm" className="w-full gap-1 bg-transparent">
                  <Pencil className="h-4 w-4" />
                  <span className="hidden sm:inline">Editar</span>
                </Button>
              </Link>

              {/* Botón para más acciones */}
              <Button
                onClick={() => setShowExtraActions(!showExtraActions)}
                variant="ghost"
                size="sm"
                className="w-full gap-1"
              >
                <MoreVertical className="h-4 w-4" />
                <span className="hidden sm:inline">Más</span>
                <ChevronDown className={cn("h-3 w-3 transition-transform", showExtraActions && "rotate-180")} />
              </Button>
            </div>

            {/* Acciones adicionales colapsables */}
            {showExtraActions && (
              <div className="grid gap-2 pt-2 border-t">
                <Button
                  onClick={handleWhatsApp}
                  disabled={!cliente?.telefono}
                  variant="outline"
                  size="sm"
                  className="w-full gap-1 bg-transparent"
                >
                  <Phone className="h-4 w-4" />
                  <span>Recordatorio</span>
                </Button>
                <Button
                  onClick={() => setShowDeleteDialog(true)}
                  variant="outline"
                  size="sm"
                  className="w-full gap-1 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Eliminar</span>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

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
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
