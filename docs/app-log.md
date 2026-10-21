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

- Supertécnicas más suaves (bonus TP/40, +1 afinidad; presión +3, hiperenergía +4, contraataque +2, táctica 2), botones con icono de tipo y afinidad y color de fondo, y fondo de campo en las ventanas de jugada.

- IA competitiva del Fatal (clásico y Sim): decide con las cartas restantes (src/lib/ai.ts), usa tensión y supertécnicas con criterio. 71 % contra la IA antigua en pruebas.

- `npm run balance` (tools/balance): partidos sin pantalla con el código real e informe docs/balance-report.md. Corrige el duelo (rival adaptado, DUEL_PULL 0,9) y el Sim (SIM_PULL 0,8).

- Sonidos nuevos en las revelaciones y el Sim, vibración en el móvil y guía de tres pasos la primera vez en Fatal y Sim.

- Sim: penaltis con elección de dirección (1 de cada 10 ataques ganados) y cambios de suplentes en el descanso (solo con el último draft).

- Historial de Fatal (src/lib/history.ts, components/modes/MatchHistory.tsx): cada partido de club, Sim y draft se guarda en el dispositivo con marcador, rival y modo (máx. 200). En la página de Fatal: números, racha, forma y últimos 8 partidos con filtro.

- Retos de la semana de Fatal (src/lib/challenges.ts, components/modes/Challenges.tsx): 3 de 5 cada semana (siempre los mismos para todos), con contadores en los objetivos semanales (fatalTechs, fatalWins, fatalNoSpend, penGoals, subsMade) y premio al cobrar.

- Dificultad del Fatal (fácil, normal, difícil): cambia la IA, el rival y el premio (src/lib/difficulty.ts); se elige en la página del Fatal.

- Minijuegos (src/lib/minigames, ruta `#/minijuegos`): calibrar con vuelta de 1800 ms (recomendado en gameplay-analisis §1) y la aguja vuelve al inicio al empezar; pronóstico con favorito según la diferencia de media, empate a 3 puntos, racha (+2 al 3.º acierto, +5 al 5.º) y probabilidades del balance normalizadas. Pruebas: `npm run test:minigames` (21).

- Fatal: el historial se pliega por defecto (un toque para verlo) para acortar la página.

- Depuración de los minijuegos (docs/depuracion-minijuegos.md): H1–H7 corregidos y comprobados en el navegador. La parada de la calibración coincide con el reloj en 40 de 40 pruebas.

- Dojo (`#/dojo`, src/lib/dojo.ts, components/modes/Dojo.tsx): las copias de sobra suben el límite de rotura de una carta (0–3; Legendarias, 2). Cada nivel suma 1 a los tres números, y el tercero, 2. Se aplica en la ficha, en Mis cartas y en el duelo del propio equipo. Límite 3 medido: la media de los números sube 2,7 (con 5, 3,9).

- Fusión Mixi Max (`#/fusion`, src/lib/fusion.ts, src/data/fusions.json): 19 recetas; dos personajes del mismo juego, cada uno con una copia de sobra, dan su Mixi Max. Una vez por cuenta.

## Balance de temporadas: IE1 e IE2 cerrados

Detalle completo en [plan-balance-temporadas.md](plan-balance-temporadas.md) (§3 el estado, §6 las firmas, §7 el registro).

- **IE1 cerrado**: rampa 54 → 79,8 con `compress 0,5` y capitán #1; Raimon y Royal Academy a mano; pool **sin equipo** repartido por **stats + técnica con TP de IE1** (42–75). El parser de técnicas coge el **TP europeo (EU)** en vez del japonés.
- **IE2 cerrado**: `compress 0,5`; escala de **alienígenas** del juego: Géminis 80,6 < Épsilon 81,3 < Épsilon Plus 82,1 < Prominence/Diamond 83 < Royal Redux 84,3 < Génesis 85,4 < Emperadores Oscuros 85,9 < Raimon 87 < **Caos 87,9**. Capitán #1 en todos (Kiyama 89, Caos 90).
- **Equipo nuevo: Caos** (IE2): fusión de Prominence + Diamond Dust, 11 jugadores con su «Chaos form» (escudo y nombre «Caos», top 1 Torch/Gazelle). Se crea con `overrides.extra_versions` + `team_tuning['Chaos']` (`cap` 90).
- **IE2, correcciones**: Emperadores Oscuros a sus 11 reales; **Isabelle → Bellatrix** (nombre alien + sprite de zukan 1134) en Génesis; Raimon-joiners con sus dos versiones (regular en su equipo / Raimon final), Shawn el mejor; **normales** ordenados como la wiki/foros (Claustro ≈ Mary Times > SP Fixers > Fauxshore > Alpino); pool sin equipo **46–84**; `tech_balance` (técnica del puesto, y **TP de IE3** para los alienígenas porque en IE2 iba rebajado por la piedra Aliea); apodos de Génesis arreglados.
- **Subido**: rama `app` + workflow `db-load` (Supabase: characters 4.976 · cards 5.393; upsert, sin borrar lo del CRUD).

