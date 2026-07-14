-- Horas semanales de contrato: el umbral fijo contra el que se calculan las
-- horas extra en la liquidación mensual (RF-16), independiente de las horas
-- semanales pactadas (que pueden ser menores o mayores).
alter table public.employees
  add column weekly_contract_hours numeric(6, 2) not null default 0;
