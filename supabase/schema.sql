-- Catálogo de jugadores (generado por tools/db/build.py; cargado por .github/workflows/db-load.yml).
-- Idempotente: se puede ejecutar varias veces.

create table if not exists public.characters (
  id          text primary key,              -- slug estable (ficha de la wiki o zukan)
  name        text not null,                 -- nombre inglés oficial (zukan)
  wiki_page   text,                          -- título de la ficha en inazuma-eleven.fandom.com
  gender      text,
  zukan_no    int                            -- nº oficial en zukan.inazuma.jp (su primera ficha)
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
alter table public.techniques add column if not exists description text;   -- descripción oficial de zukan (inglés)
alter table public.techniques add column if not exists image_url text;     -- imagen de zukan
alter table public.techniques add column if not exists zukan_types jsonb;  -- categorías de zukan (Shot, Defence, Shot Block…)
alter table public.techniques add column if not exists traits jsonb;       -- tiro largo, bloqueo de tiros… (WazaData chr)
-- Columnas propias de la tabla (se rellenan en Supabase y con supabase/technique_balance.sql; seed.sql no las toca):
alter table public.techniques add column if not exists victorymods_id bigint;        -- id en victorymods (datos de Victory Road)
alter table public.techniques add column if not exists vr_power_min int;             -- potencia mínima / máxima del juego (Victory Road)
alter table public.techniques add column if not exists vr_power_max int;
alter table public.techniques add column if not exists vr_tp int;                    -- TP del juego
alter table public.techniques add column if not exists vr_recast_time int;
alter table public.techniques add column if not exists vr_category text;             -- Tiro | Regate | Bloqueo | Parada
alter table public.techniques add column if not exists vr_participants int;
alter table public.techniques add column if not exists vr_aura_type text;
alter table public.techniques add column if not exists balance_tp int;               -- TP nuevo, balanceado: el que enseña la app
alter table public.techniques add column if not exists balance_power_min int;        -- potencia mínima / máxima que le corresponde a ese TP
alter table public.techniques add column if not exists balance_power_max int;
alter table public.techniques add column if not exists source text;                  -- null = de la carga; otro valor = fila añadida a mano (no se toca)

create table if not exists public.cards (
  id           text primary key,             -- <personaje>--<juego>--<versión>
  character_id text not null references public.characters(id) on delete cascade,
  name         text not null,
  game         text not null,                -- IE1 | IE2 | IE3 | GO1 | GO2 | GO3 | ARES | ORION | VR
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
  zukan_no     int,                          -- nº oficial de la ficha de zukan de esta carta (foto)
  raw_stats    jsonb,                        -- stats originales del juego (nivel 99)
  is_version   boolean not null default false -- true = versión extra (Strikers / protagonistas GO)
);
alter table public.techniques add column if not exists name_es text;
alter table public.techniques add column if not exists name_fr text;   -- doblaje francés (wikis es/fr)
alter table public.techniques add column if not exists name_it text;   -- doblaje italiano (wikis es/it)
alter table public.characters add column if not exists zukan_no int;
alter table public.cards add column if not exists zukan_no int;
alter table public.cards add column if not exists description text;
alter table public.cards add column if not exists description_es text;   -- descripción en castellano (inazuma.fandom.com/es)
alter table public.cards add column if not exists no int;                -- nº de la carta: el de zukan o, las nuestras, desde el último de zukan
alter table public.cards add column if not exists specials jsonb;        -- Keshin / Keshin Armed / Soul (tótem) / Mixi Max
alter table public.cards add column if not exists extra_teams jsonb;     -- equipos sin cartas propias en los que juega (Caos)
alter table public.cards add column if not exists duel_att int;           -- duelo a mano (CRUD); null = se calcula
alter table public.cards add column if not exists duel_con int;
alter table public.cards add column if not exists duel_def int;

create index if not exists cards_character_idx on public.cards(character_id);
create index if not exists cards_ovr_idx on public.cards(ovr desc);
create index if not exists cards_game_pos_idx on public.cards(game, position);

create table if not exists public.teams (
  name        text primary key,              -- nombre del equipo en las cartas (inglés)
  name_es     text                           -- nombre en castellano (inazuma.fandom.com/es)
);
alter table public.teams add column if not exists name_fr text;        -- doblaje francés
alter table public.teams add column if not exists name_it text;        -- doblaje italiano
alter table public.teams add column if not exists logo_url text;       -- escudo (inazuma-eleven.fandom.com)
alter table public.teams add column if not exists logos jsonb;         -- escudo de otras épocas {GO, ARES, VR} si cambia

create table if not exists public.staff (      -- cuerpo técnico (zukan), de momento sin stats
  zukan_no     int primary key,              -- nº oficial en zukan.inazuma.jp
  name         text not null,
  role         text not null,                -- Manager (entrenador) | Coach (segundo entrenador) | Coordinator (gerente)
  team         text,
  teams        jsonb,
  games        jsonb,                        -- juegos de la saga principal
  age          text,
  element      text,
  image_url    text,
  description  text,                         -- descripción oficial de zukan (inglés)
  wiki_page    text
);

create table if not exists public.zukan (      -- réplica de las fichas oficiales de zukan.inazuma.jp (todas las sagas)
  no           int primary key,              -- nº oficial
  image_id     text,                         -- ruta de la imagen (dxi4wb638ujep.cloudfront.net/1/<id>.png)
  name         text not null,
  name_ja      text,                         -- nombre en japonés (zukan en japonés)
  role         text,                         -- Player | Manager | Coach | Coordinator…
  age          text,
  element      text,
  position     text,
  teams        jsonb,
  games        jsonb,
  description  text,                         -- descripción oficial (inglés)
  vr_lv50      jsonb,                        -- stats oficiales de Victory Road a nivel 50
  wiki_page    text
);
alter table public.zukan add column if not exists name_ja text;

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
  foreach t in array array['characters','techniques','cards','card_techniques','teams','staff','zukan'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "public read" on public.%I', t);
    execute format('create policy "public read" on public.%I for select using (true)', t);
  end loop;
end $$;
