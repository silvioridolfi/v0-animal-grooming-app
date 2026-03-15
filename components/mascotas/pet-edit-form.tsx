"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dog, Cat, AlertCircle, ChevronDown } from "lucide-react"
import { actualizarMascota } from "@/lib/actions/mascotas"
import { obtenerRazas } from "@/lib/razas-mascotas"
import { cn } from "@/lib/utils"
import type { Mascota } from "@/lib/types"

interface PetEditFormProps {
  mascota: Mascota
  mascotaId: string
  clienteId: string
}

export function PetEditForm({ mascota, mascotaId, clienteId }: PetEditFormProps) {
  const router = useRouter()

  const [nombreMascota, setNombreMascota] = useState(mascota.nombre || "")
  const [tipoAnimal, setTipoAnimal] = useState<"Perro" | "Gato">(mascota.tipo_animal as "Perro" | "Gato" || "Perro")
  const [raza, setRaza] = useState(mascota.raza || "")
  const [tamano, setTamano] = useState<"S" | "M" | "L" | "">(mascota.tamano as "S" | "M" | "L" || "")
  const [sexo, setSexo] = useState<"Macho" | "Hembra" | "">(mascota.sexo as "Macho" | "Hembra" | "" || "")
  const [notasMascota, setNotasMascota] = useState(mascota.notas || "")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showRazasDropdown, setShowRazasDropdown] = useState(false)
  const [razasSearchQuery, setRazasSearchQuery] = useState("")

  const razasDisponibles = obtenerRazas(tipoAnimal)
  const razasFiltradas = razasSearchQuery.trim()
    ? razasDisponibles.filter((r) => r.toLowerCase().includes(razasSearchQuery.toLowerCase()))
    : razasDisponibles

  const nombreMascotaValido = nombreMascota.trim().length > 0
  const razaValida = raza.trim().length > 0
  const puedeSubmit = nombreMascotaValido && razaValida && tamano && !isLoading

  const handleSelectRaza = (razaSeleccionada: string) => {
    setRaza(razaSeleccionada)
    setShowRazasDropdown(false)
    setRazasSearchQuery("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!nombreMascotaValido || !razaValida || !tamano) {
      setError("Por favor completa todos los campos requeridos")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const resultado = await actualizarMascota(mascotaId, {
        nombre: nombreMascota.trim(),
        tipo_animal: tipoAnimal,
        raza: raza.trim(),
        tamano: tamano as "S" | "M" | "L",
        sexo: (sexo || undefined) as "Macho" | "Hembra" | undefined,
        notas: notasMascota.trim() || undefined,
      })

      if (resultado.error) {
        setError(resultado.error)
        setIsLoading(false)
        return
      }

      setIsLoading(false)
      router.back()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido"
      setError(errorMessage)
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 flex gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-900">Error</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Datos de la Mascota</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombreMascota">Nombre de la mascota *</Label>
            <Input
              id="nombreMascota"
              value={nombreMascota}
              onChange={(e) => setNombreMascota(e.target.value)}
              placeholder="Ej: Firulais"
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de animal *</Label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setTipoAnimal("Perro"); setRaza("") }}
                  disabled={isLoading}
                  className={cn(
                    "flex-1 py-2 px-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 font-medium",
                    tipoAnimal === "Perro"
                      ? "border-primary bg-primary text-white"
                      : "border-border bg-background text-foreground hover:border-primary"
                  )}
                >
                  <Dog className="h-4 w-4" />
                  Perro
                </button>
                <button
                  type="button"
                  onClick={() => { setTipoAnimal("Gato"); setRaza("") }}
                  disabled={isLoading}
                  className={cn(
                    "flex-1 py-2 px-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 font-medium",
                    tipoAnimal === "Gato"
                      ? "border-primary bg-primary text-white"
                      : "border-border bg-background text-foreground hover:border-primary"
                  )}
                >
                  <Cat className="h-4 w-4" />
                  Gato
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tamano">Tamaño *</Label>
              <select
                id="tamano"
                value={tamano}
                onChange={(e) => setTamano(e.target.value as "S" | "M" | "L" | "")}
                disabled={isLoading}
                className="w-full px-3 py-2 border rounded-lg bg-background"
              >
                <option value="">Seleccionar</option>
                <option value="S">Pequeño</option>
                <option value="M">Mediano</option>
                <option value="L">Grande</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="raza">Raza *</Label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowRazasDropdown(!showRazasDropdown)}
                disabled={isLoading}
                className="w-full px-3 py-2 border rounded-lg bg-background text-left flex items-center justify-between hover:border-primary transition-colors"
              >
                <span>{raza || "Seleccionar raza"}</span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </button>

              {showRazasDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 border rounded-lg bg-background shadow-lg z-50">
                  <Input
                    type="text"
                    placeholder="Buscar raza..."
                    value={razasSearchQuery}
                    onChange={(e) => setRazasSearchQuery(e.target.value)}
                    className="border-0 border-b rounded-none"
                    autoFocus
                  />
                  <div className="max-h-40 overflow-y-auto">
                    {razasFiltradas.length > 0 ? (
                      razasFiltradas.map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => handleSelectRaza(r)}
                          className="w-full text-left px-3 py-2 hover:bg-accent transition-colors"
                        >
                          {r}
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-sm text-muted-foreground">
                        No se encontraron razas
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sexo">Sexo</Label>
            <select
              id="sexo"
              value={sexo}
              onChange={(e) => setSexo(e.target.value as "Macho" | "Hembra" | "")}
              disabled={isLoading}
              className="w-full px-3 py-2 border rounded-lg bg-background"
            >
              <option value="">Sin especificar</option>
              <option value="Macho">Macho</option>
              <option value="Hembra">Hembra</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notasMascota">Notas adicionales</Label>
            <Textarea
              id="notasMascota"
              value={notasMascota}
              onChange={(e) => setNotasMascota(e.target.value)}
              placeholder="Alergias, comportamiento, preferencias..."
              rows={3}
              disabled={isLoading}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={isLoading}
          className="flex-1 bg-transparent"
          onClick={() => router.back()}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={!puedeSubmit} className="flex-1">
          {isLoading ? "Guardando..." : "Actualizar mascota"}
        </Button>
      </div>
    </form>
  )
}