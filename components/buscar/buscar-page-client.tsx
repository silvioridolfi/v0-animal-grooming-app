"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Search, Dog, Cat, Package, Receipt } from "lucide-react"
import { buscarGlobal, type ResultadoBusqueda } from "@/lib/actions/buscar"
import Link from "next/link"

const linkPorTipo: Record<ResultadoBusqueda["tipo"], (id: string) => string> = {
  mascota: (id) => `/mascotas/${id}`,
  cliente: (id) => `/clientes/${id}/editar`,
  accesorio: () => `/accesorios`,
  egreso: () => `/finanzas`,
}

const etiquetaPorTipo: Record<ResultadoBusqueda["tipo"], string> = {
  mascota: "Mascota",
  cliente: "Dueño",
  accesorio: "Accesorio",
  egreso: "Egreso",
}

export function BuscarPageClient() {
  const [query, setQuery] = useState("")
  const [resultados, setResultados] = useState<ResultadoBusqueda[]>([])
  const [buscando, setBuscando] = useState(false)

  useEffect(() => {
    if (query.trim().length < 2) {
      setResultados([])
      return
    }

    const timeout = setTimeout(async () => {
      setBuscando(true)
      try {
        const data = await buscarGlobal(query.trim())
        setResultados(data)
      } finally {
        setBuscando(false)
      }
    }, 300)

    return () => clearTimeout(timeout)
  }, [query])

  const renderIcono = (r: ResultadoBusqueda) => {
    if (r.tipo === "mascota") {
      return r.tipo_animal === "Perro" ? <Dog className="h-5 w-5 text-primary" /> : <Cat className="h-5 w-5 text-primary" />
    }
    if (r.tipo === "accesorio") return <Package className="h-5 w-5 text-primary" />
    if (r.tipo === "egreso") return <Receipt className="h-5 w-5 text-primary" />
    return <span className="text-sm font-semibold text-primary">{r.nombre.charAt(0).toUpperCase()}</span>
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar mascota, dueño, accesorio o egreso..."
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
              href={linkPorTipo[r.tipo](r.id)}
              className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted transition-colors"
            >
              <div className="h-10 w-10 flex items-center justify-center rounded-full bg-primary/10 shrink-0">
                {renderIcono(r)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{r.nombre}</p>
                <p className="text-xs text-muted-foreground truncate">{r.subtitulo}</p>
              </div>
              <span className="text-xs text-muted-foreground shrink-0">
                {etiquetaPorTipo[r.tipo]}
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
