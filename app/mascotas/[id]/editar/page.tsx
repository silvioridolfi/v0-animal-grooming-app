import { createClient } from "@/lib/supabase/server"
import { BottomNav } from "@/components/bottom-nav"
import { PageHeader } from "@/components/page-header"
import { PetEditForm } from "@/components/mascotas/pet-edit-form"
import { notFound } from "next/navigation"
import { BackButton } from "@/components/mascotas/back-button"

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

  if (error || !mascota) notFound()

  return (
    <div className="flex min-h-screen flex-col pb-20">
      <PageHeader
        title="Editar mascota"
        action={<BackButton />}
      />
      <main className="flex-1 px-4 py-4">
        <PetEditForm mascota={mascota} mascotaId={id} clienteId={mascota.cliente_id} />
      </main>
      <BottomNav />
    </div>
  )
}