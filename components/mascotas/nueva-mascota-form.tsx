"use client"

import React, { useState, useMemo, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle2, Dog, Cat, Search, UserPlus, X } from "lucide-react"
import { crearMascota } from "@/lib/actions/mascotas"
import { crearCliente } from "@/lib/actions/clientes"
import { obtenerRazas } from "@/lib/razas-mascotas"
import { BreedCombobox } from "./breed-combobox"
import { createClient } from "@/lib/supabase/client"

type TipoAnimal = "Perro" | "Gato"

interface ClienteEncontrado {
  id: string
  nombre: string
  telefono?: string
}

export function NuevaMascotaForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const clienteIdParam = searchParams.get("clienteId")

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  // Cliente preseleccionado desde URL
  const [clientePreseleccionado, setClientePreseleccionado] = useState<ClienteEncontrado | null>(null)

  // Modo cliente (solo se usa si no hay clienteId en URL)
  const [modoCliente, setModoCliente] = useState<"buscar" | "nuevo">("buscar")
  const [searchQuery, setSearchQuery] = useState("")
  const [clientesEncontrados, setClientesEncontrados] = useState<ClienteEncontrado[]>([])
  const [clienteSeleccionado, setClienteSeleccionado] = useState<ClienteEncontrado | null>(null)
  const [buscando, setBuscando] = useState(false)

  // Nuevo cliente
  const [nombreCliente, setNombreCliente] = useState("")
  const [contactoCliente, setContactoCliente] = useState("")

  // Mascota
  const [tipoAnimal, setTipoAnimal] = useState<TipoAnimal | "">("")
  const [nombreMascota, setNombreMascota] = useState("")
  const [raza, setRaza] = useState("")
  const [tamano, setTamano] = useState<"S" | "M" | "L" | "">("")
  const [sexo, setSexo] = useState<"Macho" | "Hembra" | "">("")
  const [observaciones, setObservaciones] = useState("")

  // Cargar datos del cliente preseleccionado
  useEffect(() => {
    if (!clienteIdParam) return
    const supabase = createClient()
    supabase
      .from("clientes")
      .select("id, nombre, telefono")
      .eq("id", clienteIdParam)
      .single()
      .then(({ data }) => {
        if (data) setClientePreseleccionado(data)
      })
  }, [clienteIdParam])

  const razasDisponibles = useMemo(() => {
    if (tipoAnimal === "Perro" || tipoAnimal === "Gato") return obtenerRazas(tipoAnimal)
    return []
  }, [tipoAnimal])

  const buscarClientes = async (query: string) => {
    setSearchQuery(query)
    if (query.trim().length < 2) { setClientesEncontrados([]); return }
    setBuscando(true)
    const supabase = createClient()
    const { data } = await supabase
      .from("clientes")
      .select("id, nombre, telefono")
      .ilike("nombre", `%${query}%`)
      .limit(5)
    setClientesEncontrados(data || [])
    setBuscando(false)
  }

  const clienteListo = clienteIdParam
    ? !!clientePreseleccionado
    : modoCliente === "buscar"
      ? !!clienteSeleccionado
      : nombreCliente.trim().length > 0 && contactoCliente.trim().length > 0

  const isValid = clienteListo && tipoAnimal && nombreMascota.trim() && raza.trim() && tamano && sexo

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!isValid) { setError("Por favor completá todos los campos requeridos"); return }
    setIsLoading(true)

    try {
      let clienteId: string

      if (clienteIdParam && clientePreseleccionado) {
        clienteId = clientePreseleccionado.id
      } else if (modoCliente === "buscar" && clienteSeleccionado) {
        clienteId = clienteSeleccionado.id
      } else {
        const result = await crearCliente({
          nombre: nombreCliente.trim(),
          telefono: contactoCliente.trim(),
        })
        if (!result.success || !result.cliente) {
          setError(result.error || "Error al crear el cliente")
          setIsLoading(false)
          return
        }
        clienteId = result.cliente.id
      }

      const result = await crearMascota({
        nombre: nombreMascota.trim(),
        tipo_animal: tipoAnimal as TipoAnimal,
        raza: raza.trim(),
        tamano: tamano as "S" | "M" | "L",
        sexo: sexo as "Macho" | "Hembra",
        notas: observaciones.trim() || undefined,
        cliente_id: clienteId,
      })

      if (result.error) {
        setError(result.error)
        setIsLoading(false)
        return
      }

      setSuccess(true)
      setTimeout(() => {
        // Si venía desde un cliente, volver a su ficha
        router.push(clienteIdParam ? `/clientes/${clienteIdParam}` : `/mascotas/${result.mascotaId}`)
      }, 1500)
    } catch (err) {
      setError("Error al guardar. Intentá de nuevo.")
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

      {/* Sección cliente */}
      <Card className="border-2 border-accent/20">
        <CardHeader className="bg-gradient-to-r from-accent/5 to-accent/10">
          <CardTitle className="text-lg">Dueño</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">

          {/* Si viene desde ficha de cliente, mostrar cliente fijo */}
          {clienteIdParam ? (
            clientePreseleccionado ? (
              <div className="flex items-center gap-3 rounded-lg border-2 border-primary bg-primary/5 p-3">
                <div>
                  <p className="font-medium">{clientePreseleccionado.nombre}</p>
                  {clientePreseleccionado.telefono && (
                    <p className="text-sm text-muted-foreground">{clientePreseleccionado.telefono}</p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Cargando cliente...</p>
            )
          ) : (
            <>
              {/* Selector de modo */}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={modoCliente === "buscar" ? "default" : "outline"}
                  className="flex-1 h-11"
                  onClick={() => { setModoCliente("buscar"); setNombreCliente(""); setContactoCliente("") }}
                >
                  <Search className="mr-2 h-4 w-4" />
                  Cliente existente
                </Button>
                <Button
                  type="button"
                  variant={modoCliente === "nuevo" ? "default" : "outline"}
                  className="flex-1 h-11"
                  onClick={() => { setModoCliente("nuevo"); setClienteSeleccionado(null); setSearchQuery(""); setClientesEncontrados([]) }}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Cliente nuevo
                </Button>
              </div>

              {/* Buscar cliente existente */}
              {modoCliente === "buscar" && (
                <div className="space-y-2">
                  {clienteSeleccionado ? (
                    <div className="flex items-center justify-between rounded-lg border-2 border-primary bg-primary/5 p-3">
                      <div>
                        <p className="font-medium">{clienteSeleccionado.nombre}</p>
                        {clienteSeleccionado.telefono && (
                          <p className="text-sm text-muted-foreground">{clienteSeleccionado.telefono}</p>
                        )}
                      </div>
                      <Button type="button" variant="ghost" size="icon" onClick={() => setClienteSeleccionado(null)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="Buscar por nombre del dueño..."
                          value={searchQuery}
                          onChange={(e) => buscarClientes(e.target.value)}
                          className="pl-10 h-12"
                        />
                      </div>
                      {buscando && <p className="text-sm text-muted-foreground px-1">Buscando...</p>}
                      {clientesEncontrados.length > 0 && (
                        <div className="space-y-1 rounded-lg border p-2">
                          {clientesEncontrados.map((cliente) => (
                            <button
                              key={cliente.id}
                              type="button"
                              onClick={() => { setClienteSeleccionado(cliente); setSearchQuery(""); setClientesEncontrados([]) }}
                              className="flex w-full flex-col rounded-lg p-3 text-left hover:bg-muted transition-colors"
                            >
                              <p className="font-medium">{cliente.nombre}</p>
                              {cliente.telefono && <p className="text-sm text-muted-foreground">{cliente.telefono}</p>}
                            </button>
                          ))}
                        </div>
                      )}
                      {searchQuery.length >= 2 && !buscando && clientesEncontrados.length === 0 && (
                        <p className="text-sm text-muted-foreground px-1">No se encontró ningún cliente. ¿Querés crear uno nuevo?</p>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Crear cliente nuevo */}
              {modoCliente === "nuevo" && (
                <div className="space-y-3">
                  <Input
                    placeholder="Nombre del dueño *"
                    value={nombreCliente}
                    onChange={(e) => setNombreCliente(e.target.value)}
                    disabled={isLoading}
                    className="h-12 text-base"
                  />
                  <Input
                    placeholder="Teléfono o email *"
                    value={contactoCliente}
                    onChange={(e) => setContactoCliente(e.target.value)}
                    disabled={isLoading}
                    className="h-12 text-base"
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Sección mascota */}
      <Card className="border-2 border-primary/20">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
          <CardTitle className="text-lg">Datos de la Mascota</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label className="font-semibold">Tipo de animal <span className="text-red-500">*</span></Label>
            <div className="flex gap-3">
              {(["Perro", "Gato"] as TipoAnimal[]).map((tipo) => (
                <button
                  key={tipo}
                  type="button"
                  disabled={isLoading}
                  onClick={() => { setTipoAnimal(tipo); setRaza("") }}
                  className={`flex-1 py-4 px-4 rounded-lg font-semibold flex items-center justify-center gap-3 transition-all border-2 ${
                    tipoAnimal === tipo
                      ? "border-primary bg-primary text-primary-foreground shadow-md"
                      : "border-muted-foreground/20 bg-muted/50 text-muted-foreground hover:border-primary/50"
                  } disabled:opacity-50`}
                >
                  {tipo === "Perro" ? <Dog className="h-6 w-6" /> : <Cat className="h-6 w-6" />}
                  {tipo}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-semibold">Nombre <span className="text-red-500">*</span></Label>
            <Input
              placeholder="Ej: Max, Luna, Rocky"
              value={nombreMascota}
              onChange={(e) => setNombreMascota(e.target.value)}
              disabled={isLoading}
              className="h-12 text-base"
            />
          </div>

          <div className="space-y-2">
            <Label className="font-semibold">Raza <span className="text-red-500">*</span></Label>
            <BreedCombobox
              breeds={razasDisponibles}
              value={raza}
              onValueChange={setRaza}
              placeholder="Seleccioná una raza..."
              disabled={!tipoAnimal || isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label className="font-semibold">Tamaño <span className="text-red-500">*</span></Label>
            <div className="grid grid-cols-3 gap-2">
              {(["S", "M", "L"] as const).map((size) => (
                <Button
                  key={size}
                  type="button"
                  variant={tamano === size ? "default" : "outline"}
                  className="h-12"
                  disabled={isLoading}
                  onClick={() => setTamano(size)}
                >
                  {size === "S" ? "Chico" : size === "M" ? "Mediano" : "Grande"}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-semibold">Sexo <span className="text-red-500">*</span></Label>
            <div className="flex gap-3">
              {(["Macho", "Hembra"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  disabled={isLoading}
                  onClick={() => setSexo(s)}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold text-lg transition-all border-2 ${
                    sexo === s
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted-foreground/20 bg-muted/50 text-muted-foreground hover:border-primary/50"
                  } disabled:opacity-50`}
                >
                  {s === "Macho" ? "♂ Macho" : "♀ Hembra"}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-semibold">Observaciones</Label>
            <Textarea
              placeholder="Alergias, comportamiento, medicamentos..."
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              disabled={isLoading}
              className="text-base min-h-24 resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="flex gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/30">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-destructive text-sm font-medium">{error}</p>
        </div>
      )}

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