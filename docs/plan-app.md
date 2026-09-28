# Plan de la app (rama `app`): un MADFUT / PacyBits de Inazuma Eleven

Objetivo: un juego de cartas al estilo MADFUT 26 y PacyBits con **nuestras 5.378 cartas** (IE1–GO3, Ares, Orion, Victory Road).
Se copia la **estructura** (menús, flujo, sistemas); no sus gráficos, nombres de producto ni marca. Proyecto fan, sin compras.

---

## 1. Qué hacen MADFUT y PacyBits (investigación)

### MADFUT (Trivela Games) — 24, 25 y 26
- **Pantalla principal**: 3 páginas deslizables de paneles; barra arriba con nivel, monedas (MF), fichas LTM, tokens y escudo del club.
- **Draft** (el modo central):
  - Formación: eliges 1 de 5 al azar → capitán: 1 de 5 → cada puesto: 1 de 5 (once + banquillo).
  - **Química** más importante que la media: líneas entre vecinos **rojo** (nada), **amarillo** (poca), **verde** (mucha) según liga, país o idioma. Objetivo típico: 100 de química.
  - MADFUT 26: nuevo estilo de química en todos los modos con pistas y herramientas; posiciones alternativas para todas las cartas.
  - Guardar un draft y jugar con él más tarde.
  - **Draft Ranks**: cada draft da Draft Building Points (DBP) → rangos semanales y premios diarios.
  - **Draft Puzzles** (25): drafts rápidos alrededor de unas cartas fijas buscando 100 de química.
- **Draft Cups**: online, eliminatoria o liga; **Daily Draft Cup** (torneo corto de 4 equipos). El premio se puede cobrar en cuanto ya es matemáticamente tuyo.
- **Fatal**: 10 turnos; eliges carta y si **ataca, controla o defiende**; el rival responde; gana la nota y luego las estadísticas de esa acción. "Fatal stats": estrellas que dan bonus (+1 a todo con 2 estrellas). Variantes: Fatal Draft, **Fatal Sim** (simular partidos con el Fatal stat), **Fatal Series** por franjas de media (p. ej. 64–74), Fatal RTG.
- **Higher/Lower**: ¿la siguiente carta tiene más o menos nota/estadística? Fallar reinicia la racha. Da cartas LTM.
- **LTM** (modos por tiempo limitado) con **cartas LTM** que se mejoran jugando esos modos (Draft Duos, Fatal RTG, Higher/Lower…); **Lightning Rounds** 3 veces al día (sobres y selecciones especiales).
- **Sobres / Tienda**: con monedas; sobres guardados que se abren varios a la vez. Todas las oro, plata y bronce se pueden sacar.
- **SBC**: grupos de SBC con premio (iconos, cartas altas) y SBC en vivo; condiciones de nota, química, liga, país.
- **Objetivos**: nuevos / completados / pendientes, con premio.
- **Evolutions** (26): mejorar cartas jugando cualquier modo; **Elite EVO** (semanales, cartas elegidas) y **Standard EVO** (eliges tú la carta que cumpla los requisitos).
- **Mi club**: Mis cartas (filtros por puesto, país, liga, club, rareza, nota), **Mis plantillas**, **Colecciones** (conjuntos con % y distinción al 100 %), **Insignias** (especiales, países, clubes; se ponen de escudo del club), **Mis estadísticas**.
- **Mercado / Intercambios**: se desbloquea por nivel (5 en el 24, mercado al 10 en el 26); intercambio al azar, con amigos o por usuario; **lista de deseos** y **mensajes predefinidos** (hasta 6); "Custom Market" más seguro en el 26.
- **Códigos** que dan premios, **copia de seguridad** en la nube, votar cartas dentro de la app.
- Tipos de carta especiales por temporada (TOTY, Historic XI, etc.).

### PacyBits (FUT 18–21) y sus sucesores (PACFUT, Pacwyn)
- **Draft ilimitado** y **Draft Building Challenges (DBC)**: retos de draft con condiciones; **DBC semanal dinámico**: puntos durante la semana, ranking y premio según el puesto final.
- **Draft Leagues** con divisiones (subir de división), torneos simulados.
- **Versus**: contra la IA (ascenso hasta Div 1) y **torneos semanales** con condiciones de plantilla; ganar los 4 desbloquea un **Super torneo** sin restricciones. **ShowDown** 1 contra 1 (PACFUT).
- **Sobres ilimitados**; **Player Picks** (elegir 1 de varias cartas); Lightning Rounds.
- **SBC** con cartas exclusivas de la app; solo se pueden usar **duplicados** en SBC e intercambios.
- **Objetivos diarios** (premios crecientes; racha diaria) y **semanales**; **logros** con insignias exclusivas; objetivos de carrera.
- **Intercambios** con lista de deseos, canales y grupos; mercado de cartas y monedas.
- **Colecciones** por club, país y tipo; **Puzzles** de lógica/fútbol; Evolutions; copia en la nube.
- Online (draft, versus, intercambios, LTM) exige iniciar sesión.

---

## 2. Versión Inazuma: cada sistema con nuestros datos

