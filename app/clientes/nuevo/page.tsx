import { BottomNav } from "@/components/bottom-nav"
import { PageHeader } from "@/components/page-header"
import { ClienteForm } from "@/components/clientes/cliente-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NuevoClientePage() {
  return (
    <div className="flex min-h-screen flex-col pb-20">
      <PageHeader
        title="Nuevo cliente"
        action={
          <Link href="/clientes">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Volver
            </Button>
          </Link>
        }
      />
      <main className="flex-1 px-4 py-4">
        <ClienteForm />
      </main>
      <BottomNav />
    </div>
  )
}
