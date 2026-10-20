# Técnicas de Ares y Orion desde la wiki

> **Estado:** revisado y aplicado (2026-10-20).
> Fuente: wiki española (`https://inazuma.fandom.com/es/api.php`), categorías
> `Supertécnicas introducidas en Inazuma Eleven Ares` / `... Orion` y `Supertécnicas (IE Ares)` / `(IE Orion)`.

## Tiros que debutan en Ares

De los **24 tiros** que debutan en Ares, **23 ya estaban en la app con otro nombre** (misma técnica por
japonés/inglés). Solo faltaba **Pingüino Aéreo** (Overhead Penguin), que se ha añadido.

| Wiki de Ares | En la app | ID |
|---|---|---|
| Cabezazo Inverso | Cabezazo fiero | `vr_whs02820` |
| Explosión Cósmica | Combo cósmico | `vr_whs02980_or_02` |
| Limonada de Fuego | Granizado de fuego | `vr_whs02850` |
| Baile del Destello | Ofensiva danzarina | `vr_whs02800` |
| Sabiduría Suprema | Omnisabiduría divina | `vr_whs02900` |
| Daruma de Fuego | Daruma de fuego | `vr_whs02840` |
| Supertécnica Asesina de Osos: Ataque | Nudo atrapaosos | `vr_whs02920` |
| Oso Polar N.º 2 | Oso polar n.º 2 | `vr_whs02770` |
| Lanza del Rey | Lancero real | `vr_whs02890` |
| Lanza de Hielo | Lanza polar | `vr_whs02810` |
| Caída de Meteoritos | Tiro meteórico | `vr_whs02780` |
| Sapo Ninja | Sapo ninja | `vr_whs02790` |
| Pingüino Perfecto | Pingüino perfecto | `vr_whs02880` |
| Pájaro Luminoso | Ave goleadora | `vr_whs02760` |
| Remate Rápido del Conejo Blanco | Liebre blanca | `vr_whs02940` |
| Magna Espectral | Tiro centrífugo | `vr_whs02860` |
| Aspa del Cielo | Sierra celestial | `vr_whs02910` |
| Dragón del Cielo | Ímpetu de dragón | `vr_whs02990` |
| Explosión | Detonador | `vr_whs02960` |
| Ventisca Triple | Ventisca triple | `vr_whs02950` |
| Remate Tricolor | Victoria tricolor | `vr_whs02830` |
| Ventisca de Doble Impacto | Frente frío | `vr_whs02930` |
| Ataque en Zig Zag | Remate en zigzag | `vr_whs02970` |
| **Pingüino Aéreo** | **añadido** | `es_ping-ino-aereo` |

`Pingüino Aéreo` (Overhead Penguin / Penguin Volley, tiro de fuego) se ha añadido a Elliot Ember (Ares y
Orion) y a Jude Sharp (Orion).

## Variantes A de Victory Road (zukan)

El zukan también tiene las dos variantes “A” de Ares:

| Zukan | Nombre en la app | Tipo | Poder VR | Usuario |
|---|---|---|---:|---|
| Fire Tornado A | **Tornado de fuego A** | Tiro / Fuego | 360 | Basile Hardy (Ares y Orion) |
| Meteor Blade A | **Cañón de meteoritos A** | Tiro / Fuego | 440 | Hunter Foster (Ares) |

Se han añadido como técnicas de la app (`vr_whs02750` y `vr_whs03410`) con las descripciones del
zukan, TP 70 y 120 respectivamente, y se han puesto en sus cartas. Son variantes de la misma técnica,
no técnicas nuevas de la saga: el zukan las lista aparte, con la misma potencia que las originales.

## Cobertura de la wiki

La tabla es el estado de la primera pasada; después se añadieron los tiros de arriba.

| Categoría | Técnicas | En la app antes | Añadidas |
|---|---:|---:|---:|
| Introducidas en Ares | 49 | 45 | 4 |
| Introducidas en Orion | 65 | 62 | 3 |
| Supertécnicas (IE Ares) | 71 | 68 | 3 |
| Supertécnicas (IE Orion) | 98 | 94 | 4 |

Las que faltaban y no son la misma técnica con otro nombre:

| Técnica | Tipo | Elemento | Usuarios (wiki) | Dónde |
|---|---|---|---|---|
| Entrada deslumbrante (Brilliant Move) | Bloqueo | Aire | Óscar Pio, Erik Eagle, Acker Reese, Cygnus Starkey, Ari Zimmerman | IE AC / SD |
| Mar de lágrimas (Flood of Feels) | Parada | Fuego | Rolland Bowlby | Manga de Ares |
| Muro colectivo (Wall for One) | Bloqueo | Montaña | Barry Cade, Lunk Ironbrow, Björn Brocken, Hefton Bulk | Anime Ares; HVR |
| Pingüino goleador (Shining Penguin) | Tiro | — | Sonny Wright, Elliot Ember | Manga de Ares |
| Embestida bufalina (Bull Steam Ahead) | Regate | — | Seok Tel-bull, Baek Bull-wo, Lee San-bull | Anime Orion |
| Último recurso: Dragón (Last Resort D) | Tiro | — | Orlando Pacelli | Ya existía como `vr_whs03290`; se le ha puesto el nombre en castellano |

- **Celebración sanadora** (Healing Celebration) no se añade: la propia wiki la clasifica como
  supertécnica **no de fútbol** (Jim Trainer).
- Las combinadas (**Muro colectivo**, **Embestida bufalina**, **Pingüino goleador**) se muestran en
  cada una de sus cartas, como en la wiki; la app no guarda el número de jugadores de la técnica.

## Cómo se ha implementado

- `data/overrides.json` → `extra_techniques` (las 5 nuevas con tipo, elemento y descripción) y
  `extra_moves` (id de carta → técnicas).
- `data/technique_balance.json` → TP de las nuevas: Entrada 90, Mar de lágrimas 90, Muro colectivo 110,
  Pingüino goleador 150, Embestida bufalina 110.
- `build.py` añade las técnicas al catálogo antes de generar las cartas y las asigna después de Ares/Orion.
- `extra_moves` también cubre `vr_whs03290` (nombre en castellano) sin duplicar la técnica.

## Pendiente

- Si se quiere que las combinadas cuenten como una sola técnica de equipo (y no una por carta), habría
  que añadir el número de jugadores al modelo de técnicas; ahora se muestran por carta.
