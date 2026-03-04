-- Create configuracion_negocio table
CREATE TABLE configuracion_negocio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dias_laborales INTEGER[] NOT NULL DEFAULT ARRAY[1,2,3,4,5],
  hora_inicio_manana TIME NOT NULL DEFAULT '09:00',
  hora_fin_manana TIME NOT NULL DEFAULT '13:00',
  hora_inicio_tarde TIME NOT NULL DEFAULT '15:00',
  hora_fin_tarde TIME NOT NULL DEFAULT '18:00',
  dias_no_laborables DATE[] DEFAULT ARRAY[]::DATE[],
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default configuration
INSERT INTO configuracion_negocio (
  dias_laborales,
  hora_inicio_manana,
  hora_fin_manana,
  hora_inicio_tarde,
  hora_fin_tarde
) VALUES (
  ARRAY[1,2,3,4,5],
  '09:00',
  '13:00',
  '15:00',
  '18:00'
);
