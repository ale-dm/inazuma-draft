# Plan: base de datos de jugadores (mega actualización)

> Estado: **implementado** (primera versión). Ver «Uso» al final.
> Objetivo: una base completa de jugadores (stats, OVR, categoría, técnicas, fotos) para una futura app tipo MadFut / Pacybits, reutilizando el draft actual.
> Complementa [`plan-tecnicas.md`](./plan-tecnicas.md).

## 1. Qué cartas existen

**Fuente de personajes: zukan** (`https://zukan.inazuma.jp/en/chara_list/?page=N`, 110 páginas, 5.456 fichas, 5.283 jugadores). Cada ficha trae nombre inglés oficial, posición, elemento, equipos, juegos donde aparece y el id de imagen (`data-chara-id`), que `tools/db/build.py` asigna a cada carta.

Reglas:

1. **Una carta por personaje, en su primer juego** de la saga principal (IE1 → IE2 → IE3 → GO1 → GO2 → GO3), con las stats, técnicas y equipo de ese juego.
   - Ej.: un scout que sale en IE2, IE3 y Galaxy → solo la carta de IE2. El Otaku → solo IE1.
2. **Versiones extra solo para quien tiene formas en Strikers 2013** (una carta por forma): Raimon form → IE1, Second Raimon / Raimon II → IE2, Inazuma Japan → IE3, Dark Emperors, Chaos, Neo Japan, Adult → GO…
   - Ej.: Nathan Swift → IE1 (Raimon), IE2 (Raimon) + IE2 (Dark Emperors), IE3 (Inazuma Japan), adulto GO.
3. **Protagonistas de la saga GO** (Strikers 2013 no cubre Galaxy y apenas las épocas GO): versiones como en la saga original:
   - **GO2:** Raimon (GO2) y **Chrono Storm**, con los jugadores en su **forma Mixi Max directa** (pre-mixed).
   - **GO3 (Galaxy):** Inazuma Japan / Earth Eleven.
4. **Fuera por ahora:** los ~1.156 personajes que solo aparecen en Ares, Orion o Victory Road (no tienen stats de los juegos clásicos). Otro tema.
5. **Formas especiales fuera de las cartas base** (irán como cartas especiales más adelante): Real Inazuma y Mixi Max (salvo el Chrono Storm de GO2).
6. **Jugadores que no están en Victory Road** (licencias): importarlos de la wiki, con su imagen de la wiki:
   - **Hide Nakata** (`Nakata Hidetoshi`): MED, stats en IE2/IE3.
   - **Pants** (`Pants`, "Riku 'Pants' Matsushita"): DEF, stats en IE3, GO2, GO3.
   - *(El "Poseidon" de IE3 es Paul Siddon, portero del Zeus: ya existe.)*

Estimación: ~3.828 personajes + versiones de Strikers y protagonistas GO ≈ **3.900–4.000 cartas**.

## 2. Fuentes de datos

