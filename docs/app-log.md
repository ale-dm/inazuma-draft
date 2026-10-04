# Diario de trabajo de la app (rama `app`)

Qué se hizo, cuándo y por qué. Lo pendiente está en [TODO-app.md](TODO-app.md).

## 2026-09-28

### Fase 1 · Base (hecha)
- **Rama `app`** creada desde `main`; `main` y la web actual no cambian. Vercel publica cada push de la rama en
  `inazuma-draft-git-app-ale-dms-projects.vercel.app` (con inicio de sesión de Vercel).
- **Pantalla principal** (`src/components/hub/`): 3 páginas deslizables (scroll-snap) con puntos; barra con nivel, títulos,
  cartas y progreso. El nivel sale de las estadísticas locales (`src/lib/progress.ts`), sin cuenta.
- **Carta FUT** (`src/components/FutCard.tsx`): escudo, rareza por categoría, nota, puesto, elemento, retrato y 6 estadísticas.
- **Estilo** (`src/app.css`): fondo oscuro con triángulos, paneles de cristal con borde de neón, un tono por página.
- **PWA** (`vite-plugin-pwa`): manifest, iconos generados (`public/icon-*.png`), service worker con caché del catálogo
  (StaleWhileRevalidate), fotos y fuentes (CacheFirst).
- **Arreglo**: en las previews de Vercel el manifest se pedía sin cookies y no dejaba instalar → `useCredentials: true`.
  Comprobado con el test de instalación de Chrome (solo avisa de "incógnito", propio del navegador de pruebas).
- **Limpieza**: fuera la portada antigua (`Landing.tsx`, 22 reglas CSS y 7 textos sin uso).
- **Investigación de MADFUT 24–26** → [plan-app.md](plan-app.md). PacyBits solo como antecedente (ya no existe).

### Fase 2 · Draft MADFUT (en curso)
- Reglas decididas:
  - **Enlaces** entre puestos vecinos del campo (por cercanía en la formación).
  - **Color del enlace**: se comparan equipo, juego y elemento. 2 o más coincidencias → verde; 1 → amarillo; 0 → rojo.
  - **Química del jugador** 0–3 según la media de sus enlaces; el **capitán** suma +1.
  - **Química del equipo** 0–100 (suma de las 11 químicas sobre 33).
  - **Media del equipo** con la fórmula de FUT: media de los 11 + corrección por los que están por encima de la media.
  - Opciones: formación 1 de 5, capitán 1 de 5 (Leyenda/Élite), cada puesto 1 de 5 con probabilidad por rareza;
    nunca dos cartas del mismo personaje.
- Hecho:
  - `src/lib/chemistry.ts`: enlaces por cercanía (cada puesto con 2–5 enlaces en las 10 formaciones), color, química
    por jugador y de equipo, media FUT. Probado: Raimon IE1 completo → química 100; once al azar → 15.
  - `src/lib/fut-draft.ts`: opciones con el azar de la partida (misma semilla = mismas opciones). Rareza de las opciones de
    puesto: Leyenda 8 · Élite 22 · Oro 35 · Plata 25 · Bronce 10. Capitán: Leyenda o Élite de cualquier puesto.
  - `src/components/futdraft/FutDraft.tsx`: formación → capitán → campo (tocar hueco → 1 de 5; las opciones de un hueco
    no cambian al cerrar y abrir) → "Jugar el FFI" con ese once (torneo actual).
  - Panel de modo: **Draft** (nuevo) o **Draft FFI** (sorteo, con Clásico/Memoria).
  - Carta FUT tamaño `xs` para el campo; el portero va en su propia fila (no se pisa con los centrales en defensas de 5).
- Encontrado de paso: el CDN de Fandom devuelve 404 a imágenes pedidas con Referer de otra web → metido
  `no-referrer` en `index.html`. Afecta también a la web de `main` (pendiente en el TODO).
- Probado en navegador (Chromium, móvil 400×860, catálogo servido desde `build/players.json`): pantalla principal,
  panel de modo, formaciones, capitán, elegir jugador y campo completo (media y química se actualizan).
