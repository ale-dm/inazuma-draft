# Plan de los modos nuevos (gacha gratuito)

Desarrolla las ideas de [ideas-modos.md](ideas-modos.md). Cada modo tiene: **objetivo**, **reglas**, **datos** (qué se
guarda y dónde), **pantallas y archivos**, **reutiliza**, **pasos** en orden (cada paso se puede probar solo), **pruebas**,
**economía** y **criterio de hecho**. Al final, lo que hay que decidir antes de empezar.

## Principios comunes
- **Todo gratis.** Los premios salen de jugar (monedas, sobres, fichas). Ningún modo vende nada con dinero.
- **Datos en el club** (`src/lib/club.ts`, clave `ffi-club-v1`): cada modo añade su campo con valor por defecto en `fresh()`
  y lo lee con `?? valor` (así las cuentas viejas siguen funcionando). Nada de datos nuevos en Supabase salvo donde se diga.
- **Premios por `giveReward`** (`objectives.ts`): monedas, sobre o ficha. Un modo nunca da cartas sueltas sin pasar por ahí.
- **Balance antes de lanzar:** cada modo que da premios se mide con `npm run balance` y se suma al
  [balance-guide](balance-guide.md) (§5, economía).
- **Rutas:** cada modo es una pantalla con su hash en `src/lib/route.ts`, carga perezosa en `App.tsx`, y entrada desde el hub.
- **Textos** en las cuatro lenguas (`src/i18n/translations.ts`), con el mismo número de claves en cada una.

---

## 1. Dojo: ascender con copias

**Objetivo.** Dar salida a los repetidos subiendo el límite de una carta.

**Reglas.**
- Cada carta tiene un límite de rotura, de 0 a 5 (`LIMIT_MAX = 5`).
- Una copia extra que tienes de una carta sube su límite en 1 (en vez de venderla). Solo se puede si tienes copias de sobra.
- Cada nivel de límite suma **+1 a los tres números** de la carta (`duelStats`), y +2 al tercer nivel. El tope sigue siendo `OVR − 1`.
- La venta rápida (`QUICK_SELL`) sigue existiendo para la última forma de salida, pero con el precio bajado a la mitad si la copia ya
  subió el límite al máximo.

**Datos.** `club.limits: Record<cardId, number>` (0–5). Nada en Supabase.

**Pantallas y archivos.**
- Ficha de la carta (`CardInfo.tsx`): botón «Ascender» si hay copias de sobra, con el límite actual (`●●○○○`).
- Modo nuevo `src/components/modes/Dojo.tsx` con hash `#/dojo`: lista de tus cartas con copias, por qué subir primero, y el límite de cada una.
- `duel.ts`: `duelStats(p)` suma el límite de `club.limits[p.id]`.
- `club.ts`: `addLimit(cardId)`, y que `quickSell` tenga en cuenta el límite.

**Reutiliza.** `addCards`, `removeCopies` (club.ts), `duelStats`, el sistema de iconos de rareza.

**Pasos.**
1. Campo `limits` en `ClubState` + `fresh()` + función `addLimit` con pruebas de tope y de copias de sobra.
2. Suma del límite en `duelStats` y en la ficha (sin cambiar el tope del OVR).
3. Botón «Ascender» en la ficha; la copia se resta y el límite sube.
4. Pantalla Dojo (lista, filtros por rareza) con el límite y el siguiente paso.
5. Precio de la venta rápida con el límite máximo a mitad de precio.
6. Balance: medir el efecto en `balance-report` con límite 5 en todos los equipos (no debe subir más de 2–3 puntos la media).

**Pruebas.** Unitarias de `addLimit` (tope, copias de sobra, no se puede ascender con la última copia). Playwright: ascender una carta
y ver el número nuevo en la ficha.

**Economía.** Coste cero (usa copias que ya tienes). Reduce la venta rápida, así que baja la fuga de monedas del sobre gratis.

**Criterio de hecho.** Ascender una carta cambia sus números en la ficha y en el duelo; el Dojo lista las cartas; `npm run balance` sin ⚠.

**Preguntas abiertas.** ¿Límite máximo 5 o 3? ¿Un límite bajo por rareza (Común hasta 5, Leyenda hasta 2)?

---

## 2. Expedición (roguelike de draft)

**Objetivo.** Un modo nuevo y distinto cada vez, con las cartas que tienes sin gastar nada.

