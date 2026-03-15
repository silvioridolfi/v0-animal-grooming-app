"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import type { Mascota, Turno } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { actualizarTurno } from "@/lib/actions/turnos"
import { Dog, Cat, DollarSign, X } from "lucide-react"

interface EditarTurnoFormProps {
  turno: Turno
  mascotas: Mascota[]
}

export function EditarTurnoForm({ turno, mascotas }: EditarTurnoFormProps) {
  const router = useRouter()
  const [mascotaId, setMascotaId] = useState(turno.mascota_id)
  const [tipoServicio, setTipoServicio] = useState<"Corte" | "Baño" | "Corte y Baño" | "">(turno.tipo_servicio || "")
  const [fecha, setFecha] = useState(turno.fecha)
  const [hora, setHora] = useState(turno.hora.slice(0, 5))
  const [estado, setEstado] = useState(turno.estado)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  // Cobro
  const [mostraCobro, setMostraCobro] = useState(false)
  const [precioManual, setPrecioManual] = useState(turno.precio_final?.toString() || "")
  const [metodoPago, setMetodoPago] = useState<"efectivo" | "transferencia" | "">(turno.metodo_pago || "")
  const [descuentoTipo, setDescuentoTipo] = useState<"fijo" | "porcentaje" | "">(turno.descuento_tipo || "")
  const [descuentoValor, setDescuentoValor] = useState(turno.descuento_valor?.toString() || "")

  const precioFinal = useMemo(() => {
    const precio = Number(precioManual) || 0
    if (!descuentoTipo || !descuentoValor || precio <= 0) return precio
    const descuento = Number(descuentoValor)
    if (descuentoTipo === "fijo") return Math.max(0, precio - descuento)
    return Math.max(0, precio * (1 - descuento / 100))
  }, [precioManual, descuentoTipo, descuentoValor])

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!mascotaId || !tipoServicio) return
    setIsLoading(true)
    const result = await actualizarTurno(turno.id, {
      fecha,
      hora,
      mascota_id: mascotaId,
      tipo_servicio: tipoServicio as "Corte" | "Baño" | "Corte y Baño",
      descuento_tipo: turno.descuento_tipo || null,
      descuento_valor: turno.descuento_valor || 0,
      precio_final: turno.precio_final || 0,
      metodo_pago: turno.metodo_pago || null,
      estado,
    })
    if (result.success) router.push("/")
    setIsLoading(false)
  }

  const handleCobrar = async () => {
    if (!metodoPago || precioFinal <= 0) {
      setErrorMsg("Ingresá el precio y la forma de pago")
      return
    }
    setErrorMsg("")
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
      estado: "realizado",
    })
    if (result.success) router.push("/")
    setIsLoading(false)
  }

  const yaCobrado = turno.estado === "realizado"

  return (
    <form onSubmit={handleGuardar} className="space-y-4 max-w-lg mx-auto">

      {/* Info principal condensada */}
      <Card>
        <CardContent className="pt-4 space-y-4">

          {/* Estado */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase">Estado</Label>
            <div className="flex gap-2">
              {(["pendiente", "realizado", "cancelado"] as const).map((e) => (
                <Button
                  key={e}
                  type="button"
                  variant={estado === e ? "default" : "outline"}
                  className="flex-1 capitalize h-9 text-sm"
                  onClick={() => setEstado(e)}
                >
                  {e.charAt(0).toUpperCase() + e.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {/* Mascota */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase">Mascota</Label>
            <Select value={mascotaId} onValueChange={setMascotaId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccioná una mascota" />
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
          </div>

          {/* Tipo de servicio */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase">Tipo de servicio</Label>
            <div className="grid grid-cols-3 gap-2">
              {(["Corte", "Baño", "Corte y Baño"] as const).map((tipo) => (
                <Button
                  key={tipo}
                  type="button"
                  variant={tipoServicio === tipo ? "default" : "outline"}
                  className="h-10 text-sm"
                  onClick={() => setTipoServicio(tipo)}
                >
                  {tipo}
                </Button>
              ))}
            </div>
          </div>

          {/* Fecha y hora en una fila */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase">Fecha</Label>
              <Input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase">Hora</Label>
              <Input type="time" value={hora} onChange={(e) => setHora(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cobro */}
      {!yaCobrado && (
        <Card className="border-2 border-accent/30">
          <CardContent className="pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 text-accent-foreground font-medium">
                <DollarSign className="h-4 w-4" />
                Cobrar turno
              </Label>
              {mostraCobro && (
                <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => setMostraCobro(false)}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            {!mostraCobro ? (
              <Button type="button" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" onClick={() => setMostraCobro(true)}>
                Registrar cobro
              </Button>
            ) : (
              <>
                <Input
                  type="number"
                  value={precioManual}
                  onChange={(e) => setPrecioManual(e.target.value)}
                  placeholder="Ingresá el precio"
                  min="0"
                  step="100"
                  className="h-12 text-base"
                />
                <div className="flex gap-2">
                  <Button type="button" variant={descuentoTipo === "fijo" ? "default" : "outline"} size="sm" className="flex-1"
                    onClick={() => { setDescuentoTipo(descuentoTipo === "fijo" ? "" : "fijo"); setDescuentoValor("") }}>
                    $ Fijo
                  </Button>
                  <Button type="button" variant={descuentoTipo === "porcentaje" ? "default" : "outline"} size="sm" className="flex-1"
                    onClick={() => { setDescuentoTipo(descuentoTipo === "porcentaje" ? "" : "porcentaje"); setDescuentoValor("") }}>
                    % Porcentaje
                  </Button>
                </div>
                {descuentoTipo && (
                  <Input
                    type="number"
                    value={descuentoValor}
                    onChange={(e) => setDescuentoValor(e.target.value)}
                    placeholder={descuentoTipo === "fijo" ? "Monto a descontar" : "Porcentaje (ej: 10)"}
                    min="0"
                  />
                )}
                <div className="flex gap-2">
                  <Button type="button" variant={metodoPago === "efectivo" ? "default" : "outline"} className="flex-1 h-12"
                    onClick={() => setMetodoPago("efectivo")}>
                    💵 Efectivo
                  </Button>
                  <Button type="button" variant={metodoPago === "transferencia" ? "default" : "outline"} className="flex-1 h-12"
                    onClick={() => setMetodoPago("transferencia")}>
                    🔄 Transferencia
                  </Button>
                </div>
                {precioManual && Number(precioManual) > 0 && (
                  <div className="rounded-lg bg-green-50 border border-green-200 p-3 flex justify-between font-semibold">
                    <span>Total:</span>
                    <span className="text-green-700">${precioFinal.toLocaleString("es-AR")}</span>
                  </div>
                )}
                {errorMsg && <p className="text-sm text-destructive">{errorMsg}</p>}
                <Button type="button" className="w-full h-12 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
                  onClick={handleCobrar} disabled={isLoading}>
                  {isLoading ? "Guardando..." : "Confirmar cobro"}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {yaCobrado && turno.precio_final && turno.precio_final > 0 && (
        <Card className="bg-accent/15 border-accent/30">
          <CardContent className="py-4 flex items-center justify-between">
            <span className="text-accent-foreground font-medium">✓ Turno cobrado</span>
            <div className="text-right">
              <p className="text-xl font-bold text-accent-foreground">${turno.precio_final.toLocaleString("es-AR")}</p>
              {turno.metodo_pago && <p className="text-sm text-accent-foreground/70 capitalize">{turno.metodo_pago}</p>}
            </div>
          </CardContent>
        </Card>
      )}

      <Button type="submit" className="w-full" size="lg" disabled={!mascotaId || !tipoServicio || isLoading}>
        {isLoading ? "Guardando..." : "Guardar cambios"}
      </Button>
    </form>
  )
}