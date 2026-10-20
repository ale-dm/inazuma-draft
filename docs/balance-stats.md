# Stats de las cartas desde el balance del mod (nivel 40)

> **Estado:** aplicado (2026-10-20). IE1, IE2 e IE3 usan las stats del mod de Victory Road;
> Ares, Orion, GO y VR siguen con las suyas.
> **Fuente:** `C:\Program Files (x86)\Steam\steamapps\common\INAZUMA ELEVEN Victory Road\EditorMods\`
> (explicación completa en `balance_stats_para_otra_conversacion.md` de esa misma carpeta).

## Qué se ha hecho

1. `tools/db/import_stats_mod.py` lee los JSON del editor del mod y cruza cada carta de la app
   (IE1/IE2/IE3) con su ficha del juego:
   - `balance_medias.json`: cartas de Supabase y modelo del juego (`codes`).
   - `balance_base.json`: crecimiento, libertad y stats base.
   - `balance_last.json`: **stats finales de nivel 200** (lo que genera el mod).
   - `balance_versiones.json` / `balance_copies.json`: copias de versión (Axel IE2/IE3, Mark IE2/IE3…).
   - `proyecto.json`: temporada de cada ficha.
   El cruce usa el código de modelo (`c01000100` → `crc32` → `chara` de la ficha) y, si la carta no
   está enlazada, el nombre + juego + equipo de las **copias de versión** (46 en el último balance).
   El resultado se guarda en `data/stats_mod.json` (2.320 cartas).
2. `tools/db/stats_mod.py` (lo llama `build.py` después de `apply_tuning`):
   - reescala las 7 stats a la media (OVR) de la carta si la copia se calculó con otra media;
   - las pasa a **nivel 40** con la curva de Character Reforged:
     `factor` 1,50/1,35/1,25 y exponente 1,6/1,0/0,6 según el crecimiento;
   - guarda `stats40` (7 stats), `growth` y `freedom` en la carta;
   - calcula las 6 stats del motor con las mismas fórmulas de duelo del juego, normalizadas por puesto
     a la escala 25–99 y ajustadas para que su media ponderada siga siendo el OVR.
3. La ficha del jugador (`CardInfo`) enseña las **7 stats a nivel 40** con los iconos del juego, la
   letra por cuantiles, la libertad y los **7 duelos**. Las cartas sin datos del mod (GO, Ares, Orion,
   VR y 15 fichas de IE1-3 sin fila) siguen con las 6 stats de siempre.

## Cobertura

| Juego | Cartas | Con stats del mod |
|---|---:|---:|
| IE1 | 1.014 | 1.014 |
| IE2 | 673 | 666 |
| IE3 | 648 | 640 |
| GO1/GO2/GO3 | 1.704 | — |
| Ares / Orion | 406 | — |
| VR | 943 | — |
| **Total** | **5.388** | **2.320** |

Las 15 fichas de IE1-3 sin datos son las que no están enlazadas en `card_victorymods_map` ni en una
copia de versión (los Chaos de IE2 que faltan, Bellatrix, Shawn IE3…); se quedan con las 6 stats
anteriores y sin bloque de nivel 40.

## Modelo 3: reparto por puesto

El balance del mod reparte el total de puntos `T` de cada jugador (el que da su media) en dos partes:
**60 %** con el perfil ideal de su puesto (`PROFILE`) y **40 %** con su reparto propio. El perfil se mezcla
un **30 %** con el puesto secundario (el de la ficha del juego si Supabase dice otro).

| Puesto | Kick | Control | Technique | Pressure | Physical | Intelligence | Agility |
|---|---:|---:|---:|---:|---:|---:|---:|
| DEL | 27 | 21 | 10 | 5 | 15 | 14 | 8 |
| MED | 14 | 23 | 25 | 8 | 9 | 12 | 9 |
| DEF | 5 | 6 | 16 | 19 | 18 | 27 | 9 |
| POR | 7 | 8 | 8 | 12 | 19 | 19 | 27 |

El **puesto es el de la carta de Supabase de esa versión**, no el de la ficha del juego: Shawn IE2 en
Raimon reparte como delantero y su ficha de Alpine como defensa; Mark IE2 reparte como defensa.

La app **no recalcula** este paso: `import_stats_mod.py` lee `balance_last.json`, donde ya está aplicado,
y usa la copia de versión que corresponde por nombre + juego + equipo. Ejemplos del último balance:
Axel IE3 (nivel 200) `419 / 391 / 285 / 148 / 252 / 249 / 175` → a nivel 40
`142 / 133 / 97 / 50 / 86 / 84 / 60`.

## Fórmulas

- Peso de la media por stat: principal `1,0`, secundaria `0,5`, resto `0,15` (roles del mod).
- `f(media) = 1,70 ^ ((media − 68) / 31)`; la media es el OVR de la carta.
- Nivel 40: `v99 = round(v200 / factor)`, `lv1 = round(v99 × 0,10)`,
  `v40 = round(lv1 + (v99 − lv1) × (39/98)^exp)`.
- 7 stats: Kick, Control, Technique, Pressure, Physical, Intelligence, Agility.
- Duelos: Tiro `K+C`, Regate AT `T+C+½K`, Regate DF `T+I+½A`, Scramble AT `I+Ph`,
  Scramble DF `I+P`, Muro `P+Ph`, Parada `2P+3Ph+4A`.

## Regenerar

```powershell
python tools/db/import_stats_mod.py "C:\Program Files (x86)\Steam\steamapps\common\INAZUMA ELEVEN Victory Road\EditorMods"
python tools/db/build.py
```

`import_stats_mod.py` necesita el editor del mod y sus `balance_*.json`; `build.py` solo necesita
`data/stats_mod.json`, que está en el repo. No se guarda ninguna clave de Supabase en el repo: las medias
se leen del `balance_medias.json` que descarga el editor.

## Avisos

- `stats40` es la fuente de la ficha; las 6 stats (`shooting`…`goalkeeping`) siguen siendo las del motor
  de duelos/simulación y se derivan de las 7 para que la carta sea coherente.
- Si se vuelve a lanzar `import_stats_mod.py` después de cambiar medias en Supabase, hay que regenerar
  `data/stats_mod.json` y el build.
- La curva de nivel 40 es la de Character Reforged; si el juego cambia de nivel de referencia, se cambia
  `LEVEL` en `tools/db/stats_mod.py`.
