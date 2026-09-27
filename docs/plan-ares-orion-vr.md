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

## Versiones de Victory Road de personajes clásicos (pendientes)

En la galería de sprites de Victory Road de la wiki española (sección «Saga de Destin») hay versiones de personajes clásicos con equipaciones que no tienen carta (p. ej. Mark en **Los Arions**, Royal Academy, Orfeo, Earth Eleven; armaduras como Grandius). Son de Victory Road y necesitan sus stats: se harán en esta fase. `build.py` las lista en `build/report.txt`. Ahora mismo:

- Gouenji Shuuya: Kirkwood (Saga de Mark)
- Gouenji Shuuya: Earth Eleven (Saga de Mark)
- Gouenji Shuuya: Royal Academy (Saga de Mark)
- Gouenji Shuuya: Surtur (Armadura) (Saga de Mark)
- Gouenji Shuuya: Alex Zabel (Saga de Arion)
- Gouenji Shuuya: Casual (''Chrono Stones'') (Saga de Arion)
- Gouenji Shuuya: Equipación sencilla (''Galaxy'') (Saga de Arion)
- Tachimukai Yuuki: Raimon Equipo B (Saga de Mark)
- Tachimukai Yuuki: Earth Eleven (Saga de Mark)
- Tachimukai Yuuki: Casual (Saga de Arion)
- Tsunami Jousuke: Raimon Equipo B (Saga de Mark)
- Tsunami Jousuke: Earth Eleven (Saga de Mark)
- Kabeyama Heigorou: Earth Eleven (Saga de Mark)
- Kidou Yuuto: Orfeo (Saga de Mark)
- Kidou Yuuto: Raimon Equipo B (Saga de Mark)
- Kidou Yuuto: Raimon Revolucionario (Saga de Mark)
- Kidou Yuuto: Earth Eleven (Saga de Mark)
- Kidou Yuuto: Casual (Saga de Arion)
- Kidou Yuuto: Raimon Revolucionario (Saga de Arion)
- Endou Mamoru: Royal Academy (Saga de Mark)
- Endou Mamoru: Orfeo (Saga de Mark)
- Endou Mamoru: Raimon Revolucionario (Saga de Mark)
- Endou Mamoru: Los Arions (Saga de Mark)
- Endou Mamoru: Earth Eleven (Saga de Mark)
- Endou Mamoru: Grandius (Armadura) (Saga de Mark)
- Endou Mamoru: Casual (Saga de Arion)
- Endou Mamoru: Raimon Revolucionario (Saga de Arion)
- Kazemaru Ichirouta: Earth Eleven (Saga de Mark)
- Fubuki Shirou: Raimon Equipo B (Saga de Mark (Unión))
- Fubuki Shirou: Raimon Revolucionario (Saga de Mark (Unión))
- Fubuki Shirou: Earth Eleven (Saga de Mark (Unión))
- Fubuki Shirou: Casual (Saga de Arion)
- Zaizen Touko: Raimon (Saga de Mark)
- Zaizen Touko: Inazuma Japón (Saga de Mark)
- Zaizen Touko: Raimon Equipo B (Saga de Mark)
- Zaizen Touko: Earth Eleven (Saga de Mark)
- Zaizen Touko: Adulta (Saga de Arion)

## Equipos de Victory Road detectados (para esta fase)

- **Nuevo Inazuma Japón / Inazuma Japón Alterno** (sprites "(IJA)" de la wiki española): Arion, Victor, JP, Riccardo, Fei, Aitor, Gabi, Goldie, Bai Long. Es de Victory Road, no de GO2 ni el Earth Eleven.
- **Inazuma Best Eleven** (sprites "(IBE)").
