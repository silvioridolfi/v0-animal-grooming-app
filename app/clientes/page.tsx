import { createClient } from "@/lib/supabase/server"
import { BottomNav } from "@/components/bottom-nav"
import { PageHeader } from "@/components/page-header"
import { ClientesList } from "@/components/clientes/clientes-list"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default async function ClientesPage() {
  const supabase = await createClient()

  const { data: clientes } = await supabase
    .from("clientes")
    .select("*, mascotas(*)")
    .order("nombre", { ascending: true })

  return (
    <div className="flex min-h-screen flex-col pb-20">
      <PageHeader
        title="Clientes"
        subtitle={`${clientes?.length || 0} clientes registrados`}
        action={
          <Link href="/clientes/nuevo">
            <Button size="sm" className="gap-1">
              <Plus className="h-4 w-4" />
              Cliente
            </Button>
          </Link>
        }
      />
      <main className="flex-1 px-4 py-4">
        <ClientesList clientes={clientes || []} />
      </main>
      <BottomNav />
    </div>
  )
}
