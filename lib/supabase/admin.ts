import { createClient as createSupabaseClient } from "@supabase/supabase-js"

/**
 * Cliente con la service role key: ignora RLS y puede administrar
 * cuentas de otros usuarios (listar, cambiar contraseña, etc).
 * SUPABASE_SERVICE_ROLE_KEY no tiene prefijo NEXT_PUBLIC_, así que Next
 * nunca la incluye en el bundle del navegador — pero igual este módulo
 * solo se importa desde server actions ("use server"), nunca desde un
 * componente cliente.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error("Falta configurar SUPABASE_SERVICE_ROLE_KEY en las variables de entorno.")
  }

  return createSupabaseClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
