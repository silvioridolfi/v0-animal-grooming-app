"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Accesorio, Cliente } from "@/lib/types"
import { crearVentaAccesorio } from "@/lib/actions/ventas-accesorios"
import { getFechaArgentina } from "@/lib/utils/fecha-argentina"
import { AccesorioCombobox } from "./accesorio-combobox"
import { ClienteCombobox } from "./cliente-combobox"

interface VentaFormProps {
  accesorios: Accesorio[]
  clientes: Cliente[]
  onSuccess: () => void
  onCancel: () => void
}

const mediosPago = [
  { value: "efectivo", label: "Efectivo" },
  { value: "transferencia", label: "Transferencia" },
]

export function VentaForm({ accesorios, clientes, onSuccess, onCancel }: VentaFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [accesorioId, setAccesorioId] = useState("")
  const [clienteId, setClienteId] = useState("")
  const [cantidad, setCantidad] = useState("1")
  const [precioUnitario, setPrecioUnitario] = useState("")
  const [medioPago, setMedioPago] = useState("efectivo")

  const accesorioSeleccionado = accesorios.find((a) => a.id === accesorioId)
  const accesoriosActivos = useMemo(() => accesorios.filter((a) => a.activo), [accesorios])

  const handleAccesorioChange = (id: string) => {
    setAccesorioId(id)
    const acc = accesorios.find((a) => a.id === id)
    if (acc) setPrecioUnitario(String(acc.precio))
  }

  const total = (Number.parseFloat(precioUnitario) || 0) * (Number.parseInt(cantidad, 10) || 0)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    if (!accesorioId) {
      setError("Elegí un accesorio")
      return
    }

    setIsSubmitting(true)
    try {
      const formData = new FormData(e.currentTarget)
      formData.set("accesorio_id", accesorioId)
      formData.set("cliente_id", clienteId)
      formData.set("metodo_pago", medioPago)

      const result = await crearVentaAccesorio(formData)

      if (!result.success) {
        setError(result.error || "Error al registrar la venta")
        return
      }
      onSuccess()
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 0 }).format(amount)

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <CardTitle>Nueva Venta</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Accesorio</Label>
            <AccesorioCombobox accesorios={accesoriosActivos} value={accesorioId} onValueChange={handleAccesorioChange} />
          </div>

          <div className="space-y-2">
            <Label>Cliente (opcional)</Label>
            <ClienteCombobox clientes={clientes} value={clienteId} onValueChange={setClienteId} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cantidad">Cantidad</Label>
              <Input
                id="cantidad"
                name="cantidad"
                type="number"
                step="1"
                min="1"
                max={accesorioSeleccionado?.stock || undefined}
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                required
              />
              {accesorioSeleccionado && (
                <p className="text-xs text-muted-foreground">Disponible: {accesorioSeleccionado.stock}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="precio_unitario">Precio unitario ($)</Label>
              <Input
                id="precio_unitario"
                name="precio_unitario"
                type="number"
                step="0.01"
                min="0"
                value={precioUnitario}
                onChange={(e) => setPrecioUnitario(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fecha">Fecha</Label>
            <Input id="fecha" name="fecha" type="date" defaultValue={getFechaArgentina()} required />
          </div>

          <div className="space-y-2">
            <Label>Medio de Pago</Label>
            <div className="grid grid-cols-2 gap-2">
              {mediosPago.map((mp) => (
                <button
                  key={mp.value}
                  type="button"
                  onClick={() => setMedioPago(mp.value)}
                  className={cn(
                    "py-3 px-4 rounded-lg border text-sm font-medium transition-colors",
                    medioPago === mp.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card text-foreground hover:bg-muted",
                  )}
                >
                  {mp.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notas">Notas (opcional)</Label>
            <Textarea id="notas" name="notas" placeholder="Notas adicionales..." rows={2} />
          </div>

          <div className="flex items-center justify-between rounded-lg bg-muted p-3">
            <span className="text-sm font-medium text-muted-foreground">Total</span>
            <span className="text-lg font-bold text-foreground">{formatCurrency(total)}</span>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1 bg-transparent" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting || !accesorioId}>
              {isSubmitting ? "Guardando..." : "Registrar Venta"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
