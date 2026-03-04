"use client"

import type React from "react"
import { useState, useMemo, useCallback } from "react"
import type { Mascota, ConfiguracionNegocio, Turno, Cliente } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { crearTurno } from "@/lib/actions/turnos"
import { Dog, Cat, UserPlus, Clock, Check, X, ChevronLeft, ChevronRight, User, DollarSign, Calendar } from "lucide-react"
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
  const hoy = new Date().toISOString().split("T")[0]

  const [paso, setPaso] = useState<"fecha" | "cliente" | "mascotas" | "servicio" | "precio" | "pago" | "resumen">("fecha")
  const [fecha, setFecha] = useState(hoy)
  const [hora, setHora] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [showNuevoCliente, setShowNuevoCliente] = useState(false)

  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null)
  const [mascotasSeleccionadas, setMascotasSeleccionadas] = useState<Mascota[]>([])
  const [tipoServicio, setTipoServicio] = useState<"Corte" | "Baño" | "Corte y Baño" | "">("")
  const [preciosPorMascota, setPreciosPorMascota] = useState<Record<string, number>>({})
  const [metodoPago, setMetodoPago] = useState<"efectivo" | "transferencia" | "">("")

  const [nuevoCliente, setNuevoCliente] = useState({ nombre: "", telefono: "" })
  const [nuevaMascota, setNuevaMascota] = useState({
    nombre: "",
    tipo_animal: "Perro",
    tamano: "M",
  })

  const [isLoading, setIsLoading] = useState(false)

  // Reset modal state only when isOpen changes (not when props change)
  useMemo(() => {
    if (isOpen) {
      setPaso("fecha")
      setFecha(fechaInicial || hoy)
      setHora(horaInicial || "")
      setSearchQuery("")
      setClienteSeleccionado(null)
      setMascotasSeleccionadas([])
      setTipoServicio("")
      setPreciosPorMascota({})
      setMetodoPago("")
      setShowNuevoCliente(false)
    }
  }, [isOpen]) // Only depends on isOpen

  // Compute feriado name directly without useEffect
  const feriadoNombre = useMemo(() => getNombreFeriado(fecha), [fecha])

  const handleClose = useCallback(() => {
    onClose()
  }, [onClose])

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

      if (matchesSearch) {
        if (m.cliente && !map.has(m.cliente_id)) {
          map.set(m.cliente_id, { ...m.cliente, mascotas: [] })
        }
        if (m.cliente) {
          map.get(m.cliente_id)!.mascotas.push(m)
        }
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
    const d = new Date(dateStr + "T12:00:00")
    const day = d.getDay()
    const dias = config?.dias_laborales || [1, 2, 3, 4, 5]
    const diasNoLaborables = config?.dias_no_laborables || []
    
    // Permitir agendar en cualquier día excepto los configurados como no laborables
    if (diasNoLaborables.includes(dateStr)) return false
    return true
  }

  const navigateDate = (days: number) => {
    const d = new Date(fecha + "T12:00:00")
    d.setDate(d.getDate() + days)
    setFecha(d.toISOString().split("T")[0])
    setHora("")
  }

  const handleToggleMascota = (mascota: Mascota) => {
    setMascotasSeleccionadas((prev) => {
      const exists = prev.find((m) => m.id === mascota.id)
      if (exists) {
        return prev.filter((m) => m.id !== mascota.id)
      }
      return [...prev, mascota]
    })
  }

  const handleSelectAll = () => {
    if (mascotasSeleccionadas.length === mascotasDelCliente.length) {
      setMascotasSeleccionadas([])
    } else {
      setMascotasSeleccionadas([...mascotasDelCliente])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!hora || mascotasSeleccionadas.length === 0 || !tipoServicio || !metodoPago) return

    // Validar que todos los precios estén ingresados
    for (const mascota of mascotasSeleccionadas) {
      if (!preciosPorMascota[mascota.id] || preciosPorMascota[mascota.id] <= 0) {
        alert(`Por favor ingresa un precio válido para ${mascota.nombre}`)
        return
      }
    }

    setIsLoading(true)
    let currentHora = hora

    for (const mascota of mascotasSeleccionadas) {
      const precio = preciosPorMascota[mascota.id]
      if (!precio || precio <= 0) continue

      await crearTurno({
        fecha,
        hora: currentHora,
        mascota_id: mascota.id,
        tipo_servicio: tipoServicio as "Corte" | "Baño" | "Corte y Baño",
        descuento_tipo: null,
        descuento_valor: 0,
        precio_final: precio,
        metodo_pago: metodoPago as "efectivo" | "transferencia",
        estado: "pendiente",
      })

      // Incrementar hora por 30 minutos (duración estándar)
      const [h, m] = currentHora.split(":").map(Number)
      const total = h * 60 + m + 30
      currentHora = `${Math.floor(total / 60)
        .toString()
        .padStart(2, "0")}:${(total % 60).toString().padStart(2, "0")}`
    }

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

  const precioTotal = useMemo(() => {
    return mascotasSeleccionadas.reduce((sum, m) => sum + (preciosPorMascota[m.id] || 0), 0)
  }, [mascotasSeleccionadas, preciosPorMascota])

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
                <p className="text-xs text-muted-foreground mt-1">Agendando para {fechaFormateada}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={handleClose}>
                <X className="h-5 w-5" />
              </Button>
            </CardHeader>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-28">
                {/* ================= PASO 1: FECHA Y HORA ================= */}
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
                          {feriadoNombre && <p className="text-xs text-amber-600">{feriadoNombre}</p>}
                          {!isWorkingDay(fecha) && <p className="text-xs text-destructive">Día no laborable</p>}
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

                {/* ================= PASO 2: BUSCAR CLIENTE ================= */}
                {paso === "cliente" && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <User className="h-4 w-4" />
                        Buscar cliente
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
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
                              setPaso("mascotas")
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

                      {searchQuery && clientesFiltrados.length === 0 && (
                        <div className="text-center py-4">
                          <p className="text-muted-foreground mb-2">No se encontró cliente</p>
                          <Button type="button" variant="outline" onClick={() => setShowNuevoCliente(true)}>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Crear nuevo cliente
                          </Button>
                        </div>
                      )}

                      {clientesFiltrados.length === 0 && !searchQuery && (
                        <p className="text-center text-muted-foreground text-sm py-4">No hay clientes disponibles</p>
                      )}

                      {!searchQuery && clientesFiltrados.length > 0 && (
                        <p className="text-center text-muted-foreground text-xs py-2">Escribí para filtrar clientes</p>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* ================= PASO 3: SELECCIONAR MASCOTAS ================= */}
                {paso === "mascotas" && clienteSeleccionado && (
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Mascotas de {clienteSeleccionado.nombre}</CardTitle>
                        {mascotasDelCliente.length > 1 && (
                          <Button type="button" variant="ghost" size="sm" onClick={handleSelectAll}>
                            {mascotasSeleccionadas.length === mascotasDelCliente.length
                              ? "Deseleccionar todas"
                              : "Seleccionar todas"}
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {mascotasDelCliente.map((mascota) => {
                        const isSelected = mascotasSeleccionadas.some((m) => m.id === mascota.id)
                        return (
                          <label
                            key={mascota.id}
                            className={cn(
                              "flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors",
                              isSelected ? "border-primary bg-primary/5" : "hover:bg-muted",
                            )}
                          >
                            <Checkbox checked={isSelected} onCheckedChange={() => handleToggleMascota(mascota)} />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                {mascota.tipo_animal === "Perro" ? (
                                  <Dog className="h-4 w-4 text-amber-600" />
                                ) : (
                                  <Cat className="h-4 w-4 text-purple-600" />
                                )}
                                <span className="font-medium">{mascota.nombre}</span>
                                {mascota.sexo && (
                                  <span
                                    className={cn(
                                      "text-sm",
                                      mascota.sexo === "Macho" ? "text-blue-500" : "text-pink-500",
                                    )}
                                  >
                                    {mascota.sexo === "Macho" ? "♂" : "♀"}
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {mascota.raza} · Tamaño {mascota.tamano}
                              </div>
                            </div>
                          </label>
                        )
                      })}

                      {mascotasSeleccionadas.length > 0 && (
                        <div className="flex items-center justify-center gap-2 bg-primary/10 text-primary p-3 rounded-lg mt-4">
                          <Check className="h-4 w-4" />
                          <span className="font-medium">{mascotasSeleccionadas.length} turno(s) a crear</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* ================= PASO 4: SELECCIONAR SERVICIO ================= */}
                {paso === "servicio" && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Seleccionar servicio</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {TIPOS_SERVICIO.map((tipo) => (
                        <button
                          key={tipo}
                          type="button"
                          onClick={() => {
                            setTipoServicio(tipo)
                            setPaso("precio")
                          }}
                          className={cn(
                            "w-full p-3 border rounded-lg text-left hover:bg-muted transition-colors",
                            tipoServicio === tipo && "border-primary bg-primary/5",
                          )}
                        >
                          <span className="font-medium">{tipo}</span>
                        </button>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* ================= PASO 5: INGRESAR PRECIOS MANUALES ================= */}
                {paso === "precio" && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Ingresar precios
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        Ingresa el precio para el servicio <span className="font-semibold">{tipoServicio}</span> de cada mascota.
                      </p>
                      <div className="space-y-2">
                        {mascotasSeleccionadas.map((mascota) => (
                          <div key={mascota.id} className="flex items-center gap-2 p-2 border rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{mascota.nombre}</p>
                              <p className="text-xs text-muted-foreground">Tamaño: {mascota.tamano}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-sm">$</span>
                              <Input
                                type="number"
                                placeholder="0"
                                min="0"
                                step="100"
                                value={preciosPorMascota[mascota.id] || ""}
                                onChange={(e) =>
                                  setPreciosPorMascota({
                                    ...preciosPorMascota,
                                    [mascota.id]: Number(e.target.value) || 0,
                                  })
                                }
                                className="w-32 text-right"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="border-t pt-3 flex justify-between items-center font-medium text-lg">
                        <span>Total:</span>
                        <span className="text-primary text-2xl">${precioTotal.toLocaleString("es-AR")}</span>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* ================= PASO 6: SELECCIONAR MÉTODO DE PAGO ================= */}
                {paso === "pago" && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Método de pago</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        Selecciona cómo deseas registrar el pago para este turno
                      </p>
                      <div className="space-y-2">
                        {["efectivo", "transferencia"].map((metodo) => (
                          <button
                            key={metodo}
                            type="button"
                            onClick={() => setMetodoPago(metodo as "efectivo" | "transferencia")}
                            className={cn(
                              "w-full p-4 border-2 rounded-lg text-left font-medium transition-all",
                              metodoPago === metodo
                                ? "border-primary bg-primary/5"
                                : "border-muted hover:border-muted-foreground/50"
                            )}
                          >
                            <div className="capitalize">
                              {metodo === "efectivo" ? "💵 En efectivo" : "🔄 Transferencia"}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {metodo === "efectivo" 
                                ? "Pago en efectivo al momento del servicio" 
                                : "Pago mediante transferencia bancaria"}
                            </div>
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* ================= PASO 7: RESUMEN ================= */}
                {paso === "resumen" && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Resumen del turno</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <span className="text-muted-foreground">Fecha:</span>
                        <span className="capitalize">{fechaFormateada}</span>

                        <span className="text-muted-foreground">Hora inicio:</span>
                        <span>{hora}</span>

                        <span className="text-muted-foreground">Cliente:</span>
                        <span>{clienteSeleccionado?.nombre || "—"}</span>

                        <span className="text-muted-foreground">Servicio:</span>
                        <span>{tipoServicio || "—"}</span>

                        <span className="text-muted-foreground">Pago:</span>
                        <span className="capitalize">{metodoPago === "efectivo" ? "💵 Efectivo" : "🔄 Transferencia"}</span>
                      </div>

                      <div className="border-t pt-3">
                        <p className="text-sm text-muted-foreground mb-2">Mascotas ({mascotasSeleccionadas.length}):</p>
                        <div className="space-y-1">
                          {mascotasSeleccionadas.map((m, idx) => {
                            const precio = preciosPorMascota[m.id]
                            return (
                              <div key={m.id} className="flex justify-between text-sm">
                                <span>
                                  {idx + 1}. {m.nombre} ({m.tamano})
                                </span>
                                <span className="text-muted-foreground">
                                  ${precio?.toLocaleString("es-AR") || 0}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      <div className="border-t pt-3 flex justify-between font-medium text-lg">
                        <span>Total:</span>
                        <span className="text-primary">${precioTotal.toLocaleString("es-AR")}</span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* ================= BOTONES DE NAVEGACIÓN ================= */}
              <div className="flex gap-2 bg-background pt-2 border-t px-4 pb-4">
                {paso !== "fecha" && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (paso === "cliente") setPaso("fecha")
                      else if (paso === "mascotas") setPaso("cliente")
                      else if (paso === "servicio") setPaso("mascotas")
                      else if (paso === "precio") setPaso("servicio")
                      else if (paso === "pago") setPaso("precio")
                      else if (paso === "resumen") setPaso("pago")
                    }}
                    className="flex-1 h-12"
                  >
                    Atrás
                  </Button>
                )}
                {paso !== "resumen" ? (
                  <Button
                    type="button"
                    onClick={() => {
                      if (paso === "fecha" && hora) setPaso("cliente")
                      else if (paso === "cliente" && clienteSeleccionado) setPaso("mascotas")
                      else if (paso === "mascotas" && mascotasSeleccionadas.length > 0) setPaso("servicio")
                      else if (paso === "servicio" && tipoServicio) setPaso("precio")
                      else if (paso === "precio" && Object.keys(preciosPorMascota).length === mascotasSeleccionadas.length) setPaso("pago")
                      else if (paso === "pago" && metodoPago) setPaso("resumen")
                    }}
                    disabled={
                      (paso === "fecha" && !hora) || 
                      (paso === "cliente" && !clienteSeleccionado) ||
                      (paso === "mascotas" && mascotasSeleccionadas.length === 0) ||
                      (paso === "servicio" && !tipoServicio) ||
                      (paso === "precio" && Object.keys(preciosPorMascota).length < mascotasSeleccionadas.length) ||
                      (paso === "pago" && !metodoPago)
                    }
                  >
                    Siguiente
                  </Button>
                ) : (
                  <Button type="submit" disabled={isLoading} className="flex-1 h-12">
                    {isLoading ? "Agendando..." : `Agendar ${mascotasSeleccionadas.length} turno(s)`}
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