- Segunda tanda de la fase 2:
  - **Química en el partido**: `SimulateOptions.chemistry1` → la fuerza del equipo va de −5 % (química 0) a +5 % (100);
    50 no cambia nada. Solo en el draft MADFUT; el Draft FFI simula como siempre.
  - **Cambiar de sitio**: tocar una carta y otra del mismo puesto las intercambia; el capitán se mueve con su carta.
  - **Banquillo**: 5 suplentes (1 de 5, cualquier puesto) cuando el once está completo; un suplente entra al campo si su
    puesto coincide con el del titular. Los suplentes cuentan como cartas conseguidas (colección).
  - Probado: once + banquillo completos, cambio suplente → titular (química 27 → 21, se recalcula) y "Jugar el FFI" abre
    el torneo.

### Fase 3 · Economía local (primera parte hecha)
- **Club** (`src/lib/club.ts`, `localStorage` "ffi-club-v1"): monedas, XP, cartas con copias, sobres guardados, racha y
  contadores del día. Se empieza con 5.000 monedas y un sobre de bienvenida (8 cartas, 1 Élite o más garantizada).
- **Sobres** (`src/lib/packs.ts`): Bronce 500 · Plata 1.500 · Oro 3.500 (Élite garantizada) · Leyenda 12.000 (Leyenda
  garantizada) · por saga 2.500 (Mark, Arion, Ares/Orion, Victory Road). Sin repetir personaje dentro de un sobre; la mejor
  carta sale la última. Premios: sobre de bienvenida y sobre de premio (no se venden).
- **Apertura** (`club/PackOpening.tsx`): sobre flotando → tocar → cartas una a una (brillo giratorio con Élite/Leyenda,
  etiqueta NUEVA) → resumen.
- **Tienda** (`club/Store.tsx`): mis sobres (con cantidad) y sobres a la venta con probabilidades por color de rareza.
- **Mis cartas** (`club/MyCards.tsx`): filtros por puesto, rareza y repetidas; venta rápida (Leyenda 1.000 · Élite 400 ·
  Oro 150 · Plata 60 · Bronce 25; nunca la última copia).
- **Colecciones** (`club/Collections.tsx`): cada equipo de cada juego (la plantilla del draft); premio al completarla.
- **Objetivos** (`lib/objectives.ts`, `club/Objectives.tsx`): premio diario 300→1.200 y sobre Oro el 7.º día; objetivos
  del día (jugar un draft, abrir 2 sobres, 60 de química, semifinales, ganar el FFI). Aviso rojo en el panel de inicio.
- **Premios del torneo**: grupos 250 🪙 / 50 XP · semis 500 / 100 · final perdida 800 / 150 + sobre de premio ·
  campeón 1.500 / 250 + sobre Oro. Se enseñan en la pantalla de resultado. Nivel = XP / 200.
- Rutas nuevas: `#/tienda`, `#/club`, `#/colecciones`, `#/objetivos` (la partida en curso no se pierde).
- **Imágenes**: comprobadas las 6.074 URL (cartas y técnicas) sin Referer: todas responden. Las iniciales que salían en
  las capturas eran fotos aún cargando.
- Probado en navegador: tienda (5.000) → abrir sobre de bienvenida (8 cartas) → comprar Bronce (4.500) → premio diario
  (4.800) → mis cartas (8) → colecciones (0 de 189) → inicio con monedas y cartas.

### Marco nuevo y colores de rareza
- **Pantallas de juego** (Draft FFI, alineación, torneo, resultado) y el explorador de jugadores van dentro de
  `hub/GameShell.tsx` (cabecera con ✕ o ←). Fuera `AppLayout`, `TopBar` y `SiteFooter`; los créditos del proyecto
  original (autor y apoyo) pasan al panel de Ajustes. El resultado enseña el once con cartas FUT y el premio del club.
- **Colores de rareza** pedidos: los de Victory Road, según la media de la carta (categoría), sin la rareza Hero:
  Common verde · Growing azul · Advanced morado · Top amarillo · Legendary naranja. Clases `fut-card--common/growing/
  advanced/top/legendary` y los puntos de probabilidad de los sobres con los mismos colores.
