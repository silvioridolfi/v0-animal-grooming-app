"use client"

import { useState, useMemo } from "react"
import type { Mascota } from "@/lib/types"
import { MascotaCard } from "./mascota-card"
import { EmptyState } from "@/components/empty-state"
import { Dog, Search, ChevronDown, ChevronRight, Plus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface MascotasListProps {
  mascotas: Mascota[]
}

export function MascotasList({ mascotas }: MascotasListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set())

  const mascotasPorCliente = useMemo(() => {
    const grouped: Record<string, { cliente: { id: string; nombre: string; telefono: string }; mascotas: Mascota[] }> =
      {}

    mascotas.forEach((mascota) => {
      const clienteId = mascota.cliente?.id || "sin-cliente"
      const clienteNombre = mascota.cliente?.nombre || "Sin dueño"
      const clienteTelefono = mascota.cliente?.telefono || ""

      if (!grouped[clienteId]) {
        grouped[clienteId] = {
          cliente: { id: clienteId, nombre: clienteNombre, telefono: clienteTelefono },
          mascotas: [],
        }
      }
      grouped[clienteId].mascotas.push(mascota)
    })

    return Object.values(grouped).sort((a, b) => a.cliente.nombre.localeCompare(b.cliente.nombre))
  }, [mascotas])

  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return mascotasPorCliente

    const query = searchQuery.toLowerCase()
    return mascotasPorCliente
      .map((group) => ({
        ...group,
        mascotas: group.mascotas.filter(
          (m) => m.nombre.toLowerCase().includes(query) || group.cliente.nombre.toLowerCase().includes(query),
        ),
      }))
      .filter((group) => group.mascotas.length > 0 || group.cliente.nombre.toLowerCase().includes(query))
  }, [mascotasPorCliente, searchQuery])

  const toggleClient = (clienteId: string) => {
    const newExpanded = new Set(expandedClients)
    if (newExpanded.has(clienteId)) {
      newExpanded.delete(clienteId)
    } else {
      newExpanded.add(clienteId)
    }
    setExpandedClients(newExpanded)
  }

  // Expand all when searching
  const effectiveExpanded = searchQuery.trim() ? new Set(filteredGroups.map((g) => g.cliente.id)) : expandedClients

  if (mascotas.length === 0) {
    return (
      <EmptyState
        icon={Dog}
        title="Sin mascotas"
        description="Agrega tu primera mascota desde la vista de detalle de un cliente."
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por mascota o dueño..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-12"
        />
      </div>

      {filteredGroups.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No se encontraron resultados para "{searchQuery}"</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredGroups.map((group) => {
            const isExpanded = effectiveExpanded.has(group.cliente.id)

            return (
              <div key={group.cliente.id} className="rounded-lg border bg-card overflow-hidden">
                <button
                  onClick={() => toggleClient(group.cliente.id)}
                  className="flex w-full items-center justify-between p-4 text-left hover:bg-muted/50 active:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <span className="text-sm font-semibold text-primary">
                        {group.cliente.nombre.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{group.cliente.nombre}</p>
                      <p className="text-sm text-muted-foreground">
                        {group.mascotas.length} {group.mascotas.length === 1 ? "mascota" : "mascotas"}
                      </p>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>

                {isExpanded && (
                  <div className="border-t bg-muted/20 p-3 space-y-2">
                    {group.mascotas.map((mascota) => (
                      <MascotaCard key={mascota.id} mascota={mascota} compact />
                    ))}
                    <Link href="/mascotas/nueva">
                      <Button variant="outline" size="sm" className="w-full mt-2 bg-transparent">
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar mascota
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
