# Plan: balance de rivales por temporadas (historia)

> Estado: **IE1 hecho**; IE2, IE3, GO1, GO2, GO3, Ares y Orion **pendientes**.
> Objetivo: que la curva de nota de los rivales de la historia (una temporada = un juego) sea coherente y siga el
> orden de los partidos, con las reglas de abajo.
> Complementa [`plan-base-jugadores.md`](./plan-base-jugadores.md) §3 (OVR) y §9 (`team_tuning`).
> Se ajusta **solo con datos** (`data/overrides.json`) + `tools/db/tuning.py`; no hace falta tocar la app.

## 0. Reglas de diseño

1. **El capitán es siempre la estrella (#1) del equipo.** Ningún compañero puede superarlo. Se consigue **subiendo al
   capitán** hasta 1 por encima del mejor compañero (con su tope propio), no bajando al resto.
2. **Cada temporada es una rampa**: los equipos suben de nota según el orden de la historia (wiki de Fandom / episodios
   del anime).
3. **Escala de poder tipo IE1**: cada temporada queda por debajo de la siguiente.
   - IE1 entero **justo por debajo de GO1** (techo GO1 = 83,9).
   - Los jefes finales (Zeus, Royal Academy en IE1) son la excepción "fuertes": quedan **justo** por debajo del techo de
     la siguiente temporada, no a media tabla.
4. **Dispersión comprimida**: dentro de un equipo no puede haber un crack suelto muy por encima de la media (los
   jugadores "S" de Strikers 2013 inflan a algunos; p. ej. Kirigakure 85 en un equipo de media 81). Se comprime la
   dispersión hacia la media (`compress`).

## 1. Dónde se ajusta

`data/overrides.json` → `team_tuning.<JUEGO>.<equipo>`:

| campo | qué es |
|---|---|
| `top11` | **media objetivo del once titular** (las 11 mejores cartas del equipo) |
| `captain` | ficha de la wiki del capitán (nombre inglés/japonés de la página) |
| `captain_cap` | techo propio del capitán (opcional; por defecto, el techo del juego) |
| `compress` | 0–1: cuánto se comprime la **dispersión** del equipo hacia su media (opcional; 1 = no comprime) |
| `floor` | suelo del equipo: nadie por debajo (opcional) |
| `note` | sitio en la historia, para leer la rampa |

`data/overrides.json` → `team_tuning._game.<JUEGO>`:

| campo | qué es |
|---|---|
| `cap` | techo de las subidas (mín. 88). Nadie baja por el techo |
| `compress` | `compress` por defecto del juego (IE1: 0,5) |
| `compress_above` / `compress_factor` | comprime las notas **por encima** de un valor (GO1: 84 → ½, 92 → 88) |
| `captain_plus` / `captain_raise` | cuánto destaca el capitán sobre el once (4) y cuánto puede subir (6) |

`data/overrides.json` → `ovr_manual` (`"<ficha>|<juego>|<versión>": ovr`): OVR fijado **a mano** por carta. Manda **al
final**, por encima de la curva y de todas las reglas (también en equipos ajustados). Lo usa para retoques finos
(Raimon, Royal Academy §6).

`data/overrides.json` → `scout_pool.<JUEGO>`: OVR del pool **sin equipo** por percentiles del propio pool (`stats` =
`ovr_raw`, `tech` = mejor TP de las técnicas del juego indicado en `cost`) con rango y tope (`cost`, `stats`, `tech`,
`lo`, `hi`, `cap`, `bonus`). IE1 usa el **TP de IE1 EU** (no el de IE3), 50 % stats + 50 % técnica, 46–79, cap 79. Lo
aplica `apply_scout_pool` (`tuning.py`) antes de las curvas.

**Mecanismo** (`tools/db/tuning.py` → `apply_tuning`), en orden:

1. Guarda la nota de partida (`ovr_untuned`).
2. **Curva del equipo**: `new = round(top11 + (raw − media_once_raw) × compress)`. Nadie pasa del techo; nadie sube por
   encima de su nota raw (nadie baja por el techo).
3. **Capitán**: `+2` y cerca de 4 por encima del once (subida máx. `captain_raise`, tope `cap`/`captain_cap`).
4. **+1 a los más flojos del once** hasta clavar `top11` (corrige el redondeo).
5. **Capitán #1**: si algún compañero supera al capitán, el capitán sube hasta ponerse 1 por encima (tope
   `captain_cap`). *(regla nueva)*