## Balance de temporadas: IE3 cerrado

Detalle completo en [plan-balance-temporadas.md](plan-balance-temporadas.md) (§3 el estado y §7 el registro).

- **IE3 cerrado**: rampa **84,4 → 89,9** con `_game.IE3.compress = 0,5`. Asia: Big Waves (Australia) 84,4 → Leones del
  Desierto (Catar) 84,6 → Dragones de Fuego (Corea) 85,8. FFI: Knights of Queen (Inglaterra) 86,0 → Unicorn (EE. UU.)
  86,9 → Orfeo (Italia) 87,4 → Emperadores (Argentina) 86,7 → Os Reis (Brasil) 89,1 → **Little Gigantes (Cotarl) 89,9**
  (final). Inazuma Japón (protagonista) 90,9, un punto por encima de Little. **Capitán #1 en los 20 equipos**, con los capitanes de la wiki.
- **Capitanes**: Niese Dolphin · Bjorn Kyle · Saginuma Osamu (Neo Japón) · Choi Chang-soo · Edgar Valtinas ·
  Demonio Strada (Equipo D) · Pierre Godin · Jonas Pollack · Querardo Naval · Mark Krueger · Fidio Aldena (Nakata es el
  ex-capitán) · Teles Torrue · Mack Ronijo · Lubbock Henktacker (Zoolan) · Rococo Ulpa · Endou Mamoru · Jake Fana
  (Caimanes) · Sein (Sky) · Desuta (Dark) · Baddap Sleed (Ogro). Dragones de Fuego sube a Choi **90** para ser #1;
  Knights of Queen sube su once a 86,0 para no quedar por debajo de la final de Asia; Unicorn **baja** a sus 90
  (Mark Krueger 92, Erik Eagle 90, Dylan Keats 89) para no quedar por delante de Os Reis y Little Gigantes.
- **Extras con curva y capitán**: Equipo D = *Team K* de Mister K (subido a nivel de Knights, 86,5); Zoolan Team =
  *Team Garshield*; Caimanes del Cabo = *The Great Horn* («The Cape Crusaders», Sudáfrica); Sky Team = *Tenkuu no
  Shito*; Dark Team = *Makai Gundan Z*; Equipo Ogro = *Ogre* (película / versión Team Ogre), subido a nivel de Little
  Gigantes (89,6, top 93).
- **Nombres por versión**: el `nickname` de la app ya puede ser por versión (`personaje|juego|versión`) y el nombre de
  la carta también (`overrides.card_names`). Neo Japan muestra/guarda los nombres del juego (Dave Quagmire, Zack
  Cummings, Wilbur Watkins, Zeke Valanche, Ethan Whitering, Sail Bluesea, Johan Tassman, Henry House, Argie Bargie,
  Mark Hillvalley, Joseph King) y Génesis/Épsilon se queda con los alien (Dvalin, Zohen, Wittz, Zell, Heat).
- **Pool sin equipo** (`scout_pool.IE3`): 341 cartas, **46–88**, mediana 66; top Chucky Cardaway 88. Notables
  cuadrados con el ranking competitivo (Sutefuda 88, Bernadette 87, Fudouyama 86, Libra 85, Ray Pier 85, Kazamatsuri
  84, Virgo 82, Shippuu 81, Kappa 80…); el resto, reordenado por rendimiento (stats Lv99 + técnica por puesto).