- Las cartas grandes y medianas cargan la foto sin esperar (en el panel de elegir no salían a tiempo).

### Carta nueva con estilo propio e iconos de Victory Road
- Pedido: nada que ver con FIFA; que se vea media, puesto, foto, afinidad y equipo; iconos de Victory Road.
- **Iconos** en `public/icons/` (98 KB, van en la app y funcionan sin conexión), de Fandom:
  - Wiki española (versión HVR de sus plantillas): afinidades `Fuego/Aire/Bosque/Montaña (HVR).png`, tipos de
    supertécnica `Tiro/Regate/Defensa/Portero (HVR).png`, `Tiro largo (HVR)`, `Bloqueo de tiros (HVR)`, y
    `EG (HVR)` (espíritu guerrero), `Miximax (HVR)`, `Tótem (HVR)`.
  - Wiki inglesa: puestos `GK/DF/MF/FW icon (VR).png` (la española solo tiene DF).
  - `src/components/GameIcon.tsx`: `PositionIcon`, `ElementIcon`, `TechniqueIcon`, `SpecialIcon`.
- **Carta** `src/components/InaCard.tsx` (sustituye a `FutCard`): esquinas cortadas en diagonal, líneas de velocidad sobre
  el color de la rareza, brillo detrás de la foto, media grande con el icono de puesto debajo, afinidad arriba a la
  derecha, franja de abajo con nombre y "equipo · juego". Las Legendary llevan un brillo que se mueve. Sin estadísticas
  en la carta: están en la ficha (`CardInfo.tsx`: estadísticas y supertécnicas con su icono de tipo), que usan la ficha
  del jugador y Mis cartas.
- La ficha del jugador y la carta antigua (Draft FFI y explorador) usan los iconos en vez de emojis.
- Arreglo de paso: al quitar el CSS de la carta FUT se habían ido también los estilos del draft (estaban en medio);
  recuperados del commit anterior.
- Probado: sobre de bienvenida (8 cartas), campo del draft, ficha en Mis cartas. Las cartas sin foto en las capturas son
  fallos de red del navegador de pruebas (`ERR_TOO_MANY_RETRIES` del proxy), no de la app.

### Fuera los emojis
- Pedido: no usar tantos emojis. Se quitan todos los de la interfaz (inicio, club, sobres, objetivos, ajustes, draft,
  torneo, partido, resumen, imagen para compartir y los textos de los 4 idiomas). En su lugar:
  - Iconos de Victory Road (`GameIcon`) para lo del juego: puestos, afinidades, supertécnicas, especiales.
  - Iconos de línea `lucide-react` (solo se incluyen los que se usan) para la interfaz: ajustes, tienda, objetivos,
    insignias, copia de seguridad, reglas, volver/cerrar, sonido, tema, trofeo, sobre, gol, fallo, comprobado.
  - Moneda propia `src/components/Coin.tsx` (disco dorado con un rayo).
  - La química de cada jugador en el campo: 3 puntos en vez de ◆.
  - Banderas de países del torneo fuera (eran emojis; en Windows salen como letras).
- Las flechas → de los botones se quedan: son tipografía, no emojis.

## 2026-09-28 (tarde)

### Arreglo de imágenes en `main`
- PR #53 (fusionado): `<meta name="referrer" content="no-referrer">` en la web actual; ~85 imágenes de Fandom volvían 404.

### Química nueva (estilo MADFUT/FC actual)
- Se sustituye la química de enlaces entre vecinos (antigua) por la de ahora: cada jugador suma puntos según cuántos del
  once comparten algo con él, sin líneas. Adaptación a Inazuma:
  - liga → **mismo juego** (4 → +1 · 6 → +2 · 8 → +3)
  - nación → **misma afinidad** (4 → +1 · 7 → +2 · 10 → +3)
  - club → **mismo equipo** (2 → +1 · 4 → +2 · 7 → +3), las cartas sin equipo no suman aquí
  - máximo 3 por jugador y **33 el equipo**; el **capitán cuenta doble** para los umbrales (como Iconos/Héroes en FC)
