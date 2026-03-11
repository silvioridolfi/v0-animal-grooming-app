"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

interface CreateClienteData {
  nombre: string
  telefono?: string
  notas?: string
}

interface CreateClienteConMascotaData {
  nombre: string
  telefono?: string
}

interface CreateMascotaInlineData {
  nombre: string
  tipo_animal: "Perro" | "Gato"
  tamano: "S" | "M" | "L"
}

export async function crearCliente(data: CreateClienteData) {
  const supabase = await createClient()

  const { data: cliente, error } = await supabase.from("clientes").insert(data).select().single()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/clientes")
  revalidatePath("/mascotas")
  return { success: true, cliente }
}

export async function actualizarCliente(clienteId: string, data: CreateClienteData) {
  const supabase = await createClient()

  const { error } = await supabase.from("clientes").update(data).eq("id", clienteId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/clientes")
  return { success: true }
}

export async function eliminarCliente(clienteId: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("clientes").delete().eq("id", clienteId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/clientes")
  return { success: true }
}