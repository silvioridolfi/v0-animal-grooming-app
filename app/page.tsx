"use client"

import { useState, useEffect, useMemo } from "react"
import { CalendarAgenda } from "@/components/agenda/calendar-agenda"
import { CalendarMobile } from "@/components/agenda/calendar-mobile"
import { TurnoModal } from "@/components/turnos/turno-modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Trash2, Pencil, DollarSign, Check, RotateCcw } from "lucide-react"
import Link from "next/link"
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
import { eliminarTurno, actualizarTurno, revertirCobro } from "@/lib/actions/turnos"
import type { Turno, ConfiguracionNegocio, Mascota } from "@/lib/types"
import { GlobalHeader } from "@/components/global-header"
import { getFechaArgentina } from "@/lib/utils/fecha-argentina"

interface AgendaPageClientProps {
  initialTurnos: Turno[]
  initialConfig: ConfiguracionNegocio | null
  initialMascotas: Mascota[]
  totalCobradoHoy: number
}

export function AgendaPageClient({
  initialTurnos,
  initialConfig,
  initialMascotas,
  totalCobradoHoy,
}: AgendaPageClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalDate, setModalDate] = useState<string>("")
  const [selectedDate, setSelectedDate] = useState<string>(getFechaArgentina())
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [selectedTurno, setSelectedTurno] = useState<Turno | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const [mostraCobro, setMostraCobro] = useState(false)
  const [precio, setPrecio] = useState("")
  const [metodoPago, setMetodoPago] = useState<"efectivo" | "transferencia" | "">("")
  const [errorCobro, setErrorCobro] = useState("")
  const [isCobering, setIsCobering] = useState(false)

  const [showConfirmCobro, setShowConfirmCobro] = useState(false)
  const [showConfirmRevertir, setShowConfirmRevertir] = useState(false)
  const [isReverting, setIsReverting] = useState(false)

  const precioNum = useMemo(() => Number(precio) || 0, [precio])

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const handleDayClick = (fecha: string) => setSelectedDate(fecha)

  const handleTurnoClick = (turno: Turno) => {
    setSelectedTurno(turno)
    setDetailsModalOpen(true)
    setMostraCobro(false)
    setPrecio("")
    setMetodoPago("")
    setErrorCobro("")
  }

  const handleAddTurno = (fecha?: string) => {
    setModalDate(fecha || selectedDate)
    setIsModalOpen(true)
  }

  const handleTurnoCreated = () => {
    setIsModalOpen(false)
    setModalDate("")
    setDetailsModalOpen(false)
    setSelectedTurno(null)
  }

  const handleDeleteTurno = async () => {
    if (!selectedTurno) return
    setIsDeleting(true)
    try {
      await eliminarTurno(selectedTurno.id)
      setShowDeleteDialog(false)
      setDetailsModalOpen(false)
      setSelectedTurno(null)
    } catch (error) {
      console.error("Error al eliminar turno:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDetailsModalClose = () => {
    setDetailsModalOpen(false)
    setSelectedTurno(null)
    setMostraCobro(false)
    setPrecio("")
    setMetodoPago("")
    setErrorCobro("")
  }

  const handlePrepararCobro = () => {
    if (!metodoPago || precioNum <= 0) {
      setErrorCobro("Ingresá el precio y la forma de pago")
      return
    }
    setErrorCobro("")
    setShowConfirmCobro(true)
  }

  const handleCobrarConfirmado = async () => {
    if (!selectedTurno) return
    setShowConfirmCobro(false)
    setIsCobering(true)
    await actualizarTurno(selectedTurno.id, {
      fecha: selectedTurno.fecha,
      hora: selectedTurno.hora,
      mascota_id: selectedTurno.mascota_id,
      tipo_servicio: selectedTurno.tipo_servicio as "Corte" | "Baño" | "Corte y Baño",
      descuento_tipo: null,
      descuento_valor: 0,
      precio_final: precioNum,
      metodo_pago: metodoPago as "efectivo" | "transferencia",
      estado: "realizado",
    })
    setIsCobering(false)
    handleDetailsModalClose()
  }

  const handleRevertirConfirmado = async () => {
    if (!selectedTurno) return
    setShowConfirmRevertir(false)
    setIsReverting(true)
    await revertirCobro(selectedTurno.id)
    setIsReverting(false)
    handleDetailsModalClose()
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && detailsModalOpen) handleDetailsModalClose()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [detailsModalOpen])

  const yaCobrado = selectedTurno?.estado === "realizado"

  return (
    <div className="flex flex-col min-h-screen">
      <div className="sticky top-0 z-40">
        <GlobalHeader />
      </div>

      <main className="flex-1 px-4 py-4 space-y-4 pb-24">
        {isMobile ? (
          <CalendarMobile
            turnos={initialTurnos}
            config={initialConfig}
            totalCobradoHoy={totalCobradoHoy}
            onDayClick={handleDayClick}
            onAddTurno={handleAddTurno}
            onTurnoClick={handleTurnoClick}
            initialSelectedDate={selectedDate}
          />
        ) : (
          <CalendarAgenda
            turnos={initialTurnos}
            config={initialConfig}
            totalCobradoHoy={totalCobradoHoy}
            onDayClick={handleDayClick}
            onAddTurno={handleAddTurno}
            onTurnoClick={handleTurnoClick}
            initialSelectedDate={selectedDate}
          />
        )}
      </main>

      <TurnoModal
        mascotas={initialMascotas}
        config={initialConfig}
        turnosExistentes={initialTurnos}
        fechaInicial={modalDate}
        horaInicial=""
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setModalDate("") }}
        onTurnoCreated={handleTurnoCreated}
      />

      {selectedTurno && detailsModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-end"
          onClick={handleDetailsModalClose}
        >
          <div
            className="bg-background w-full rounded-t-2xl p-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">
                  {selectedTurno.mascota?.nombre} — {selectedTurno.hora?.slice(0, 5)}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {selectedTurno.mascota?.cliente?.nombre} · {selectedTurno.tipo_servicio}
                </p>
              </div>
              <button
                onClick={handleDetailsModalClose}
                className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              {!yaCobrado && !mostraCobro && selectedTurno.estado !== "cancelado" && (
                <Button
                  onClick={() => setMostraCobro(true)}
                  className="w-full h-14 text-base font-semibold"
                >
                  <DollarSign className="mr-2 h-5 w-5" />
                  Cobrar turno
                </Button>
              )}

              {!yaCobrado && mostraCobro && (
                <div className="rounded-xl border-2 border-primary/20 bg-primary/5 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-primary">Registrar cobro</p>
                    <button
                      onClick={() => { setMostraCobro(false); setPrecio(""); setMetodoPago(""); setErrorCobro("") }}
                      className="h-7 w-7 flex items-center justify-center rounded hover:bg-primary/10 transition-colors"
                    >
                      <X className="h-4 w-4 text-primary" />
                    </button>
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
                      className="h-12 text-base"
                      autoFocus
                    />
                  </div>

                  <div className="space-y-1">
                    <Label>Forma de pago</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={metodoPago === "efectivo" ? "default" : "outline"}
                        className="flex-1 h-12"
                        onClick={() => setMetodoPago("efectivo")}
                      >
                        💵 Efectivo
                      </Button>
                      <Button
                        type="button"
                        variant={metodoPago === "transferencia" ? "default" : "outline"}
                        className="flex-1 h-12"
                        onClick={() => setMetodoPago("transferencia")}
                      >
                        🔄 Transferencia
                      </Button>
                    </div>
                  </div>

                  {errorCobro && <p className="text-sm text-destructive">{errorCobro}</p>}

                  <Button
                    onClick={handlePrepararCobro}
                    disabled={isCobering}
                    className="w-full h-12 font-semibold"
                  >
                    <Check className="mr-2 h-5 w-5" />
                    {isCobering ? "Guardando..." : `Confirmar cobro${precioNum > 0 ? ` — $${precioNum.toLocaleString("es-AR")}` : ""}`}
                  </Button>
                </div>
              )}

              {yaCobrado && (
                <div className="space-y-2">
                  <div className="rounded-xl bg-green-50 border border-green-200 p-3 flex items-center justify-between">
                    <span className="font-medium text-green-700">✓ Turno cobrado</span>
                    <div className="text-right">
                      <p className="font-bold text-green-700">${selectedTurno.precio_final?.toLocaleString("es-AR")}</p>
                      {selectedTurno.metodo_pago && (
                        <p className="text-xs text-green-600 capitalize">{selectedTurno.metodo_pago}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={() => setShowConfirmRevertir(true)}
                    disabled={isReverting}
                    className="w-full gap-2 bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200 shadow-none"
                  >
                    <RotateCcw className="h-4 w-4" />
                    {isReverting ? "Revirtiendo..." : "Revertir cobro"}
                  </Button>
                </div>
              )}

              {selectedTurno.estado === "cancelado" && (
                <div className="rounded-xl bg-muted/80 p-3 text-center">
                  <p className="text-sm text-muted-foreground font-medium">Turno cancelado</p>
                </div>
              )}

              <div className="grid gap-2 pt-2 border-t">
                <Link href={`/turnos/${selectedTurno.id}/editar`} className="w-full">
                  <Button
                    className="w-full gap-2 bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 shadow-none"
                    onClick={handleDetailsModalClose}
                  >
                    <Pencil className="h-4 w-4" />
                    Editar turno
                  </Button>
                </Link>

                {selectedTurno.estado !== "cancelado" && (
                  <Button
                    onClick={async () => {
                      await actualizarTurno(selectedTurno.id, {
                        fecha: selectedTurno.fecha,
                        hora: selectedTurno.hora,
                        mascota_id: selectedTurno.mascota_id,
                        tipo_servicio: selectedTurno.tipo_servicio as "Corte" | "Baño" | "Corte y Baño",
                        descuento_tipo: null,
                        descuento_valor: 0,
                        precio_final: selectedTurno.precio_final || 0,
                        metodo_pago: (selectedTurno.metodo_pago || null) as "efectivo" | "transferencia" | null,
                        estado: "cancelado",
                      })
                      handleDetailsModalClose()
                    }}
                    className="w-full gap-2 bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200 shadow-none"
                  >
                    Cancelar turno
                  </Button>
                )}

                <Button
                  onClick={() => setShowDeleteDialog(true)}
                  className="w-full gap-2 bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20 shadow-none"
                >
                  <Trash2 className="h-4 w-4" />
                  Eliminar turno
                </Button>

                <Button onClick={handleDetailsModalClose} variant="ghost" className="w-full">
                  Cerrar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <AlertDialog open={showConfirmCobro} onOpenChange={setShowConfirmCobro}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar cobro</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Confirmar cobro de{" "}
              <span className="font-semibold text-foreground">${precioNum.toLocaleString("es-AR")}</span>{" "}
              por{" "}
              <span className="font-semibold text-foreground capitalize">{metodoPago}</span>{" "}
              para{" "}
              <span className="font-semibold text-foreground">{selectedTurno?.mascota?.nombre}</span>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleCobrarConfirmado}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showConfirmRevertir} onOpenChange={setShowConfirmRevertir}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revertir cobro</AlertDialogTitle>
            <AlertDialogDescription>
              Esto va a volver el turno de{" "}
              <span className="font-semibold text-foreground">{selectedTurno?.mascota?.nombre}</span>{" "}
              a pendiente y limpiar el pago de{" "}
              <span className="font-semibold text-foreground">${selectedTurno?.precio_final?.toLocaleString("es-AR")}</span>.
              ¿Estás segura?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevertirConfirmado}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              Revertir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar turno</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará el turno de {selectedTurno?.mascota?.nombre} a las{" "}
              {selectedTurno?.hora.slice(0, 5)}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTurno}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}