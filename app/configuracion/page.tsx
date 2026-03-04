import { createClient } from "@/lib/supabase/server"
import { BottomNav } from "@/components/bottom-nav"
import { PageHeader } from "@/components/page-header"
import { ConfiguracionForm } from "@/components/configuracion/configuracion-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function ConfiguracionPage() {
  const supabase = await createClient()
  const { data: config } = await supabase.from("configuracion_negocio").select("*").single()

  return (
    <div className="flex min-h-screen flex-col pb-20">
      <PageHeader
        title="Configuracion"
        action={
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Volver
            </Button>
          </Link>
        }
      />
      <main className="flex-1 px-4 py-4">
        <ConfiguracionForm config={config} />
      </main>
      <BottomNav />
    </div>
  )
}
