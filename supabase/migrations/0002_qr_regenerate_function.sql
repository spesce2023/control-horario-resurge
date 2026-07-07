-- Regenera el QR maestro de forma atómica: desactivar el token vigente y
-- crear el nuevo dentro de la MISMA transacción, para que ninguna otra
-- consulta pueda observar un instante intermedio con cero tokens activos
-- (que era la causa de una condición de carrera real en RF-18).

create or replace function public.regenerate_qr_token(p_actor_id uuid)
returns public.qr_tokens
language plpgsql
security definer
set search_path = public
as $$
declare
  new_token public.qr_tokens;
begin
  update public.qr_tokens set active = false where active = true;

  insert into public.qr_tokens (created_by, active)
  values (p_actor_id, true)
  returning * into new_token;

  return new_token;
end;
$$;