- Umbrales ajustados con 400 onces al azar del catálogo: con los de FC (3/5/8, 2/5/8, 2/4/7) un once al azar sacaba
  23/33 porque solo hay 4 afinidades y 9 juegos (VR con 943 cartas); con los de arriba, ≈ 10/33. Raimon IE1 completo: 33.
- `src/lib/chemistry.ts` reescrito; `src/components/pitch/Pitch.tsx` (campo reutilizable: carta + etiqueta con puesto y
  3 rombos de química, como MADFUT) y `pitch/ChemHelp.tsx` ("Cómo funciona la química", como la ventana de MADFUT).
- La química del partido pasa a 0–33 (de −5 % a +5 %; la mitad, neutra); el objetivo diario pasa a 24 de química.

### Inicio en el orden de MADFUT y Mis plantillas
- Pedido: respetar la interfaz de MADFUT (página 1 = "Pack", página 2 = "Draft", página 3 = el club).
  - **Página 1**: Sobres (grande) → panel **Duelo** (como FATAL: Mi club · Simulación · Draft, próximamente) → Draft FFI,
    Intercambios (próximamente) y **Modos de draft** (alto, a la derecha, como en MADFUT).
  - **Página 2**: **Draft** (grande) → Tienda, Últimas cartas, Objetivos, Retos, Evoluciones (ancho).
  - **Página 3**: Mis cartas → Colección, Insignias, Mis estadísticas (títulos, finales, drafts), **Mis plantillas** →
    Ajustes, Copia de seguridad, Reglas.
- **Mis plantillas** (`#/plantillas`, `club/Squads.tsx`): plantillas guardadas en el club (`squads`), con las 10
  formaciones por nombre, el mismo campo y la misma química que el draft; tocar un hueco → tus cartas de ese puesto (sin
  repetir personaje); tocar una carta → capitán, cambiar o quitar. Al cambiar de formación se recolocan las cartas.
- El campo es más alto (3:4,6) para que en 4-4-2 los medios no pisen a los defensas.

### Torneo y alineación con el estilo nuevo
- En vez de reescribir cada componente antiguo, sus clases compartidas (`iz-panel`, `iz-panel-head`, `btn-primary`,
  `btn-secondary`, colores `--iz-*`) toman el estilo de la app **solo dentro del marco nuevo** (`.hub`): paneles de cristal,
  cabeceras en cursiva, botón principal lima, secundarios tipo píldora. La web de `main` no cambia.
- Probado: partida completa (draft → torneo → partidos → campeón) con capturas del torneo, un partido y el resultado.

### Duelo (estadísticas de combate) y escudos de equipo en la carta
- **`src/lib/duel.ts`**: las 3 estadísticas de duelo (estilo MADFUT/FC: ataque/verde, control de balón/azul,
  defensa/rojo) se calculan a partir de las 6 del jugador, sin inventar una fórmula nueva: ataque = tiro, control =
  control, defensa = defensa (los porteros mezclan defensa y parada, ya que no tienen buena defensa de campo).
  `resolveDuel()` decide quién gana una acción del futuro modo Duelo (fase 4, sin construir aún).
- **`src/components/DuelCard.tsx`** + CSS en `app.css`: columna de 3 flechas de color a la derecha de la carta. Como
  `clip-path` recorta también lo que se sale de la carta, la columna es un *hermano* de `InaCard` (no un hijo) dentro
  de un `<span>` envoltorio con `padding-right` para reservar el hueco; así no se pisa con la carta de al lado en una
  rejilla. Probado con una captura aislada (3 cartas, una con la acción resaltada).
- **Escudos de equipo** (en vez del nombre en la carta): `tools/db/fetch.py` descarga
  `Category:Team emblem images` de la wiki inglesa (7 subcategorías, ~1149 archivos) y las redirecciones de nuestros
  nombres de equipo (caché `team_emblems.json`). `tools/db/logos.py` (nuevo, mismo patrón que `i18n.py`) cruza cada
  equipo con su escudo por nombre normalizado (`tnorm`), probando también su redirección, su alias de
  `WIKI_FORM_TEAM` y el plural sin la "s" ("Rose Griffons" → "Rose Griffon"), y se queda con la categoría más oficial
  (serie original > GO > Victory Road > Strikers > SD > Cross > varios). Cobertura: 171/187 equipos (los 16 sin
  escudo son pseudo-equipos como "Mixi Max"/"Sub Character" o equipos muy secundarios sin arte propio en la wiki).
  `logo_url` se añade a la tabla `teams` (`schema.sql`, `output.py`) y a `catalog.ts`/`InaCard.tsx`/`PlayerCard.tsx`:
  si hay escudo se muestra en vez del nombre del equipo (con `onError` por si la imagen falla, vuelve al texto).

