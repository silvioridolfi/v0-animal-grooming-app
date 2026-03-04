"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { Egreso } from "@/lib/types"

export async function getEgresos(mes?: string): Promise<Egreso[]> {
  const supabase = await createClient()

  let query = supabase
    .from("egresos")
    .select("*")
    .order("fecha", { ascending: false })
    .order("created_at", { ascending: false })

  if (mes) {
    const [year, month] = mes.split("-")
    const startDate = `${year}-${month}-01`
    const endDate = new Date(Number.parseInt(year), Number.parseInt(month), 0).toISOString().split("T")[0]
    query = query.gte("fecha", startDate).lte("fecha", endDate)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

export async function getEgresosByDateRange(startDate: string, endDate: string): Promise<Egreso[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("egresos")
    .select("*")
    .gte("fecha", startDate)
    .lte("fecha", endDate)
    .order("fecha", { ascending: false })

  if (error) throw error
  return data || []
}

export async function crearEgreso(formData: FormData) {
  const supabase = await createClient()

  const fecha = formData.get("fecha") as string
  const concepto = formData.get("concepto") as string
  const categoria = formData.get("categoria") as string
  const monto = Number.parseFloat(formData.get("monto") as string)
  const medio_pago = (formData.get("medio_pago") as string) || null
  const notas = (formData.get("notas") as string) || null

  const { error } = await supabase.from("egresos").insert({
    fecha,
    concepto,
    categoria,
    monto,
    medio_pago,
    notas,
  })

  if (error) throw error
  revalidatePath("/finanzas")
}

export async function actualizarEgreso(id: string, formData: FormData) {
  const supabase = await createClient()

  const fecha = formData.get("fecha") as string
  const concepto = formData.get("concepto") as string
  const categoria = formData.get("categoria") as string
  const monto = Number.parseFloat(formData.get("monto") as string)
  const medio_pago = (formData.get("medio_pago") as string) || null
  const notas = (formData.get("notas") as string) || null

  const { error } = await supabase
    .from("egresos")
    .update({
      fecha,
      concepto,
      categoria,
      monto,
      medio_pago,
      notas,
    })
    .eq("id", id)

  if (error) throw error
  revalidatePath("/finanzas")
}

export async function eliminarEgreso(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("egresos").delete().eq("id", id)

  if (error) throw error
  revalidatePath("/finanzas")
}
