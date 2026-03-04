-- Crear la tabla servicio_precios que está faltando en la BD
-- Esta tabla debería haber sido creada por la migración 004 pero no fue ejecutada
-- La agregamos ahora para que funcione correctamente el sistema de precios por tamaño

CREATE TABLE IF NOT EXISTS servicio_precios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  servicio_id UUID NOT NULL REFERENCES servicios(id) ON DELETE CASCADE,
  tamano TEXT NOT NULL CHECK (tamano IN ('S', 'M', 'L')),
  precio DECIMAL(10,2) NOT NULL,
  duracion_estimada INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(servicio_id, tamano)
);

-- Crear índice para mejor performance
CREATE INDEX IF NOT EXISTS idx_servicio_precios_servicio ON servicio_precios(servicio_id);

-- Si la columna precio_base aún existe en servicios, removerla
ALTER TABLE servicios DROP COLUMN IF EXISTS precio_base;