**Reglas.**
- Empiezas con un **equipo base** de 11 de tu último draft (o de una plantilla).
- Son **8 rivales** en orden de dificultad (media de 70 a 88), uno por partido de Fatal (modo clásico, con la IA de siempre).
- Tras **cada victoria** eliges **1 de 3** recompensas: (a) un jugador de la lista, que entra al once; (b) un refuerzo: +5 a un número de una carta, o +1 química; (c) una supertécnica nueva para una carta.
- Un empate avanza con la mitad de las monedas y sin recompensa de elección; una derrota acaba la expedición.
- Vencer al octavo rival da el premio grande (sobre especial de expedición). Cada rival vencido da monedas.
- Solo dura la expedición: las recompensas no se quedan en tus cartas (solo las monedas y los sobres).

**Datos.** `club.expedition: { run: { team, step, picks, won } | null, best: number }`. Una partida activa por cuenta.

**Pantallas y archivos.**
- `src/components/modes/Expedition.tsx`, hash `#/expedicion`: mapa de 8 nodos, elección de recompensa, resumen.
- `src/lib/expedition.ts`: generar rivales por paso, generar las 3 recompensas, aplicarlas al equipo de la expedición.
- Partido: reutiliza `Duel.tsx` (`FatalMatch`) con `source = 'expedition'` y `rivalTeam` con media fija por paso.

**Reutiliza.** Todo el motor de Fatal (`fatal.ts`, `ai.ts`, `tension.ts`), `history.ts` (guarda cada partido), `giveReward`.

**Pasos.**
1. `expedition.ts`: rivales por paso (media 70 → 88) y generación de las 3 recompensas. Pruebas puras, sin pantalla.
2. Estado de la partida en el club (`run`), con guardar y reanudar al recargar.
3. Pantalla del mapa: 8 nodos, el actual, los vencidos, y el botón de jugar.
4. Partido: usa `FatalMatch` con el equipo de la expedición (con las recompensas de elección ya aplicadas).
5. Elección de recompensa tras cada victoria (3 tarjetas), y aplicación al equipo.
6. Premio por paso y premio final (sobre especial, nuevo en `packs.ts`).
7. Récord (`best`) y entrada desde el hub con su tarjeta.
8. Balance: medir cuántos pasos llega un jugador razonable (`npm run balance` con un bot que elige la recompensa de media) y ajustar.

**Pruebas.** `expedition.ts`: 8 rivales ordenados, 3 recompensas distintas, aplicar cada tipo cambia el equipo como debe.
Playwright: una expedición entera con un bot, y reanudar tras recargar.

**Economía.** Monedas por paso (de 150 a 600) y un sobre de expedición. Medir que una expedición completa no paga más que una semana de objetivos.

**Criterio de hecho.** Se puede empezar, perder, reanudar y completar; el récord se guarda; `npm run balance -- --expedition` (escenario nuevo) sin ⚠.

**Preguntas abiertas.** ¿Las recompensas de jugador son de una sola expedición? ¿Se puede repetir el mismo rival? ¿Hay vidas (3 derrotas) o una sola?

---

## 3. Campaña por capítulos

**Objetivo.** Contenido con historia por saga, con reglas y estrellas que dan una razón para volver.

**Reglas.**
- Cuatro mapas: Inazuma (IE1–IE3), Galaxy (GO1–GO3), Ares/Orion y Victory Road.
- Cada mapa tiene **5 capítulos** de **3–5 partidos**. Cada capítulo tiene una **regla** (solo un juego, media máxima del once,
  formación fija, sin técnicas, solo afinidad X, sin cambios).
- Cada capítulo tiene **3 estrellas**: ganar (1), ganar sin recibir gol (2), y ganar con una condición extra (3, p. ej. marcar un penalti, ganar con una técnica de tiro largo).
- Las estrellas dan monedas y fichas la primera vez. Repetir un capítulo no paga otra vez, pero sí se puede repetir para estrellas.

**Datos.** Los capítulos son datos (`src/data/chapters.json` versionado en el repo, no en Supabase). Progreso en el club:
`club.campaign: Record<chapterId, { stars: 0–3, claimed: number }>`.

**Pantallas y archivos.**
- `src/data/chapters.json`: capítulos (id, mapa, regla, rivales por nombre o media, estrellas).
- `src/lib/chapters.ts`: aplica la regla al equipo y a la IA; calcula las estrellas.
- `src/components/modes/Campaign.tsx`, hash `#/campana`: mapa con capítulos y estrellas.
- Partido: `FatalMatch` o `SimMatch` con la regla aplicada al equipo (`fatalTeam`) y al rival.

