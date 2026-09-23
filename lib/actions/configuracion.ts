"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { ConfiguracionNegocio } from "@/lib/types"

export async function getConfiguracion(): Promise<ConfiguracionNegocio | null> {
  const supabase = await createClient()
  const { data } = await supabase.from("configuracion_negocio").select("*").single()
  return data
}

export async function updateConfiguracion(config: Partial<ConfiguracionNegocio>) {
  const supabase = await createClient()

  const { data: existing } = await supabase.from("configuracion_negocio").select("id").single()

  if (existing) {
    const { data: actualizado, error } = await supabase
      .from("configuracion_negocio")
      .update({ ...config, updated_at: new Date().toISOString() })
      .eq("id", existing.id)
      .select("id")
      .single()

    if (error || !actualizado) {
      return { success: false, error: "No se pudo actualizar la configuración." }
    }
  } else {
    const { error } = await supabase.from("configuracion_negocio").insert(config)
    if (error) return { success: false, error: error.message }
  }

  revalidatePath("/")
  revalidatePath("/configuracion")
  return { success: true }
}

export async function agregarDiaNoLaborable(fecha: string) {
  const supabase = await createClient()
  const { data: config } = await supabase.from("configuracion_negocio").select("*").single()

  if (!config) return { success: false, error: "No hay configuracion" }

  const diasNoLaborables = [...(config.dias_no_laborables || []), fecha]

  const { data: actualizado, error } = await supabase
    .from("configuracion_negocio")
    .update({ dias_no_laborables: diasNoLaborables })
    .eq("id", config.id)
    .select("id")
    .single()

  if (error || !actualizado) {
    return { success: false, error: "No se pudo actualizar la configuración." }
  }

  revalidatePath("/")
  revalidatePath("/configuracion")
  return { success: true }
}

export async function quitarDiaNoLaborable(fecha: string) {
  const supabase = await createClient()
  const { data: config } = await supabase.from("configuracion_negocio").select("*").single()

  if (!config) return { success: false, error: "No hay configuracion" }

  const diasNoLaborables = (config.dias_no_laborables || []).filter((d: string) => d !== fecha)

  const { data: actualizado, error } = await supabase
    .from("configuracion_negocio")
    .update({ dias_no_laborables: diasNoLaborables })
    .eq("id", config.id)
    .select("id")
    .single()

  if (error || !actualizado) {
    return { success: false, error: "No se pudo actualizar la configuración." }
  }

  revalidatePath("/")
  revalidatePath("/configuracion")
  return { success: true }
}