| Sistema | Inazuma | Con qué datos |
|---|---|---|
| **Rareza** | Leyenda · Élite · Oro · Plata · Bronce | `category` (Legendary/Top/Advanced/Growing/Common) |
| **Cartas especiales** | Mixi Max, espíritu guerrero, armadura, tótem, Chrono Storm, formas (adulto, niño, Dark Emperors…) como "tipos" con diseño propio | `specials`, `version`, `is_version` |
| **Química** | Líneas entre vecinos: **verde** mismo equipo y juego · **amarillo** mismo equipo (otro juego), mismo juego, o mismo elemento · **rojo** nada. Bonus de capitán | `team`, `game`, `element` |
| **Draft** | Formación 1 de 5 → capitán 1 de 5 → cada puesto 1 de 5 → banquillo. Nota + química. Guardar drafts | catálogo + formaciones actuales (`lib/lineup`) |
| **Draft por sorteo** (el actual) | Se queda como modo "Clásico FFI": sortear equipo+juego y elegir | ya hecho |
| **Copas** | Copa FFI (actual), Fútbol Frontera (IE1), Arco Iris / Holy Road (GO), Copa Ares, Orion, Victory Road; diaria de 4 equipos | rivales por juego (`team_tuning`) |
| **Fatal → "Duelo"** | 10 turnos: tu carta + acción **Tiro / Regate / Bloqueo / Parada**; el rival responde; gana nota + estadística + **potencia de la supertécnica** + ventaja de elemento (Fuego > Bosque > Aire > Montaña > Fuego) | `techniques` (tipo y coste), `stats`, `element` |
| **Higher/Lower** | Nota, una estadística, o nº de técnicas | catálogo |
| **Puzzles** | Draft con cartas fijas → 100 de química; "¿quién es?" con silueta y pistas (equipo, juego, técnica) | catálogo, descripciones |
| **Sobres** | Por saga (IE, GO, Ares/Orion, VR), por elemento, por equipo; probabilidades por rareza; **Player Pick** (1 de 3) | catálogo |
| **Retos (SBC)** | "11 de Fuego", "Raimon completo", "media 85 de GO", "3 espíritus guerreros"… Solo duplicados | catálogo |
| **Objetivos** | Diarios (racha), semanales y de carrera | estadísticas locales |
| **Evoluciones** | Mejorar una carta con formas reales: normal → Mixi Max / espíritu guerrero / armadura; "Elite" = forma famosa (Tenma con Pegaso Arco…) | `specials`, versiones |
| **Colecciones** | Equipos completos (Raimon IE1, Orfeo, Inazuma Japón…), sagas, elementos; distinción al 100 % | `team`, `game` |
| **Insignias** | Escudos de los equipos de Inazuma, especiales por logros | equipos |
| **Nivel / monedas** | XP por jugar; monedas por partidos, copas, retos; tienda de sobres | local → Supabase |
| **Intercambios** | Duplicados, lista de deseos, mensajes predefinidos; desbloqueo por nivel | Supabase Auth + Realtime |
| **Códigos / copia en la nube** | Tabla de códigos; colección en la nube | Supabase |

---

## 3. Fases

1. **Base** ✅ (rama `app`): PWA instalable, pantalla principal de 3 páginas, carta FUT, ajustes.
2. **Draft MADFUT**: formación y capitán 1 de 5, cada puesto 1 de 5, química con líneas de colores, nota del equipo, guardar draft.
3. **Economía local**: monedas, XP, sobres con probabilidades, Mis cartas, duplicados, colecciones, objetivos diarios con racha (todo en el dispositivo).
4. **Modos**: Duelo (Fatal con supertécnicas), Higher/Lower, copas por saga y copa diaria.
5. **Retos y evoluciones**: SBC con duplicados, evoluciones con formas, insignias y logros.
6. **Cuentas y nube**: Supabase Auth, colección y monedas en la nube, sobres tirados en el servidor (Edge Function), códigos, copia de seguridad.
7. **Social**: intercambios con lista de deseos, ranking semanal (DBC/DBP), copas online.

## Fuentes

- [MADFUT 26 — App Store (descripción e historial de versiones)](https://apps.apple.com/us/app/madfut-26/id6752884808)
- [MADFUT 26 — Google Play](https://play.google.com/store/apps/details?id=com.trivela.madfut)
- [MADFUT 26 — MWM (lista de funciones)](https://mwm.ai/apps/madfut-26/6752884808)
- [MADFUT 26 Starter Guide — life.gg](https://life.gg/madfut-26-starter-guide-october-2025/)
- [MADFUT 25 — BlueStacks](https://www.bluestacks.com/blog/game-guides/madfut-25.html)
- [Madfut 24 — guía de juego (Talk Android)](https://www.talkandroid.com/33186-madfut-24-gameplay-guide/)
- [PACYBITS FUT 20 — RAWG](https://rawg.io/games/pacybits-fut-20)
- [PACYBITS — FAQ](http://www.pacybits.com/faq)
- [PACFUT 26 — App Store](https://apps.apple.com/bs/app/pacfut-26/id1592155003)
- [Pacwyn 26 — App Store](https://apps.apple.com/us/app/pacwyn-26-draft-pack-opener/id6751347528)
- [Draft explicado (formación, capitán, 1 de 5) — fifauteam](https://fifauteam.com/draft-football-club-24/)