6. Stats y categoría se desplazan con el delta; el `floor` se aplica al final.

## 2. Receta para una temporada (paso a paso)

1. Caché y build: `python3 tools/db/fetch.py` (si falta) → `python3 tools/db/build.py`.
2. **Tabla de la temporada**: media del once, estrella y capitán por equipo (§4).
3. **Techo de referencia**: comparar con el mejor once de la temporada siguiente (criterio "por debajo").
4. **Rampa**: ordenar los equipos por el orden de la historia y fijar `top11` de cada uno (subiendo de a poco).
5. **Cracks sueltos**: si algún equipo flojo tiene un jugador muy por encima, bajar `compress` (IE1: 0,5).
6. **Recompilar** y **verificar**: rampa correcta, capitán #1 en todos, sin avisos nuevos en `build/report.txt`.
7. **Guardar** la tabla resultante en §3 y marcar la temporada como *hecho*.
8. Si toca la escala global, re-ejecutar `npm run balance`.

## 3. Estado por temporada

### IE1 — hecho

Rampa (media del once): Sallys 58 · Kids FC 62 · Umbrella 65,1 · Occult 69,1 · Wild 70,7 · Brain 72,2 · Otaku 73,7 ·
Inazuma Eleven 77,5 · Shuriken 78,2 · Farm 79 · Kirkwood 80 · **Royal Academy 81,5 · Zeus 83,8** (justo bajo GO1 83,9).
`compress: 0,5`. Capitán #1 en todos. Notas finales (estrella):

| Equipo (ES) | Once | #1 | Estrella / Capitán |
|---|--:|--:|---|
| Sallys | 58,0 | 65 | Alf Holmes |
| Inazuma Kids FC | 62,0 | 70 | Millie Moonlight (antes 83) |
| Umbrella | 65,1 | 69 | Alan Most |
| Occult | 69,1 | 79 | Johan Tassman |
| Wild | 70,7 | 76 | Hugo Tallgeese |
| Brain | 72,2 | 81 | Thomas Feldt (antes ~84) |
| Otaku | 73,7 | 78 | Spencer Gates |
| Inazuma Eleven | 77,5 | 84 | Seymour Hillman |
| Shuriken | 78,2 | 82 | Sail Bluesea (antes 85) |
| Farm | 79,0 | 83 | Tom Walters |
| Kirkwood | 80,0 | 85 | Marvin Murdock (antes 88) |
| Royal Academy | 81,5 | 87 | Jude Sharp (Kidou, antes 83) |
| Zeus | 83,8 | 88 | Byron Love |

Referencia de techo de GO1: Raimon 83,9 · Oscuridad Ancestral 83,5 · Luz Eterna 82,5.

### Pendientes (objetivos actuales, de `plan-base-jugadores.md` §9)

| Temporada | Estado | Notas |
|---|---|---|
| IE2 | pendiente | Gemini Storm 76,5 → … → Génesis 86 |
| IE3 | pendiente | Big Waves 76 → … → Little Gigantes 86,5 |
| GO1 | pendiente | Vía Láctea 74,5 → Luz Eterna 82,5 → Oscuridad Ancestral 83,5 (techo 87) |
| GO2 | pendiente | Protocolo Omega 76 → … → Aullido Lunar 87 (techo 90) |
| GO3 | pendiente | Dragones de Fuego 73 → … → Supernova/Big Bang 84,5 (techo 90) |
| Ares | pendiente | Bastión 76,5 → … → Barcelona Orb 87 (techo 88) |
| Orion | pendiente | Bisonte Rojo 76 → … → Eclipse de Orión 87 (techo 91) |

