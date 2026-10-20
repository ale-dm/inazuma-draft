# Técnicas de Ares y Orion desde la wiki

> **Estado:** revisado y aplicado (2026-10-20).
> Fuente: wiki española (`https://inazuma.fandom.com/es/api.php`), categorías
> `Supertécnicas introducidas en Inazuma Eleven Ares` / `... Orion` y `Supertécnicas (IE Ares)` / `(IE Orion)`.

## Cobertura de la wiki

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
