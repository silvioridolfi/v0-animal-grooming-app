import { createClient } from "@/lib/supabase/server"

export async function obtenerHistorialServiciosPorMascota(mascotaId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("historial_servicios")
    .select("*")
    .eq("mascota_id", mascotaId)
    .order("fecha_servicio", { ascending: false })

  if (error) {
    return { error: error.message }
  }

  return { data }
}
