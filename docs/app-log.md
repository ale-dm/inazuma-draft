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
