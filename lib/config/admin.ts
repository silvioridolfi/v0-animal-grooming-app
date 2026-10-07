// Lista fija de cuentas con permiso para administrar otras cuentas
// (generar contraseñas temporales). App de 2 personas: no hace falta
// un sistema de roles, alcanza con este allowlist.
const ADMIN_EMAILS = ["silvioridolfi@gmail.com"]

export function esAdmin(email: string | null | undefined): boolean {
  return !!email && ADMIN_EMAILS.includes(email.toLowerCase())
}