**Reutiliza.** Fatal y Sim, `lastDraftXI`/`draftSquad`, `giveReward`, `history.ts`.

**Pasos.**
1. Formato de `chapters.json` y validación (regla conocida, rivales existentes en el catálogo). Prueba de carga.
2. `chapters.ts`: aplicar cada tipo de regla (solo un juego, media máxima, formación fija, sin técnicas) a un equipo, con pruebas.
3. Progreso y estrellas en el club, con cobro al primer conseguido.
4. Pantalla del mapa y la lista de capítulos, con candados y estrellas.
5. Partido del capítulo con su regla visible (una franja arriba, como el boost).
6. Primeros dos mapas completos en `chapters.json`; los otros dos después.
7. Balance: medir que las reglas no hacen imposible ningún capítulo con un equipo de media normal.

**Pruebas.** Validación de `chapters.json` (ids únicos, rivales válidos). Playwright: un capítulo con la regla «sin técnicas» y comprobar que no se puede usar ninguna.

**Economía.** Premio por capítulo (800 a 2000 monedas por mapa completo). Revisar con la tabla de §5 del balance-guide.

**Criterio de hecho.** Un mapa completo se puede jugar de principio a fin, las estrellas se cobran una vez, y las reglas se ven en el partido.

**Preguntas abiertas.** ¿El contenido lo escribes tú (rivales y reglas) o lo genero? ¿Las historias (texto de intro) son necesarias?

---

## 4. Fusión Mixi Max

**Objetivo.** Dar un uso a los repetidos y a los personajes de la serie, con una carta por fusión.

**Reglas.**
- Dos cartas **del mismo juego**, con copias de sobra, se fusionan en una **Mixi Max** (si la combinación existe en la lista).
- La Mixi Max tiene la **media de la mejor de las dos + 2** (con tope 94) y hereda una técnica de cada una.
- Cada combinación se puede hacer una vez por cuenta (así hay un número limitado de fusiones que coleccionar).
- Lista de fusiones: `src/data/fusions.json` (desde las 29 Mixi Max de la base: nombre, dos ingredientes, media, técnicas).

**Datos.** `club.fusions: string[]` (ids de fusión hechas). La carta resultante se añade a `cards` como las demás.

**Pantallas y archivos.**
- `src/components/modes/Fusion.tsx`, hash `#/fusion`: lista de fusiones con los ingredientes (y si los tienes) y el botón.
- `src/lib/fusion.ts`: validar la fusión, calcular la media y las técnicas, aplicar.
- Mixi Max en la base: una carta nueva por fusión está en `fusions.json`, no se crea en Supabase.

**Reutiliza.** `addCards`, `removeCopies`, `CardInfo` para mostrar la carta resultante, el catálogo de Mixi Max.

**Pasos.**
1. `fusions.json` desde la base (29 Mixi Max con sus ingredientes), con revisión a mano de los ingredientes.
2. `fusion.ts` con pruebas: ingredientes válidos, media, técnicas, una vez por combinación.
3. Pantalla Fusión (lista, filtros, ingredientes en propiedad).
4. Animación de la fusión (el sonido `win`, la carta nueva al centro).
5. Entrada desde el hub y desde la colección.

**Pruebas.** Unitarias de `fusion.ts`. Playwright: una fusión completa y que no se repite.

**Economía.** Coste: dos cartas que ya no tienes (sin monedas). Mide el efecto en la venta rápida (se vende menos).

**Criterio de hecho.** Las 29 fusiones se muestran; una fusión válida crea la carta; no se puede repetir.

**Preguntas abiertas.** ¿Las Mixi Max de la serie son cartas fijas o hay que fusionar (y se conservan)? ¿Pueden ser ingredientes de otra fusión?

---

## 5. Liga de temporada

**Objetivo.** Una competición de larga duración con tabla y ascenso, con las copas y Fatal como base.

**Reglas.**
- Liga de **10 jornadas** (ida y vuelta de 9 rivales = 18 partidos; o 10 jornadas de un partido si el tiempo aprieta: decidir).
- Rivales: 10 equipos del catálogo de la misma media, elegidos por temporada (semilla = semana ISO).
- Puntos: victoria 3, empate 1, derrota 0. Tabla por puntos, diferencia de goles y goles a favor.
- Premios por posición al terminar (1.º 3000 monedas + sobre oro, 2.º 2000, 3.º 1000, resto según puntos).
- **Ascenso y descenso** entre tres ligas (Bronce, Plata, Oro): el 1.º y 2.º suben, el último baja. Empieza en Bronce.

