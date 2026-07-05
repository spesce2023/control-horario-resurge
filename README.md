# Control Horario — Cafetería

Web para registrar entrada/salida de empleados (hasta ~15-20), calcular horas trabajadas y saldo semanal, y generar el reporte mensual para liquidación de haberes. Ver [`Analisis_Funcional_Control_Horario_Cafeteria.md`](./Analisis_Funcional_Control_Horario_Cafeteria.md) para la especificación completa y [`Backlog_Requerimientos_Control_Horario_Cafeteria.xlsx`](./Backlog_Requerimientos_Control_Horario_Cafeteria.xlsx) para el estado de cada requerimiento.

Stack: **Next.js** (App Router) + **Supabase** (Postgres + Auth) + **Vercel** (hosting).

> Notas de versiones (por compatibilidad con el Node de esta máquina, hoy 18.16.0):
> - **Next.js 13.5.11** en vez de 14.x (14 exige Node ≥18.17). El App Router ya es estable en 13.5, sin recorte funcional.
> - **`@supabase/supabase-js` fijado en `2.105.0`** (no la última) y **`@supabase/ssr` en `0.9.0`**. A partir de `@supabase/supabase-js@2.107.0`, el cliente de Realtime dejó de tener alternativa vía el paquete `ws` y pasó a exigir el `WebSocket` nativo del entorno (recién disponible en Node ≥22 sin flags). Como esta app no usa Realtime pero el cliente lo inicializa igual internamente, actualizar a la última versión rompe **todo** llamado a `createClient`/`createServerClient` en Node 18 o 20 con el error `Node.js detected but native WebSocket not found`. Se fijaron ambos paquetes a versiones que todavía dependen de `ws`. Si más adelante se corre exclusivamente en Node 22+ (Vercel lo permite eligiendo esa versión en la configuración del proyecto), se puede volver a la última versión de ambos paquetes.
> - Si se actualiza Node a 18.17+/20/22, se puede subir Next a 14.x sin cambios de arquitectura.

## 1. Requisitos previos

- Node.js 18.17+ (idealmente 20 LTS). Localmente hoy hay Node 18.16.0, que **no alcanza** para correr `npm run dev`/`npm run build` de forma confiable — conviene actualizar Node antes de desarrollar en esta máquina.
- Un proyecto de Supabase ya creado (según el documento de análisis, ya existe uno vinculado a esta cuenta).
- El repositorio ya está vinculado a Vercel para despliegue automático en cada push a `main` (según el flujo descripto en la sección 5 del análisis funcional).

## 2. Configurar Supabase

1. Entrá a tu proyecto en [supabase.com](https://supabase.com) → **SQL Editor**.
2. Corré, en orden, todos los archivos de `supabase/migrations/` (empezando por `0001_init.sql`). Esto crea las tablas, la función `is_owner()` y las políticas de RLS.
   - Alternativa: si completás `SUPABASE_DB_URL` en `.env.local` (Project Settings → Database → Connection Pooling, **no** la conexión directa `db.*.supabase.co` si tu red no tiene salida IPv6), podés correr `node scripts/run-migrations.mjs`, que aplica los archivos pendientes de `supabase/migrations/` y lleva registro en `public.schema_migrations` para no reaplicarlos.
3. En **Authentication → URL Configuration**, configurá:
   - **Site URL**: la URL pública de la app (en producción, la de Vercel; en local, `http://localhost:3000`).
   - **Redirect URLs**: agregá `http://localhost:3000/auth/callback` y `https://<tu-dominio-de-vercel>/auth/callback`.
4. En **Settings → API**, copiá `Project URL`, `anon public key` y `service_role key` (este último es secreto, no se comparte ni se commitea).

## 3. Variables de entorno

Copiá `.env.local.example` a `.env.local` y completá los valores obtenidos en el paso anterior:

```bash
cp .env.local.example .env.local
```

En Vercel, cargá las mismas 4 variables en **Project Settings → Environment Variables** (con `NEXT_PUBLIC_SITE_URL` apuntando al dominio de producción).

## 4. Instalar y correr en local

```bash
npm install
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

## 5. Crear la cuenta del Dueño (una sola vez)

Después de completar `.env.local` con las claves reales, corré:

```bash
node scripts/bootstrap-owner.mjs
```

Esto crea la cuenta de Dueño (rol `owner`) e invita por correo a la dirección configurada para que defina su contraseña. Ver [`scripts/bootstrap-owner.mjs`](./scripts/bootstrap-owner.mjs) para más detalle. Solo hace falta correrlo una vez por proyecto de Supabase.

## 6. Desplegar

Cada push a `main` en GitHub dispara un build y deploy automático en Vercel (ya configurado). No hace falta ningún paso manual adicional una vez cargadas las variables de entorno en Vercel.

## 7. Estado de avance

El detalle de qué requerimientos están implementados está en la columna **Estado** de [`Backlog_Requerimientos_Control_Horario_Cafeteria.xlsx`](./Backlog_Requerimientos_Control_Horario_Cafeteria.xlsx).

## 8. Límites conocidos de esta entrega

- El proyecto de Supabase real está conectado y **la migración `0001_init.sql` ya está aplicada** (las 7 tablas existen). La cuenta de Dueño ya fue creada (`node scripts/bootstrap-owner.mjs`, usuario `spesce`, sebas.pesce.m@gmail.com) — falta que definas tu contraseña desde el enlace que te llegó por correo.
- Verificado en vivo, en el navegador, contra el proyecto real: **login completo** (usuario → resolución de email → Supabase Auth → redirección por rol a `/admin`), incluso con una cuenta de dueño de prueba descartable (creada y borrada después, con tu autorización). También se confirmó por script directo que la invitación por correo (RF-22) efectivamente envía el email cuando el dominio es válido (no funciona con `@example.com`: Supabase lo rechaza como dirección inválida).
- **No se pudo verificar en vivo, a través del navegador automatizado de esta herramienta, el alta de empleados (ni otras acciones de escritura más complejas que el login)**: el formulario redirige a `/login` en vez de completar la acción, de forma reproducible, incluso después de descartar (uno por uno) causas de código: no es un problema de validación, ni del email de prueba, ni de la versión de `zod`, ni de referencias de Server Action desactualizadas por hot-reload. La lógica de negocio subyacente (generación de usuario, invitación, inserts) se probó por separado con un script y funciona correctamente contra Supabase. Todo indica que es una particularidad de cómo esta herramienta de automatización de navegador interactúa con las Server Actions **experimentales** de Next.js 13.5 (no estabilizadas hasta Next 14) — algo que muy probablemente no se reproduzca en un navegador real. **Recomendación:** probar el alta de un empleado real desde tu propio navegador (`npm run dev` en tu máquina) antes de asumir que hay un bug; si falla ahí también, avisame con el mensaje de error exacto.
- `npm run build`, `npm run lint` y `npm test` (29 tests unitarios sobre el cálculo de horas/saldo, generación de usuario y armado del reporte) pasan sin errores.
- El reporte mensual (RF-16) se generó en formato Excel (.xlsx). El export a PDF queda como mejora futura si hace falta.
- QR dinámico rotativo (RF-20) queda fuera de alcance, tal como indica el documento de análisis funcional.