- **Técnicas**: `tech_balance.IE3` (50 % stats + 50 % técnica del puesto, TP de IE3) en los 22 equipos.
- **Balance** (`npm run balance`): queda un único aviso marginal: en «condiciones reales» (media 75, humano fuerte) se
  gana 27,2 % (rango 28–65), con el once mezclado a −0,5 de química contra 2,5 del rival. Con el pool a 46–86 el aviso
  pasaba a Expedición (5,27 victorias / 20,7 %), así que se deja **46–87**. La Expedición queda en **4,17 / 9,1 %**
  (con el catálogo anterior sin cerrar, 6,42 / 26,8 %).
- De paso: el techo de IE3 pasa a 93 (`CEIL`) y el máximo real queda en 94 (Mark Evans, Inazuma Japón); la tabla de IE1 de `plan-balance-temporadas.md` se
  corrige a los valores reales (54 → 79,8); `tuning.py` escribe el volcado de depuración en UTF-8.
- **Segundo Raimon (IE2)**: alineación de la final vs Emperadores Oscuros (Tachimukai; Kabeyama, Tsunami, Kogure,
  Touko; Fubuki; Gouenji, Megane, Domon, Kidou; Endou capitán), **Fubuki en su forma fusionada** (el build admite
  `form` en `extra_versions`), Nakatani fuera del equipo, y medias por méritos: Axel/Fubuki 89, Jude 88, Endou 88
  (capitán), Erik 86, Darren 87, Tsunami 86, Kabeyama/Domon/Touko 85, Rica 84, Kogure 83, Megane 80. Once 86,5.
- Pendiente: **GO1, GO2, GO3, Ares y Orion**.

## Balance de técnicas de IE1/IE2/IE3 (escala B)

Detalle en [balance-tecnicas-ie123.md](balance-tecnicas-ie123.md) (índice), con un doc por tipo: tiros (individuales, dobles y triples), regates, bloqueos y paradas.

- **Aplicado**: 371 ids de `data/technique_balance.json` con la escala B en múltiplos de 10 — tiros 50–200 (individuales 50–160, dobles 60–180, triples 80–200), regates 50–150, bloqueos 50–150 y paradas 50–180. Cambian de TP 289; 17 ids no estaban en el JSON (técnicas añadidas a mano en Supabase) y se han incorporado.
- **Potencias**: salen de la escala TP → potencia que ya tenía el JSON (50 → 50–300 … 200 → 270–1080), no de la hoja.
- **Sin id**: Bola de tierra (tiro individual de IE1, TP 22 → 60) no existe ni en la base ni en el build; queda pendiente de alta.
- **Carga**: `supabase/technique_balance.sql` regenerado desde el JSON; se aplica con el workflow `db-load` (`balance_only`).
- **Aviso**: `tools/db/balance_xlsx.py` sigue regenerando el JSON desde la hoja y pisaría estos valores; si se vuelve a usar la hoja, hay que meter antes la escala de IE123.

## Ares: temporada cuadrada

