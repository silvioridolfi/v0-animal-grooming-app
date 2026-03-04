-- Migración para refactorizar de servicio_id a tipo_servicio
-- Paso 1: Hacer servicio_id nullable para poder remover la restricción
ALTER TABLE turnos ALTER COLUMN servicio_id DROP NOT NULL;

-- Paso 2: Rellenar tipo_servicio desde valores existentes si es necesario
-- (La mayoría ya deberían tener valores por defecto 'Corte y Baño')

-- Paso 3: Hacer tipo_servicio NOT NULL después de que tenga valores
ALTER TABLE turnos ALTER COLUMN tipo_servicio SET NOT NULL;

-- Paso 4: Remover la restricción CHECK antigua si existe
-- (La nueva restricción se aplica al nivel de aplicación)

-- Paso 5: Crear índice si no existe
CREATE INDEX IF NOT EXISTS idx_turnos_tipo_servicio ON turnos(tipo_servicio);

COMMIT;
