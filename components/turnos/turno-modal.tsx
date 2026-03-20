"use client"

import type React from "react"
import { useState, useMemo, useCallback } from "react"
import type { Mascota, ConfiguracionNegocio, Turno, Cliente } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { crearTurno } from "@/lib/actions/turnos"
import { Dog, Cat, UserPlus, Clock, Check, X, ChevronLeft, ChevronRight, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { getNombreFeriado } from "@/lib/feriados-argentina-2026"

const TIPOS_SERVICIO = ["Corte", "Baño", "Corte y Baño"] as const

interface TurnoModalProps {
  mascotas: Mascota[]
  config: ConfiguracionNegocio | null
  turnosExistentes: Turno[]
  fechaInicial?: string
  horaInicial?: string
  isOpen: boolean
  onClose: () => void
  onTurnoCreated?: () => void
}

export function TurnoModal({
  mascotas,
  config,
  turnosExistentes,
  fechaInicial,
  horaInicial,
  isOpen,
  onClose,
  onTurnoCreated,
}: TurnoModalProps) {
  const hoy = new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
  })

  const [paso, setPaso] = useState<"fecha" | "cliente" | "mascota" | "servicio">("fecha")
  const [fecha, setFecha] = useState(hoy)
  const [hora, setHora] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [showNuevoCliente, setShowNuevoCliente] = useState(false)
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null)
  const [mascotaSeleccionada, setMascotaSeleccionada] = useState<Mascota | null>(null)
  const [tipoServicio, setTipoServicio] = useState<"Corte" | "Baño" | "Corte y Baño" | "">("")
  const [nuevoCliente, setNuevoCliente] = useState({ nombre: "", telefono: "" })
  const [nuevaMascota, setNuevaMascota] = useState({ nombre: "", tipo_animal: "Perro", tamano: "M" })
  const [isLoading, setIsLoading] = useState(false)

  useMemo(() => {
    if (isOpen) {
      setPaso("fecha")
      setFecha(fechaInicial || hoy)
      setHora(horaInicial || "")
      setSearchQuery("")
      setClienteSeleccionado(null)
      setMascotaSeleccionada(null)
      setTipoServicio("")
      setShowNuevoCliente(false)
      setNuevoCliente({ nombre: "", telefono: "" })
      setNuevaMascota({ nombre: "", tipo_animal: "Perro", tamano: "M" })
    }
  }, [isOpen])

  const feriadoNombre = useMemo(() => getNombreFeriado(fecha), [fecha])

  const handleClose = useCallback(() => { onClose() }, [onClose])

  const clientesFiltrados = useMemo(() => {
    const query = searchQuery.toLowerCase()
    const map = new Map<string, Cliente & { mascotas: Mascota[] }>()
    const shouldFilter = query.trim().length > 0

    mascotas.forEach((m) => {
      const matchesSearch =
        !shouldFilter ||
        m.nombre.toLowerCase().includes(query) ||
        m.cliente?.nombre.toLowerCase().includes(query) ||
        m.cliente?.telefono?.includes(query)

      if (matchesSearch && m.cliente && !map.has(m.cliente_id)) {
        map.set(m.cliente_id, { ...m.cliente, mascotas: [] })
      }
      if (matchesSearch && m.cliente) {
        map.get(m.cliente_id)!.mascotas.push(m)
      }
    })

    return Array.from(map.values()).slice(0, 10)
  }, [searchQuery, mascotas])

  const mascotasDelCliente = useMemo(() => {
    if (!clienteSeleccionado) return []
    return mascotas.filter((m) => m.cliente_id === clienteSeleccionado.id)
  }, [clienteSeleccionado, mascotas])

  const { horariosDisponibles } = useMemo(() => {
    const slots: string[] = []
    const ocupados = new Set<string>()

    turnosExistentes
      .filter((t) => t.fecha === fecha && t.estado !== "cancelado")
      .forEach((t) => ocupados.add(t.hora.slice(0, 5)))

    const addSlots = (inicio: string, fin: string) => {
      const [sh, sm] = inicio.split(":").map(Number)
      const [eh, em] = fin.split(":").map(Number)
      let cur = sh * 60 + sm
      const end = eh * 60 + em
      while (cur < end) {
        const h = Math.floor(cur / 60)
        const m = cur % 60
        const slot = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`
        if (!ocupados.has(slot)) slots.push(slot)
        cur += 30
      }
    }

    if (config) {
      addSlots(config.hora_inicio_manana, config.hora_fin_manana)
      addSlots(config.hora_inicio_tarde, config.hora_fin_tarde)
    }

    return { horariosDisponibles: slots }
  }, [config, turnosExistentes, fecha])

  const isWorkingDay = (dateStr: string) => {
    const diasNoLaborables = config?.dias_no_laborables || []
    if (diasNoLaborables.includes(dateStr)) return false
    return true
  }

  const navigateDate = (days: number) => {
    const d = new Date(fecha + "T12:00:00")
    d.setDate(d.getDate() + days)
    setFecha(d.toLocaleDateString("en-CA", { timeZone: "America/Argentina/Buenos_Aires" }))
    setHora("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!hora || !mascotaSeleccionada || !tipoServicio) return

    setIsLoading(true)
    await crearTurno({
      fecha,
      hora,
      mascota_id: mascotaSeleccionada.id,
      tipo_servicio: tipoServicio as "Corte" | "Baño" | "Corte y Baño",
      descuento_tipo: null,
      descuento_valor: 0,
      precio_final: 0,
      estado: "pendiente",
    })
    setIsLoading(false)
    onTurnoCreated?.()
    handleClose()
  }

  const fechaFormateada = new Date(fecha + "T12:00:00").toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={handleClose}>
          <Card
            className="w-full sm:max-w-md rounded-lg shadow-lg flex flex-col max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-3 sticky top-0 bg-background border-b z-10">
              <div>
                <CardTitle>Nuevo turno</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  {paso === "fecha" && "Elegí fecha y hora"}
                  {paso === "cliente" && "Buscá el cliente"}
                  {paso === "mascota" && `Mascotas de ${clienteSeleccionado?.nombre}`}
                  {paso === "servicio" && `Servicio para ${mascotaSeleccionada?.nombre}`}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={handleClose}>
                <X className="h-5 w-5" />
              </Button>
            </CardHeader>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-28">

                {/* PASO 1: FECHA Y HORA */}
                {paso === "fecha" && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Clock className="h-4 w-4" />
                        Fecha y hora
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Button type="button" variant="ghost" size="icon" onClick={() => navigateDate(-1)}>
                          <ChevronLeft />
                        </Button>
                        <div className="text-center">
                          <p className="font-medium capitalize">{fechaFormateada}</p>
                          {feriadoNombre && (
                            <p className="text-xs text-amber-600 font-medium">🎉 {feriadoNombre}</p>
                          )}
                          {!isWorkingDay(fecha) && (
                            <p className="text-xs text-destructive">Día no laborable</p>
                          )}
                        </div>
                        <Button type="button" variant="ghost" size="icon" onClick={() => navigateDate(1)}>
                          <ChevronRight />
                        </Button>
                      </div>

                      {isWorkingDay(fecha) && (
                        <div className="grid grid-cols-4 gap-2">
                          {horariosDisponibles.map((slot) => (
                            <Button
                              key={slot}
                              type="button"
                              variant={hora === slot ? "default" : "outline"}
                              className="h-11 text-sm"
                              onClick={() => setHora(slot)}
                            >
                              {slot}
                            </Button>
                          ))}
                        </div>
                      )}

                      {hora && (
                        <div className="flex items-center justify-center gap-2 bg-muted p-2 rounded">
                          <Check className="h-4 w-4" />
                          Turno a las {hora}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* PASO 2: BUSCAR CLIENTE */}
                {paso === "cliente" && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <User className="h-4 w-4" />
                        Buscar cliente
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {!showNuevoCliente ? (
                        <>
                          <Input
                            placeholder="Buscar por nombre, mascota o teléfono..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            autoFocus
                          />
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {clientesFiltrados.map((cliente) => (
                              <button
                                key={cliente.id}
                                type="button"
                                onClick={() => {
                                  setClienteSeleccionado(cliente)
                                  setSearchQuery("")
                                  setPaso("mascota")
                                }}
                                className="w-full text-left p-3 border rounded-lg hover:bg-muted transition-colors"
                              >
                                <div className="font-medium">{cliente.nombre}</div>
                                <div className="text-sm text-muted-foreground">
                                  {cliente.telefono} · {cliente.mascotas.length} mascota(s)
                                </div>
                                <div className="flex gap-1 mt-1 flex-wrap">
                                  {cliente.mascotas.map((m) => (
                                    <span key={m.id} className="text-xs bg-muted px-2 py-0.5 rounded">
                                      {m.tipo_animal === "Perro" ? "🐕" : "🐈"} {m.nombre}
                                    </span>
                                  ))}
                                </div>
                              </button>
                            ))}
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full gap-2"
                            onClick={() => setShowNuevoCliente(true)}
                          >
                            <UserPlus className="h-4 w-4" />
                            Crear nuevo cliente
                          </Button>
                        </>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="font-medium">Nuevo cliente y mascota</Label>
                            <Button type="button" variant="ghost" size="sm" onClick={() => setShowNuevoCliente(false)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <Input
                            placeholder="Nombre del cliente"
                            value={nuevoCliente.nombre}
                            onChange={(e) => setNuevoCliente({ ...nuevoCliente, nombre: e.target.value })}
                            className="h-12"
                          />
                          <Input
                            placeholder="Teléfono (WhatsApp)"
                            value={nuevoCliente.telefono}
                            onChange={(e) => setNuevoCliente({ ...nuevoCliente, telefono: e.target.value })}
                            className="h-12"
                          />
                          <Input
                            placeholder="Nombre de la mascota"
                            value={nuevaMascota.nombre}
                            onChange={(e) => setNuevaMascota({ ...nuevaMascota, nombre: e.target.value })}
                            className="h-12"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            {(["Perro", "Gato"] as const).map((tipo) => (
                              <Button
                                key={tipo}
                                type="button"
                                variant={nuevaMascota.tipo_animal === tipo ? "default" : "outline"}
                                className="h-11"
                                onClick={() => setNuevaMascota({ ...nuevaMascota, tipo_animal: tipo })}
                              >
                                {tipo === "Perro" ? <Dog className="mr-2 h-4 w-4" /> : <Cat className="mr-2 h-4 w-4" />}
                                {tipo}
                              </Button>
                            ))}
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            {(["S", "M", "L"] as const).map((size) => (
                              <Button
                                key={size}
                                type="button"
                                variant={nuevaMascota.tamano === size ? "default" : "outline"}
                                className="h-11"
                                onClick={() => setNuevaMascota({ ...nuevaMascota, tamano: size })}
                              >
                                {size === "S" ? "Chico" : size === "M" ? "Mediano" : "Grande"}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* PASO 3: SELECCIONAR MASCOTA */}
                {paso === "mascota" && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Dog className="h-4 w-4" />
                        Mascota de {clienteSeleccionado?.nombre}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {mascotasDelCliente.map((mascota) => (
                        <button
                          key={mascota.id}
                          type="button"
                          onClick={() => {
                            setMascotaSeleccionada(mascota)
                            setPaso("servicio")
                          }}
                          className={cn(
                            "w-full text-left p-3 border-2 rounded-lg transition-colors flex items-center gap-3",
                            mascotaSeleccionada?.id === mascota.id
                              ? "border-primary bg-primary/5"
                              : "border-muted hover:border-muted-foreground/50"
                          )}
                        >
                          {mascota.tipo_animal === "Perro" ? (
                            <Dog className="h-5 w-5 text-primary" />
                          ) : (
                            <Cat className="h-5 w-5 text-primary" />
                          )}
                          <div>
                            <p className="font-medium">{mascota.nombre}</p>
                            <p className="text-xs text-muted-foreground">
                              {mascota.raza} · {mascota.tamano === "S" ? "Chico" : mascota.tamano === "M" ? "Mediano" : "Grande"}
                            </p>
                          </div>
                        </button>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* PASO 4: TIPO DE SERVICIO */}
                {paso === "servicio" && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Tipo de servicio</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {TIPOS_SERVICIO.map((tipo) => (
                        <button
                          key={tipo}
                          type="button"
                          onClick={() => setTipoServicio(tipo)}
                          className={cn(
                            "w-full p-4 border-2 rounded-lg text-left font-medium transition-all",
                            tipoServicio === tipo
                              ? "border-primary bg-primary/5"
                              : "border-muted hover:border-muted-foreground/50"
                          )}
                        >
                          {tipo}
                        </button>
                      ))}
                    </CardContent>
                  </Card>
                )}

              </div>

              {/* BOTONES DE NAVEGACIÓN */}
              <div className="flex gap-2 bg-background pt-2 border-t px-4 pb-4">
                {paso !== "fecha" && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (paso === "cliente") setPaso("fecha")
                      else if (paso === "mascota") setPaso("cliente")
                      else if (paso === "servicio") setPaso("mascota")
                    }}
                    className="flex-1 h-12"
                  >
                    Atrás
                  </Button>
                )}
                {paso !== "servicio" ? (
                  <Button
                    type="button"
                    className="flex-1 h-12"
                    onClick={() => {
                      if (paso === "fecha" && hora) setPaso("cliente")
                      else if (paso === "cliente" && clienteSeleccionado) setPaso("mascota")
                      else if (paso === "mascota" && mascotaSeleccionada) setPaso("servicio")
                    }}
                    disabled={
                      (paso === "fecha" && !hora) ||
                      (paso === "cliente" && !clienteSeleccionado) ||
                      (paso === "mascota" && !mascotaSeleccionada)
                    }
                  >
                    Siguiente
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={!tipoServicio || isLoading}
                    className="flex-1 h-12"
                  >
                    {isLoading ? "Agendando..." : "Agendar turno"}
                  </Button>
                )}
              </div>
            </form>
          </Card>
        </div>
      )}
    </>
  )
}