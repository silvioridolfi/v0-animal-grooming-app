"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import type { Mascota, ConfiguracionNegocio, Turno } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { crearTurno } from "@/lib/actions/turnos"
import { crearMascotaConCliente } from "@/lib/actions/mascotas"
import { Dog, Cat, UserPlus, Search, Clock, Check, X, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { getNombreFeriado } from "@/lib/feriados"

interface NuevoTurnoFormProps {
  mascotas: Mascota[]
  config: ConfiguracionNegocio | null
  turnosExistentes: Turno[]
  fechaInicial?: string
  horaInicial?: string
}

const TIPOS_SERVICIO = ["Corte", "Baño", "Corte y Baño"] as const

export function NuevoTurnoForm({
  mascotas,
  config,
  turnosExistentes,
  fechaInicial,
  horaInicial,
}: NuevoTurnoFormProps) {
  const router = useRouter()

  const [fecha, setFecha] = useState(fechaInicial || new Date().toISOString().split("T")[0])
  const [hora, setHora] = useState(horaInicial || "")
  const [mascotaId, setMascotaId] = useState("")
  const [tipoServicio, setTipoServicio] = useState<"Corte" | "Baño" | "Corte y Baño" | "">("")
  const [precioManual, setPrecioManual] = useState("")
  const [descuentoTipo, setDescuentoTipo] = useState<"fijo" | "porcentaje" | "">("")
  const [descuentoValor, setDescuentoValor] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const [searchQuery, setSearchQuery] = useState("")
  const [showNuevoCliente, setShowNuevoCliente] = useState(false)
  const [nuevoCliente, setNuevoCliente] = useState({ nombre: "", telefono: "" })
  const [nuevaMascota, setNuevaMascota] = useState({
    nombre: "",
    tipo_animal: "Perro" as "Perro" | "Gato",
    tamano: "M" as "S" | "M" | "L",
  })
  const [localMascotas, setLocalMascotas] = useState(mascotas)

  const mascotaSeleccionada = localMascotas.find((m) => m.id === mascotaId)

  const precioFinal = useMemo(() => {
    if (!precioManual || Number(precioManual) <= 0) return 0
    if (!descuentoTipo || !descuentoValor) return Number(precioManual)
    const descuento = Number(descuentoValor)
    const precio = Number(precioManual)
    if (descuentoTipo === "fijo") {
      return Math.max(0, precio - descuento)
    }
    return Math.max(0, precio * (1 - descuento / 100))
  }, [precioManual, descuentoTipo, descuentoValor])

  const mascotasFiltradas = useMemo(() => {
    if (!searchQuery.trim()) return []
    const query = searchQuery.toLowerCase()
    return localMascotas
      .filter((m) => m.nombre.toLowerCase().includes(query) || m.cliente?.nombre.toLowerCase().includes(query))
      .slice(0, 5)
  }, [searchQuery, localMascotas])

  const { horariosDisponibles, turnosPorHora } = useMemo(() => {
    const slots: string[] = []
    const ocupados: Record<string, Turno> = {}

    turnosExistentes
      .filter((t) => t.fecha === fecha && t.estado !== "cancelado")
      .forEach((t) => {
        ocupados[t.hora.slice(0, 5)] = t
      })

    if (!config) {
      for (let h = 9; h < 18; h++) {
        slots.push(`${h.toString().padStart(2, "0")}:00`)
        slots.push(`${h.toString().padStart(2, "0")}:30`)
      }
      return { horariosDisponibles: slots, turnosPorHora: ocupados }
    }

    const addSlots = (inicio: string, fin: string) => {
      const [startH, startM] = inicio.split(":").map(Number)
      const [endH, endM] = fin.split(":").map(Number)
      let current = startH * 60 + startM
      const end = endH * 60 + endM

      while (current < end) {
        const h = Math.floor(current / 60)
        const m = current % 60
        slots.push(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`)
        current += 30
      }
    }

    addSlots(config.hora_inicio_manana, config.hora_fin_manana)
    addSlots(config.hora_inicio_tarde, config.hora_fin_tarde)

    return { horariosDisponibles: slots, turnosPorHora: ocupados }
  }, [config, turnosExistentes, fecha])

  const isWorkingDay = (dateStr: string) => {
    const date = new Date(dateStr + "T12:00:00")
    const dayOfWeek = date.getDay()
    const diasLaborales = config?.dias_laborales || [1, 2, 3, 4, 5]
    const diasNoLaborables = config?.dias_no_laborables || []
    if (diasNoLaborables.includes(dateStr)) return false
    return diasLaborales.includes(dayOfWeek)
  }

  const navigateDate = (days: number) => {
    const current = new Date(fecha + "T12:00:00")
    current.setDate(current.getDate() + days)
    const newDate = current.toISOString().split("T")[0]
    setFecha(newDate)
    setHora("")
  }

  const handleCrearClienteYMascota = async () => {
    if (!nuevoCliente.nombre || !nuevaMascota.nombre) return
    setIsLoading(true)
    const result = await crearMascotaConCliente(nuevoCliente, nuevaMascota)
    if (result.success && result.mascota) {
      const newMascota: Mascota = {
        ...result.mascota,
        cliente: result.cliente,
      }
      setLocalMascotas([...localMascotas, newMascota])
      setMascotaId(result.mascota.id)
      setShowNuevoCliente(false)
      setSearchQuery("")
      setNuevoCliente({ nombre: "", telefono: "" })
      setNuevaMascota({ nombre: "", tipo_animal: "Perro", tamano: "M" })
    }
    setIsLoading(false)
  }

  const handleSelectMascota = (mascota: Mascota) => {
    setMascotaId(mascota.id)
    setSearchQuery("")
    setTipoServicio("")
    setPrecioManual("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!mascotaId || !tipoServicio || !hora || precioFinal <= 0) return

    setIsLoading(true)
    const result = await crearTurno({
      fecha,
      hora,
      mascota_id: mascotaId,
      tipo_servicio: tipoServicio as "Corte" | "Baño" | "Corte y Baño",
      descuento_tipo: descuentoTipo || null,
      descuento_valor: descuentoTipo ? Number(descuentoValor) : 0,
      precio_final: precioFinal,
    })

    if (result.success) {
      router.push("/")
    }
    setIsLoading(false)
  }

  const fechaFormateada = new Date(fecha + "T12:00:00").toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })

  const isValidDay = isWorkingDay(fecha)
  const feriadoNombre = getNombreFeriado(fecha)

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base font-heading">
            <Clock className="h-4 w-4" />
            Fecha y hora
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg bg-muted/50 p-2">
            <Button type="button" variant="ghost" size="icon" onClick={() => navigateDate(-1)} className="h-10 w-10">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="text-center">
              <p className="text-sm font-medium capitalize">{fechaFormateada}</p>
              {feriadoNombre && <p className="text-xs text-amber-600 font-medium">{feriadoNombre}</p>}
              {!isValidDay && !feriadoNombre && <p className="text-xs text-destructive">Día no laborable</p>}
            </div>
            <Button type="button" variant="ghost" size="icon" onClick={() => navigateDate(1)} className="h-10 w-10">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          {feriadoNombre && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-center">
              <p className="text-sm text-amber-800">No se pueden agendar turnos en feriados</p>
            </div>
          )}

          {isValidDay && !feriadoNombre && (
            <div className="grid grid-cols-4 gap-2">
              {horariosDisponibles.map((slot) => {
                const ocupado = turnosPorHora[slot]
                const isSelected = hora === slot

                return (
                  <Button
                    key={slot}
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    disabled={!!ocupado}
                    onClick={() => setHora(slot)}
                    className={cn(
                      "relative h-12 text-sm font-medium",
                      isSelected && "ring-2 ring-ring ring-offset-2",
                      ocupado && "cursor-not-allowed opacity-40 line-through bg-muted",
                    )}
                  >
                    {slot}
                    {ocupado && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-destructive" />}
                  </Button>
                )
              })}
            </div>
          )}

          {hora && (
            <div className="flex items-center justify-center gap-2 rounded-lg bg-accent/30 p-3">
              <Check className="h-4 w-4 text-accent-foreground" />
              <span className="font-medium">Turno a las {hora}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-base font-heading">
            <span className="flex items-center gap-2">
              <Dog className="h-4 w-4" />
              Mascota
            </span>
            {!mascotaSeleccionada && !showNuevoCliente && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowNuevoCliente(true)}
                className="gap-1 text-xs"
              >
                <UserPlus className="h-3 w-3" />
                Crear nuevo
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {mascotaSeleccionada ? (
            <div className="flex items-center justify-between rounded-lg border-2 border-primary bg-primary/5 p-3">
              <div className="flex items-center gap-3">
                {mascotaSeleccionada.tipo_animal === "Perro" ? (
                  <Dog className="h-6 w-6 text-primary" />
                ) : (
                  <Cat className="h-6 w-6 text-primary" />
                )}
                <div>
                  <p className="font-medium">{mascotaSeleccionada.nombre}</p>
                  <p className="text-sm text-muted-foreground">
                    {mascotaSeleccionada.cliente?.nombre} - {mascotaSeleccionada.tamano}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  setMascotaId("")
                  setTipoServicio("")
                  setPrecioManual("")
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : showNuevoCliente ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Nuevo cliente y mascota</Label>
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowNuevoCliente(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-3 rounded-lg bg-muted/30 p-3">
                <Input
                  placeholder="Nombre del cliente"
                  value={nuevoCliente.nombre}
                  onChange={(e) => setNuevoCliente({ ...nuevoCliente, nombre: e.target.value })}
                  className="bg-background h-12"
                />
                <Input
                  placeholder="Teléfono (WhatsApp)"
                  value={nuevoCliente.telefono}
                  onChange={(e) => setNuevoCliente({ ...nuevoCliente, telefono: e.target.value })}
                  className="bg-background h-12"
                />
              </div>

              <div className="space-y-3 rounded-lg bg-muted/30 p-3">
                <Input
                  placeholder="Nombre de la mascota"
                  value={nuevaMascota.nombre}
                  onChange={(e) => setNuevaMascota({ ...nuevaMascota, nombre: e.target.value })}
                  className="bg-background h-12"
                />
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={nuevaMascota.tipo_animal === "Perro" ? "default" : "outline"}
                    className="h-12"
                    onClick={() => setNuevaMascota({ ...nuevaMascota, tipo_animal: "Perro" })}
                  >
                    <Dog className="mr-2 h-5 w-5" />
                    Perro
                  </Button>
                  <Button
                    type="button"
                    variant={nuevaMascota.tipo_animal === "Gato" ? "default" : "outline"}
                    className="h-12"
                    onClick={() => setNuevaMascota({ ...nuevaMascota, tipo_animal: "Gato" })}
                  >
                    <Cat className="mr-2 h-5 w-5" />
                    Gato
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(["S", "M", "L"] as const).map((size) => (
                    <Button
                      key={size}
                      type="button"
                      variant={nuevaMascota.tamano === size ? "default" : "outline"}
                      className="h-12"
                      onClick={() => setNuevaMascota({ ...nuevaMascota, tamano: size })}
                    >
                      {size === "S" ? "Chico" : size === "M" ? "Mediano" : "Grande"}
                    </Button>
                  ))}
                </div>
              </div>

              <Button
                type="button"
                onClick={handleCrearClienteYMascota}
                disabled={!nuevoCliente.nombre || !nuevaMascota.nombre || isLoading}
                className="w-full h-12"
              >
                {isLoading ? "Creando..." : "Crear y seleccionar"}
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por mascota o cliente..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>

              {mascotasFiltradas.length > 0 && (
                <div className="space-y-1 rounded-lg border p-2">
                  {mascotasFiltradas.map((mascota) => (
                    <button
                      key={mascota.id}
                      type="button"
                      onClick={() => handleSelectMascota(mascota)}
                      className="flex w-full items-center gap-3 rounded-lg p-3 text-left hover:bg-muted active:bg-muted/80 transition-colors"
                    >
                      {mascota.tipo_animal === "Perro" ? (
                        <Dog className="h-5 w-5 text-primary" />
                      ) : (
                        <Cat className="h-5 w-5 text-primary" />
                      )}
                      <div>
                        <p className="font-medium">{mascota.nombre}</p>
                        <p className="text-sm text-muted-foreground">{mascota.cliente?.nombre}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {searchQuery && mascotasFiltradas.length === 0 && (
                <div className="rounded-lg border border-dashed p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-2">No se encontraron resultados</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowNuevoCliente(true)}
                    className="gap-1"
                  >
                    <UserPlus className="h-4 w-4" />
                    Crear nuevo cliente
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {mascotaSeleccionada && (
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-heading">Servicio y precio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label>Tipo de servicio</Label>
              <div className="grid grid-cols-3 gap-2">
                {TIPOS_SERVICIO.map((tipo) => (
                  <Button
                    key={tipo}
                    type="button"
                    variant={tipoServicio === tipo ? "default" : "outline"}
                    className="h-12 text-sm"
                    onClick={() => setTipoServicio(tipo)}
                  >
                    {tipo}
                  </Button>
                ))}
              </div>
            </div>

            {tipoServicio && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="precio-manual">Precio</Label>
                  <Input
                    id="precio-manual"
                    type="number"
                    value={precioManual}
                    onChange={(e) => setPrecioManual(e.target.value)}
                    placeholder="Ingresá el precio"
                    min="0"
                    step="0.01"
                    className="h-12 text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Descuento (opcional)</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={descuentoTipo === "fijo" ? "default" : "outline"}
                      size="sm"
                      onClick={() => { setDescuentoTipo("fijo"); setDescuentoValor("") }}
                      className="flex-1"
                    >
                      $ Fijo
                    </Button>
                    <Button
                      type="button"
                      variant={descuentoTipo === "porcentaje" ? "default" : "outline"}
                      size="sm"
                      onClick={() => { setDescuentoTipo("porcentaje"); setDescuentoValor("") }}
                      className="flex-1"
                    >
                      % Porcentaje
                    </Button>
                    {descuentoTipo && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => { setDescuentoTipo(""); setDescuentoValor("") }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {descuentoTipo && (
                    <Input
                      type="number"
                      value={descuentoValor}
                      onChange={(e) => setDescuentoValor(e.target.value)}
                      placeholder={descuentoTipo === "fijo" ? "Monto a descontar" : "Porcentaje (ej: 10)"}
                      min="0"
                      className="h-12"
                    />
                  )}
                </div>

                {precioManual && Number(precioManual) > 0 && (
                  <div className="rounded-lg bg-primary/10 p-3 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Precio base:</span>
                      <span>${Number(precioManual).toLocaleString("es-AR")}</span>
                    </div>
                    {descuentoTipo && descuentoValor && (
                      <div className="flex justify-between text-sm text-amber-600">
                        <span>Descuento:</span>
                        <span>-${(Number(precioManual) - precioFinal).toLocaleString("es-AR")}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-semibold border-t pt-1">
                      <span>Total:</span>
                      <span>${precioFinal.toLocaleString("es-AR")}</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      <Button
        type="submit"
        className="w-full h-14 text-lg font-semibold shadow-lg"
        size="lg"
        disabled={!mascotaId || !tipoServicio || !hora || precioFinal <= 0 || isLoading}
      >
        {isLoading ? "Creando turno..." : "Agendar turno"}
      </Button>
    </form>
  )
}