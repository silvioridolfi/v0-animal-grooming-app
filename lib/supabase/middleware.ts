import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

const PUBLIC_PATHS = ["/login"]
const CAMBIAR_PASSWORD_PATH = "/cambiar-password"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    },
  )

  // IMPORTANTE: no meter lógica entre createServerClient y getUser().
  // Un return anticipado acá puede hacer que la sesión se pierda de forma
  // intermitente y muy difícil de rastrear después (advertencia de la
  // propia documentación de Supabase para este patrón).
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const isPublicPath = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))

  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  if (user && pathname === "/login") {
    const url = request.nextUrl.clone()
    url.pathname = "/"
    return NextResponse.redirect(url)
  }

  // Contraseña temporal (generada por un admin desde Configuración): hasta
  // que la cambie, el usuario no puede ver ninguna otra pantalla de la app.
  const debeCambiarPassword = user?.app_metadata?.must_change_password === true

  if (user && debeCambiarPassword && pathname !== CAMBIAR_PASSWORD_PATH) {
    const url = request.nextUrl.clone()
    url.pathname = CAMBIAR_PASSWORD_PATH
    return NextResponse.redirect(url)
  }

  if (user && !debeCambiarPassword && pathname === CAMBIAR_PASSWORD_PATH) {
    const url = request.nextUrl.clone()
    url.pathname = "/"
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
