import { createClient } from "@/lib/supabase/server"
import { BottomNav } from "@/components/bottom-nav"
import { PageHeader } from "@/components/page-header"
import { EditarClienteForm } from "@/components/clientes/editar-cliente-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function EditarClientePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: cliente, error } = await supabase
    .from("clientes")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !cliente) notFound()

  return (
    <div className="flex min-h-screen flex-col pb-20">
      <PageHeader
        title="Editar dueño"
        action={
          <Link href={`/mascotas`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Volver
            </Button>
          </Link>
        }
      />
      <main className="flex-1 px-4 py-4">
        <EditarClienteForm cliente={cliente} />
      </main>
      <BottomNav />
    </div>
  )
}