"use client"

import { useState, useEffect } from "react"
import { PageHeader } from "@/components/page-header"
import { CalendarAgenda } from "@/components/agenda/calendar-agenda"
import { CalendarMobile } from "@/components/agenda/calendar-mobile"
import { TurnoModal } from "@/components/turnos/turno-modal"
import { Button } from "@/components/ui/button"
import { Settings, X, Trash2, Pencil } from "lucide-react"
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
import { eliminarTurno, actualizarEstadoTurno } from "@/lib/actions/turnos"
import type { Turno, ConfiguracionNegocio, Mascota } from "@/lib/types"

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
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0])
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [selectedTurno, setSelectedTurno] = useState<Turno | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const handleDayClick = (fecha: string) => {
    setSelectedDate(fecha)
  }

  const handleTurnoClick = (turno: Turno) => {
    setSelectedTurno(turno)
    setDetailsModalOpen(true)
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
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && detailsModalOpen) {
        handleDetailsModalClose()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [detailsModalOpen])

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader
        title="Andrea | Peluquería Canina"
        action={
          <Link href="/configuracion">
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <Settings className="h-5 w-5" />
            </Button>
          </Link>
        }
      />
      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-24">
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
        onClose={() => {
          setIsModalOpen(false)
          setModalDate("")
        }}
        onTurnoCreated={handleTurnoCreated}
      />

      {selectedTurno && detailsModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-end"
          onClick={handleDetailsModalClose}
          role="button"
          onKeyDown={(e) => e.key === "Escape" && handleDetailsModalClose()}
          tabIndex={0}
        >
          <div
            className="bg-background w-full rounded-t-lg p-4 max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Detalles del Turno</h2>
                <button
                  onClick={handleDetailsModalClose}
                  className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
                  aria-label="Cerrar modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Hora</p>
                  <p className="font-semibold">{selectedTurno.hora?.slice(0, 5) || "—"}</p>
                </div>
                {/* Mostrar mascota con relación correcta */}
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Mascota</span>
                  <p className="font-medium">{selectedTurno?.mascota?.nombre || "—"}</p>
                </div>
                {/* Mostrar dueño desde la mascota.cliente */}
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Dueño</span>
                  <p className="font-medium">{selectedTurno?.mascota?.cliente?.nombre || "—"}</p>
                </div>
                  {/* Mostrar tipo de servicio */}
                  <div className="space-y-1">
                    <span className="text-sm text-muted-foreground">Servicio</span>
                    <p className="font-medium">{selectedTurno?.tipo_servicio || "—"}</p>
                  </div>
                  {/* Mostrar método de pago */}
                  <div className="space-y-1">
                    <span className="text-sm text-muted-foreground">Método de pago</span>
                    <p className="font-medium capitalize">
                      {selectedTurno?.metodo_pago === "efectivo" 
                        ? "💵 Efectivo" 
                        : selectedTurno?.metodo_pago === "transferencia"
                        ? "🔄 Transferencia"
                        : "Sin especificar"}
                    </p>
                  </div>
                <div>
                  <p className="text-xs text-muted-foreground">Precio</p>
                  <p className="font-semibold">
                    {selectedTurno.precio_final != null
                      ? `$${selectedTurno.precio_final.toLocaleString("es-AR")}`
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Estado del turno</p>
                  <p className="font-semibold capitalize">
                    {selectedTurno.estado === "cancelado" ? "Cancelado" : selectedTurno.estado === "realizado" ? "Pagado" : "Pendiente"}
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  <p className="text-xs text-muted-foreground font-medium">Cambiar estado del turno</p>
                  <div className="flex gap-2">
                    <Button
                      onClick={async () => {
                        await actualizarEstadoTurno(selectedTurno.id, "pendiente")
                        handleTurnoCreated()
                      }}
                      variant={selectedTurno.estado === "pendiente" ? "default" : "outline"}
                      size="sm"
                      className="flex-1"
                    >
                      Pendiente
                    </Button>
                    <Button
                      onClick={async () => {
                        await actualizarEstadoTurno(selectedTurno.id, "realizado")
                        handleTurnoCreated()
                      }}
                      variant={selectedTurno.estado === "realizado" ? "default" : "outline"}
                      size="sm"
                      className="flex-1"
                    >
                      Pagado
                    </Button>
                    <Button
                      onClick={async () => {
                        await actualizarEstadoTurno(selectedTurno.id, "cancelado")
                        handleTurnoCreated()
                      }}
                      variant={selectedTurno.estado === "cancelado" ? "destructive" : "outline"}
                      size="sm"
                      className="flex-1"
                    >
                      Cancelado
                    </Button>
                  </div>
                </div>
              </div>
              
                {/* Botones de acción principales */}
                <div className="grid gap-2 pt-4 border-t">
                  <Button
                    onClick={() => {
                      setModalDate(selectedTurno.fecha)
                      handleDetailsModalClose()
                      setIsModalOpen(true)
                    }}
                    variant="outline"
                    className="w-full gap-2"
                  >
                    <Pencil className="h-4 w-4" />
                    Editar turno
                  </Button>
                  <Button 
                    onClick={() => setShowDeleteDialog(true)} 
                    variant="destructive" 
                    className="w-full gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Eliminar turno
                  </Button>
                  <Button
                    onClick={handleDetailsModalClose}
                    variant="ghost"
                    className="w-full"
                  >
                    Cerrar
                  </Button>
                </div>
            </div>
          </div>
        </div>
      )}

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
