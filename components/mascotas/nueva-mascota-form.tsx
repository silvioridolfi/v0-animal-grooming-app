"use client"

import { SelectItem } from "@/components/ui/select"

import { SelectContent } from "@/components/ui/select"

import { SelectValue } from "@/components/ui/select"

import { SelectTrigger } from "@/components/ui/select"

import { Select } from "@/components/ui/select"

import React, { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle2, Dog, Cat } from "lucide-react"
import { crearMascotaConClienteSimple } from "@/lib/actions/mascotas"
import { obtenerRazas } from "@/lib/razas-mascotas"
import { BreedCombobox } from "./breed-combobox"

type TipoAnimal = "Perro" | "Gato"

export function NuevaMascotaForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  // Pet details state
  const [tipoAnimal, setTipoAnimal] = useState<TipoAnimal | "">("")
  const [nombreMascota, setNombreMascota] = useState("")
  const [raza, setRaza] = useState("")
  const [sexo, setSexo] = useState<"Macho" | "Hembra" | "">("")
  const [observaciones, setObservaciones] = useState("")

  // Owner details state
  const [nombreCliente, setNombreCliente] = useState("")
  const [contactoCliente, setContactoCliente] = useState("")

  // Get breeds based on animal type
  const razasDisponibles = useMemo(() => {
    if (tipoAnimal === "Perro" || tipoAnimal === "Gato") {
      return obtenerRazas(tipoAnimal)
    }
    return []
  }, [tipoAnimal])

  // Validation
  const isValid =
    tipoAnimal &&
    nombreMascota.trim() &&
    raza.trim() &&
    sexo &&
    nombreCliente.trim() &&
    contactoCliente.trim()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!isValid) {
      setError("Por favor completa todos los campos requeridos")
      return
    }

    setIsLoading(true)

    try {
      const result = await crearMascotaConClienteSimple({
        nombreMascota: nombreMascota.trim(),
        tipoAnimal: tipoAnimal as TipoAnimal,
        raza: raza.trim(),
        sexo,
        observaciones: observaciones.trim(),
        nombreCliente: nombreCliente.trim(),
        contactoCliente: contactoCliente.trim(),
      })

      if (result.error) {
        setError(result.error)
        setIsLoading(false)
        return
      }

      setSuccess(true)
      setTimeout(() => {
        router.push(`/mascotas/${result.mascotaId}`)
      }, 1500)
    } catch (err) {
      setError("Error al guardar. Intenta de nuevo.")
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-8">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">¡Mascota guardada!</h2>
            <p className="text-muted-foreground">Redirigiendo...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
      {/* Pet Details Section */}
      <Card className="border-2 border-primary/20">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
          <CardTitle className="text-lg">Datos de la Mascota</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          {/* Animal Type Selection */}
          <div className="space-y-2">
            <Label className="font-semibold">
              Tipo de Animal <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setTipoAnimal("Perro")
                  setRaza("") // Reset breed when changing type
                }}
                disabled={isLoading}
                className={`flex-1 py-4 px-4 rounded-lg font-semibold flex items-center justify-center gap-3 transition-all border-2 ${
                  tipoAnimal === "Perro"
                    ? "border-primary bg-primary text-primary-foreground shadow-md"
                    : "border-muted-foreground/20 bg-muted/50 text-muted-foreground hover:border-primary/50"
                } disabled:opacity-50`}
              >
                <Dog className="h-6 w-6" />
                <span>Perro</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setTipoAnimal("Gato")
                  setRaza("") // Reset breed when changing type
                }}
                disabled={isLoading}
                className={`flex-1 py-4 px-4 rounded-lg font-semibold flex items-center justify-center gap-3 transition-all border-2 ${
                  tipoAnimal === "Gato"
                    ? "border-primary bg-primary text-primary-foreground shadow-md"
                    : "border-muted-foreground/20 bg-muted/50 text-muted-foreground hover:border-primary/50"
                } disabled:opacity-50`}
              >
                <Cat className="h-6 w-6" />
                <span>Gato</span>
              </button>
            </div>
          </div>

          {/* Pet Name */}
          <div className="space-y-2">
            <Label htmlFor="nombreMascota" className="font-semibold">
              Nombre de la mascota <span className="text-red-500">*</span>
            </Label>
            <Input
              id="nombreMascota"
              placeholder="Ej: Max, Luna, Rocky"
              value={nombreMascota}
              onChange={(e) => setNombreMascota(e.target.value)}
              disabled={isLoading}
              className="text-base"
            />
          </div>

          {/* Breed Dropdown - Dynamic based on animal type with Search */}
          <div className="space-y-2">
            <Label htmlFor="raza" className="font-semibold">
              Raza <span className="text-red-500">*</span>
            </Label>
            <BreedCombobox
              breeds={razasDisponibles}
              value={raza}
              onValueChange={setRaza}
              placeholder="Selecciona una raza..."
              disabled={!tipoAnimal || isLoading}
            />
          </div>

          {/* Gender - Using International Symbols */}
          <div className="space-y-2">
            <Label className="font-semibold">
              Sexo <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setSexo("Macho")}
                disabled={isLoading}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold text-lg transition-all border-2 ${
                  sexo === "Macho"
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted-foreground/20 bg-muted/50 text-muted-foreground hover:border-primary/50"
                } disabled:opacity-50`}
              >
                ♂ Macho
              </button>
              <button
                type="button"
                onClick={() => setSexo("Hembra")}
                disabled={isLoading}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold text-lg transition-all border-2 ${
                  sexo === "Hembra"
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted-foreground/20 bg-muted/50 text-muted-foreground hover:border-primary/50"
                } disabled:opacity-50`}
              >
                ♀ Hembra
              </button>
            </div>
          </div>

          {/* Observations */}
          <div className="space-y-2">
            <Label htmlFor="observaciones" className="font-semibold">
              Observaciones
            </Label>
            <Textarea
              id="observaciones"
              placeholder="Alergias, comportamiento, preferencias, medicamentos..."
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              disabled={isLoading}
              className="text-base min-h-24 resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Owner Details Section */}
      <Card className="border-2 border-accent/20">
        <CardHeader className="bg-gradient-to-r from-accent/5 to-accent/10">
          <CardTitle className="text-lg">Datos del Dueño</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          {/* Owner Name */}
          <div className="space-y-2">
            <Label htmlFor="nombreCliente" className="font-semibold">
              Nombre <span className="text-red-500">*</span>
            </Label>
            <Input
              id="nombreCliente"
              placeholder="Ej: Juan García"
              value={nombreCliente}
              onChange={(e) => setNombreCliente(e.target.value)}
              disabled={isLoading}
              className="text-base"
            />
          </div>

          {/* Owner Contact */}
          <div className="space-y-2">
            <Label htmlFor="contactoCliente" className="font-semibold">
              Contacto (Teléfono/Email) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="contactoCliente"
              placeholder="Ej: +54 911 2345-6789 o email@example.com"
              value={contactoCliente}
              onChange={(e) => setContactoCliente(e.target.value)}
              disabled={isLoading}
              className="text-base"
            />
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <div className="flex gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/30">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-destructive text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={!isValid || isLoading}
        className="w-full py-6 text-base font-semibold"
        size="lg"
      >
        {isLoading ? "Guardando..." : "Guardar"}
      </Button>
    </form>
  )
}
