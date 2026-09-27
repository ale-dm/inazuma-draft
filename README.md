# Inazuma Draft — FFI

> Draftea tu **Inazuma Japón**. Gana el **FFI**.

Fan game de *Inazuma Eleven*: draftea 11 jugadores, arma tu alineación y juega el torneo **Fútbol Frontier Internacional** en la Isla Liocott.

🎮 **Juega aquí:** [inazuma-draft-alpha.vercel.app](https://inazuma-draft-alpha.vercel.app/)

**Proyecto fan no oficial — sin relación con Level-5.**

---

## 🙏 Agradecimientos

Este proyecto es un **fork de [Inazuma Draft — FFI 6-0](https://github.com/thomaslekieffre/inazuma-draft)**, creado por **[Thomas Lekieffre](https://github.com/thomaslekieffre)** ([versión original](https://ffi-6-0.vercel.app)). La idea, el draft, el torneo y toda la base del juego son obra suya: ¡muchísimas gracias por hacerlo y por compartirlo! Si te gusta, puedes [apoyar su proyecto](https://paypal.me/tlekieffredev).

Gracias también a quienes hacen posibles los datos:

- **[Inazuma Eleven Wiki (Fandom)](https://inazuma-eleven.fandom.com)**: stats por juego, supertécnicas y plantillas (contenido bajo licencia [CC BY-SA](https://creativecommons.org/licenses/by-sa/3.0/)).
- **[Zukan oficial (Inazugle)](https://zukan.inazuma.jp)** de Level-5: nombres oficiales y retratos.
- **[Xtreme Team](https://www.xtreme13.com)**, por el mod *Inazuma Eleven GO Strikers 2013 Xtreme*, su documento de balanceo y su [wiki](https://iegos13xtreme.fandom.com).
- La comunidad competitiva, por sus listas de los mejores jugadores y fichajes.

---

## Cómo se juega

### Modos

| Modo | Descripción |
|------|-------------|
| **Clásico** | Se ven la nota (OVR) y las estadísticas: elecciones informadas |
| **Memoria** | Sin estadísticas: draft de pura memoria |

### Draft (11 rondas)

- En cada ronda sale al azar **un equipo de un juego** (p. ej. Raimon IE1, Dark Emperors IE2, Chrono Storm GO2) y eliges **un jugador** de esa plantilla.
- **3 re-rolls en total** para todo el draft.
- Posiciones estrictas (POR / DEF / MED / DEL), con colocación automática en el campo.
- **Semilla compartible:** copia el enlace y otra persona tendrá los mismos sorteos.

### Alineación

Formaciones reales de Inazuma Eleven (F-Basic, F-Three Top, F-Death Zone 2, F-Butterfly…). Cada jugador tiene que ocupar una casilla de su posición.

### Torneo FFI

- Cuadro **sorteado** entre los equipos de todos los juegos.
- **Grupo A:** 4 partidos; pasan los 2 primeros. El **Grupo B** se simula aparte.
- Semifinales (1.º A vs 2.º B · 2.º A vs 1.º B) y final. Si hay empate en eliminatorias: **penaltis**.
- La simulación usa el poder del equipo, los elementos, el azar y las **supertécnicas de tiro** de cada jugador.

---

## Jugadores

- **~3.900 cartas** de IE1 a GO Galaxy: cada personaje en su primer juego, más **versiones** para quien las tiene (Raimon / Second Raimon / Inazuma Japan, Dark Emperors, subformas como Shawn/Shirou, Young Inazuma, Inazuma Japón Legendario adulto, Chrono Storm con Mixi Max, Earth Eleven…).
- **Nota global (OVR) estilo FIFA** (44–94) y 6 estadísticas: Tiro, Control, Físico, Velocidad, Defensa y Parada.
- **Categorías:** Legendary (89+), Top (83+), Advanced (75+), Growing (65+) y Common.
- **Supertécnicas reales** de cada juego, con su coste (TP) y **nombre en castellano** ([wiki en español](https://inazuma.fandom.com/es/wiki)).
- **Sección Jugadores** (botón 👥 o [`#/jugadores`](https://inazuma-draft-alpha.vercel.app/#/jugadores)): buscador con filtros (posición, categoría, juego, elemento, equipo, OVR mínimo), navegación **Juego → Equipos → Plantilla** y ficha de cada jugador con sus stats, supertécnicas y otras versiones.
- Idiomas **español, francés e inglés** · tema claro / oscuro.

### Cómo se calcula la nota

Las estadísticas vienen de los **juegos originales** (nivel 99), y el nivel de las estrellas de los rangos de ***Inazuma Eleven GO Strikers 2013*** con los ajustes del **mod Xtreme**, el único juego con personajes de todas las épocas en la misma escala. Los detalles están en [`docs/plan-base-jugadores.md`](docs/plan-base-jugadores.md).

---

## Desarrollo

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # build de producción · npm run preview para probarlo
```

### Base de datos (Supabase)

Los jugadores se cargan desde **Supabase** al abrir la app (solo lectura, clave *publishable*). La base se genera con scripts a partir de las fuentes de arriba:

```bash
python3 tools/db/fetch.py   # descarga las fuentes (caché en tools/.cache/db/)
python3 tools/db/build.py   # genera las cartas → supabase/seed.sql + build/review.csv
```

- **Ajustes a mano:** [`data/overrides.json`](data/overrides.json) (jugadores destacados, posiciones por versión, notas manuales…).
- **Carga:** un push a `main` que cambie `supabase/` recarga la base con el workflow `db-load.yml` (secreto del repositorio `SUPABASE_DB_URL`).
- Para usar otro proyecto de Supabase: variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_KEY`.

### Stack

React 19 · TypeScript · Vite 6 · Tailwind CSS 3 · Supabase · Vercel · PostHog (opcional, `VITE_PUBLIC_POSTHOG_KEY`)

---

## Licencia y aviso

Proyecto fan gratuito y sin ánimo de lucro. *Inazuma Eleven* © Level-5 Inc. Sin afiliación, patrocinio ni reivindicación de propiedad intelectual. Los retratos y nombres pertenecen a sus propietarios; los datos de la wiki de Fandom se usan bajo licencia CC BY-SA.
