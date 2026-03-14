"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Search, Dog, Cat } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

interface Resultado {
  id: string
  nombre: string
  tipo: "mascota" | "cliente"
  subtitulo: string
  tipo_animal?: string
}

export function BuscarPageClient() {
  const [query, setQuery] = useState("")
  const [resultados, setResultados] = useState<Resultado[]>([])
  const [buscando, setBuscando] = useState(false)

  useEffect(() => {
    if (query.trim().length < 2) {
      setResultados([])
      return
    }

    const timeout = setTimeout(async () => {
      setBuscando(true)
      const supabase = createClient()

      const [{ data: mascotas }, { data: clientes }] = await Promise.all([
        supabase
          .from("mascotas")
          .select("id, nombre, tipo_animal, raza, cliente:clientes(nombre)")
          .ilike("nombre", `%${query}%`)
          .limit(8),
        supabase
          .from("clientes")
          .select("id, nombre, telefono")
          .ilike("nombre", `%${query}%`)
          .limit(5),
      ])

      const resultadosMascotas: Resultado[] = (mascotas || []).map((m: any) => ({
        id: m.id,
        nombre: m.nombre,
        tipo: "mascota",
        subtitulo: `${m.cliente?.nombre || "Sin dueño"} · ${m.raza || ""}`,
        tipo_animal: m.tipo_animal,
      }))

      const resultadosClientes: Resultado[] = (clientes || []).map((c: any) => ({
        id: c.id,
        nombre: c.nombre,
        tipo: "cliente",
        subtitulo: c.telefono || "Sin teléfono",
      }))

      setResultados([...resultadosMascotas, ...resultadosClientes])
      setBuscando(false)
    }, 300)

    return () => clearTimeout(timeout)
  }, [query])

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar mascota o dueño..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 h-12 text-base"
          autoFocus
        />
      </div>

      {buscando && (
        <p className="text-sm text-muted-foreground text-center">Buscando...</p>
      )}

      {!buscando && query.length >= 2 && resultados.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">
          No se encontraron resultados para "{query}"
        </p>
      )}

      {resultados.length > 0 && (
        <div className="space-y-2">
          {resultados.map((r) => (
            <Link
              key={`${r.tipo}-${r.id}`}
              href={r.tipo === "mascota" ? `/mascotas/${r.id}` : `/clientes/${r.id}/editar`}
              className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted transition-colors"
            >
              <div className="h-10 w-10 flex items-center justify-center rounded-full bg-primary/10 shrink-0">
                {r.tipo === "mascota" ? (
                  r.tipo_animal === "Perro"
                    ? <Dog className="h-5 w-5 text-primary" />
                    : <Cat className="h-5 w-5 text-primary" />
                ) : (
                  <span className="text-sm font-semibold text-primary">{r.nombre.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{r.nombre}</p>
                <p className="text-xs text-muted-foreground truncate">{r.subtitulo}</p>
              </div>
              <span className="text-xs text-muted-foreground shrink-0">
                {r.tipo === "mascota" ? "Mascota" : "Dueño"}
              </span>
            </Link>
          ))}
        </div>
      )}

      {query.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Search className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p className="text-sm">Escribí al menos 2 caracteres para buscar</p>
        </div>
      )}
    </div>
  )
}