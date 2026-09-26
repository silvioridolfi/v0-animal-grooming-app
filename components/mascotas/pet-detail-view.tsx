"use client"

import { useState } from "react"
import type { PetHistoryEntry, Mascota } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Dog, Cat, Trash2, Edit, DollarSign, Calendar, Tag, Clock, Pencil, Check, X, User, Phone, Plus } from "lucide-react"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { eliminarMascota } from "@/lib/actions/mascotas"
import { actualizarNotasTurno } from "@/lib/actions/turnos"
import { ESTADO_BADGE } from "@/lib/config/estado-turno"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface ProximoTurno {
  id: string
  fecha: string
  hora: string
  tipo_servicio: string
  estado: string
}

interface PetDetailViewProps {
  mascota: Mascota
  history: PetHistoryEntry[]
  clienteNombre: string
  clienteTelefono?: string | null
  proximoTurno?: ProximoTurno | null
}

export function PetDetailView({ mascota, history, clienteNombre, clienteTelefono, proximoTurno }: PetDetailViewProps) {
  const router = useRouter()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState("")
  const [editingNotasId, setEditingNotasId] = useState<string | null>(null)
  const [notasTemp, setNotasTemp] = useState("")
  const [savingNotasId, setSavingNotasId] = useState<string | null>(null)

  const handleDelete = async () => {
    setIsDeleting(true)
    setDeleteError("")
    const result = await eliminarMascota(mascota.id)
    if (result.success) {
      router.push(`/mascotas`)
      return
    }
    setDeleteError(result.error || "No se pudo eliminar la mascota.")
    setIsDeleting(false)
  }

  const handleEditNotas = (entry: PetHistoryEntry) => {
    setEditingNotasId(entry.id)
    setNotasTemp(entry.notas || "")
  }

  const handleSaveNotas = async (turnoId: string) => {
    setSavingNotasId(turnoId)
    await actualizarNotasTurno(turnoId, notasTemp)
    setSavingNotasId(null)
    setEditingNotasId(null)
    router.refresh()
  }

  const totalServicios = history.length
  const totalGastado = history.reduce((sum, h) => sum + h.precio_total, 0)
  const ultimoServicio = history.find((h) => h.estado === "realizado")

  const diasDesdeUltimo = ultimoServicio
    ? Math.floor((new Date().getTime() - new Date(ultimoServicio.fecha_servicio + "T12:00:00").getTime()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {mascota.tipo_animal === "Perro" ? <Dog className="h-8 w-8 text-primary shrink-0" /> : <Cat className="h-8 w-8 text-primary shrink-0" />}
              <div className="min-w-0">
                <CardTitle className="text-2xl truncate">{mascota.nombre}</CardTitle>
                {clienteTelefono ? (
                  <a
                    href={`tel:${clienteTelefono}`}
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{clienteNombre}</span>
                  </a>
                ) : (
                  <p className="text-sm text-muted-foreground truncate">{clienteNombre}</p>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href={`/mascotas/${mascota.id}/historial`}>
                <Button variant="outline" size="sm" className="h-10" title="Ver historial completo">
                  <Clock className="h-4 w-4" />
                  <span className="hidden sm:inline ml-1">Historial</span>
                </Button>
              </Link>
              <Button variant="outline" size="icon" className="h-10 w-10" asChild>
                <Link href={`/clientes/${mascota.cliente_id}/editar`} aria-label="Editar dueño" title="Editar dueño">
                  <User className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="icon" className="h-10 w-10" asChild>
                <Link href={`/mascotas/${mascota.id}/editar`} aria-label="Editar mascota" title="Editar mascota">
                  <Edit className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="destructive"
                size="icon"
                className="h-10 w-10"
                onClick={() => setShowDeleteDialog(true)}
                aria-label="Eliminar mascota"
                title="Eliminar mascota"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase">Tipo</p>
              <p className="font-medium">{mascota.tipo_animal}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase">Tamaño</p>
              <p className="font-medium">
                {mascota.tamano === "S" ? "Pequeño" : mascota.tamano === "M" ? "Mediano" : mascota.tamano === "L" ? "Grande" : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase">Raza</p>
              <p className="font-medium">{mascota.raza || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase">Sexo</p>
              <p className="font-medium">{mascota.sexo || "—"}</p>
            </div>
          </div>
          {mascota.notas && (
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground uppercase mb-1">Notas</p>
              <p className="text-sm text-muted-foreground">{mascota.notas}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-primary">{totalServicios}</p>
            <p className="text-xs text-muted-foreground mt-1">Servicios</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">${totalGastado.toLocaleString("es-AR")}</p>
            <p className="text-xs text-muted-foreground mt-1">Gastado</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            {diasDesdeUltimo !== null ? (
              <>
                <p className={`text-2xl font-bold ${diasDesdeUltimo > 30 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                  {diasDesdeUltimo}d
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {diasDesdeUltimo === 0 ? "Hoy" : diasDesdeUltimo === 1 ? "Hace 1 día" : `Hace ${diasDesdeUltimo} días`}
                </p>
              </>
            ) : (
              <>
                <p className="text-2xl font-bold text-muted-foreground">—</p>
                <p className="text-xs text-muted-foreground mt-1">Sin servicios</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Próximo turno */}
      {proximoTurno && (
        <Card className="border-2 border-primary/30 bg-primary/5">
          <CardContent className="py-3 px-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase mb-1">Próximo turno</p>
              <p className="font-semibold">
                {new Date(proximoTurno.fecha + "T12:00:00").toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })}
              </p>
              <p className="text-sm text-muted-foreground">{proximoTurno.hora.slice(0, 5)} — {proximoTurno.tipo_servicio}</p>
            </div>
            <div className="text-2xl">📅</div>
          </CardContent>
        </Card>
      )}

      {/* History */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Historial de servicios</CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="text-center py-8 space-y-3">
              <p className="text-muted-foreground">No hay servicios registrados aún</p>
              <Link href="/turnos/nuevo">
                <Button size="sm" variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Agendar turno
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((entry) => (
                <div key={entry.id} className="p-3 rounded-lg bg-muted/50 border space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm">{entry.tipo_servicio}</p>
                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                          entry.estado === "realizado" ? ESTADO_BADGE.realizado :
                          entry.estado === "cancelado" ? ESTADO_BADGE.cancelado :
                          ESTADO_BADGE.pendiente
                        }`}>
                          {entry.estado}
                        </span>
                        {entry.monto_reembolsado > 0 && (
                          <span className="text-xs px-2 py-0.5 rounded font-medium bg-destructive/10 text-destructive">
                            Reembolsado ${entry.monto_reembolsado.toLocaleString("es-AR")}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(entry.fecha_servicio + "T12:00:00").toLocaleDateString("es-AR")}
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3.5 w-3.5" />
                          ${entry.precio_total.toLocaleString("es-AR")}
                        </div>
                        {entry.metodo_pago && (
                          <div className="flex items-center gap-1">
                            <Tag className="h-3.5 w-3.5" />
                            {entry.metodo_pago === "efectivo" ? "💵 Efectivo" : "🔄 Transferencia"}
                          </div>
                        )}
                      </div>
                    </div>
                    {editingNotasId !== entry.id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 shrink-0"
                        onClick={() => handleEditNotas(entry)}
                        title="Agregar nota"
                        aria-label={`Agregar nota al servicio de ${entry.tipo_servicio} del ${new Date(entry.fecha_servicio + "T12:00:00").toLocaleDateString("es-AR")}`}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>

                  {editingNotasId === entry.id ? (
                    <div className="space-y-2 pt-1">
                      <Textarea
                        value={notasTemp}
                        onChange={(e) => setNotasTemp(e.target.value)}
                        placeholder="Ej: cara redonda, tijera N°5, no le gusta el secador..."
                        className="text-sm min-h-16 resize-none"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1 h-8"
                          onClick={() => handleSaveNotas(entry.id)}
                          disabled={savingNotasId === entry.id}
                        >
                          <Check className="h-3.5 w-3.5 mr-1" />
                          {savingNotasId === entry.id ? "Guardando..." : "Guardar"}
                        </Button>
                        <Button size="sm" variant="outline" className="h-8" onClick={() => setEditingNotasId(null)}>
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ) : entry.notas ? (
                    <p className="text-xs text-muted-foreground italic border-t pt-2">{entry.notas}</p>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={(open) => { setShowDeleteDialog(open); if (!open) setDeleteError("") }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar mascota</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar a {mascota.nombre}? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && <p className="text-sm text-destructive">{deleteError}</p>}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <Button onClick={handleDelete} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}