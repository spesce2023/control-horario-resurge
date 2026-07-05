# Control Horario — Cafetería

Web para registrar entrada/salida de empleados (hasta ~15-20), calcular horas trabajadas y saldo semanal, y generar el reporte mensual para liquidación de haberes. Ver [`Analisis_Funcional_Control_Horario_Cafeteria.md`](./Analisis_Funcional_Control_Horario_Cafeteria.md) para la especificación completa y [`Backlog_Requerimientos_Control_Horario_Cafeteria.xlsx`](./Backlog_Requerimientos_Control_Horario_Cafeteria.xlsx) para el estado de cada requerimiento.

Stack: **Next.js** (App Router) + **Supabase** (Postgres + Auth) + **Vercel** (hosting).

> Nota de versión: el proyecto usa **Next.js 13.5.11** (no la 14.x) porque la máquina de desarrollo actual tiene Node 18.16.0, una versión por debajo del mínimo que exige Next 14 (18.17). Next 13.5 ya tiene el App Router estable, así que no hay recorte funcional. Si en algún momento se actualiza Node a 18.17+ o 20+, se puede subir a Next 14 sin cambios de arquitectura.

## 1. Requisitos previos

- Node.js 18.17+ (idealmente 20 LTS). Localmente hoy hay Node 18.16.0, que **no alcanza** para correr `npm run dev`/`npm run build` de forma confiable — conviene actualizar Node antes de desarrollar en esta máquina.
- Un proyecto de Supabase ya creado (según el documento de análisis, ya existe uno vinculado a esta cuenta).
- El repositorio ya está vinculado a Vercel para despliegue automático en cada push a `main` (según el flujo descripto en la sección 5 del análisis funcional).

## 2. Configurar Supabase

1. Entrá a tu proyecto en [supabase.com](https://supabase.com) → **SQL Editor**.
2. Corré, en orden, todos los archivos de `supabase/migrations/` (empezando por `0001_init.sql`). Esto crea las tablas, la función `is_owner()` y las políticas de RLS.
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

- El código se desarrolló sin acceso a las credenciales reales de Supabase (por decisión explícita, para no exponer la `service role key`). Se validó que el proyecto compila (`npm run build`) y se agregaron tests unitarios para la lógica de cálculo de horas (`npm test`), pero **el flujo end-to-end (login, marcado por QR, envío de emails) no fue probado en vivo** — hace falta validarlo una vez cargado `.env.local` con el proyecto real, siguiendo los pasos de este README.
- El reporte mensual (RF-16) se generó en formato Excel (.xlsx). El export a PDF queda como mejora futura si hace falta.
- QR dinámico rotativo (RF-20) queda fuera de alcance, tal como indica el documento de análisis funcional.
