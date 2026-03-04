import { BottomNav } from "@/components/bottom-nav"
import { PageHeader } from "@/components/page-header"
import { NuevaMascotaForm } from "@/components/mascotas/nueva-mascota-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NuevaMascotaPage() {
  return (
    <div className="flex min-h-screen flex-col pb-20">
      <PageHeader
        title="Nueva Mascota"
        subtitle="Agrega una mascota y su dueño rápidamente"
        action={
          <Link href="/mascotas">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Volver
            </Button>
          </Link>
        }
      />
      <main className="flex-1 px-4 py-6">
        <NuevaMascotaForm />
      </main>
      <BottomNav />
    </div>
  )
}
