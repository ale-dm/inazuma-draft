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
