-- Tabla para registrar historial de servicios y precios por mascota
CREATE TABLE IF NOT EXISTS historial_servicios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mascota_id UUID NOT NULL REFERENCES mascotas(id) ON DELETE CASCADE,
  turno_id UUID REFERENCES turnos(id) ON DELETE SET NULL,
  tipo_servicio TEXT NOT NULL CHECK (tipo_servicio IN ('Corte', 'Baño', 'Corte y Baño')),
  precio NUMERIC(10, 2) NOT NULL,
  metodo_pago TEXT NOT NULL CHECK (metodo_pago IN ('efectivo', 'transferencia')),
  fecha_servicio DATE NOT NULL,
  hora_servicio TIME NOT NULL,
  estado_turno TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado_turno IN ('pendiente', 'realizado', 'cancelado')),
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para búsquedas frecuentes
CREATE INDEX idx_historial_servicios_mascota_id ON historial_servicios(mascota_id);
CREATE INDEX idx_historial_servicios_turno_id ON historial_servicios(turno_id);
CREATE INDEX idx_historial_servicios_fecha ON historial_servicios(fecha_servicio DESC);

-- Agregar columna de método_pago a tabla turnos si no existe
ALTER TABLE turnos ADD COLUMN IF NOT EXISTS metodo_pago TEXT DEFAULT 'efectivo' CHECK (metodo_pago IN ('efectivo', 'transferencia'));
