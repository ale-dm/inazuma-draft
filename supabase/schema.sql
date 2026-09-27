-- Catálogo de jugadores (generado por tools/db/build.py; cargado por .github/workflows/db-load.yml).
-- Idempotente: se puede ejecutar varias veces.

create table if not exists public.characters (
  id          text primary key,              -- slug estable (ficha de la wiki o zukan)
  name        text not null,                 -- nombre inglés oficial (zukan)
  wiki_page   text,                          -- título de la ficha en inazuma-eleven.fandom.com
  gender      text
);

create table if not exists public.techniques (
  id          text primary key,              -- clave de Module:WazaData
  name        text not null,                 -- nombre inglés (name_dub)
  name_es     text,                          -- nombre en castellano (inazuma.fandom.com/es)
  name_jp     text,
  type        text,                          -- Shoot | Dribble | Block | Catch
  element     text,
  cost        int,                           -- coste que se muestra (Galaxy si existe)
  cost_game   text,                          -- juego de ese coste
  costs       jsonb                          -- todos los costes por juego
);

create table if not exists public.cards (
  id           text primary key,             -- <personaje>--<juego>--<versión>
  character_id text not null references public.characters(id) on delete cascade,
  name         text not null,
  game         text not null,                -- IE1 | IE2 | IE3 | GO1 | GO2 | GO3
  saga         text not null,                -- IE | GO
  version      text not null,                -- p. ej. "Raimon", "Dark Emperors", "Chrono Storm"
  team         text,
  position     text not null,                -- GK | DF | MF | FW
  element      text,                         -- fire | wood | air | earth
  ovr          int  not null,
  category     text not null,                -- Legendary/Top/Advanced/Growing/Common Player
  tier         text not null,                -- S (Strikers/Xtreme) | A | B | C (scout)
  source       text,                         -- de dónde sale el OVR
  shooting     int, control int, physical int, speed int, defense int, goalkeeping int,
  image_url    text,
  zukan_id     text,
  raw_stats    jsonb,                        -- stats originales del juego (nivel 99)
  is_version   boolean not null default false -- true = versión extra (Strikers / protagonistas GO)
);
alter table public.techniques add column if not exists name_es text;

create index if not exists cards_character_idx on public.cards(character_id);
create index if not exists cards_ovr_idx on public.cards(ovr desc);
create index if not exists cards_game_pos_idx on public.cards(game, position);

create table if not exists public.card_techniques (
  card_id      text not null references public.cards(id) on delete cascade,
  technique_id text not null references public.techniques(id) on delete cascade,
  slot         int  not null,
  primary key (card_id, technique_id)
);

-- Lectura pública (la clave publishable del frontend solo puede leer).
do $$
declare t text;
begin
  foreach t in array array['characters','techniques','cards','card_techniques'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "public read" on public.%I', t);
    execute format('create policy "public read" on public.%I for select using (true)', t);
  end loop;
end $$;
