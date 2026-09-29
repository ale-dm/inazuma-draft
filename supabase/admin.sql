-- CRUD de la app (#/admin) en tiempo real contra la base.
-- La clave publishable solo puede leer las tablas; para escribir, la app llama a admin_write() con la contraseña de
-- admin, que se guarda cifrada (bcrypt) en admin_config. Cada cambio queda en admin_log y admin_replay() lo vuelve a
-- aplicar al final de seed.sql, así la recarga del catálogo (db-load.yml) no borra lo hecho desde la app.
-- Idempotente: se puede ejecutar varias veces (lo carga db-load.yml después de schema.sql).

create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;

create table if not exists public.admin_config (
  id         int primary key default 1 check (id = 1),
  pass_hash  text                                   -- bcrypt; null = sin contraseña todavía (la primera la crea)
);
alter table public.admin_config enable row level security;   -- sin políticas: nadie la lee con la clave pública

create table if not exists public.admin_log (
  id       bigserial primary key,
  at       timestamptz not null default now(),
  tbl      text not null,
  data     jsonb not null,                          -- la fila o el cambio (claves = columnas; siempre con la clave primaria)
  deleted  boolean not null default false
);
alter table public.admin_log enable row level security;

-- tablas que puede tocar el CRUD y su clave primaria
create or replace function public.admin_pk(tbl text) returns text[] language sql immutable as $$
  select case tbl
    when 'cards' then array['id'] when 'characters' then array['id'] when 'techniques' then array['id']
    when 'teams' then array['name'] when 'staff' then array['zukan_no'] when 'card_techniques' then array['card_id']
  end
$$;

create or replace function public.admin_ok(pass text) returns boolean
language sql stable security definer set search_path = public, extensions as $$
  select exists (select 1 from public.admin_config
                 where id = 1 and pass_hash is not null and pass_hash = extensions.crypt(coalesce(pass, ''), pass_hash))
$$;

-- 'unset' (falta crear la contraseña) · 'ok' · 'wrong'
create or replace function public.admin_status(pass text) returns text
language plpgsql security definer set search_path = public, extensions as $$
begin
  if not exists (select 1 from public.admin_config where id = 1 and pass_hash is not null) then return 'unset'; end if;
  if public.admin_ok(pass) then return 'ok'; end if;
  perform pg_sleep(1);                                -- frena a quien pruebe contraseñas
  return 'wrong';
end $$;

-- crea la contraseña si todavía no hay ninguna (para cambiarla: vaciar admin_config desde db-load.yml)
create or replace function public.admin_claim(pass text) returns boolean
language plpgsql security definer set search_path = public, extensions as $$
begin
  if length(coalesce(pass, '')) < 8 then raise exception 'La contraseña necesita al menos 8 caracteres'; end if;
  insert into public.admin_config (id, pass_hash) values (1, extensions.crypt(pass, extensions.gen_salt('bf', 10)))
  on conflict (id) do update set pass_hash = excluded.pass_hash where public.admin_config.pass_hash is null;
  return public.admin_ok(pass);
end $$;

-- aplica un cambio sin comprobar la contraseña (solo lo llaman admin_write y admin_replay)
--  · borrar: data con la clave primaria
--  · card_techniques: {card_id, techniques: [ids en orden]} sustituye todas las técnicas de la carta
--  · resto: si la fila existe, se cambian solo las columnas que vienen; si no, se crea
create or replace function public.admin_apply(tbl text, data jsonb, del boolean default false) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  pk text[] := public.admin_pk(tbl);
  cols text[];
  sets text[];
  keycols text;
  keyvals text;
  found_row boolean;
  res jsonb;
begin
  if pk is null then raise exception 'Tabla no permitida: %', tbl; end if;
  if exists (select 1 from unnest(pk) k where not data ? k) then raise exception 'Falta la clave (%) en %', array_to_string(pk, ', '), tbl; end if;

  if tbl = 'card_techniques' then
    delete from public.card_techniques where card_id = data->>'card_id';
    if not del then
      insert into public.card_techniques (card_id, technique_id, slot)
      select data->>'card_id', t.id, min(t.n)::int
      from jsonb_array_elements_text(coalesce(data->'techniques', '[]'::jsonb)) with ordinality as t(id, n)
      where exists (select 1 from public.techniques x where x.id = t.id)
      group by t.id;
    end if;
    select jsonb_build_object('card_id', data->>'card_id', 'techniques',
             coalesce(jsonb_agg(technique_id order by slot), '[]'::jsonb))
      into res from public.card_techniques where card_id = data->>'card_id';
    return res;
  end if;

  keycols := (select string_agg(format('t.%I', k), ', ') from unnest(pk) k);
  keyvals := (select string_agg(format('r.%I', k), ', ') from unnest(pk) k);

  if del then
    execute format('delete from public.%1$I t where (%2$s, true) = (select %3$s, true from jsonb_populate_record(null::public.%1$I, $1) r) returning to_jsonb(t)',
                   tbl, keycols, keyvals) using data into res;
    return res;
  end if;

  select array_agg(c.column_name::text order by c.ordinal_position) into cols
  from information_schema.columns c
  where c.table_schema = 'public' and c.table_name = tbl and data ? c.column_name;

  execute format('select exists (select 1 from public.%1$I t where (%2$s, true) = (select %3$s, true from jsonb_populate_record(null::public.%1$I, $1) r))',
                 tbl, keycols, keyvals) using data into found_row;

  if found_row then
    select array_agg(format('%1$I = r.%1$I', c)) into sets from unnest(cols) c where c <> all(pk);
    if sets is null then sets := array[format('%1$I = t.%1$I', pk[1])]; end if;
    execute format('update public.%1$I t set %2$s from jsonb_populate_record(null::public.%1$I, $1) r where (%3$s, true) = (%4$s, true) returning to_jsonb(t)',
                   tbl, array_to_string(sets, ', '), keycols, keyvals) using data into res;
  else
    execute format('insert into public.%1$I as t (%2$s) select %2$s from jsonb_populate_record(null::public.%1$I, $1) returning to_jsonb(t)',
                   tbl, (select string_agg(format('%I', c), ', ') from unnest(cols) c)) using data into res;
  end if;
  return res;
end $$;

-- lo que llama la app: comprueba la contraseña, aplica el cambio y lo apunta en el historial
create or replace function public.admin_write(pass text, tbl text, data jsonb, del boolean default false) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare res jsonb;
begin
  if not public.admin_ok(pass) then perform pg_sleep(1); raise exception 'Contraseña de admin incorrecta'; end if;
  res := public.admin_apply(tbl, data, del);
  insert into public.admin_log (tbl, data, deleted) values (tbl, data, del);
  return res;
end $$;

-- fila completa y al día para el formulario del CRUD (por POST: no la guarda la caché de la app); las cartas, con sus
-- técnicas en orden. Los datos son públicos igualmente.
create or replace function public.admin_get(tbl text, data jsonb) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  pk text[] := public.admin_pk(tbl);
  res jsonb;
begin
  if pk is null or tbl = 'card_techniques' then raise exception 'Tabla no permitida: %', tbl; end if;
  execute format('select to_jsonb(t) from public.%1$I t where (%2$s, true) = (select %3$s, true from jsonb_populate_record(null::public.%1$I, $1) r)',
                 tbl, (select string_agg(format('t.%I', k), ', ') from unnest(pk) k), (select string_agg(format('r.%I', k), ', ') from unnest(pk) k))
    using data into res;
  if tbl = 'cards' and res is not null then
    res := res || jsonb_build_object('techniques', coalesce((select jsonb_agg(technique_id order by slot)
                                                               from public.card_techniques where card_id = res->>'id'), '[]'::jsonb));
  end if;
  return res;
end $$;

-- historial para la pestaña "Historial" del CRUD
create or replace function public.admin_history(pass text, lim int default 100) returns setof public.admin_log
language plpgsql security definer set search_path = public, extensions as $$
begin
  if not public.admin_ok(pass) then raise exception 'Contraseña de admin incorrecta'; end if;
  return query select * from public.admin_log order by id desc limit least(lim, 500);
end $$;

-- vuelve a aplicar todo el historial (al final de seed.sql); un cambio que ya no encaja se salta
create or replace function public.admin_replay() returns int
language plpgsql security definer set search_path = public as $$
declare e record; n int := 0;
begin
  for e in select * from public.admin_log order by id loop
    begin
      perform public.admin_apply(e.tbl, e.data, e.deleted);
      n := n + 1;
    exception when others then
      raise notice 'admin_replay: cambio % (%) saltado: %', e.id, e.tbl, sqlerrm;
    end;
  end loop;
  return n;
end $$;

revoke all on function public.admin_apply(text, jsonb, boolean) from public, anon, authenticated;
revoke all on function public.admin_replay() from public, anon, authenticated;
grant execute on function public.admin_get(text, jsonb), public.admin_status(text), public.admin_claim(text), public.admin_write(text, text, jsonb, boolean),
  public.admin_history(text, int) to anon, authenticated;
revoke all on function public.admin_ok(text) from public, anon, authenticated;
