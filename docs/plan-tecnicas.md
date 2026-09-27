# Plan: supertécnicas (hissatsu)

> Estado: **aparcado**. Investigación hecha y verificada con datos reales; falta implementar.

## Objetivo

- Cada jugador con sus técnicas reales **del juego del que viene** (IE1, IE2, IE3, GO1, GO2, GO3).
- Coste de cada técnica como medida de su potencia.
- En el juego: técnicas visibles en la carta, goles narrados con la técnica de tiro y paradas con la técnica de portero.

## Fuente de datos: wiki de Fandom (inglés)

Las páginas normales de la wiki están bloqueadas por Cloudflare, pero **la API de MediaWiki funciona**:
`https://inazuma-eleven.fandom.com/api.php`

| Qué | Dónde | Cómo |
|---|---|---|
| Técnicas de cada jugador por juego | `Module:PlayerData/IE`, `/IE2`, `/IE3`, `/GO`, `/CS`, `/GX` | `action=parse&page=Module:PlayerData/GX&prop=wikitext` → tabla Lua; cada jugador tiene `moveset = { IE = {...}, IE2 = {...}, ... }` |
| Nombre inglés del jugador → ficha de la wiki | Redirecciones de la wiki | `action=query&titles=<nombres>&redirects=1` (lotes de 50). Ej.: *Axel Blaze* → *Gouenji Shuuya* |
| Identificador de técnica → página | `Module:WazaData` | Cada técnica tiene `page="..."` (a veces nombre japonés romanizado) |
| Nombre inglés, tipo y **coste** de cada técnica | Ficha de la técnica (plantilla `{{Hissatsu}}`) | `action=query&prop=revisions&rvprop=content&titles=...` (lotes de 50). Campos: `name_dub`, `type`, `tp_iego3`, `tp_ie3`, `tp_iego2`, `tp_ie2`… |

Correspondencia de juegos: IE1→`IE`, IE2→`IE2`, IE3→`IE3`, GO1→`GO`, GO2→`CS` (Chrono Stones), GO3→`GX` (Galaxy).

> ⚠️ El coste hay que leerlo de la **ficha de cada técnica** (`tp_*`), no de `Module:WazaData`, que tiene menos datos (p. ej. Psycho Shot no tiene coste de IE3 en el módulo, pero sí en su ficha: 20).

## Reglas decididas

1. **Técnicas:** las del juego del jugador (`moveset[<juego>]`).
2. **Coste:** `tp_iego3` (Galaxy) → si no, `tp_ie3` (IE3) → respaldo `tp_iego2` (Chrono Stones) → `tp_ie2` (IE2).
   Galaxy (8–85) e IE3 (12–76) tienen escalas parecidas, así que se mezclan sin normalizar.
   No se usa la **potencia**: las escalas varían mucho entre juegos (Fire Tornado: Galaxy 70, IE3 28).
   Tampoco Victory Road: es demasiado tosca (casi todo 50–70).
3. **Tipos útiles:** `Shoot`, `Dribble`, `Block`, `Catch`. Se descartan las habilidades pasivas (`Parameter`, `Field`, `Command kyouka`…).
4. **Limpieza de nombres:** `{{PAGENAME}}` → nombre de la página; quitar `*` inicial y sufijos `(game)`, `(games)`, `(EU)`, `(games & anime)`…; si hay varias versiones del nombre, preferir la del juego.

## Cobertura medida (sept. 2026)

- Jugadores con técnicas en su juego: **2.500 / 2.530**. Los que faltan son secundarios (Andy, Othello Go…) sin datos en ese juego.
- Técnicas por jugador: 4 → 1.406 · 3 → 896 · 2 → 140 · 1 → 13 · 5–6 → 6 · media 3,5.
- Técnicas distintas usadas: 573 (215 tiro, 126 bloqueo, 116 regate, 112 parada).
- Coste desde la ficha: **Galaxy 320 + IE3 253 = 573 (100 %)**.

## Equipos que añadir: Second Raimon (IE2)

No existe en el juego: en IE2 falta el Raimon protagonista. Página: `Second_Raimon`, tabla `{{#invoke:MemberTable|main |caption=Main members |game=IE2 ...}}`. Las claves `pN=` son las mismas de `Module:PlayerData`.

Miembros principales (nombre inglés, posición, técnicas de IE2):

| Clave | Jugador | Pos. | Técnicas IE2 |
|---|---|---|---|
| Endou | Mark Evans | GK | God Hand, Fist of Justice, The Earth… |
| Kabeyama | Jack Wallside | DF | The Wall, Mole Fake, Stone Wall |
| Tsunami | Hurley Kane | DF | Spinning Cut, Whale Guard… |
| Tachimukai | Darren LaChance | GK | God Hand, Big Fan… |
| Kogure | Scott Banyan | DF | Whirlwind Force, About Face, Bewildered… |
| Rica | Suzette Hartland | FW | Butterfly Trance, Prima Donna… |
| Touko | Victoria Vanguard | MF | The Tower, Rainbow Arc, Acrobat Bomber |
| Fubuki | Shawn Froste | FW | Freeze Shot, Legendary Wolf… |
| Gouenji | Axel Blaze | FW | Fire Tornado, Inazuma Drop, Fireball Storm |
| Megane | William Glass | FW | Jinx, Black Magic… |
| Domon | Bobby Shearer | DF | Killer Slide, Volcano Cut, Triple Boost |
| Kidou_Blue | Jude Sharp | MF | Twin Boost, Death Zone 2… |
| Ichinose | Erik Eagle | MF | Spinning Shot, Flame Dance, The Phoenix |
| Nakatani | Eugene Conwell | FW | Heel Kick, Freeze Shot… |

- Hay variantes de forma (`Kogure_CC`, `Fubuki_U`, `Fubuki_CC`): quedarse con **una por jugador**.
- Las stats se copian de la versión del jugador que ya existe en el juego (Raimon IE1, Alpine, Mary Times…).
- La foto sale sola: basta con ejecutar `node tools/zukan-images.mjs` después de añadirlos.
- El mismo método sirve para cualquier otro equipo con página en la wiki.

## Pasos de implementación

1. `tools/wiki-hissatsu.mjs`: descarga (con caché en `tools/.cache/`), cruce, reglas de coste, limpieza de nombres → genera `src/data/hissatsu.ts` (técnicas por id de jugador + catálogo de técnicas con nombre, tipo, elemento, coste y juego de origen del coste).
2. Cartas del draft: mostrar las técnicas con su coste.
3. Motor: el goleador usa una de sus técnicas de tiro (más probable cuanto más coste); nuevos eventos de parada con técnicas de portero.
4. Pie de página: atribución a la wiki de Fandom (licencia **CC BY-SA**).
5. Second Raimon (y otros equipos que falten).