### Pendientes de las fases 1–3, fase 4 y CRUD oculto
- **Tiro largo / bloqueo de tiros**: `build.py` saca los rasgos de cada técnica (`traits`) del campo `chr` de
  `Module:WazaData` (L = tiro largo, B = bloqueo, C/CN = encadenable, P = puños) y de las categorías de zukan; solo
  `long` en tiros y `block` en bloqueos. `TechniqueIcon` usa `tech-longshot` / `tech-shotblock`.
- **Draft guardado** (`lib/saved-draft.ts`): el draft MADFUT se guarda a cada paso; "Seguir el draft guardado" en el
  panel de modos. El del Duelo no se guarda.
- **Sobres** por afinidad y del equipo de la semana (`weeklyTeam`, semana ISO); **objetivos** semanales y de carrera
  (`track()` suma a día, semana y siempre).
- **Torneo**: clasificación y cuadro (`Bracket`) nuevos.
- **Fase 4** (`components/modes/`): Duelo (reglas en [duelo.md](duelo.md)), Higher/Lower, Copas (`lib/cups.ts`) y
  Puzzles (`lib/puzzles.ts`). Mi club / Simulación / Copas juegan con una de Mis plantillas completa.
- **CRUD oculto** (`#/admin`): `lib/admin-edits.ts` guarda cambios en el dispositivo; `catalog.ts` guarda las filas
  de Supabase y `rebuildCatalog()` los aplica encima al momento. Exportar → `data/card_edits.json` →
  `tools/db/edits.py` los aplica en cada build (cartas, nuevas, borradas, técnicas). Columnas nuevas:
  `cards.duel_att/duel_con/duel_def`, `techniques.traits`.
- Probado con Playwright: duelo completo, simulación, higher/lower, copa, puzzle, objetivos, tienda, CRUD (editar y
  ver la carta cambiada), draft guardado y retomado, torneo hasta la final con el cuadro.

### Rediseño de la carta (distribución de MADFUT)
- Pedido con capturas de MADFUT: que se vean todos los iconos y, con una opción, las 3 stats.
- `InaCard`: columna izquierda como la de MADFUT (media · puesto · afinidad en lugar de la bandera · escudo del equipo
  en lugar del club), foto grande, nombre abajo. A la derecha, los 3 números de duelo en etiquetas verde/azul/roja
  dentro de la carta; con los números ocultos, una etiqueta con el juego (como las posiciones alternativas de
  MADFUT). Sin escudo, el equipo sale en texto bajo el nombre.
- Botón de números (`StatsToggle`, preferencia `lib/card-prefs.ts`, en este dispositivo) en Mis cartas, Mis
  plantillas, Colecciones y el Draft. `DuelCard` es ya la misma carta con los números siempre visibles; fuera la
  columna externa.
- Probado con fotos y escudos reales (servidos con curl en la prueba): Mis cartas con y sin números, plantilla en el
  campo y duelo.

### Fase 5: retos, evoluciones e insignias
- **Retos (SBC)** (`lib/sbc.ts`, `phase5/Sbc.tsx`, `#/retos`): se entregan solo cartas repetidas (se gasta una copia,
  nunca la última). Requisitos: media mínima (media simple de las entregadas), N del mismo juego/equipo/afinidad, N
  Top o mejor, N de un equipo, todas de unos juegos. 8 retos, 4 repetibles; `club.sbcDone`.
