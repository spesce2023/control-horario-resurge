-- Control Horario Cafetería - esquema inicial
-- Correr en el SQL Editor de Supabase (o vía `supabase db push`), una sola vez.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- profiles: 1 fila por usuario de auth.users (dueño o empleado)
-- ---------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique,
  email text not null,
  full_name text not null,
  role text not null check (role in ('owner', 'employee')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- employees: datos propios de un empleado (1:1 con profiles)
-- ---------------------------------------------------------------------
create table public.employees (
  id uuid primary key references public.profiles (id) on delete cascade,
  cedula text not null,
  phone text not null,
  mutualista text not null,
  emergency_contact text not null,
  weekly_hours_target numeric(6, 2) not null default 0,
  default_schedule jsonb not null default '[]'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- weekly_schedules: horario acordado por empleado y semana (lunes a domingo)
-- ---------------------------------------------------------------------
create table public.weekly_schedules (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees (id) on delete cascade,
  week_start date not null,
  days jsonb not null default '[]'::jsonb,
  total_hours numeric(6, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (employee_id, week_start)
);

-- ---------------------------------------------------------------------
-- qr_tokens: QR maestro del local (solo una fila activa a la vez)
-- ---------------------------------------------------------------------
create table public.qr_tokens (
  id uuid primary key default gen_random_uuid(),
  token uuid not null default gen_random_uuid(),
  active boolean not null default true,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

create unique index qr_tokens_one_active
  on public.qr_tokens (active)
  where active;

-- ---------------------------------------------------------------------
-- time_entries: marcas de entrada/salida
-- ---------------------------------------------------------------------
create table public.time_entries (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees (id) on delete cascade,
  type text not null check (type in ('in', 'out')),
  occurred_at timestamptz not null,
  source text not null default 'qr' check (source in ('qr', 'manual')),
  qr_token_id uuid references public.qr_tokens (id),
  is_manual boolean not null default false,
  created_by uuid references public.profiles (id),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index time_entries_employee_occurred_at
  on public.time_entries (employee_id, occurred_at);

-- ---------------------------------------------------------------------
-- hour_adjustments: ajustes manuales de horas (regla de negocio 8, RF-15)
-- ---------------------------------------------------------------------
create table public.hour_adjustments (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees (id) on delete cascade,
  week_start date not null,
  hours_delta numeric(6, 2) not null,
  concept text not null,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

create index hour_adjustments_employee_week
  on public.hour_adjustments (employee_id, week_start);

-- ---------------------------------------------------------------------
-- audit_log: trazabilidad de correcciones y ajustes (RF-19)
-- ---------------------------------------------------------------------
create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles (id),
  action text not null,
  entity text not null,
  entity_id uuid,
  old_value jsonb,
  new_value jsonb,
  created_at timestamptz not null default now()
);

create index audit_log_entity
  on public.audit_log (entity, entity_id);

-- ---------------------------------------------------------------------
-- helper: is_owner() - usado en las políticas de RLS
-- ---------------------------------------------------------------------
create or replace function public.is_owner()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'owner'
  );
$$;

-- ---------------------------------------------------------------------
-- RLS: todas las tablas solo permiten lectura (select) desde el cliente.
-- Las escrituras (insert/update/delete) se hacen exclusivamente desde el
-- servidor con la service role key, que ignora RLS. No se agregan
-- políticas de escritura a propósito: así cualquier intento de escribir
-- directo desde el cliente (anon/authenticated) queda bloqueado.
-- ---------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.employees enable row level security;
alter table public.weekly_schedules enable row level security;
alter table public.qr_tokens enable row level security;
alter table public.time_entries enable row level security;
alter table public.hour_adjustments enable row level security;
alter table public.audit_log enable row level security;

create policy profiles_select on public.profiles
  for select using (id = auth.uid() or public.is_owner());

create policy employees_select on public.employees
  for select using (id = auth.uid() or public.is_owner());

create policy weekly_schedules_select on public.weekly_schedules
  for select using (employee_id = auth.uid() or public.is_owner());

create policy qr_tokens_select on public.qr_tokens
  for select using (public.is_owner());

create policy time_entries_select on public.time_entries
  for select using (employee_id = auth.uid() or public.is_owner());

create policy hour_adjustments_select on public.hour_adjustments
  for select using (employee_id = auth.uid() or public.is_owner());

create policy audit_log_select on public.audit_log
  for select using (public.is_owner());
