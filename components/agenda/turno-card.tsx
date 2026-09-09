"use client"

import { useState, useEffect } from "react"
import type { Turno } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Check, MoreVertical, Trash2, Dog, Cat, Pencil, ChevronDown, Scissors, DollarSign, Droplet, Undo2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { marcarTurnoRealizado, eliminarTurno, reembolsarTurno } from "@/lib/actions/turnos"
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
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [showReembolsoDialog, setShowReembolsoDialog] = useState(false)
  const [montoReembolso, setMontoReembolso] = useState("")
  const [reembolsoError, setReembolsoError] = useState<string | null>(null)
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
  const estaReembolsado = Number(turno.monto_reembolsado) > 0

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
    setDeleteError(null)
    try {
      const result = await eliminarTurno(turno.id)
      if (!result.success) {
        setDeleteError(result.error || "No se pudo eliminar")
        return
      }
      setShowDeleteDialog(false)
    } finally {
      setIsLoading(false)
    }
  }

  const abrirReembolso = () => {
    setMontoReembolso(String(turno.precio_final))
    setReembolsoError(null)
    setShowReembolsoDialog(true)
  }

  const handleReembolsar = async () => {
    const monto = Number.parseFloat(montoReembolso)
    setIsLoading(true)
    setReembolsoError(null)
    try {
      const result = await reembolsarTurno(turno.id, monto)
      if (!result.success) {
        setReembolsoError(result.error || "No se pudo registrar el reembolso")
        return
      }
      setShowReembolsoDialog(false)
    } finally {
      setIsLoading(false)
    }
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
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  {mascota?.tipo_animal === "Perro" ? (
                    <Dog className="h-5 w-5 text-primary" />
                  ) : (
                    <Cat className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
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
                    {estaReembolsado && (
                      <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-destructive/10 text-destructive">
                        Reembolsado ${Number(turno.monto_reembolsado).toLocaleString("es-AR")}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-foreground truncate">{mascota?.nombre}</span>
                    {sexoInfo && <span className={sexoInfo.color}>{sexoInfo.symbol}</span>}
                    <span className="text-sm text-muted-foreground truncate">({cliente?.nombre})</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    {getServiceIcon()}
                    <span>{turno.tipo_servicio}</span>
                    <span className="text-muted-foreground">·</span>
                    <DollarSign className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground text-xs">{getPaymentMethod()}</span>
                  </div>
                </div>
              </div>

              <span className="shrink-0 text-lg font-bold font-heading text-foreground">
                ${Number(turno.precio_final).toLocaleString("es-AR")}
              </span>
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
                {turno.estado === "realizado" && !estaReembolsado && (
                  <Button
                    onClick={abrirReembolso}
                    variant="outline"
                    size="sm"
                    className="w-full gap-1 bg-transparent"
                  >
                    <Undo2 className="h-4 w-4" />
                    <span>Reembolsar</span>
                  </Button>
                )}
                <Button
                  onClick={() => { setShowDeleteDialog(true); setDeleteError(null) }}
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

      <AlertDialog open={showDeleteDialog} onOpenChange={(open) => { setShowDeleteDialog(open); if (!open) setDeleteError(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar turno</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará el turno de {mascota?.nombre} a las{" "}
              {turno.hora.slice(0, 5)}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && <p className="text-sm text-destructive">{deleteError}</p>}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <Button
              onClick={handleEliminar}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? "Eliminando..." : "Eliminar"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showReembolsoDialog} onOpenChange={setShowReembolsoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reembolsar turno</DialogTitle>
            <DialogDescription>
              {mascota?.nombre} — {turno.tipo_servicio}. Esto registra un egreso por el monto devuelto; el
              turno queda marcado como realizado y reembolsado, sin borrar el registro.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="monto-reembolso">Monto a devolver ($)</Label>
            <Input
              id="monto-reembolso"
              type="number"
              step="0.01"
              min="0"
              max={turno.precio_final}
              value={montoReembolso}
              onChange={(e) => setMontoReembolso(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Precio original: ${Number(turno.precio_final).toLocaleString("es-AR")}</p>
          </div>
          {reembolsoError && <p className="text-sm text-destructive">{reembolsoError}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReembolsoDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleReembolsar} disabled={isLoading} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isLoading ? "Procesando..." : "Confirmar reembolso"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