- **Evoluciones** (`lib/evolutions.ts`, `phase5/Evolutions.tsx`, `#/evoluciones`): las tareas cuentan desde que
  empiezas (se guarda una foto de los contadores de siempre). Mixi Max cambia la carta por su versión Mixi Max real
  del catálogo; espíritu guerrero, armadura (después del espíritu y si puede armarse), tótem y entrenamiento dan una
  carta "evo~<evolución>~<id>" con más media y stats (`lib/evo-boosts.ts`; `getPlayer` las monta al vuelo, la rareza
  se recalcula con la media). Al terminar se cambia una copia; si era la última, también en las plantillas. Las
  cartas evolucionadas llevan brillo y la etiqueta EVO.
- **Insignias** (`phase5/Badges.tsx`, `#/insignias`): escudos de las colecciones completadas (uno se puede poner como
  escudo del club, en la barra de la pantalla principal) y 17 logros (`lib/achievements.ts`).
- Textos con plural: `{n|copa|copas}` en las traducciones.
- Probado: reto (sobre y copias gastadas), evolución Mixi Max (Bailong → Mixi Max Victor) y espíritu guerrero
  (+4 de media, EVO), insignias y escudo del club.

### Evoluciones descartadas
- Se hicieron (Mixi Max → carta real; espíritu guerrero, armadura, tótem y entrenamiento con cartas "evo~…") y se
  quitaron enteras a petición: pantalla, lógica, casilla de la pantalla principal, logros de evoluciones y textos.
  Están en el commit a6d67b0 por si algún día se recuperan. La fase 5 queda en retos e insignias.

### Duelo = Fatal de MADFUT, números nuevos, draft 6 opciones y escudos por época
- **Números de duelo** recalculados (tenían poco sentido: porteros y defensas con mucho ataque): stats afines × lo
  que aprovecha el puesto + supertécnicas (tipo, TP, tiro largo / bloqueo), tope media + 8. Detalle en duelo.md.
- **Duelo** rehecho siguiendo la guía de Fatal de r/MADFUT (`lib/fatal.ts`): Mi club y Draft con 10 rondas por
  turnos, pista de la carta rival (afinidad, escudo, juego), empate por suma y desempate con la última carta (> 5);
  Simulación con 6 ocasiones por puestos (control → ataque contra defensa). Química +2/+1/0/−3 y boost semanal.
- **Draft**: 1 de 6 en formación, capitán y cada puesto; 7 suplentes (cuentan para la media) y 5 reservas (no
  cuentan). `teamRating` divide entre las cartas que haya (antes, siempre entre 11).
- **Escudos**: revisados uno a uno (hoja de contactos). Los nombres casaban bien ("Team D" es el Team K de Kageyama
  en japonés); lo que fallaba era la época: ahora cada equipo guarda también el de GO, Ares/Orión y VR cuando cambia
  (`teams.logos`, 94 equipos) y la carta usa el de su juego.
- Evoluciones: siguen quitadas.
- Batalla en el campo como MADFUT: tu once con sus números y, deslizando, el rival boca abajo con una pista por carta
  (afinidad, juego o escudo). Rival real o generado con química a tope ("Fatal IA", los 11 del mismo juego).

### Interfaz de MADFUT: Fatal, tienda, sobre gratis, códigos y copia de seguridad
- Pedido con capturas de MADFUT (pantalla principal, Fatal, tienda, sobres, cartas con sus 3 números).
- **Números de duelo** recalibrados con cartas reales de MADFUT: plantilla por perfil (delantero, delantero de toque,
  medio de ataque/defensivo, central, carrilero, portero) sobre la media + ajuste propio + supertécnicas; el número
  fuerte nunca pasa de media − 1 (antes llegaban a 99). Detalle en duelo.md.
- **Fatal** (`#/fatal`, `lib/fatal-series.ts`): Mi club y Simulación con 7 series (70…90 y X / 68…91 y X): la
  plantilla no puede pasar de esa media; 9 puntos (victoria 3, empate o derrota 1) → premio (sobres y fichas). Draft
  por divisiones (victoria 3, empate 1; 9 para subir). Temporada = semana (se reinicia el lunes). El panel de la
  pantalla principal enseña Series x/7 y la división.
