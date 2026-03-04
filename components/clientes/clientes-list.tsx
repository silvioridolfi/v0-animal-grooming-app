"use client"

import type { Cliente, Mascota } from "@/lib/types"
import { ClienteCard } from "./cliente-card"
import { EmptyState } from "@/components/empty-state"
import { Users } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface ClienteWithMascotas extends Cliente {
  mascotas: Mascota[]
}

interface ClientesListProps {
  clientes: ClienteWithMascotas[]
}

export function ClientesList({ clientes }: ClientesListProps) {
  if (clientes.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="Sin clientes"
        description="Agrega tu primer cliente para comenzar a gestionar turnos."
        action={
          <Link href="/clientes/nuevo">
            <Button>Agregar cliente</Button>
          </Link>
        }
      />
    )
  }

  return (
    <div className="space-y-3">
      {clientes.map((cliente) => (
        <ClienteCard key={cliente.id} cliente={cliente} />
      ))}
    </div>
  )
}
