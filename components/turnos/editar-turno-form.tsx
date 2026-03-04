"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import type { Mascota, Turno } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { actualizarTurno } from "@/lib/actions/turnos"
import { Dog, Cat } from "lucide-react"

interface EditarTurnoFormProps {
  turno: Turno
  mascotas: Mascota[]
}

export function EditarTurnoForm({ turno, mascotas }: EditarTurnoFormProps) {
  const router = useRouter()
  const [mascotaId, setMascotaId] = useState(turno.mascota_id)
  const [tipoServicio, setTipoServicio] = useState<"Corte" | "Baño" | "Corte y Baño" | "">(turno.tipo_servicio || "")
  const [precioManual, setPrecioManual] = useState(turno.precio_final?.toString() || "")
  const [metodoPago, setMetodoPago] = useState<"efectivo" | "transferencia" | "">(turno.metodo_pago || "")
  const [fecha, setFecha] = useState(turno.fecha)
  const [hora, setHora] = useState(turno.hora.slice(0, 5))
  const [descuentoTipo, setDescuentoTipo] = useState<"fijo" | "porcentaje" | "">(turno.descuento_tipo || "")
  const [descuentoValor, setDescuentoValor] = useState(turno.descuento_valor?.toString() || "")
  const [estado, setEstado] = useState(turno.estado)
  const [isLoading, setIsLoading] = useState(false)

  const mascotaSeleccionada = mascotas.find((m) => m.id === mascotaId)

  const precioFinal = useMemo(() => {
    const precio = Number(precioManual) || 0
    if (!descuentoTipo || !descuentoValor || precio <= 0) return precio

    const descuento = Number(descuentoValor)
    if (descuentoTipo === "fijo") {
      return Math.max(0, precio - descuento)
    } else {
      return Math.max(0, precio * (1 - descuento / 100))
    }
  }, [precioManual, descuentoTipo, descuentoValor])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!mascotaId || !tipoServicio || !metodoPago || precioFinal <= 0) return

    setIsLoading(true)

    const result = await actualizarTurno(turno.id, {
      fecha,
      hora,
      mascota_id: mascotaId,
      tipo_servicio: tipoServicio as "Corte" | "Baño" | "Corte y Baño",
      descuento_tipo: descuentoTipo || null,
      descuento_valor: descuentoTipo ? Number(descuentoValor) : 0,
      precio_final: precioFinal,
      metodo_pago: metodoPago as "efectivo" | "transferencia",
      estado,
    })

    if (result.success) {
      router.push("/")
    }

    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Estado del turno</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={estado === "pendiente" ? "default" : "outline"}
              className="flex-1"
              onClick={() => setEstado("pendiente")}
            >
              Pendiente
            </Button>
            <Button
              type="button"
              variant={estado === "realizado" ? "default" : "outline"}
              className="flex-1"
              onClick={() => setEstado("realizado")}
            >
              Realizado
            </Button>
            <Button
              type="button"
              variant={estado === "cancelado" ? "default" : "outline"}
              className="flex-1"
              onClick={() => setEstado("cancelado")}
            >
              Cancelado
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Mascota</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={mascotaId} onValueChange={setMascotaId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una mascota" />
            </SelectTrigger>
            <SelectContent>
              {mascotas.map((mascota) => (
                <SelectItem key={mascota.id} value={mascota.id}>
                  <div className="flex items-center gap-2">
                    {mascota.tipo_animal === "Perro" ? <Dog className="h-4 w-4" /> : <Cat className="h-4 w-4" />}
                    {mascota.nombre} ({mascota.cliente?.nombre})
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Tipo de servicio</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={tipoServicio} onValueChange={(v) => setTipoServicio(v as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un servicio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Corte">Corte</SelectItem>
              <SelectItem value="Baño">Baño</SelectItem>
              <SelectItem value="Corte y Baño">Corte y Baño</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Precio y método de pago</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="precio">Precio ($)</Label>
            <Input
              id="precio"
              type="number"
              value={precioManual}
              onChange={(e) => setPrecioManual(e.target.value)}
              placeholder="Ingresa el precio"
              min="0"
              step="100"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="metodo">Método de pago</Label>
            <Select value={metodoPago} onValueChange={(v) => setMetodoPago(v as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona método" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="efectivo">💵 Efectivo</SelectItem>
                <SelectItem value="transferencia">🔄 Transferencia</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Fecha y hora</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fecha">Fecha</Label>
            <Input id="fecha" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hora">Hora</Label>
            <Input id="hora" type="time" value={hora} onChange={(e) => setHora(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Descuento (opcional)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              type="button"
              variant={descuentoTipo === "fijo" ? "default" : "outline"}
              className="flex-1"
              onClick={() => setDescuentoTipo(descuentoTipo === "fijo" ? "" : "fijo")}
            >
              Monto fijo
            </Button>
            <Button
              type="button"
              variant={descuentoTipo === "porcentaje" ? "default" : "outline"}
              className="flex-1"
              onClick={() => setDescuentoTipo(descuentoTipo === "porcentaje" ? "" : "porcentaje")}
            >
              Porcentaje
            </Button>
          </div>
          {descuentoTipo && (
            <div className="space-y-2">
              <Label htmlFor="descuentoValor">{descuentoTipo === "fijo" ? "Monto ($)" : "Porcentaje (%)"}</Label>
              <Input
                id="descuentoValor"
                type="number"
                value={descuentoValor}
                onChange={(e) => setDescuentoValor(e.target.value)}
                placeholder="0"
                min="0"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-primary/5">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Precio final</span>
            <div className="text-right">
              <span className="text-2xl font-bold text-foreground">${precioFinal.toLocaleString("es-AR")}</span>
              {descuentoTipo && descuentoValor && (
                <p className="text-sm text-muted-foreground line-through">${Number(precioManual).toLocaleString("es-AR")}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" className="w-full" size="lg" disabled={!mascotaId || !tipoServicio || !metodoPago || precioFinal <= 0 || isLoading}>
        {isLoading ? "Guardando..." : "Guardar cambios"}
      </Button>
    </form>
  )
}
