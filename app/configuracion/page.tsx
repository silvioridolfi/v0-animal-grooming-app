import { createClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/page-header"
import { ConfiguracionForm } from "@/components/configuracion/configuracion-form"
import { CuentaSection } from "@/components/configuracion/cuenta-section"
import { UsuariosSection } from "@/components/configuracion/usuarios-section"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { esAdmin } from "@/lib/config/admin"
import { listarUsuarios } from "@/lib/actions/usuarios"

export default async function ConfiguracionPage() {
  const supabase = await createClient()
  const { data: config } = await supabase.from("configuracion_negocio").select("*").single()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const mostrarUsuarios = esAdmin(user?.email)
  const { usuarios } = mostrarUsuarios ? await listarUsuarios() : { usuarios: undefined }

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Configuración"
        action={
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Volver
            </Button>
          </Link>
        }
      />
      <main className="flex-1 px-4 py-4 space-y-4">
        <CuentaSection email={user?.email ?? null} />
        {mostrarUsuarios && usuarios && <UsuariosSection usuarios={usuarios} />}
        <ConfiguracionForm config={config} />
      </main>
    </div>
  )
}