**Datos.** `club.league: { season, div, table: Record<teamId, {pts, gf, ga, played}>, played: number, rivals: string[] } | null`.

**Pantallas y archivos.**
- `src/lib/league.ts`: rivales por temporada, tabla, aplicar un resultado, premio al final.
- `src/components/modes/League.tsx`, hash `#/liga`: tabla, próxima jornada, botón de jugar.
- Partido: `FatalMatch` (si es modo clásico) o `SimMatch`, con el equipo de la liga (plantilla fija, elegida una vez).

**Reutiliza.** `cups.ts` (`cupOpponents` como base de rivales), `fatal-series.ts` (puntos y divisiones: misma lógica de subir y bajar), `history.ts`.

**Pasos.**
1. `league.ts`: rivales, tabla, puntos y desempate, con pruebas (sin pantalla).
2. Estado de la liga en el club, con temporada por semana ISO (como el Fatal).
3. Pantalla con tabla y jornada.
4. Partidos: jugar la jornada con la plantilla fija (elegir una al empezar la temporada).
5. Premios por posición al cerrar la temporada, y ascenso o descenso.
6. Balance: que el premio de posición 1 no supere a una semana de objetivos + retos.

**Pruebas.** Tabla (orden por puntos, diferencia, goles). Ascenso y descenso en los límites. Playwright: una temporada completa con un bot.

**Economía.** Monedas por partido (mismo que duelo) y premio de temporada. Revisar con el balance-guide §5.

**Criterio de hecho.** Una temporada se puede jugar entera, la tabla es correcta, el ascenso y descenso cambian la división, y el premio se cobra una vez.

**Preguntas abiertas.** ¿10 jornadas de un partido o ida y vuelta? ¿La plantilla es fija durante la temporada?

---

## 6. Ruleta de equipo (gacha diario con pity)

**Objetivo.** Una tirada gratis al día de scouting, con garantía de carta buena para que nunca sea una pérdida total.

**Reglas.**
- Una tirada gratis al día (`today`, como el sobre de hoy). Tiradas extra cuestan monedas (precio alto, para no ser la vía principal).
- La tirada elige una **afinidad** y un **juego** al azar (ruleta visible), luego una carta de esa mezcla con la rareza sorteada.
- **Pity:** cada tirada sin Top o Leyenda suma 1; a las **10** sin suerte, la siguiente es Top garantizada; a las **30**, Leyenda garantizada. Se resetea al sacar la garantía.

**Datos.** `club.roulette: { day: string | null, pity: number, pityLegend: number }`.

**Pantallas y archivos.**
- `src/components/modes/Roulette.tsx`, hash `#/ruleta`: rueda con afinidad y juego, botón de tirar, contador de pity.
- `src/lib/roulette.ts`: sorteo (semilla opcional para pruebas), pity, reseteo.
- Reutiliza `openPack` de `packs.ts` con un filtro de afinidad y juego (ya existe `elements` y `games` en `PackDef`).

**Pasos.**
1. `roulette.ts` con pity y pruebas de estadística (1000 tiradas: Top ≈ la probabilidad que se diga, garantía a las 10 y las 30).
2. Estado en el club (día, pity) y tirada gratis al día.
3. Pantalla de la rueda con animación (dos ruletas que giran y paran) y revelado de la carta.
4. Tirada extra con monedas (precio en `store-extra.ts`).
5. Entrada desde la tienda y el hub.
6. Medir la probabilidad real con el script y ajustar.

**Pruebas.** Unitarias: pity sube, garantiza y resetea. Estadística: 10 000 tiradas simuladas dentro del rango.

**Economía.** Una tirada al día es gratis: suma unas 30 tiradas al mes. Medir con los sobres actuales (`PACKS`): la probabilidad de Leyenda no puede superar la del sobre de oro.

**Criterio de hecho.** Tiradas diarias, pity que garantiza, y probabilidades medidas dentro de rango.

**Preguntas abiertas.** ¿Pity en Top o solo en Leyenda? ¿Las tiradas extra valen la pena con monedas?

---

