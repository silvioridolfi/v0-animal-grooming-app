"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { actualizarCliente } from "@/lib/actions/clientes"

interface EditarClienteFormProps {
  cliente: {
    id: string
    nombre: string
    telefono: string | null
    notas: string | null
  }
}

export function EditarClienteForm({ cliente }: EditarClienteFormProps) {
  const router = useRouter()
  const [nombre, setNombre] = useState(cliente.nombre || "")
  const [telefono, setTelefono] = useState(cliente.telefono || "")
  const [notas, setNotas] = useState(cliente.notas || "")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre.trim()) { setError("El nombre es obligatorio"); return }
    setIsLoading(true)
    const result = await actualizarCliente(cliente.id, {
      nombre: nombre.trim(),
      telefono: telefono.trim() || undefined,
      notas: notas.trim() || undefined,
    })
    if (result.error) {
      setError(result.error)
      setIsLoading(false)
      return
    }
    router.push("/mascotas")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto">
      <Card>
        <CardContent className="pt-4 space-y-4">
          <div className="space-y-2">
            <Label>Nombre *</Label>
            <Input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre del dueño"
              disabled={isLoading}
              className="h-12"
            />
          </div>
          <div className="space-y-2">
            <Label>Teléfono</Label>
            <Input
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="Teléfono o WhatsApp"
              disabled={isLoading}
              className="h-12"
            />
          </div>
          <div className="space-y-2">
            <Label>Notas</Label>
            <Textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Observaciones sobre el dueño..."
              disabled={isLoading}
              className="resize-none"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" className="w-full" size="lg" disabled={!nombre.trim() || isLoading}>
        {isLoading ? "Guardando..." : "Guardar cambios"}
      </Button>
    </form>
  )
}