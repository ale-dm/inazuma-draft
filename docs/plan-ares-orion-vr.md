# Plan: Ares, Orion y Victory Road

> Estado: **Ares hecho** (juego `ARES`, 199 cartas; `tools/db/ares.py`). Orion y Victory Road: pendientes (datos de Orion ya guardados en `data/azalee` y `data/roadtoultimate`, sin revisar).

## Ares (hecho)

- Una carta por ficha de zukan de jugador de Ares, con su nº oficial, en su equipo de Ares (los personajes clásicos que se van del Raimon, en su otro equipo: Kirkwood, Polestar, Everytown…). El Raimon de Ares es solo el de los nuevos: los del Raimon original que salen en Ares (Erik, Tod, Bobby, Max, Sam, Steve, Tim, Willy, Jim) van a Secundarios.
- Nota:
  1. Banda por el **tier de potencial** de Victory Road (0–3).
  2. Dentro de la banda, **potencia de sus supertécnicas** de Victory Road.
  3. Protagonistas con versión héroe/basara (Sonny, Elliot, Heath): suelo de Top.
  4. Personajes antiguos: media con su carta de **IE2** (salvo Shawn).
  5. Todo repartido con la **curva de los equipos de IE2**: Ares es IE2 en otra línea temporal. Orion hará lo mismo con IE3.
- Stats de Victory Road de la carta (`raw_stats`): plantilla Lv50 × rareza de su categoría (Común = Normal ×1,0 … Legendario ×1,4).
- Supertécnicas de la carta, por orden de preferencia:
  1. **Las del anime de Ares**: wiki española, «Supertécnicas → Anime → Desde Ares». En los clásicos es el bloque de la segunda línea temporal, así que nunca salen las de la serie original.
  2. Si no las hay: **Road to Ultimate, la ficha de Ares del personaje**, con las técnicas comunes y la rama principal (sin la rama alternativa).
  3. Si tampoco hay: todas las de Victory Road.
  - Cada técnica es la de la base si existe (por nombre en castellano o japonés). Si no, una nueva `vr_<código>` con su potencia de VR, o `es_<nombre>` si solo se conoce el nombre en castellano.
  - Fuera las 19 técnicas básicas de Victory Road (potencia base 30, máx. 200: Power Shot, Dust Kick, Heel Flick, Deceptive Step…), las que todos aprenden a nivel 1.
  - La **nota** sigue saliendo de la potencia de sus supertécnicas de Victory Road.
- Cuerpo técnico de Ares: a la pestaña de staff.
- Datos y fórmulas: `docs/victory-road-stats.md`, `data/azalee/`, `data/roadtoultimate/`.

## Qué hay

- **1.405 fichas de zukan** solo de estos juegos: 223 se estrenan en Ares, 190 en Orion y 992 en Victory Road (1.314 jugadores y 91 del cuerpo técnico). Ya descargadas en [`data/zukan/`](../data/zukan/README.md).
- **Stats oficiales de Victory Road** (Lv50: Kick, Control, Technique, Pressure, Physical, Agility, Intelligence) para todas: `data/zukan/chara_param.json` (`vr_lv50`).
- **Técnicas** en la wiki: `Module:PlayerData/AT` (Ares, 218 entradas), `/OK` (Orion, 194) y `/VR` (992); los módulos clásicos traen también las técnicas de VR de los personajes antiguos.
- **Sprites de Victory Road por versión** en la wiki española (`<Personaje>/Diseño en los Videojuegos`, sección «Saga de Destin» → «Saga de Sonny»): Raimon, Ribera, Inazuma Japón (Orión)…
- Equipos: Raimon (Ares), Inazuma Japón (Orion), Destroyers, Platos, South Cirrus, Seagull FC, Polestar Academy, Guardians of the Queen…

## Propuesta

1. **Tres juegos nuevos**: Ares, Orion y Victory Road, con sus equipos (y pools del draft).
2. **Una carta por personaje en su juego de estreno** + versiones solo de los equipos protagonistas (Raimon de Ares, Inazuma Japón de Orion), como en la saga clásica.
3. **Nota calibrada con los clásicos** (opción recomendada): muchos personajes clásicos tienen stats de VR *y* nota en nuestra escala → se calcula la conversión VR → OVR con ellos y se aplica a los nuevos, para que todo esté en la misma escala. Alternativa: percentil entre ellos solos (más simple, escalas separadas).
   - Stats: Tiro ← Kick · Control ← Control + Technique · Físico ← Physical · Velocidad ← Agility · Defensa ← Pressure · Parada (porteros) ← Physical + Intelligence.
4. **Técnicas** de los módulos AT / OK / VR, con nombre en castellano y descripción e imagen de zukan.
5. **Descripciones**: zukan (inglés) + wiki española (Ares y Orion se emitieron en España).
6. **Cuerpo técnico**: los 91 de estos juegos a la pestaña «Cuerpo técnico».
7. Después: **despertares** de Victory Road (potenciadores).

## Versiones de Victory Road de personajes clásicos (descartadas por ahora)

Las 37 versiones de la galería de Victory Road (Mark en Los Arions, Orfeo, Earth Eleven, Raimon Equipo B, Raimon Revolucionario, armaduras, casual…) quedan **fuera**. Se retomarán mucho más adelante, si se hacen equipos especiales. `build.py` las sigue listando en `build/report.txt`.

## Equipos de Victory Road detectados (para esta fase)

- **Nuevo Inazuma Japón / Inazuma Japón Alterno** (sprites "(IJA)" de la wiki española): Arion, Victor, JP, Riccardo, Fei, Aitor, Gabi, Goldie, Bai Long. Es de Victory Road, no de GO2 ni el Earth Eleven.
- **Inazuma Best Eleven** (sprites "(IBE)").