## 7. Torneo de técnicas (duelo tipo juego de cartas)

**Objetivo.** Un juego nuevo para jugadores que quieren estrategia de mazo, con las técnicas como protagonistas.

**Reglas (propuesta, a validar).**
- Mazo de **20 técnicas** de tu colección (con TP y tipo). Mano de 5.
- **Energía** = TP disponible: cada turno suma energía; una técnica cuesta su TP (o el TP balanceado).
- Turno: juegas hasta 3 acciones (técnica, cambio de afinidad, presión). Las técnicas se enfrentan a las de la otra parte según tipo (tiro vs bloqueo, regate vs parada).
- Gana quien baje la vida del rival a 0 (vida = 20, cada tiro sin parar resta el ataque).
- IA con un mazo de técnicas generado por equipo.

**Datos.** `club.decks: Record<deckId, techniqueIds[]>` (hasta 5 mazos).

**Pantallas y archivos.** Nuevo motor `src/lib/tcg/` (estado, turnos, IA), `src/components/modes/Tcg.tsx`, hash `#/tcg`.

**Pasos.**
1. Diseño de reglas en un documento aparte (`docs/tcg-rules.md`), con 5 ejemplos de turno escritos a mano.
2. Motor de reglas sin pantalla (`src/lib/tcg/`), con pruebas de cada regla.
3. IA básica (elige la técnica que más resta con la energía que tiene).
4. Simulación masiva (como `npm run balance`) para ver si gana siempre el mazo con más TP.
5. Pantalla de mesa, mano, energía, vida.
6. Mazos: construir y guardar.
7. Recompensas y premio por victoria.

**Pruebas.** Motor: cada regla con un caso fijo. Simulación: ningún mazo gana más del 60 % contra la IA mezclada.

**Economía.** Premio por victoria moderado (como un duelo). No dar técnicas nuevas por este modo (sobre de técnicas es otro camino).

**Criterio de hecho.** Un mazo se puede construir, se juega una partida entera, y la simulación no tiene un mazo dominante.

**Riesgo.** Es el modo más grande. Solo empezar cuando el resto esté estable, y con el documento de reglas aprobado.

**Preguntas abiertas.** ¿Mazo de técnicas o de cartas? ¿Vida 20 o 30? ¿Se pueden repetir técnicas?

---

## 8. Evento semanal con tabla

**Objetivo.** Algo nuevo cada semana, que da una razón para entrar a diario, sin tener que tocar el resto del juego.

**Reglas.**
- Cada semana un **evento** con un equipo o una afinidad, reglas especiales (p. ej. «solo Fuego», «sin química», «media máxima 80») y puntos por partido jugado con esas reglas.
- Puntos por partido (ganar 3, empatar 1) con un bonus por cumplir la regla.
- Premio por puntos (3 escalones) y tabla propia (local al principio; global después).

**Datos.** `club.event: { week, id, points, played, claimed }` y, para la tabla global, `event_scores` en Supabase (fase 2).

**Pantallas y archivos.**
- `src/data/events.json`: un evento por semana (rotación; el mismo que el boost semanal de `weeklyBoost`, o uno propio).
- `src/lib/event.ts`: reglas, puntos y premios.
- `src/components/modes/Event.tsx`, hash `#/evento`: regla de la semana, tabla y botón.

**Reutiliza.** `challenges.ts` (la idea de la semana), `fatal-series.ts`, `history.ts`, `weeklyBoost`.

**Pasos.**
1. Formato de `events.json` y `event.ts` con pruebas.
2. Estado local y premios por escalón.
3. Pantalla con la regla y los puntos.
4. Partido con la regla aplicada (reutiliza las de `chapters.ts` si ya existen).
5. Tabla global (fase 2, con Supabase): solo lectura pública y escritura por RPC, como `admin_write`, con límite por día.

**Pruebas.** Puntos y escalones; la regla se aplica al equipo.

**Economía.** Premio por escalón moderado. Vigilar que el evento no sea la vía principal de monedas.

**Criterio de hecho.** Un evento semanal se puede jugar y cobrar; la tabla local es correcta.

**Preguntas abiertas.** ¿La tabla global vale la pena (y el coste de backend)? ¿El evento usa el boost semanal o es propio?

---

## 9. Jefe mundial (raid cooperativo)

**Objetivo.** Algo en común: toda la comunidad contribuye a derrotar a un jefe cada semana.

