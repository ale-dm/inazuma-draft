# Plan: Ares, Orion y Victory Road

> Estado: **pendiente** (propuesta aprobada para hacer más adelante).

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
