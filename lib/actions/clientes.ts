"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { Cliente } from "@/lib/types"

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

export async function getClientes(): Promise<Cliente[]> {
  const supabase = await createClient()

  const { data, error } = await supabase.from("clientes").select("*").order("nombre", { ascending: true })

  if (error) throw error
  return data || []
}

export async function getClientePorId(id: string): Promise<Pick<Cliente, "id" | "nombre" | "telefono"> | null> {
  const supabase = await createClient()

  const { data, error } = await supabase.from("clientes").select("id, nombre, telefono").eq("id", id).single()

  if (error) return null
  return data
}

export async function buscarClientes(query: string): Promise<Pick<Cliente, "id" | "nombre" | "telefono">[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("clientes")
    .select("id, nombre, telefono")
    .ilike("nombre", `%${query}%`)
    .limit(5)

  if (error) return []
  return data || []
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

  const { data: actualizado, error } = await supabase
    .from("clientes")
    .update(data)
    .eq("id", clienteId)
    .select("id")
    .single()

  if (error || !actualizado) {
    return { error: "No se pudo actualizar: el cliente ya no existe." }
  }

  revalidatePath("/clientes")
  return { success: true }
}

export async function eliminarCliente(clienteId: string) {
  const supabase = await createClient()

  const { data: eliminado, error } = await supabase.from("clientes").delete().eq("id", clienteId).select("id")

  if (error) {
    return { error: error.message }
  }
  if (!eliminado || eliminado.length === 0) {
    return { error: "No se pudo eliminar: el cliente ya no existe." }
  }

  revalidatePath("/clientes")
  return { success: true }
}