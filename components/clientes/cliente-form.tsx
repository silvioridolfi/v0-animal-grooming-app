"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Cliente } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { crearCliente, actualizarCliente } from "@/lib/actions/clientes"

interface ClienteFormProps {
  cliente?: Cliente
}

export function ClienteForm({ cliente }: ClienteFormProps) {
  const router = useRouter()
  const [nombre, setNombre] = useState(cliente?.nombre || "")
  const [telefono, setTelefono] = useState(cliente?.telefono || "")
  const [notas, setNotas] = useState(cliente?.notas || "")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre.trim()) return

    setIsLoading(true)

    const data = {
      nombre: nombre.trim(),
      telefono: telefono.trim() || undefined,
      notas: notas.trim() || undefined,
    }

    const result = cliente ? await actualizarCliente(cliente.id, data) : await crearCliente(data)

    if (result.success) {
      router.push("/clientes")
    }

    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card>
        <CardContent className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre *</Label>
            <Input
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre del cliente"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefono">Telefono (WhatsApp)</Label>
            <Input
              id="telefono"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="Ej: +54 11 1234-5678"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notas">Notas</Label>
            <Textarea
              id="notas"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Notas adicionales..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Button type="submit" className="w-full" size="lg" disabled={!nombre.trim() || isLoading}>
        {isLoading ? "Guardando..." : cliente ? "Guardar cambios" : "Crear cliente"}
      </Button>
    </form>
  )
}
