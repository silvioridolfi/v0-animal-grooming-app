-- Separar egresos del negocio de gastos personales (alquiler, seguro, etc.)
-- que Andrea también registra en la misma tabla, para que el balance del
-- negocio no quede contaminado con gastos que no son de la peluquería.

ALTER TABLE egresos ADD COLUMN IF NOT EXISTS tipo TEXT NOT NULL DEFAULT 'negocio' CHECK (tipo IN ('negocio', 'personal'));

-- Las categorías de "negocio" quedan igual que antes (sin renombrar nada,
-- así ningún registro existente rompe con el constraint nuevo). Se agregan
-- categorías nuevas, válidas solo cuando tipo = 'personal'. "impuestos" se
-- deja disponible en ambos tipos: el Monotributo, por ejemplo, es un
-- impuesto pero existe específicamente por tener el negocio registrado.
ALTER TABLE egresos DROP CONSTRAINT IF EXISTS egresos_categoria_check;
ALTER TABLE egresos ADD CONSTRAINT egresos_categoria_check
  CHECK (
    (tipo = 'negocio' AND categoria IN ('mantenimiento', 'insumos', 'herramientas', 'reembolsos', 'impuestos', 'otros'))
    OR
    (tipo = 'personal' AND categoria IN ('alquiler', 'seguro', 'servicios', 'internet_telefono', 'transporte', 'impuestos', 'otros_personal'))
  );

CREATE INDEX IF NOT EXISTS idx_egresos_tipo ON egresos(tipo);
