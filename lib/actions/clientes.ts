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

export async function crearClienteConMascota(
  clienteData: CreateClienteConMascotaData,
  mascotaData: CreateMascotaInlineData,
) {
  const supabase = await createClient()

  // Create cliente
  const { data: cliente, error: clienteError } = await supabase
    .from("clientes")
    .insert({
      nombre: clienteData.nombre,
      telefono: clienteData.telefono || null,
    })
    .select()
    .single()

  if (clienteError || !cliente) {
    return { success: false, error: clienteError?.message || "Error al crear cliente" }
  }

  // Create mascota
  const { data: mascota, error: mascotaError } = await supabase
    .from("mascotas")
    .insert({
      nombre: mascotaData.nombre,
      tipo_animal: mascotaData.tipo_animal,
      tamano: mascotaData.tamano,
      cliente_id: cliente.id,
    })
    .select()
    .single()

  if (mascotaError || !mascota) {
    return { success: false, error: mascotaError?.message || "Error al crear mascota" }
  }

  revalidatePath("/clientes")
  revalidatePath("/mascotas")
  revalidatePath("/turnos/nuevo")

  return { success: true, cliente, mascota }
}
