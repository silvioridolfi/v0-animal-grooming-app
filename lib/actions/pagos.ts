"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

interface CreatePagoData {
  turno_id: string
  monto: number
  metodo: "efectivo" | "transferencia"
}

export async function registrarPago(data: CreatePagoData) {
  const supabase = await createClient()

  const { data: existingPago } = await supabase.from("pagos").select("id").eq("turno_id", data.turno_id).single()

  if (existingPago) {
    throw new Error("Este turno ya tiene un pago registrado")
  }

  await supabase.from("pagos").insert({
    ...data,
    estado: "pagado",
  })

  await supabase.from("turnos").update({ estado: "realizado" }).eq("id", data.turno_id)

  revalidatePath("/")
  revalidatePath("/pagos")
  revalidatePath("/finanzas")
}
