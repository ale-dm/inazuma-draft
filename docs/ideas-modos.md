# Ideas de modos de juego (gacha gratuito con tus cartas)

Plan de cada modo, con pasos y criterio de hecho: [plan-modos.md](plan-modos.md).

Lista para decidir qué hacer después. Cada modo dice de qué juego sale la idea, cómo se juega, qué aporta a la
colección y el coste de construirlo: **S** (horas, sin backend), **M** (días, lógica nueva), **L** (semanas o backend).
Todo gratis: el premio sale de jugar (monedas, sobres, fichas), sin compras con dinero.

## Lo que ya hay (para no repetirlo)
Sobres (básico gratis, de hoy, de saga/afinidad/equipo), Draft, Fatal (Mi club, Sim, Draft por divisiones, series,
historial, retos semanales, dificultad), Copas de draft, Higher/Lower, Puzzles, Objetivos diarios/semanales/carrera,
SBC, Mis plantillas, Tienda, Códigos, Colecciones.

## Modos recomendados (en orden)

### 1. Expedición (roguelike de draft) · inspiración: Slay the Spire / Balatro, eventos de Dokkan
Empiezas con un equipo base y avanzas por **8 rivales**. Tras cada victoria eliges **1 de 3 cartas** (un jugador, una
técnica o un refuerzo: +5 a un número, química extra) que se quedan solo durante la expedición. Una derrota la acaba.
- Premio: monedas y sobres según hasta dónde llegues; un sobre especial al pasar el jefe final.
- Por qué engancha: cada partida es distinta y usa cartas que tienes sin gastar nada.
- Construcción: **M**. Reutiliza el motor de Fatal (`fatal.ts`, `ai.ts`) con un equipo que cambia entre rondas.

### 2. Campaña por capítulos · inspiración: Inazuma Eleven (historia), Dokkan (stages)
Mapas por saga (Inazuma, Galaxy, Ares, Victory Road). Cada capítulo son 3–5 partidos contra rivales con nombre, con
**una regla** (solo un juego, media máxima, formación fija, sin técnicas, solo afinidad fuego…). Cada capítulo tiene
3 estrellas por objetivos extra (ganar sin recibir gol, marcar con un tiro largo…) y las estrellas dan un cofre.
- Premio: el primer cobro de cada estrella; las estrellas ya cobradas no vuelven a pagar.
- Construcción: **M** para el motor de capítulos; el contenido (rivales y reglas) es datos de la base.

### 3. Dojo: ascender con copias (límite de rotura) · inspiración: Dokkan (ascender), FIFA/FUT (evoluciones)
Las copias repetidas, que hoy solo se venden, sirven para **subir el límite de la carta**: +1 a sus números por copia
hasta un máximo (p. ej. +5). Dos copias de una Leyenda la hacen más útil, no solo más barata.
- Por qué: da salida a los repetidos y motiva a coleccionar la misma carta.
- Construcción: **S**. Cambia `QUICK_SELL` por un límite (`limitBreak` en `club.ts` y el `duel` de la carta).
- Cuidado: hay que ajustar el balance (`duel.ts`); el script de balance lo mide.

### 4. Fusión Mixi Max · inspiración: Inazuma Eleven (Mixi Max de la serie), Pokémon (fusiones), Dragon Ball (fusión)
Dos cartas del mismo juego se fusionan en una **Mixi Max** con la media de la mejor más un bonus, y hereda una técnica
de cada una. Solo hay una por combinación (así cada fusión es una colección aparte).
- Construcción: **S–M**. Hay 29 Mixi Max en la base: sirve de catálogo para las fusiones que cuentan.

### 5. Liga de temporada · inspiración: Dream League / FUT Champions, Fatal por divisiones
Liga de 10 jornadas con tu plantilla fija contra 10 equipos del catálogo (ida y vuelta, o 9 partidos). Tabla, premios
por posición, y ascenso o descenso entre ligas de la misma temporada. Usa el mismo motor que las copas.
- Construcción: **S–M**. Reutiliza `cups.ts` (rivales) y `fatal-series.ts` (puntos y divisiones).

### 6. Ruleta de equipo (dentro del draft) · inspiración: Pacybits / Sorare (gacha de scouting)
Igual que el sobre de oro, pero la carta sale de una **ruleta de afinidad + juego** cada día, con pity garantizado
(tras N tiradas sin Top, la siguiente lo es). Gratis: una tirada al día.
- Construcción: **S**. Ojo con la economía: no subir la probabilidad de Leyenda sin medirla.

### 7. Torneo de técnicas (duelo estilo TCG) · inspiración: Yu-Gi-Oh, Magic, Dragon Ball Dokkan (cartas de acción)
Un mazo de 20 **técnicas** (en vez de cartas de jugador), energía = TP, turnos de 3 acciones, y las técnicas se
enfrentan a las de la otra parte. Las cartas de jugador son la mesa.
- Construcción: **L**. Es un juego nuevo; úsalo cuando el resto esté estable. Las técnicas ya tienen TP y tipo.

### 8. Evento semanal con tabla · inspiración: Dokkan (eventos de tiempo limitado), Inazuma Cross (eventos)
Cada semana un equipo o una afinidad tiene un evento: reglas especiales y puntos por partido. Tabla global.
- Construcción: **S** sin tabla global; **L** con una tabla compartida (necesita Supabase de lectura/escritura pública).

### 9. Jefe mundial (raid cooperativo) · inspiración: Dokkan (raids), Pokémon GO (incursiones)
Un jefe con vida (p. ej. 1 000 000) que toda la comunidad ataca cada semana. Cada partido gana daño según tu media.
- Construcción: **L**. Necesita un contador compartido en la base (como `admin_write`, pero público).

## Ideas pequeñas que suman
- **Pronósticos de la jornada** (sin apuestas de dinero): adivinar el marcador del Sim de otros usuarios, con puntos en el ranking.
- **Retos de clasificación**: «gana 3 penaltis», «termina una expedición sin perder un partido» (los retos semanales ya tienen el motor).
- **Diario tipo ruleta de premios** (uno al día, gratis).
- **Modo práctica sin premio** para probar equipos sin gastar nada.

## Qué haría yo primero
1. **Dojo (3)**: rápido (S), da salida a los repetidos y se ve enseguida.
2. **Expedición (1)**: el modo nuevo más fuerte, usa el motor de Fatal.
3. **Campaña por capítulos (2)**: contenido para semanas; sale después de la Expedición.
4. **Liga (5)**: reutiliza copas y Fatal.

## Riesgos de economía (medir antes de lanzar)
- Los premios de Expedición y Campaña pueden superar a los sobres. Antes de lanzar, pasa el script de balance
  (`npm run balance`) y suma monedas por día con los objetivos actuales (ver `balance-guide.md` §5).
- El sobre gratis ilimitado y la venta rápida siguen siendo la fuga más grande; el Dojo ayuda a darle salida.
