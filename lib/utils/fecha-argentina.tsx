export function getFechaArgentina(): string {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
  })
  // "en-CA" devuelve directamente formato YYYY-MM-DD
}