- **Tienda** (`lib/store-extra.ts`): pestañas Sobres de hoy (4 ofertas del día, las mismas para todos, con unidades y
  cuenta atrás; debajo, los sobres a la venta), Mis sobres y Fichas (fichas de 1 carta con media mínima; ficha gratis
  de 80+ al día). Sobres nuevos de 1 carta (80+, 85–89, 88+, 90+, 100 % Top, bronce, plata) y 2 al azar.
- **Sobre gratis** (`#/sobre-gratis`, botón arriba a la izquierda): 9 cartas casi todas flojas cada 10 minutos;
  puntos = lo que cada carta pasa de 50; barra de bonus a 500 (sobre oro) y récord.
- **Códigos** (`#/codigos`, botón arriba a la derecha): INAZUMA, RAIMON, FFI, CHRONOSTORM, FUEGO, VICTORYROAD (una
  vez cada uno). **Copia de seguridad** (casilla de la página 3): exporta el club, el draft guardado, estadísticas y
  ajustes a un archivo e impórtalo en otro dispositivo.
- Probado con Playwright: 3 partidos de una serie (puntos sumados), oferta de hoy cogida, ficha gratis, sobre gratis,
  código canjeado y repetido, copia descargada.

## UI compacta (todo cabe en la pantalla del móvil)
- **Inicio**: las 3 páginas caben enteras (probado a 360×780 y 400×860): los paneles se reparten el alto, textos y
  cartas del abanico se ajustan al alto de la pantalla; FATAL enseña Mi club / Simulación / Draft sin cortar.
- **Duelo**: marcador en una línea (con el boost de la semana), el campo ocupa el alto que queda y la formación se
  estira a todo el campo para que las cartas no se pisen; botones Tú/Rival dentro del campo; abajo, una barra fija con
  lo que toca (pista del rival, los 3 números de tu carta o la última jugada). El resultado sale arriba al acabar.
- **Plantillas**: volver y formaciones en una sola fila que se desliza (antes 4 filas); el campo entra sin deslizar.
- **Mis cartas**: posición y rareza en una fila; cartas en 3 columnas más grandes; vender repetidas en una línea.
- **Draft**: capitán y opciones de cada puesto en 3 columnas (las 6 caben sin deslizar).
- **Tienda / Fatal**: pestañas y cuentas atrás sin saltos de línea. Menos espacio entre bloques y textos pequeños
  algo más grandes en general.

## Sobre gratis, walkout, CRUD en tiempo real, FR/IT, optimización
- **Sobres**: el panel grande abre el **sobre básico gratis** (antes llevaba a la tienda): 9 cartas flojas, sin
  límite, con puntos, barra de bonus y récord (como el Free Pack de MADFUT). **Walkout** en todos los sobres: la mejor
  carta sale poco a poco en el orden de FIFA (afinidad = bandera → puesto → escudo = club → carta) con rayos del color
  de su rareza; al tocar, todas las cartas de golpe (ordenadas por media).
- **CRUD en tiempo real** (`#/admin`): ya no se exporta nada. Guarda directamente en Supabase con funciones
  `security definer` de `supabase/admin.sql`:
  - La clave pública solo lee; para escribir hace falta la contraseña de admin. La primera vez se crea; para
    cambiarla, el workflow `db-load.yml` con `reset_admin`.
  - Todo cambio va a `admin_log` y `admin_replay()` lo vuelve a aplicar al final de `seed.sql`, así una recarga del
    catálogo no lo borra.
  - Pestañas: Cartas, Equipos, Técnicas, Cuerpo técnico e Historial.
  - Formularios por secciones, con vista previa de la carta en vivo, campos cambiados en amarillo y barra fija de
    guardar/deshacer/borrar.
  - Si quedan cambios antiguos guardados solo en el móvil, se ofrece subirlos.
  - Probado contra un Postgres 16 local con el mismo esquema.
- **Tensión e hiperenergía** de Victory Road recopiladas en `docs/tension-vr.md`, con una propuesta para el Duelo.
- **FR/IT**:
  - El cruce con las wikis fr/it ahora usa también el nombre inglés y normaliza los caracteres de ancho completo
    (ゴッドハンドＶ).
  - Nuevo paso `10b2` en `fetch.py`: enlaces entre idiomas de la wiki inglesa, filtrados por tipo de ficha.
  - Espíritus en FR: de 79 a 212.
