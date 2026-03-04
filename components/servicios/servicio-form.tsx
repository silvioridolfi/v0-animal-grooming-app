"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import type { Servicio, ServicioPrecio } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { crearServicio, actualizarServicio } from "@/lib/actions/servicios"
import { Dog, Cat, CheckCircle, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ServicioFormProps {
  servicio?: Servicio & { precios?: ServicioPrecio[] }
}

export function ServicioForm({ servicio }: ServicioFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [nombre, setNombre] = useState(servicio?.nombre || "")
  const [tipoAnimal, setTipoAnimal] = useState<"Perro" | "Gato" | "Ambos">(servicio?.tipo_animal || "Ambos")

  const [precioChico, setPrecioChico] = useState("")
  const [precioMediano, setPrecioMediano] = useState("")
  const [precioGrande, setPrecioGrande] = useState("")

  const [duracionChico, setDuracionChico] = useState("")
  const [duracionMediano, setDuracionMediano] = useState("")
  const [duracionGrande, setDuracionGrande] = useState("")

  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  // Initialize prices from servicio using useMemo with servicio.id as dependency
  useMemo(() => {
    if (servicio?.precios && servicio.id) {
      const chico = servicio.precios.find((p) => p.tamano === "S")
      const mediano = servicio.precios.find((p) => p.tamano === "M")
      const grande = servicio.precios.find((p) => p.tamano === "L")

      if (chico) {
        setPrecioChico(chico.precio?.toString() || "")
        setDuracionChico(chico.duracion_estimada?.toString() || "")
      }
      if (mediano) {
        setPrecioMediano(mediano.precio?.toString() || "")
        setDuracionMediano(mediano.duracion_estimada?.toString() || "")
      }
      if (grande) {
        setPrecioGrande(grande.precio?.toString() || "")
        setDuracionGrande(grande.duracion_estimada?.toString() || "")
      }
    }
  }, [servicio?.id]) // Only depend on ID, not the whole prices array

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre.trim() || !precioChico || !precioMediano || !precioGrande) {
      toast({
        title: "Campos requeridos",
        description: "Todos los precios por tamaño son obligatorios",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    const data = {
      nombre: nombre.trim(),
      tipo_animal: tipoAnimal,
      precios: {
        S: { precio: Number(precioChico), duracion_estimada: duracionChico ? Number(duracionChico) : undefined },
        M: { precio: Number(precioMediano), duracion_estimada: duracionMediano ? Number(duracionMediano) : undefined },
        L: { precio: Number(precioGrande), duracion_estimada: duracionGrande ? Number(duracionGrande) : undefined },
      },
    }

    const result = servicio ? await actualizarServicio(servicio.id, data) : await crearServicio(data)

    if (result.success) {
      setSuccessMessage(servicio ? "Servicio actualizado correctamente" : "Servicio creado correctamente")
      toast({
        title: "Éxito",
        description: servicio ? "Servicio actualizado correctamente" : "Servicio creado correctamente",
        variant: "default",
      })
      setTimeout(() => {
        router.push("/servicios")
      }, 1500)
    } else {
      toast({
        title: "Error",
        description: result.error || "Error al guardar el servicio",
        variant: "destructive",
      })
    }

    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card>
        <CardContent className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre del servicio *</Label>
            <Input
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Baño completo"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Tipo de animal *</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={tipoAnimal === "Perro" ? "default" : "outline"}
                className="flex-1 gap-2"
                onClick={() => setTipoAnimal("Perro")}
              >
                <Dog className="h-4 w-4" />
                Perro
              </Button>
              <Button
                type="button"
                variant={tipoAnimal === "Gato" ? "default" : "outline"}
                className="flex-1 gap-2"
                onClick={() => setTipoAnimal("Gato")}
              >
                <Cat className="h-4 w-4" />
                Gato
              </Button>
              <Button
                type="button"
                variant={tipoAnimal === "Ambos" ? "default" : "outline"}
                className="flex-1 gap-1"
                onClick={() => setTipoAnimal("Ambos")}
              >
                <Dog className="h-4 w-4" />
                <Cat className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-4 border-t pt-4">
            <Label className="text-base font-semibold">Precios por tamaño de mascota *</Label>

            {/* Mascota Chica */}
            <div className="space-y-2 rounded-lg bg-blue-50 p-3">
              <Label htmlFor="precio-chico" className="font-medium">
                Mascota Chica (S)
              </Label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    id="precio-chico"
                    type="number"
                    value={precioChico}
                    onChange={(e) => setPrecioChico(e.target.value)}
                    placeholder="Precio"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div className="flex-1">
                  <Input
                    type="number"
                    value={duracionChico}
                    onChange={(e) => setDuracionChico(e.target.value)}
                    placeholder="Duración (min)"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Mascota Mediana */}
            <div className="space-y-2 rounded-lg bg-amber-50 p-3">
              <Label htmlFor="precio-mediano" className="font-medium">
                Mascota Mediana (M)
              </Label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    id="precio-mediano"
                    type="number"
                    value={precioMediano}
                    onChange={(e) => setPrecioMediano(e.target.value)}
                    placeholder="Precio"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div className="flex-1">
                  <Input
                    type="number"
                    value={duracionMediano}
                    onChange={(e) => setDuracionMediano(e.target.value)}
                    placeholder="Duración (min)"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Mascota Grande */}
            <div className="space-y-2 rounded-lg bg-red-50 p-3">
              <Label htmlFor="precio-grande" className="font-medium">
                Mascota Grande (L)
              </Label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    id="precio-grande"
                    type="number"
                    value={precioGrande}
                    onChange={(e) => setPrecioGrande(e.target.value)}
                    placeholder="Precio"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div className="flex-1">
                  <Input
                    type="number"
                    value={duracionGrande}
                    onChange={(e) => setDuracionGrande(e.target.value)}
                    placeholder="Duración (min)"
                    min="0"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={!nombre.trim() || !precioChico || !precioMediano || !precioGrande || isLoading}
      >
        {isLoading ? "Guardando..." : servicio ? "Guardar cambios" : "Crear servicio"}
      </Button>
    </form>
  )
}
