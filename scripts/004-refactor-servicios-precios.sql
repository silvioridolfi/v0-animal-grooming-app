-- Crear tabla servicio_precios para manejar precios por tamaño
-- Remover precio_base directo del servicio
-- Esto permite que un servicio tenga múltiples precios según el tamaño de la mascota

-- Create servicio_precios table (NUEVA)
CREATE TABLE servicio_precios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  servicio_id UUID NOT NULL REFERENCES servicios(id) ON DELETE CASCADE,
  tamano TEXT NOT NULL CHECK (tamano IN ('S', 'M', 'L')),
  precio DECIMAL(10,2) NOT NULL,
  duracion_estimada INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(servicio_id, tamano)
);

-- Drop precio_base from servicios table (eliminar el campo incorrecto)
ALTER TABLE servicios DROP COLUMN precio_base;

-- Create index for better performance
CREATE INDEX idx_servicio_precios_servicio ON servicio_precios(servicio_id);