- **Optimización**: pantallas con `React.lazy` (bundle inicial de 514 a 355 kB). **Diseño**: explorador de
  jugadores con la carta nueva y filtros plegables; pestañas, selectores y rarezas con los colores de la app; campo de
  la alineación del FFI igual que los demás; cartas del campo algo más grandes.

## Flujo de MADFUT: draft → resumen → Fatal Draft / Copas
- **Quitado el modo clásico** (Draft FFI y Memoria, alineación, torneo, pantalla de resultado, semillas compartidas,
  estadísticas del FFI y el panel de reglas antiguo). Los objetivos y logros «Gana el FFI» / «Llega a semifinales» pasan
  a «Gana un duelo» y «Gana una copa». Las estadísticas salen ahora de los contadores del club.
- **Draft directo**: el panel Draft del inicio abre `#/draft`. Si había uno a medias, pregunta seguir o nuevo.
- **Resumen** (`#/draft-resumen`): media (estrellas), química, puntos de draft (Σ de lo que cada titular pasa de 50 + 5
  por punto de química) con récord personal y rango (bronce/plata/oro/élite), y juegos/equipos/afinidades del once. Abajo,
  Fatal Draft y Copas de draft. El draft se guarda como «último draft» (`ffi-last-draft-v1`).
- **Fatal Draft** (`#/fatal-draft`): división, temporada con cuenta atrás, barra de puntos, boost de la semana, escalera
  de divisiones con premio y los modos Fatal Classic (duelos con el último draft) y Fatal Sim (pronto).
- **Copas de draft** (`#/copas`): se juegan con el último draft; cada copa tiene un boost (cartas de su saga o juegos
  distintos: +4 de química si el once lo cumple).

## TP balanceado de las técnicas (hoja de cálculo → Supabase)
- Cruzada la «Sheet2» con la tabla `techniques`: 765 técnicas con TP nuevo (248 con un TP distinto del anterior). Detalle,
  casos dudosos y lo que no ha cruzado en [balance-tp.md](balance-tp.md); se regenera con `tools/db/balance_xlsx.py`.
- La potencia mín./máx. no se copia de la hoja (en 145 filas se cambió el TP y no la potencia): sale de la escala
  TP → potencia que cumple la inmensa mayoría de la hoja (150 → 180–900, 100 → 100–640…).
- `data/technique_balance.json` → `supabase/technique_balance.sql` (columnas `balance_tp`, `balance_power_min`,
  `balance_power_max`); el workflow lo carga después del seed.
- **La carga completa (`seed.sql`) ya no vacía ni borra nada**: antes hacía `truncate` de todas las tablas, y así se
  perdían las columnas `vr_*` / `balance_*` y las 144 técnicas añadidas a mano de `techniques`, y chocaba con tu tabla
  `card_victorymods_map` (que apunta a `cards`: el `truncate` fallaba). Ahora son solo upserts: las filas nuevas se
  insertan y las que existen se actualizan en las columnas de la carga; lo añadido a mano en la base se queda. Lo que se
  quite del repo ya no se borra de la base. `schema.sql` declara las columnas nuevas. Probado con una copia de la base con
  tu tabla, una carta extra, un vínculo extra y una columna extra: nada se pierde y se puede repetir.
- El workflow `db-load.yml` tiene la opción `balance_only`: aplica solo `technique_balance.sql` (es lo que se ha lanzado
  para este cambio; no se ha ejecutado la carga completa).
- La app enseña `balance_tp` como el TP de cada técnica (ficha de la carta; al mantener pulsado, la potencia) y el CRUD
  permite editar TP y potencias.

- Fatal Sim (MADFUT): SimMatch con marcador, línea de ocasiones y paneles de control/ataque; ruta `#/duelo/draftsim`; ver docs/fatal-sim.md.

- Guía de balance (docs/balance-guide.md): cartas, química, modos, series, draft, economía, sobres, TP y receta para medir.

- Duelo clásico: tensión (400), supertécnicas, combo y ventana por pasos con animaciones (ver docs/duelo.md).
