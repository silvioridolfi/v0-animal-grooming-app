-- Activa Row Level Security (RLS) en todas las tablas del sistema.
--
-- Hasta ahora, la app se conectaba a Supabase con la "clave anónima"
-- (pública, viaja en el código del navegador) y las tablas no tenían RLS
-- activado — es decir, cualquiera que consiguiera esa clave podía leer o
-- escribir los datos DIRECTAMENTE por la API de Supabase, sin pasar por
-- la app ni por el login que armamos.
--
-- Esta es una app de un solo negocio (no hay "cada cliente ve solo lo
-- suyo" — vos y Andrea ven y editan los mismos datos), así que la regla
-- es simple: con sesión iniciada, acceso total; sin sesión, nada de nada.
--
-- IMPORTANTE — probar enseguida de correr esto:
-- Entrá a la app ya logueado y confirmá que la agenda carga, que podés
-- crear un turno, etc. Si algo se rompe (pantalla en blanco, error de
-- "permission denied"), significa que alguna tabla quedó sin su política
-- — mandá el error exacto y lo agregamos. Para volver atrás de urgencia
-- en cualquier tabla puntual: ALTER TABLE nombre_tabla DISABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  tabla text;
BEGIN
  FOREACH tabla IN ARRAY ARRAY[
    'accesorios',
    'clientes',
    'configuracion_negocio',
    'egresos',
    'historial_servicios',
    'mascotas',
    'pagos',
    'servicio_precios',
    'servicios',
    'turnos',
    'ventas_accesorios'
  ]
  LOOP
    -- Si la tabla no existe en este proyecto (algunas quedaron solo en el
    -- historial de scripts, nunca se llegaron a crear), la saltea en vez
    -- de romper todo el script.
    IF to_regclass('public.' || tabla) IS NULL THEN
      RAISE NOTICE 'Tabla % no existe, salteada', tabla;
      CONTINUE;
    END IF;

    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tabla);

    -- DROP + CREATE en vez de "IF NOT EXISTS" porque Postgres no soporta
    -- esa cláusula para políticas — así se puede correr este script de
    -- nuevo sin que falle si ya existía la política.
    EXECUTE format('DROP POLICY IF EXISTS "usuarios_autenticados_acceso_total" ON public.%I;', tabla);
    EXECUTE format(
      'CREATE POLICY "usuarios_autenticados_acceso_total" ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true);',
      tabla
    );
  END LOOP;
END $$;
