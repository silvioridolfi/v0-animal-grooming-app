"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { esAdmin } from "@/lib/config/admin"

export interface UsuarioAdmin {
  id: string
  email: string
  createdAt: string
  lastSignInAt: string | null
}

// Evita caracteres ambiguos (0/O, 1/l/I) para que sea fácil de transcribir
// a mano si hay que pasarla por teléfono.
const ALFABETO_PASSWORD = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789"

function generarPasswordLegible(largo = 10): string {
  let resultado = ""
  for (let i = 0; i < largo; i++) {
    resultado += ALFABETO_PASSWORD[Math.floor(Math.random() * ALFABETO_PASSWORD.length)]
  }
  return resultado
}

async function requerirAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!esAdmin(user?.email)) {
    throw new Error("No autorizado.")
  }

  return user!
}

export async function listarUsuarios(): Promise<{ usuarios?: UsuarioAdmin[]; error?: string }> {
  try {
    await requerirAdmin()

    const admin = createAdminClient()
    const { data, error } = await admin.auth.admin.listUsers()

    if (error) {
      return { error: "No se pudo obtener la lista de usuarios." }
    }

    const usuarios = data.users
      .map((u) => ({
        id: u.id,
        email: u.email || "(sin email)",
        createdAt: u.created_at,
        lastSignInAt: u.last_sign_in_at || null,
      }))
      .sort((a, b) => a.email.localeCompare(b.email))

    return { usuarios }
  } catch (err) {
    return { error: err instanceof Error ? err.message : "No se pudo obtener la lista de usuarios." }
  }
}

export async function generarContrasenaTemporal(
  userId: string,
): Promise<{ success: boolean; password?: string; error?: string }> {
  try {
    await requerirAdmin()

    const password = generarPasswordLegible()
    const admin = createAdminClient()

    const { error } = await admin.auth.admin.updateUserById(userId, {
      password,
      app_metadata: { must_change_password: true },
    })

    if (error) {
      return { success: false, error: "No se pudo generar la contraseña temporal." }
    }

    return { success: true, password }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "No se pudo generar la contraseña temporal." }
  }
}

export async function cambiarMiContrasena(nuevaContrasena: string): Promise<{ success: boolean; error?: string }> {
  if (nuevaContrasena.length < 6) {
    return { success: false, error: "La contraseña tiene que tener al menos 6 caracteres." }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password: nuevaContrasena })

  if (error) {
    return { success: false, error: "No se pudo cambiar la contraseña." }
  }

  return { success: true }
}

// Usada en el flujo de cambio obligatorio (contraseña temporal de primer
// ingreso): cambia la contraseña y además limpia el flag must_change_password,
// algo que el usuario no puede hacer por su cuenta porque app_metadata solo
// lo puede escribir un cliente con la service role key.
export async function confirmarCambioContrasenaObligatorio(
  nuevaContrasena: string,
): Promise<{ success: boolean; error?: string }> {
  if (nuevaContrasena.length < 6) {
    return { success: false, error: "La contraseña tiene que tener al menos 6 caracteres." }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "No hay sesión activa." }
  }

  const { error: errorPassword } = await supabase.auth.updateUser({ password: nuevaContrasena })
  if (errorPassword) {
    return { success: false, error: "No se pudo cambiar la contraseña." }
  }

  // La contraseña ya se cambió en este punto; si limpiar el flag falla (o
  // falta la service role key), no lo tratamos como error fatal — el
  // próximo login va a pedir la contraseña que recién se guardó, no la
  // temporal, así que el usuario ya está destrabado igual.
  try {
    const admin = createAdminClient()
    await admin.auth.admin.updateUserById(user.id, {
      app_metadata: { must_change_password: false },
    })
  } catch {
    // ver comentario arriba
  }

  return { success: true }
}
