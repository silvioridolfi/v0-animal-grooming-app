"use client"

import { useState } from "react"
import type { PetHistoryEntry, Mascota } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Dog, Cat, Trash2, Edit, DollarSign, Calendar, Tag, Clock, Pencil, Check, X, User } from "lucide-react"
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
import { eliminarMascota } from "@/lib/actions/mascotas"
import { actualizarNotasTurno } from "@/lib/actions/turnos"
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
  proximoTurno?: ProximoTurno | null
}

export function PetDetailView({ mascota, history, clienteNombre, proximoTurno }: PetDetailViewProps) {
  const router = useRouter()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [editingNotasId, setEditingNotasId] = useState<string | null>(null)
  const [notasTemp, setNotasTemp] = useState("")
  const [savingNotasId, setSavingNotasId] = useState<string | null>(null)

  const handleDelete = async () => {
    setIsDeleting(true)
    const result = await eliminarMascota(mascota.id)
    if (result.success) router.push(`/mascotas`)
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
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {mascota.tipo_animal === "Perro" ? <Dog className="h-8 w-8 text-primary" /> : <Cat className="h-8 w-8 text-primary" />}
              <div>
                <CardTitle className="text-2xl">{mascota.nombre}</CardTitle>
                <p className="text-sm text-muted-foreground">{clienteNombre}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href={`/mascotas/${mascota.id}/historial`}>
                <Button variant="outline" size="sm" title="Ver historial completo">
                  <Clock className="h-4 w-4" />
                  <span className="hidden sm:inline ml-1">Historial</span>
                </Button>
              </Link>
              <Link href={`/clientes/${mascota.cliente_id}/editar`} title="Editar dueño">
                <Button variant="outline" size="sm">
                  <User className="h-4 w-4" />
                </Button>
              </Link>
              <Link href={`/mascotas/${mascota.id}/editar`} title="Editar mascota">
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
              </Link>
              <Button variant="destructive" size="sm" onClick={() => setShowDeleteDialog(true)}>
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
            <p className="text-2xl font-bold text-green-600">${totalGastado.toLocaleString("es-AR")}</p>
            <p className="text-xs text-muted-foreground mt-1">Gastado</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            {diasDesdeUltimo !== null ? (
              <>
                <p className={`text-2xl font-bold ${diasDesdeUltimo > 30 ? "text-amber-500" : "text-blue-600"}`}>
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
        <Card className="border-2 border-primary/20 bg-primary/5">
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
            <div className="text-center py-8 text-muted-foreground">
              <p>No hay servicios registrados aún</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((entry) => (
                <div key={entry.id} className="p-3 rounded-lg bg-muted/50 border space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm">{entry.tipo_servicio}</p>
                        <Badge
                          variant={
                            entry.estado === "realizado"
                              ? "default"
                              : entry.estado === "pendiente"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {entry.estado}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(entry.fecha_servicio).toLocaleDateString("es-AR")}
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
                        className="h-7 w-7 shrink-0"
                        onClick={() => handleEditNotas(entry)}
                        title="Agregar nota"
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

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar mascota</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar a {mascota.nombre}? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}