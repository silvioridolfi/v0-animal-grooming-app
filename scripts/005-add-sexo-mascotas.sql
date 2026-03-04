-- Agregar columna sexo a la tabla mascotas para registrar el género del animal
ALTER TABLE mascotas ADD COLUMN sexo TEXT CHECK (sexo IN ('Macho', 'Hembra'));

-- Crear índice para búsquedas futuras
CREATE INDEX idx_mascotas_sexo ON mascotas(sexo);
