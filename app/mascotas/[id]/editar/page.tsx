import { createClient } from "@/lib/supabase/server"
import { BottomNav } from "@/components/bottom-nav"
import { PageHeader } from "@/components/page-header"
import { PetEditForm } from "@/components/mascotas/pet-edit-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function EditarMascotaPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: mascota, error } = await supabase
    .from("mascotas")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !mascota) {
    notFound()
  }

  return (
    <div className="flex min-h-screen flex-col pb-20">
      <PageHeader
        title="Editar mascota"
        action={
          <Link href={`/clientes/${mascota.cliente_id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Volver
            </Button>
          </Link>
        }
      />
      <main className="flex-1 px-4 py-4">
        <PetEditForm mascota={mascota} mascotaId={id} clienteId={mascota.cliente_id} />
      </main>
      <BottomNav />
    </div>
  )
}