// Feriados nacionales de Argentina 2026
// Fuente: Calendario oficial de feriados nacionales

export const FERIADOS_ARGENTINA_2026: Record<string, string> = {
  // Enero
  "2026-01-01": "Año Nuevo",

  // Febrero - Carnaval (lunes y martes)
  "2026-02-16": "Carnaval",
  "2026-02-17": "Carnaval",

  // Marzo
  "2026-03-24": "Día Nacional de la Memoria",

  // Abril - Semana Santa
  "2026-04-02": "Día del Veterano y de los Caídos en Malvinas",
  "2026-04-03": "Viernes Santo",

  // Mayo
  "2026-05-01": "Día del Trabajador",
  "2026-05-25": "Día de la Revolución de Mayo",

  // Junio
  "2026-06-15": "Paso a la Inmortalidad del Gral. Güemes (trasladado)",
  "2026-06-20": "Paso a la Inmortalidad del Gral. Belgrano",

  // Julio
  "2026-07-09": "Día de la Independencia",

  // Agosto
  "2026-08-17": "Paso a la Inmortalidad del Gral. San Martín",

  // Octubre
  "2026-10-12": "Día del Respeto a la Diversidad Cultural",

  // Noviembre
  "2026-11-23": "Día de la Soberanía Nacional (trasladado)",

  // Diciembre
  "2026-12-08": "Inmaculada Concepción de María",
  "2026-12-25": "Navidad",
}

export function esFeriado(fecha: string): boolean {
  return fecha in FERIADOS_ARGENTINA_2026
}

export function getNombreFeriado(fecha: string): string | null {
  return FERIADOS_ARGENTINA_2026[fecha] || null
}
