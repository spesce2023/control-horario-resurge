-- Valor hora nominal del empleado (obligatorio), usado para calcular la
-- liquidación mensual en el reporte (RF-16 extendido).
alter table public.employees
  add column hourly_rate numeric(10, 2) not null default 0;
