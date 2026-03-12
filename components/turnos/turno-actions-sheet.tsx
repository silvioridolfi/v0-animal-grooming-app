"use client"

import { useState, useMemo } from "react"
import type { Turno } from "@/lib/types"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Trash2, Phone, Edit, DollarSign, X, Check } from "lucide-react"
import { actualizarTurno, eliminarTurno } from "@/lib/actions/turnos"
import Link from "next/link"

interface TurnoActionsSheetProps {
  turno: Turno
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function TurnoActionsSheet({ turno, isOpen, onOpenChange }: TurnoActionsSheetProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [mostraCobro, setMostraCobro] = useState(false)
  const [precio, setPrecio] = useState("")
  const [metodoPago, setMetodoPago] = useState<"efectivo" | "transferencia" | "">("")
  const [errorMsg, setErrorMsg] = useState("")

  const mascota = turno.mascota
  const cliente = mascota?.cliente

  const precioNum = useMemo(() => Number(precio) || 0, [precio])

  const handleCobrar = async () => {
    if (!metodoPago || precioNum <= 0) {
      setErrorMsg("Ingresá el precio y la forma de pago")
      return
    }
    setErrorMsg("")
    setIsLoading(true)
    await actualizarTurno(turno.id, {
      fecha: turno.fecha,
      hora: turno.hora,
      mascota_id: turno.mascota_id,
      tipo_servicio: turno.tipo_servicio as "Corte" | "Baño" | "Corte y Baño",
      descuento_tipo: null,
      descuento_valor: 0,
      precio_final: precioNum,
      metodo_pago: metodoPago,
      estado: "realizado",
    })
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
      weekday: "long", day: "numeric", month: "long",
    })
    const hora = turno.hora.slice(0, 5)
    const mensaje = `Hola! Te recordamos el turno de ${mascota?.nombre} el ${fecha} a las ${hora}.\nCualquier cosa avisame, gracias!`
    window.open(`https://wa.me/${cliente.telefono.replace(/\D/g, "")}?text=${encodeURIComponent(mensaje)}`, "_blank")
  }

  const yaCobrado = turno.estado === "realizado"

  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => {
        if (!open) { setMostraCobro(false); setPrecio(""); setMetodoPago(""); setErrorMsg("") }
        onOpenChange(open)
      }}>
        <SheetContent side="bottom" className="h-auto">
          <SheetHeader>
            <SheetTitle>
              {mascota?.nombre} — {turno.hora.slice(0, 5)}
            </SheetTitle>
            <p className="text-sm text-muted-foreground">
              {cliente?.nombre} · {turno.tipo_servicio}
            </p>
          </SheetHeader>

          <div className="space-y-2 py-4">

            {/* COBRO */}
            {!yaCobrado && !mostraCobro && (
              <Button
                onClick={() => setMostraCobro(true)}
                className="w-full h-14 text-base bg-green-600 hover:bg-green-700 text-white font-semibold"
              >
                <DollarSign className="mr-2 h-5 w-5" />
                Cobrar turno
              </Button>
            )}

            {!yaCobrado && mostraCobro && (
              <div className="rounded-lg border-2 border-green-200 bg-green-50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-green-800">Registrar cobro</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => { setMostraCobro(false); setPrecio(""); setMetodoPago(""); setErrorMsg("") }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-1">
                  <Label>Precio</Label>
                  <Input
                    type="number"
                    value={precio}
                    onChange={(e) => setPrecio(e.target.value)}
                    placeholder="Ingresá el precio"
                    min="0"
                    step="100"
                    className="h-12 text-base bg-white"
                    autoFocus
                  />
                </div>

                <div className="space-y-1">
                  <Label>Forma de pago</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={metodoPago === "efectivo" ? "default" : "outline"}
                      className="flex-1 h-12 bg-white"
                      onClick={() => setMetodoPago("efectivo")}
                    >
                      💵 Efectivo
                    </Button>
                    <Button
                      type="button"
                      variant={metodoPago === "transferencia" ? "default" : "outline"}
                      className="flex-1 h-12 bg-white"
                      onClick={() => setMetodoPago("transferencia")}
                    >
                      🔄 Transferencia
                    </Button>
                  </div>
                </div>

                {errorMsg && <p className="text-sm text-destructive">{errorMsg}</p>}

                <Button
                  onClick={handleCobrar}
                  disabled={isLoading}
                  className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold"
                >
                  <Check className="mr-2 h-5 w-5" />
                  {isLoading ? "Guardando..." : `Confirmar cobro${precioNum > 0 ? ` — $${precioNum.toLocaleString("es-AR")}` : ""}`}
                </Button>
              </div>
            )}

            {yaCobrado && (
              <div className="rounded-lg bg-green-50 border border-green-200 p-3 flex items-center justify-between">
                <span className="text-green-800 font-medium">✓ Turno cobrado</span>
                <div className="text-right">
                  <p className="font-bold text-green-700">${turno.precio_final?.toLocaleString("es-AR")}</p>
                  {turno.metodo_pago && (
                    <p className="text-xs text-green-600 capitalize">{turno.metodo_pago}</p>
                  )}
                </div>
              </div>
            )}

            <Button
              onClick={handleWhatsApp}
              disabled={!cliente?.telefono}
              className="w-full h-12 text-base"
              variant="outline"
            >
              <Phone className="mr-2 h-5 w-5" />
              Enviar recordatorio por WhatsApp
            </Button>

            <Button asChild className="w-full h-12 text-base" variant="outline">
              <Link href={`/turnos/${turno.id}/editar`}>
                <Edit className="mr-2 h-5 w-5" />
                Editar turno
              </Link>
            </Button>

            <Button
              onClick={() => setShowDeleteDialog(true)}
              className="w-full h-12 text-base"
              variant="destructive"
            >
              <Trash2 className="mr-2 h-5 w-5" />
              Eliminar turno
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
              Esta acción no se puede deshacer. Se eliminará el turno de {mascota?.nombre} a las {turno.hora.slice(0, 5)}.
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