| Dato | Fuente | Cómo |
|---|---|---|
| Personajes, nombre inglés, foto | zukan | ver arriba |
| Nombre inglés → ficha de la wiki | Fandom (redirecciones) | `api.php?action=query&titles=…&redirects=1` (lotes de 50). 2.593/2.595 nombres nuevos resuelven |
| **Stats reales por juego (nivel 99)** | Sección `==Parameters==` de la ficha del jugador | `prop=revisions&rvprop=content` (lotes de 25). IE1 → usar la **versión europea** (la japonesa es plana, 84/84/84…) |
| Técnicas por juego | `Module:PlayerData/{IE,IE2,IE3,GO,CS,GX}` | ver `plan-tecnicas.md` |
| **Rangos Strikers 2013** (escala común a todas las épocas) | Tab `Inazuma Eleven GO Strikers 2013` en Parameters | letras S/A/B/C/D por forma |
| **Cambios del Xtreme** (mod de la comunidad) | [Balancing doc](https://docs.google.com/document/d/1PT3LSxd1CUyhkHUD9xtpZdm4zmhScg-ZvIW6Yz1wy0M/) (`/export?format=txt`) | 96 personajes con cambios de stats (rangos con +: A+, S+…) |
| Rangos completos del Xtreme (16 personajes) | [Wiki del Xtreme](https://iegos13xtreme.fandom.com) (plantilla `{{Stats|…}}`) | API MediaWiki |
| Jugadores destacados (scouts meta, etc.) | [Blog competitivo IE3](https://site.nicovideo.jp/ch/userblomaga_thanks/archive/ar873915), [tier list Galaxy](https://site.nicovideo.jp/ch/userblomaga_thanks/archive/ar1490572), [hilo Fandom](https://inazuma-eleven.fandom.com/f/p/2963766375350613164) | lista manual de destacados |

> Las páginas normales de Fandom y atwiki están tras Cloudflare/403; **la API de MediaWiki sí funciona**. Las stats numéricas completas del Xtreme no son públicas (solo dentro del juego, con Strikers2013Editor).

## 3. Cálculo del OVR (estilo FIFA, techo 94 para cartas base)

Stats de la carta: **Tiro, Control, Físico, Velocidad, Defensa, Parada** (Parada solo relevante en porteros).

Conversión de las stats de los juegos:

| Común | Saga IE | Saga GO |
|---|---|---|
| Tiro | Kick | Kick |
| Control | Control | (Dribbling + Technique) / 2 |
| Físico | (Body + Stamina) / 2 | Stamina |
| Velocidad | Speed | Speed |
| Defensa | Guard | Block |
| Parada | (Guard + Guts) / 2 | Catch |

Pesos por posición: DEL Tiro .5 · Control .2 · Velocidad .15 · Físico .15 — MED Control .4 · Velocidad .2 · Tiro .2 · Defensa .1 · Físico .1 — DEF Defensa .5 · Físico .25 · Velocidad .15 · Control .1 — POR Parada .6 · Físico .2 · Defensa .2.

**Niveles de importancia:**

| Nivel | Quién | Cómo se calcula el OVR |
|---|---|---|
| **S** | Personajes con Strikers 2013 / Xtreme (~270 versiones) | Rangos → escala: **S+ 92 · S 88 · A+ 84 · A 80 · B+ 76 · B 72 · C+ 68 · C 64 · D 56 · E 48**; prioridad **wiki Xtreme > balancing doc Xtreme > Strikers 2013**; ±3 según sus stats reales en su juego (percentil) |
| **A** | Importantes fuera de Strikers: aparecen en ≥4 juegos o en otros spin-offs | 66–84 según el percentil de sus stats en su juego y posición |
| **B** | Jugadores de equipos con nombre (rivales de la historia) | 56–77 |
| **C** | Scouts / sin equipo ("Unaffiliated", "Sub Character") | 44–72: **60 % stats + 40 % mejor técnica**; +5 si su mejor técnica está en el 5 % más caro **de su saga**; máx. 80 |

Ajustes:

- En todos: +0,5 × época (IE1 0 · IE2 1 · IE3 2 · GO1 2 · GO2 3 · GO3 4).
- La **línea principal de un personaje nunca baja** entre juegos **dentro de la misma posición** (las formas alternativas —Dark Emperors, Chaos, Atsuya…— van aparte).
- **Cambios de posición por forma:** p. ej. **Mark Evans en IE2 es líbero (DEF)** — en Strikers 2013 su forma Second Raimon tiene Catch A (Darren es el portero).
- **Destacados de la comunidad** (lista editable): recomendados → mínimo **Advanced (78)**; tier más alta → mínimo **Top (83)**. Ej.: Leonardo Almeida, Chucky Cardaway (Sutefuda), Verne Spring (Seiryuu), Calla de Wild (Mika), Dos Lightning (Retsuya), Gale Mistral (Kiyoraka), Una Lightning (Kirika)…

Distribución del prototipo (2.451 cartas actuales): mediana 64 · p90 80 · p99 88 · máx 92.

## 4. Categorías

| Categoría | OVR |
|---|---|
| **Legendary Player** | 89–94 |
| **Top Player** | 83–88 |
| **Advanced Player** | 75–82 |
| **Growing Player** | 65–74 |
| **Common Player** | < 65 |

## 5. Técnicas en la carta

- **Para valorar** una técnica (y subir a un scout): coste **de la saga del jugador** — saga original: IE3 → IE2 → IE1; saga GO: GO3 → GO2 → GO1.
- **Para mostrar** en la carta: coste de **Galaxy** si existe; si no, el que haya.
  - Ojo: a veces cambia mucho (Gungnir: 66 en IE3, 30 en Galaxy).

## 6. Problemas conocidos a corregir

- Cruces de nombres aproximados con la wiki/doc del Xtreme: hacen falta **equivalencias a mano** (Goldie Lemmon, Tezcat y Aum Nirvana recibieron stats ajenas; faltan Nepper, Rhionne, IC, Kino Aki, Yukimura Hyouga…).
- Las stats de la wiki del Xtreme deben aplicarse a la **forma/época correcta** (Darren IE2 salía con 92 por usar su forma de IE3).
- Revisar a mano casos como Paul Peabody (83–86 por sus notas de Strikers).

## 7. Base de datos: Supabase

- Proyecto: `https://xacgoiaejdgjrvvsnqyi.supabase.co` (la clave *publishable* es pública por diseño; puede ir en el frontend).
- La conexión directa (`db.….supabase.co`) es solo IPv6 → desde el entorno de desarrollo usar la URI de **Session pooler** (IPv4) en la variable de entorno **`SUPABASE_DB_URL`**. Nunca subir contraseñas al repo.
- **Los scripts del repo son la fuente de verdad del catálogo**: generan jugadores y técnicas y los vuelcan a Supabase; si cambia una regla, se regenera y se recarga.
- Tablas previstas (catálogo): personajes, cartas (versiones), técnicas, técnicas por carta, equipos, excepciones/destacados. Más adelante: usuarios, colecciones, sobres, intercambios.
- Imágenes: guardar el **id de zukan** y enlazar (no redistribuir); Nakata y Pants desde la wiki.

## 8. Estructura prevista en el repo

```
tools/
  db/                       descarga con caché (zukan, wiki, Strikers, Xtreme) + cálculo
data/
  legacy-teams.json         equipos por juego del draft original ("nombre|juego" → equipo)
  overrides.json            excepciones editables: equivalencias de nombres, posiciones por forma,
                            destacados, ajustes manuales
supabase/
  schema.sql                esquema del catálogo
build/                      salida generada: players.json, review.csv (para revisar a mano)
```

## 9. Uso

```bash
python3 tools/db/fetch.py            # descarga todas las fuentes (caché en tools/.cache/db/, ~10 min la primera vez)
python3 tools/db/build.py            # genera build/players.json, build/review.csv, build/report.txt y supabase/seed.sql
```

- **Revisar:** `build/review.csv` (todas las cartas con OVR, categoría, stats y técnicas) y `build/report.txt` (avisos).
- **Ajustar:** editar `data/overrides.json` (destacados, posiciones por versión, equivalencias de nombres, OVR manual) y volver a ejecutar `build.py`.
- **Cargar en Supabase:** al hacer push a `main` de cambios en `supabase/`, el workflow `.github/workflows/db-load.yml` aplica `schema.sql` + `seed.sql` con el secreto del repo `SUPABASE_DB_URL` (también se puede lanzar a mano desde Actions → "Load player database into Supabase").

Primera generación: **3.903 cartas** (3.806 personajes + 97 versiones), 587 técnicas · Legendary 36 · Top 233 · Advanced 516 · Growing 771 · Common 2.347 · OVR mediana 61, p90 79, máx 92.

## 10. La app

- La app carga el catálogo desde Supabase al arrancar (`src/data/catalog.ts`, clave publishable) y ya no incluye datos de jugadores en el código.
- **Draft/torneo:** los pools son los grupos juego + equipo con ≥ 8 cartas (sin scouts ni adultos).
- **Sección Jugadores** (`#/jugadores`): buscador con filtros (posición, categoría, juego, elemento, equipo, OVR mínimo), navegación Juego → Equipos → Plantilla y ficha con stats, supertécnicas y otras versiones.
- Para usar otro proyecto de Supabase: variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_KEY` (clave publishable).