- **Rampa** (once, #1): Bastión 76,0 (80) → Green Hill 76,4 (77) → Brain 77,1 (82) → Kirkwood 77,2 (83) → Royal Academy 78,4 (84) → Academia Polaris 79,8 (85) → Zeus 80,8 (86) → Ribera 81,2 (88) → Alpino 81,6 (86) → Academia Alia 82,9 (87) → Raimon 84,5 (87) → Academia Plenilunio 85,0 (87) → Barcelona Orb 86,1 (88).
- **Compresión y ajuste**: `_game.ARES.compress = 0,5` y `ovr_shift = -1` (toda la temporada un punto más abajo). Sin la compresión los cracks de equipos flojos se disparaban (Brain 78,2 con Neil Turner 87; Polaris 80,5 con Acker Reese 88).
- **Raimon (Inakuni)**: entra en la curva con 84,5 y capitán Sonny Wright (Asuto). Antes se quedaba en 80,5, por debajo de rivales a los que gana en la historia.
- **Excepciones**: Mark Evans no baja (88), Axel Blaze sube a 83 (por delante de Mukata 81 y de Jude 81), Ribera baja al nivel de Alpino con Mark a mano y Green Hill sube al nivel de Bastión.
- **Cobertura**: 199 cartas y 14 equipos; los 198 jugadores de zukan de Ares tienen carta. Green Hill (76,4) queda al nivel de Bastión; Secundarios (77,8) son los clásicos que se van del Raimon.
- **Posición**: 1,8 por debajo de IE2 (Caos 87,9) y muy por encima de IE1 (Zeus 79,8); es el sustituto de IE2 en su línea temporal.
- Cargado en Supabase con `db-load` tras el rebuild de `seed.sql`.

## Stats de las cartas: balance del mod a nivel 40

- **IE1-3** usan las stats del mod de Victory Road (`EditorMods/balance_last.json`, **modelo 3** con el reparto por puesto): `data/stats_mod.json` cruza **2.320 cartas** por código de modelo (`crc32` → `chara`) y por nombre + juego + equipo de las copias de versión (Axel IE2/IE3, Mark IE2/IE3, Shawn IE2 Raimon DEL / Alpine DEF…).
- `build.py` las reescala a la media de la carta, las pasa a **nivel 40** con la curva de Character Reforged y guarda `stats40` (7 stats), `growth` y `freedom`.
- Las **6 stats del motor** (`shooting`…`goalkeeping`) se derivan de las 7 con las fórmulas de duelo y se normalizan por puesto a 25-99, manteniendo el OVR.
- La ficha enseña las **7 stats** con los iconos del juego, la letra por cuantiles y los **7 duelos**; GO, Ares, Orion y VR siguen con las 6 stats.
- Cobertura: **2.320 de 2.335** cartas de IE1-3 (las 15 sin fila en el mod se quedan como estaban). Detalle en [balance-stats.md](balance-stats.md).
- Regenerar: `python tools/db/import_stats_mod.py <EditorMods>` + `python tools/db/build.py`.

## Orion: temporada cuadrada

- **Rampa**: Bisonte Rojo 76,3 → Demonios Brillantes 76,6 → Bailarines Eternos 77,9 → Fénix Árabe 78,1 → Tropa Acrobática 79,5 → Gigantes Invencibles 80,9 → Star Unicorn 81,1 → Navy Invader 82,1 → Olé de Samba 83,1 → Guardianes de la Reina 84,6 → Chispas Perfectas 86,1 → Eclipse de Orión 87,0.
- **Compresión**: `_game.ORION.compress = 0,5`. Sin ella los cracks de equipos flojos se disparaban (Bailarines 78,3 con Samba Sokolov 91; Navy 82,8 con Yoga 90).
- **Inazuma Japón**: 89,7 y capitán Jude Sharp 92; no se toca (protagonista, por debajo del de IE3 90,8).
- **Cobertura**: 207 cartas y 15 equipos; Secundarios (66,5) y Raimon (45,4) no son rivales de la historia.
- Cargado en Supabase con `db-load`.

## Técnicas de Ares y Orion

- **451 técnicas** distintas usadas por cartas de Ares/Orion; **135 son exclusivas** de esos juegos (331 usos). Las compartidas con IE1-3 ya siguen la escala de [balance-tecnicas-ie123.md](balance-tecnicas-ie123.md).
- Faltaban **4 TP**: Niebla mística (90), Ataque de garza (80), Guardia acrobática (80) y Presa de sombras (50). Se han añadido y cargado.
- El resto de exclusivas ya tenía TP en 50–200; el catálogo completo, con usos y potencia, está en [balance-tecnicas-ares-orion.md](balance-tecnicas-ares-orion.md) para revisar firmas por lore.

## Técnicas de Ares/Orion desde la wiki

- Revisadas las categorías de la wiki española: **49 técnicas introducidas en Ares** y **65 en Orion**. Faltaban 7: 6 son de fútbol (una ya existía como `vr_whs03290`, Last Resort D) y se han añadido al catálogo y a sus cartas.
- Añadidas: **Entrada deslumbrante** (Acker Reese, Cygnus Starkey, Ari Zimmerman, Erik Eagle), **Mar de lágrimas** (Rolland Bowlby), **Muro colectivo** (los 4 defensas de Bastión), **Pingüino goleador** (Sonny y Elliot) y **Embestida bufalina** (Seok, Baek y Lee).
- **Celebración sanadora** no se añade: la wiki la clasifica como supertécnica no de fútbol.
- Detalle y usuarios en [tecnicas-wiki-ares-orion.md](tecnicas-wiki-ares-orion.md).

## Tiros de Ares: comprobación de nombres

- De los **24 tiros que debutan en Ares**, **23 ya estaban** en la app con otro nombre (se han cruzado por japonés/inglés con la wiki inglesa): Cabezazo fiero, Combo cósmico, Granizado de fuego, Ofensiva danzarina, Omnisabiduría divina, Nudo atrapaosos, Lancero real, Lanza polar, Tiro meteórico, Liebre blanca, Tiro centrífugo, Sierra celestial, Ímpetu de dragón, Detonador, Victoria tricolor, Frente frío, Remate en zigzag…
- **Solo faltaba Pingüino Aéreo** (Overhead Penguin / Penguin Volley), añadido a Elliot Ember (Ares y Orion) y Jude Sharp (Orion).
- Tabla completa en [tecnicas-wiki-ares-orion.md](tecnicas-wiki-ares-orion.md).

## Variantes A de Victory Road

- El zukan tiene **Fire Tornado A** y **Meteor Blade A** (las dos únicas variantes “A” de originales). Se han añadido como **Tornado de fuego A** (`vr_whs02750`) y **Cañón de meteoritos A** (`vr_whs03410`), con TP 70 y 120.
- Asignadas a **Basile Hardy** (Ares y Orion) y **Hunter Foster** (Ares), que son sus usuarios.
- Son variantes de la misma técnica, no técnicas nuevas: mismo poder que las originales (360 y 440 en VR).

## Ares: tiros por número de jugadores

- Revisados los tiros que debutan en Ares: **17 individuales, 4 dobles y 5 triples**. Tablas completas en [tecnicas-wiki-ares-orion.md](tecnicas-wiki-ares-orion.md).
- **Cambios de TP**: Cañón de meteoritos A **120 → 100**, Detonador **100 → 120** y Lancero real **100 → 120**.
- Escala de Ares **60–150**, un escalón por debajo de IE2 (60–180); el techo son Combo cósmico y Ventisca triple (150).

## Técnicas con la placa del juego

- La ficha pinta cada técnica como el editor: placa `plate_fsp_<el>` (elemento), icono de categoría, nombre, marcas de tiro lejano/bloqueo y TP.
- Faltan las marcas de grado (`growthType` y grado evolucionado no están en la base) y las caras/escudos del juego (54 MB, pendiente de CDN). Detalle en [tecnicas-visual.md](tecnicas-visual.md).


## Orion: Rayo de diamantes curvo

- Añadida **Rayo de diamantes curvo** (Magaru Diamond Ray / Curving Diamond Ray) a **Sergi Hernández** (Orion), TP **140**, VR 540. Es la evolución de Rayo de diamantes y faltaba en el catálogo.
- Revisadas las 70 técnicas de la categoría inglesa de Orion y las 959 de Victory Road: el resto ya estaban con otro nombre en la app.
- La única ausencia real de Orion era esta; en VR solo quedan variantes menores sin usuario (Gutsy Grit Punch y dos códigos sin nombre).


## Orion: paradas posicionadas por VR

- Ajustadas **14 paradas** de Orion para que cada escalón de VR quede por encima de Ares: 640 → 150–190, 540 → 140–150, 440 → 120–130 y 360 → 100–110. Detalle en [balance-tecnicas-orion.md](balance-tecnicas-orion.md).
- Añadida **Parada de espaguetis extra** (*Sauced-up Marinara Barrier*) a **Gonçalo/Macero** (Orion, slot 4) con TP **120**; estaba en el catálogo sin carta.
- La ficha inglesa de cada técnica (potencia VR, 	_vr, evolución y Info) se ha usado para decidir el suelo de cada banda: las firmas suben a 130 en 440 y las que fallan en el anime se quedan en 120.


## GO1: temporada y Equipo Zero

- Revisada la temporada GO1: rampa **75,0 → 83,5**, Raimon **83,9**, techo 87. Corregido compress_above en 	uning.py para que la compresión de >84 no se pierda al aplicar la curva del equipo: Bailong 92 → 88, Iggie 90 → 87, Dracon 89 → 87… y desaparecen las tres fallas de capitán (Royal, Alpine y Kirkwood).
- Creado **Equipo Zero** (post-game, combinado de **Luz Eterna + Oscuridad Ancestral**, como el Caos de IE2): 11 versiones «Zero» con sprites (Z), target **85,0** y capitán **Hakuryuu**. Los 6 cartas de cuerpo técnico/banquillo que el zukan ponía en Team Zero pasan a **Sub Character**.
- Documentado en [plan-balance-temporadas.md](plan-balance-temporadas.md) y [plan-base-jugadores.md](plan-base-jugadores.md).


## Equipo Zero: sprites de Victory Road

- Cambiados los 11 sprites del Equipo Zero por los de la sección **Victory Road** de las fichas inglesas (.../Game_appearance#Victory_Road): uniforme Zero (Z) ... sprite (VR).png. Los anteriores (Z) ... sprite.png eran los de GO1 y no cuadraban.
- **Criterio desde ahora**: para sprites e info de jugadores/técnicas, revisar primero la **wiki inglesa** (inazuma-eleven.fandom.com), que tiene la galería completa por juego (Game_appearance → Victory Road).


## Dark Angel y técnicas exclusivas de las combinadas

- **Zero y Chaos**: ZeroMagnum sale de las cartas base de Bailong y Tezcat (Luz Eterna / Oscuridad Ancestral) y queda solo en **Equipo Zero**; Fire Blizzard sale de Prominence y Diamond Dust y queda solo en **Chaos**. Los duplicados de Torch y Gazelle en Chaos se quitan: la carta base ya no lleva `extra_teams: ["Chaos"]`. `tech_remove` ahora funciona en IE/GO y el seed borra los enlaces viejos antes de reinsertar.
- **Dark Angel** (IE3): creado el combinado de **Sky Team** + **Dark Team** con las 11 versiones (Astaroth, Hebeemoth, Beelzebu, Nenel, Elfel, Mephisto, Satanatos, Gyuel, Uinel, Desuta y Sein), target **83,5** y capitán **Desuta**. **Shadow Ray** (tiro de dos de Sein/Sael y Destra) sale de las cartas base y queda solo en las versiones de Dark Angel; **Dark Phoenix** se queda en Thanatos base y en su versión Dark Angel.
- **Sprites**: Equipo Zero con los `(Z) ... sprite (VR)`; Dark Angel con los **VR de sus equipos base** (`(MGZ)` para el Dark Team y `(TS)` para el Sky Team), porque la wiki inglesa no tiene sprites VR del uniforme Dark Angel; en Chaos, Torch y Gazelle pasan a los `(C) ... sprite (VR)` ingleses y el resto sigue con los `(C) HVR`.


## GO1 Raimon: plantilla del último partido

- **Raimon First Squad** pasa a los 16 principales del final vs Dragonlink: entran **Tsurugi** (desde Black Templars), **Aoyama** e **Ichino** (desde Raimon Second Squad) con sprites (SR) VR; salen **Kosaka** y **Mizumori** (dejaron el club → Unaffiliated) y **Minamisawa** (Gassan Kunimitsu → Lunar Sea).
- Sprites: Tsurugi en Black Templars con (KK); Kosaka/Mizumori con (SR); Minamisawa con (GK) de Gassan Kunimitsu.
- Técnicas de dos versiones: **Shadow Ray** Forest/Mountain y **Fire Blizzard** Fire/Wind se separan por id y elemento (wood/earth y ire/ir) con overrides.technique_elements; ya no caen en el morado de Vacío.


## Técnicas: revisión de elementos

- Añadido el elemento **Vacío** (`void`) a la app (`Element`, `EL_NUM` y traducciones) con la placa `plate_fsp_5.png`; las técnicas Void ya no usan el degradado morado de reserva.
- Asignados 8 elementos que faltaban (Bull Steam Ahead, KAMAKURA D, Koutei Penguin 2gou feat. Shark, Triple G Strike, Penguin The God & Devil, Inazuma Break CG, Super God Hand y Tenkuu Hayabusadan) y 5 Void (Last Resort Σ/D, Mega Majin Trio, Black Shield y Black Field).
- Las 4 que quedaban sin elemento se han resuelto con la wiki española: **Shining Penguin** → Vacío (manga sin elemento), **Chilena de pingüino** → Bosque (variante azul de Overhead Penguin; la negra/fuego es Pingüino Aéreo), **Arrollador** (= Coz/Judge Through) → Fuego y **Orion's Shade** → Vacío (Neutro en VR; Bosque en SD).
- Quedan 24 técnicas con elemento único (`{{PAGENAME}}`/nombre propio). Detalle en [tecnicas-visual.md](tecnicas-visual.md).
