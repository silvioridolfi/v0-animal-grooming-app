"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function marcarTurnoRealizado(turnoId: string) {
  const supabase = await createClient()

  const { data: turno } = await supabase
    .from("turnos")
    .select("precio_final")
    .eq("id", turnoId)
    .single()

  if (!turno?.precio_final || turno.precio_final <= 0) {
    return { error: "Ingresá el precio antes de marcar el turno como realizado" }
  }

  await supabase
    .from("turnos")
    .update({ estado: "realizado" })
    .eq("id", turnoId)

  revalidatePath("/")
  return { success: true }
}

export async function eliminarTurno(turnoId: string) {
  const supabase = await createClient()

  await supabase.from("turnos").delete().eq("id", turnoId)

  revalidatePath("/")
}

interface CreateTurnoData {
  fecha: string
  hora: string
  mascota_id: string
  tipo_servicio: "Corte" | "Baño" | "Corte y Baño"
  descuento_tipo?: "fijo" | "porcentaje" | null
  descuento_valor?: number
  precio_final: number
  metodo_pago?: "efectivo" | "transferencia" | null
  estado?: "pendiente" | "realizado" | "cancelado"
}

export async function crearTurno(data: CreateTurnoData) {
  const supabase = await createClient()

  const { data: turnoInsertado, error } = await supabase
    .from("turnos")
    .insert({
      fecha: data.fecha,
      hora: data.hora,
      mascota_id: data.mascota_id,
      tipo_servicio: data.tipo_servicio,
      descuento_tipo: data.descuento_tipo || null,
      descuento_valor: data.descuento_valor || 0,
      precio_final: data.precio_final,
      metodo_pago: data.metodo_pago || null,
      estado: data.estado || "pendiente",
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/")
  return { success: true }
}

export async function actualizarTurno(turnoId: string, data: CreateTurnoData) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("turnos")
    .update({
      fecha: data.fecha,
      hora: data.hora,
      mascota_id: data.mascota_id,
      tipo_servicio: data.tipo_servicio,
      descuento_tipo: data.descuento_tipo || null,
      descuento_valor: data.descuento_valor || 0,
      precio_final: data.precio_final,
      metodo_pago: data.metodo_pago || null,
      estado: data.estado,
    })
    .eq("id", turnoId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/")
  return { success: true }
}

export async function actualizarEstadoTurno(
  turnoId: string,
  estado: "pendiente" | "realizado" | "cancelado"
) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("turnos")
    .update({ estado })
    .eq("id", turnoId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/")
  revalidatePath("/pagos")
  revalidatePath("/finanzas")

  return { success: true }
}