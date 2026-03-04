export interface Cliente {
  id: string
  nombre: string
  telefono: string | null
  notas: string | null
  created_at: string
}

export interface Mascota {
  id: string
  nombre: string
  tipo_animal: "Perro" | "Gato"
  raza: string | null
  tamano: "S" | "M" | "L" | null
  sexo: "Macho" | "Hembra" | null
  notas: string | null
  cliente_id: string
  created_at: string
  cliente?: Cliente
}

export interface PetHistoryEntry {
  id: string
  fecha_servicio: string
  tipo_servicio: "Corte" | "Baño" | "Corte y Baño"
  precio_total: number
  metodo_pago: "efectivo" | "transferencia" | null
  estado: "pendiente" | "realizado" | "cancelado"
  notas: string | null
  turno_id: string
}

export interface Turno {
  id: string
  fecha: string
  hora: string
  mascota_id: string
  tipo_servicio: "Corte" | "Baño" | "Corte y Baño"
  descuento_tipo: "fijo" | "porcentaje" | null
  descuento_valor: number
  precio_final: number
  metodo_pago: "efectivo" | "transferencia" | null
  estado: "pendiente" | "realizado" | "cancelado"
  created_at: string
  mascota?: Mascota
  cliente?: Cliente
}

export interface HistorialServicio {
  id: string
  mascota_id: string
  turno_id: string
  tipo_servicio: "Corte" | "Baño" | "Corte y Baño"
  precio: number
  metodo_pago: "efectivo" | "transferencia" | null
  estado_turno: "pendiente" | "realizado" | "cancelado"
  fecha_servicio: string
  created_at: string
}

export interface Pago {
  id: string
  turno_id: string
  monto: number
  metodo: "efectivo" | "transferencia"
  estado: "pagado" | "pendiente"
  created_at: string
  turno?: Turno
}

export interface ConfiguracionNegocio {
  id: string
  dias_laborales: number[]
  hora_inicio_manana: string
  hora_fin_manana: string
  hora_inicio_tarde: string
  hora_fin_tarde: string
  dias_no_laborables: string[]
  updated_at: string
}

export interface Egreso {
  id: string
  fecha: string
  concepto: string
  categoria: "mantenimiento" | "insumos" | "herramientas" | "otros"
  monto: number
  medio_pago: "efectivo" | "transferencia" | null
  notas: string | null
  created_at: string
}