**Reglas.**
- Un jefe con **vida** (p. ej. 1 000 000). Cada partido de Fatal inflige daño igual a tu puntuación (goles × media del once).
- Límite de **3 partidos al día** para que no se pueda farmear.
- Premio global al derrotarlo (todos los que contribuyeron cobran); premio individual por contribución (tabla).

**Datos.** Supabase: tabla `world_boss(week, hp)` y tabla `boss_hits(player, week, day, damage)`, con RPC `boss_hit(player, damage)` que
comprueba el límite diario. Cliente: solo lee la vida.

**Pantallas y archivos.** `src/components/modes/Boss.tsx`, hash `#/jefe`; `supabase/boss.sql` (tablas, RPC, política de lectura);
`src/lib/boss.ts` (cliente).

**Pasos.**
1. `supabase/boss.sql` con las tablas y la RPC, probado en local (como se hizo con `admin.sql`).
2. Cliente: leer la vida y registrar daño tras cada partido (cola si no hay red).
3. Pantalla con la vida, tu contribución y la tabla.
4. Premio global al llegar a 0 (job o comprobación en la RPC).
5. Protección: límite diario, daño acotado por partido (máximo razonable), y revisión de picos.

**Pruebas.** SQL: límite diario, daño máximo, jefe derrotado una vez. Cliente: sin red, el daño se guarda y se envía luego.

**Economía.** Premio colectivo fijo (no depende del número de jugadores, para no hacerlo imposible). Medir cuánto daño produce un jugador razonable en una semana.

**Riesgo.** Trampas (daño falso). Por eso el daño lo calcula el servidor a partir de la puntuación, no el cliente, o al menos se acota. Esto es lo más caro de los modos: solo tras los anteriores.

**Criterio de hecho.** El jefe baja con las contribuciones de varios usuarios, el límite diario se cumple, y un daño fuera de rango se rechaza.

**Preguntas abiertas.** ¿Cuántos jugadores activos hay? (Sin usuarios no tiene sentido.) ¿Se acepta el coste de backend ahora?

---

## Ideas pequeñas (de [ideas-modos.md](ideas-modos.md))
- **Pronósticos de la jornada**: depende de la liga o del evento (módulo 5 o 8). Sin apuestas de dinero.
- **Retos de clasificación**: ya existe el motor de retos (`challenges.ts`); solo añadir los nuevos.
- **Ruleta diaria de premios**: es la tirada gratis de la ruleta (módulo 6) con premios pequeños.
- **Modo práctica sin premio**: un Fatal que no suma nada; reutiliza `FatalMatch` con una bandera.

## Orden recomendado y dependencias

```
Dojo ───────────────┐ (independiente, 1 semana)
Expedición ─────────┤ (usa Fatal; base para Campaña)
Campaña ────────────┤ (usa chapters.ts; reglas que Evento reutiliza)
Liga ───────────────┤ (usa cups/fatal-series)
Fusión ─────────────┤ (independiente)
Ruleta ─────────────┤ (independiente, usa openPack)
Torneo de técnicas ─┘ (grande; tras lo anterior)
Evento semanal ──── (usa reglas de Campaña)
Jefe mundial ────── (último: necesita Supabase y comunidad)
```

Semana a semana, con prueba del balance al final de cada modo que paga:
1. Dojo + Fusión (rápidos, dan salida a los repetidos).
2. Expedición.
3. Campaña (dos mapas primero).
4. Liga y Ruleta.
5. Evento semanal.
6. Torneo de técnicas (solo con el documento de reglas aprobado).
7. Jefe mundial (con backend).

## Decisiones que necesito de ti antes de empezar
1. **Dojo**: límite 5 o 3, y si hay límite por rareza.
2. **Expedición**: ¿las recompensas de jugador duran solo la expedición? ¿Vidas o una derrota la acaba?
3. **Campaña**: ¿escribo los capítulos y las reglas (y los reviso contigo) o empiezo con tres mapas de muestra?
4. **Fusión**: ¿Mixi Max de la serie fijas o fusionables? Revisión de los ingredientes.
5. **Liga**: ¿10 jornadas de un partido o ida y vuelta?
6. **Ruleta**: ¿pity en Top o solo en Leyenda?
7. **Torneo de técnicas**: ¿vida 20 o 30? ¿Mazo de técnicas o de cartas?
8. **Jefe mundial**: ¿tienes usuarios para que tenga sentido? Si no, déjalo para después.
