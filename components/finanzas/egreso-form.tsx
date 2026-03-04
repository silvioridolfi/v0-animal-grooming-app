"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Egreso } from "@/lib/types"
import { crearEgreso, actualizarEgreso } from "@/lib/actions/egresos"

interface EgresoFormProps {
  egreso?: Egreso | null
  onSuccess: () => void
  onCancel: () => void
}

const categorias = [
  { value: "insumos", label: "Insumos" },
  { value: "herramientas", label: "Herramientas" },
  { value: "mantenimiento", label: "Mantenimiento" },
  { value: "otros", label: "Otros" },
]

const mediosPago = [
  { value: "efectivo", label: "Efectivo" },
  { value: "transferencia", label: "Transferencia" },
]

export function EgresoForm({ egreso, onSuccess, onCancel }: EgresoFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categoria, setCategoria] = useState(egreso?.categoria || "insumos")
  const [medioPago, setMedioPago] = useState(egreso?.medio_pago || "efectivo")

  const isEditing = !!egreso

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)
      formData.set("categoria", categoria)
      formData.set("medio_pago", medioPago)

      if (isEditing) {
        await actualizarEgreso(egreso.id, formData)
      } else {
        await crearEgreso(formData)
      }
      onSuccess()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <CardTitle>{isEditing ? "Editar Egreso" : "Nuevo Egreso"}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fecha">Fecha</Label>
            <Input
              id="fecha"
              name="fecha"
              type="date"
              defaultValue={egreso?.fecha || new Date().toISOString().split("T")[0]}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="concepto">Concepto</Label>
            <Input
              id="concepto"
              name="concepto"
              placeholder="Ej: Shampoo para perros"
              defaultValue={egreso?.concepto}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Categoria</Label>
            <div className="grid grid-cols-2 gap-2">
              {categorias.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategoria(cat.value)}
                  className={cn(
                    "py-3 px-4 rounded-lg border text-sm font-medium transition-colors",
                    categoria === cat.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card text-foreground hover:bg-muted",
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="monto">Monto ($)</Label>
            <Input
              id="monto"
              name="monto"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              defaultValue={egreso?.monto}
              required
            />
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
            <Textarea
              id="notas"
              name="notas"
              placeholder="Notas adicionales..."
              defaultValue={egreso?.notas || ""}
              rows={2}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1 bg-transparent" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : isEditing ? "Guardar" : "Crear Egreso"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
