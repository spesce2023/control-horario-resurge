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
- **El repositorio todavía NO está importado en Vercel.** Es un paso manual, de una sola vez, que hay que hacer desde vercel.com → "Add New… → Project" → elegir este repo de GitHub. Recién ahí queda con despliegue automático en cada push a `main`. Ver sección 6.

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

**Paso único de configuración (todavía no hecho):**
1. En [vercel.com](https://vercel.com), iniciar sesión y "Add New… → Project".
2. Elegir el repositorio `control-horario-resurge` de GitHub.
3. Antes de confirmar el deploy, cargar las 4 variables de entorno (sección 3) en "Environment Variables" — `NEXT_PUBLIC_SITE_URL` con la URL que Vercel asigna (ej. `https://control-horario-resurge.vercel.app`).
4. Deploy.
5. En Supabase → Authentication → URL Configuration, agregar `<esa-url>/auth/callback` a "Redirect URLs" (si no, los links de invitación por correo no van a funcionar en producción).

Una vez hecho esto, cada push a `main` en GitHub dispara un build y deploy automático en Vercel — no hace falta ningún paso manual adicional.

## 7. Estado de avance

El detalle de qué requerimientos están implementados está en la columna **Estado** de [`Backlog_Requerimientos_Control_Horario_Cafeteria.xlsx`](./Backlog_Requerimientos_Control_Horario_Cafeteria.xlsx).

## 8. Notas sobre el correo saliente (invitaciones y recuperación de contraseña)

- Por defecto, Supabase usa un servicio de correo compartido con un límite muy bajo (**2 correos por hora** con la config actual). Alcanza para dar de alta empleados de a uno, pero no para probar varias invitaciones seguidas.
- Se evaluó configurar SMTP propio con [Resend](https://resend.com), pero el remitente de prueba `onboarding@resend.dev` no funciona para envío por SMTP relay genérico (Resend lo reserva para uso vía su propia API). Para usar Resend de verdad hace falta **verificar un dominio propio** en Resend y usar un remitente de ese dominio. Por ahora se volvió a desactivar el SMTP custom y se usa el correo por defecto de Supabase.
- Los enlaces de invitación/recuperación (`/auth/v1/verify?...`) son de **un solo uso**: si algo los abre antes que la persona destinataria (un escáner de seguridad del cliente de correo, una vista previa de link, o incluso un `fetch` de prueba), el enlace queda invalidado y la persona ve "Email link is invalid or has expired" al clickearlo. Evitar "probar" estos enlaces antes de que el usuario final los abra.

## 9. Estado de avance

El detalle de qué requerimientos están implementados está en la columna **Estado** de [`Backlog_Requerimientos_Control_Horario_Cafeteria.xlsx`](./Backlog_Requerimientos_Control_Horario_Cafeteria.xlsx).

## 10. Verificado en vivo contra el proyecto real de Supabase

- **Login** (RF-01/RF-02): usuario → resolución a email → Supabase Auth → redirección por rol a `/admin`, confirmado en un navegador real.
- **Alta de empleado + invitación por correo** (RF-08, RF-21, RF-22): confirmado desde la app real — se generó el usuario automáticamente y llegó el correo de invitación a la casilla del empleado de prueba.
- **Definición de contraseña por enlace** (RF-23): se encontró y corrigió un bug real en el camino (ver sección 11) — ya funciona.
- Migración `0001_init.sql` aplicada y cuenta de Dueño creada (usuario `spesce`, sebas.pesce.m@gmail.com).

El resto de las pantallas (horario, marcas, QR, ajustes, reportes) se construyeron con el mismo patrón que las verificadas arriba y pasan `build`/`lint`/`test`, pero no se probaron una por una en vivo en esta sesión — se recomienda darles una pasada manual antes de usarlas para liquidación real.

## 11. Bugs reales encontrados y corregidos en esta sesión

- **`@supabase/supabase-js` + WebSocket nativo**: versiones recientes (≥2.107) rompen `createClient` en Node <22 porque el cliente de Realtime exige `WebSocket` nativo. Se fijaron `@supabase/supabase-js@2.105.0` y `@supabase/ssr@0.9.0` (última combinación con el fallback `ws`).
- **Flujo implícito vs PKCE en los enlaces de email**: este proyecto de Supabase entrega los tokens de invitación/recuperación en el fragmento de la URL (`#access_token=...`), no como `?code=`. `/auth/callback` solo sabía manejar `?code=` y mandaba a `/login` perdiendo el fragmento. Corregido en [`app/auth/callback/route.ts`](./app/auth/callback/route.ts) (ahora reenvía a `next` preservando el fragmento) y en [`app/set-password/set-password-form.tsx`](./app/set-password/set-password-form.tsx) (parsea el fragmento a mano y llama a `setSession`, porque `@supabase/ssr` fuerza `flowType: "pkce"` y su detección automática de sesión en la URL no contempla el fragmento implícito).
- **No correr `npm run build` en esta carpeta mientras haya un `npm run dev` corriendo** (propio o de otra persona): ambos comparten la carpeta `.next`, y un build de producción corrompe la caché de desarrollo, causando 404 en los assets estáticos y que la app quede sin reaccionar a los clics hasta reiniciar el `dev`.

`npm run build`, `npm run lint` y `npm test` (29 tests unitarios sobre el cálculo de horas/saldo, generación de usuario y armado del reporte) pasan sin errores.

El reporte mensual (RF-16) se generó en formato Excel (.xlsx). El export a PDF queda como mejora futura si hace falta. QR dinámico rotativo (RF-20) queda fuera de alcance, tal como indica el documento de análisis funcional.
