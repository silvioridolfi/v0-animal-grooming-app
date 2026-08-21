"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import type { Accesorio } from "@/lib/types"
import { crearAccesorio, actualizarAccesorio } from "@/lib/actions/accesorios"

interface AccesorioFormProps {
  accesorio?: Accesorio | null
  onSuccess: () => void
  onCancel: () => void
}

export function AccesorioForm({ accesorio, onSuccess, onCancel }: AccesorioFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEditing = !!accesorio

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const formData = new FormData(e.currentTarget)
      const result = isEditing
        ? await actualizarAccesorio(accesorio.id, formData)
        : await crearAccesorio(formData)

      if (!result.success) {
        setError(result.error || "Error al guardar")
        return
      }
      onSuccess()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <CardTitle>{isEditing ? "Editar Accesorio" : "Nuevo Accesorio"}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              name="nombre"
              placeholder="Ej: Correa mediana"
              defaultValue={accesorio?.nombre}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoria">Categoría (opcional)</Label>
            <Input
              id="categoria"
              name="categoria"
              placeholder="Ej: Correas, Shampoo, Juguetes"
              defaultValue={accesorio?.categoria || ""}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="precio">Precio ($)</Label>
              <Input
                id="precio"
                name="precio"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                defaultValue={accesorio?.precio}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                name="stock"
                type="number"
                step="1"
                min="0"
                placeholder="0"
                defaultValue={accesorio?.stock ?? 0}
                required
              />
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1 bg-transparent" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : isEditing ? "Guardar" : "Crear Accesorio"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