Cada temporada pendiente: revisar la rampa con la receta §2 (aplicar `compress`, capitán #1 y el criterio "por debajo de
la siguiente") y anotar aquí el resultado.

## 4. Script de revisión

Imprime la rampa de una temporada con la estrella y el capitán de cada equipo:

```python
import json
from collections import defaultdict
d = json.load(open('build/players.json'))
ov = json.load(open('data/overrides.json'))
es = {t['name']: t.get('name_es') or t['name'] for t in d['teams']}
G = 'IE1'  # <-- temporada a revisar
cap = {t: v.get('captain') for t, v in ov['team_tuning'][G].items() if isinstance(v, dict)}
by = defaultdict(list)
for c in d['cards']:
    if c['game'] == G:
        by[c['team']].append(c)
for tm, g in sorted(by.items(), key=lambda kv: sum(sorted((c['ovr'] for c in kv[1]), reverse=True)[:11]) / 11):
    once = sum(sorted((c['ovr'] for c in g), reverse=True)[:11]) / 11
    top = max(g, key=lambda c: c['ovr'])
    cpn = (cap.get(tm) or '').lower().replace(' ', '-')
    cp = next((c for c in g if c['character_id'] == cpn), None)
    print(f"{es.get(tm, tm):22} {once:5.1f}  #1 {top['ovr']} {top['name']:20}  cap {(cp['ovr'] if cp else '-'):>3} {'OK' if cp and cp['ovr'] >= top['ovr'] else ''}")
```

Para el techo de una temporada y comparar entre temporadas:

```python
import json
from collections import defaultdict
d = json.load(open('build/players.json'))
es = {t['name']: t.get('name_es') or t['name'] for t in d['teams']}
by = defaultdict(lambda: defaultdict(list))
for c in d['cards']:
    by[c['game']][c['team']].append(c['ovr'])
for g in ['IE1', 'IE2', 'IE3', 'GO1', 'GO2', 'GO3', 'ARES', 'ORION', 'VR']:
    tm = sorted(by[g].items(), key=lambda kv: sum(sorted(kv[1], reverse=True)[:11]) / 11, reverse=True)[:3]
    print(g, ' · '.join(f"{es.get(t, t)} {sum(sorted(v, reverse=True)[:11]) / 11:.1f}" for t, v in tm))
```

## 5. Verificación

| Qué | Cómo |
|---|---|
| Build sin errores | `python3 tools/db/build.py` |
| Sin avisos nuevos | revisar `build/report.txt` (y el contador "Avisos: N") |
| Capitán #1 en todos | script §4 (columna `OK`) |
| Rampa y techos | script §4 (segundo bloque) |
| Equilibrio de partidos | `npm run balance` |

## 6. Firmas de IE1 (jugadores importantes y sus técnicas)

> Estado: **análisis rehecho con el TP de IE3; ajuste pendiente**. La idea es cuadrar el OVR con las técnicas que cada
> jugador **aprende en IE1** (la lista de `card.techniques` es la del juego de la carta, no acumulada de otros juegos).
> **Medida de fuerza = gasto (TP) que la técnica tiene en IE3** (`tp_ie3` de la wiki → `techniques.costs.IE3`), **no** el
> `balance_tp` de la hoja. Regla de [plan-tecnicas.md](plan-tecnicas.md) §2: para **valorar** una técnica se usa el coste
> de la saga del jugador, y en la saga original se prefiere `tp_ie3` (el `tp_ie` de la wiki trae **JP y EU** y el parser
> guardaba el JP; ver más abajo). La hoja reordena también (Hora celestial 150 en la hoja vs 50 en IE3; Pájaro de fuego
> 60 vs 62).

**Rango de TP de IE3 en IE1** (lo que cuesta la técnica en IE3, de la wiki):
- **Más alta: Pájaro de fuego 62.** Después Trama trama 57 · Potenciación 57 · Flecha huracán 57 · Fénix 55 ·
  Muralla infinita 55 · Triángulo Z 55 · Ruptura relámpago 52 · Pingüino emperador n.º2 52 · Sabiduría divina 52.
- **Más baja: Barrido defensivo 12.** Después Sorpresa 16 y un montón a 20 (Pisotón de sumo, Chut granada, Psicorremate,
  Embestida, Superaceleración, Torbellino dragón…). En todo el catálogo (todos los juegos) el IE3 llega a 76
  (Disparo valiente, Fuego total) y no baja de 12.

**Criterio de "firma"**: técnica **rara en IE1** (la usan ≤3 cartas de los equipos de la historia; los ~790
«Unaffiliated» del catálogo inflan los recuentos) o **combo**. Las compartidas también pesan si son caras: Trama trama
57 la llevan 2, pero Potenciación 57 la llevan 6, Flecha huracán 57 la llevan 6, Pájaro de fuego 62 la llevan 6.

Firmas raras de IE1 (por TP de IE3, de la wiki): Trama trama 57 · Muralla infinita 55 · Fénix 55 · Triángulo Z 55 ·
Ruptura relámpago 52 · Pingüino emperador n.º2 52 · Sabiduría divina 52 · Defensa triple 47 · Tornado dragón 46 ·
Muralla tsunami 42 · Puño vengativo 40 · Trampolín relámpago 37 · Tornado oscuro 34 · Mano mágica 32 · Deslizamiento de
portería 32 · Escudo de fuerza total 32 · Campo de fuerza defensivo 30 · Hojarasca 27 · Escudo de fuerza 25 · Mano
celestial 22 · Ataque de cóndor 22 · Ataque meteorito 22 · Atajo tornado 22 · Despeje de fuego 20.

Importantes por equipo (OVR actual · firma con su TP de IE3; ✔ = el #1 actual ya es el de la firma):

| Equipo | Importantes (OVR) · firma (IE3) | #1 actual |
|---|---|---|
| Sallys | Tammy Fielding 58 *(Trama trama 57)* · Samantha Moonlight 57 *(Pingüino n.º2 52)* | Alf Holmes 65 ✘ |
| Inazuma Kids FC | **Millie Moonlight 70** *(Pingüino n.º2 52)* ✔ | Millie Moonlight 70 |
| Umbrella | Joe Ingram 69 *(Atajo tornado 22, firma débil)* | Alan Most 69 |
| Occult | Ken Furan 71 *(Puño vengativo 40)* | Johan Tassman 79 ✘ |
| Wild | **Hugo Tallgeese 76** *(Potenciación 57, común)* ✔ · Leonard O'Shea 73 *(Puño vengativo 40)* | Hugo Tallgeese 76 |
| Brain | **Thomas Feldt 81** *(Campo de fuerza defensivo 30)* ✔ | Thomas Feldt 81 |
| Otaku | **Spencer Gates 78** *(Deslizamiento de portería 32)* ✔ | Spencer Gates 78 |
| Raimon Veterans | **Seymour Hillman 84** *(Ruptura relámpago 52, Mano mágica 32)* ✔ · Dom Foreman 75 *(Potenciación 57)* | Seymour Hillman 84 |
| Shuriken | **Sail Bluesea 82** *(Pájaro de fuego 62)* ✔ · Cal Trops 77 *(Segadora 48, común)* | Sail Bluesea 82 |
| Farm | **Muralla infinita 55**: Albert Green 81 (GK), Herb Sherman 81, Mark Hillvalley 80 · Kent Work 77 *(Trama trama 57)* | Tom Walters 83 ✘ |
| Kirkwood | **[Triángulo Z 55]** Marvin Murdock 85 / Thomas 83 / Tyler 82 ✔ + Potenciación 57 | Marvin Murdock 85 |
| Royal Academy | **Jude Sharp 87** *(Ruptura relámpago 52)* ✔ · David Samford 83 *(Pingüino n.º2 52)* | Jude Sharp 87 |
| Zeus | **[Hora celestial 50]** Byron 88 + Artie 84, Arion 83, Andy 82, Iggy 82 ✔ · Byron *(Sabiduría divina 52)* | Byron Love 88 |

Discrepancias con el TP de IE3 (la firma **no** es el #1): **Sallys** (Alf Holmes), **Occult** (Johan Tassman),
**Farm** (Tom Walters). **Desaparecen** las que salían con el TP de la hoja en **Shuriken** (Sail Bluesea lleva Pájaro
de fuego 62, la técnica más cara) y en **Wild** (Hugo lleva Potenciación 57, aunque sea común). Raimon (protagonista)
lleva Mark 85 *(Defensa triple 47, Mano mágica 32)*, Erik 79 *(Fénix 55)*, Jude 78 *(Ruptura relámpago 52)*, Kevin 78
*(Tornado dragón 46)*, Shadow 79 *(Tornado oscuro 34)*: Erik tiene la firma más cara que Mark, pero Mark es el capitán y
lleva dos.

**Con el TP de IE1** (`tp_ie` → `costs.IE1`): la wiki da **dos valores por técnica**, `N (JP)` / `M (EU)` (versión
japonesa y europea), que difieren en **103 de las 118** técnicas con `tp_ie` (28 con Δ≥10). Casos extremos: **Sabiduría
divina** (God Knows) JP 15 / **EU 59**; Mano celestial JP 45 / EU 21; Defensa triple JP 70 / EU 50. El parser guardaba el
**JP** (de ahí el «Sabiduría divina 15»); **corregido**: `infobox()` (`fetch.py`) ahora coge el **(EU)**, que es el del
juego en español (God Knows 59, God Hand 21, Defensa triple 50).
- Rango **IE1 EU: 10–62** (JP: 15–70). Arriba Fénix 62 · Disparo con rebotes 62 · Triángulo Z 59 · Sabiduría divina 59 ·
  Triángulo letal 59 · Muralla infinita 57 · Pingüino n.º2 / Pájaro de fuego / Flecha divina 56; abajo Barrido defensivo
  10 y un grupo a 15–17 (Giro bobina, Entrada huracán, Niebla venenosa…).
- Con el **EU** el outlier desaparece: Sabiduría divina 59 → **Byron vuelve a ser la firma de Zeus**. Con el JP salían
  **6** discrepancias (Sallys, Occult, Wild, Shuriken, Farm y Zeus); con el EU queda **Zeus cuadrada** y Shuriken sigue
  fuera (su firma rara es Escudo de fuerza 27). Con el EU, además, Pingüino n.º2 (56) supera a Ruptura relámpago (46), así
  que en Royal Academy la firma pasa a David Samford; por eso el ajuste real es el suave de abajo, no «firma = #1».

**Razonamiento con el min–max (EU 10–62)**: la escala de IE1 es **estrecha**, así que una técnica en el máximo **no**
justifica subir a nadie una barbaridad. Traducción suave a OVR, solo con la mejor técnica **rara** y dentro del equipo:

| TP EU de la mejor firma | Ajuste al OVR |
|---|---|
| ≥ 55 | +2 |
| 45–54 | +1 |
| 30–44 | 0 |
| < 30 | −1 |

Siempre **por debajo del capitán** y sin romper la rampa: con esto las firmas se separan 0–2 puntos del #1, no lo que
pediría el TP en crudo. Con IE3 el orden de las firmas es casi el mismo (Fénix / Muralla infinita / Trama trama arriba,
Barrido defensivo abajo); **IE1-JP es el único que rompe** (God Knows 15). Si se quiere un coste de IE1 fiable en la app,
hay que **guardar el EU, no el JP** (hoy `costs.IE1` guarda el JP; la app casi no lo usa porque `SHOW_COST` empieza por
Galaxy/IE3).

**Decisión pendiente** (a elegir antes de tocar nada):
1. **Subir a los de la firma al #1** (ajustar OVR; cambia el orden en Sallys, Occult y Farm).
2. **Solo cambiar el capitán** al de la firma donde no coincide (sin tocar OVR; la regla capitán #1 lo sube).
3. **Mezclar firma en el OVR (suave)**: tabla min–max de arriba (±2 dentro del equipo) con la mejor técnica rara, usando
   el TP de IE3 (o el de IE1 **EU**, no el JP).
4. Dejar el listado y decidir jugador a jugador.

## 7. Registro de cambios

- **IE1**: `team_tuning.IE1` reescrito (rampa 58→83,8), `_game.IE1.compress = 0,5`, y reglas nuevas en `tuning.py`
  (compresión de dispersión + capitán #1). Antes: Occult 73,5 → … → Zeus 82,6, sin compresión y con capitanes que no
  siempre eran #1 (Kidou 83 vs Joseph King 86; Byron Love 87 vs Paul Siddon 88).
- **IE1 §6**: firmas rehechas con el **TP de IE3** (`techniques.costs.IE3` de la wiki) en vez del `balance_tp` de la hoja.
  Rango: 12 (Barrido defensivo) – 62 (Pájaro de fuego). Con IE3 quedan 3 discrepancias (Sallys, Occult, Farm), no 4:
  Shuriken y Wild ya no discrepan (Sail Bluesea lleva Pájaro de fuego 62; Hugo, Potenciación 57).
- **IE1 §6, hallazgo de datos**: `tp_ie` de la wiki trae **JP y EU**, y `fetch.py` guarda el **JP**; difieren en 103 de
  las 118 técnicas (p. ej. God Knows JP 15 / EU 59; Mano celestial JP 45 / EU 21). El rango real de IE1 (EU) es 10–62.
  Añadido el razonamiento por min–max (ajuste suave ±2 al OVR).
- **IE1 retoque a mano** (`ovr_manual`, manda sobre la curva; nueva regla final en `tuning.py`):
  - **Raimon**: Jude Sharp *(Raimon)* 78 → **87** (igual que el de Royal Academy), Axel Blaze 80 → **84**, Nathan Swift
    / Jack Wallside / Erik Eagle 80/80/79 → **82**, Steve Grim 80 → **77**. Once 79,6 → **81,3** (ahora #1 = Jude 87).
  - **Royal Academy**: top 3 a mano (**Jude 87 · Samford 84 · King 84**) y el resto ~2 puntos por debajo porque se
    pasaban de alto (Gus Martin 85 → 83, Derek Swing 85 → 82, Herman Waldon 84 → 81, Daniel Hatch 83 → 80…). Se bajó el
    objetivo del once (`top11` 83 → 81) y se fijaron solo Jude/Samford/King. Once 83,5 → **81,5**.
- **IE1 pool sin equipo (scouts)**: regla `scout_pool` en `tuning.py`: 40 % stats + 60 % técnica, **TP de IE1** (`cost:
  IE1`, ya **EU**) por percentiles del propio pool, 50 % stats + 50 % técnica, **46–79** (cap 79). Los 788 sin equipo pasan
  a **46–79**, mediana **61**. Los famosos suben solos (ReflectBuster EU 62, Shine Drive 42, Full Power Shield 34…):
  **Miles Ryan 79 · Sagaminator 78 · Rory Boomer 77 · Duncan Jump 59 · Darrel Jeeling 58 · Cash Barganier 57 · Nathin
  Gaunt 53 · Saul Dowd 52**. Miles Ryan (Strikers 2013) se fija a mano en **79** como techo. (Paul Peabody 78 y Erik
  Eagle 82 ya están en Raimon.)
- **Stats: pool vs equipos**. Los scouts tienen las **mismas stats del juego** que los jugadores de equipo (mediana sin
  contar porteros: **402 vs 397**). Aun así su OVR queda algo por debajo (mediana **61 vs 74**) porque los equipos de la
  historia llevan la curva de `team_tuning` (+ hasta 8,8 puntos); el reparto los acerca «sin pasarse».
