-- Crear tabla servicio_precios si no existe
CREATE TABLE IF NOT EXISTS servicio_precios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  servicio_id UUID NOT NULL REFERENCES servicios(id) ON DELETE CASCADE,
  tamano TEXT NOT NULL CHECK (tamano IN ('S', 'M', 'L')),
  precio DECIMAL(10,2) NOT NULL,
  duracion_estimada INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(servicio_id, tamano)
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_servicio_precios_servicio ON servicio_precios(servicio_id);
CREATE INDEX IF NOT EXISTS idx_servicio_precios_tamano ON servicio_precios(tamano);

-- Agregar comentarios
COMMENT ON TABLE servicio_precios IS 'Almacena los precios de servicios por tamaño de mascota';
COMMENT ON COLUMN servicio_precios.tamano IS 'Tamaño de mascota: S (Pequeño), M (Mediano), L (Grande)';
