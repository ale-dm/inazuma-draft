# Variedad de jugabilidad: un tipo de juego por modo

Hoy casi todo es elegir carta y número (ataque, defensa, control). Esto documenta **qué se hace en cada decisión** en
cada modo nuevo, para que cada uno se sienta distinto: otro verbo, otro ritmo, otra cosa que medir. Complementa a
[plan-modos.md](plan-modos.md) (el cómo) con el **qué se juega** y **por qué es divertido**.

## 1. Catálogo de verbos (lo que el jugador hace)

Cada verbo es una forma de decidir. Un modo debería tener **un verbo principal** y, como mucho, uno secundario.

| Verbo | Qué decide el jugador | Ritmo | Ya existe |
|---|---|---|---|
| **Elegir** | una opción de un conjunto (carta, recompensa, rival) | pausado | sí (Fatal, draft) |
| **Leer** | adivinar lo oculto a partir de una pista | medio | sí (pista del rival) |
| **Calibrar** | parar una barra en la zona buena (potencia, momento) | rápido | no |
| **Secuenciar** | pulsar en el orden correcto, o encadenar | rápido | no |
| **Construir** | combinar piezas para que encajen (química, fusión) | pausado | parcial (química) |
| **Gestionar** | repartir un recurso limitado a lo largo de un plazo | lento | sí (tensión) |
| **Apostar** | arriesgar un recurso por un premio mayor, con información parcial | medio | no |
| **Cooperar** | sumar esfuerzo con otros hacia una meta común | lento, en paralelo | no |
| **Adaptar** | cambiar las reglas o el plan a mitad de partido | medio | parcial (táctica del descanso) |
| **Pronosticar** | predecir un resultado y acertar o no | lento | no |

## 2. Un tipo de juego por modo

### Dojo: **Construir a largo plazo** (gestión de progreso)
- **Verbo**: decidir qué carta mejorar con las copias que tienes, ahora o guardándolas para más adelante.
- **Decisión que importa**: subir una Leyenda (más útil en partidos grandes) o repartir copias en varias cartas
  (más equipo completo). Sin respuesta fija.
- **Ritmo**: lento, de días. La emoción está en ver el número cambiar.
- **Mini-juego**: ninguno. El juego es la planificación de la colección: una vista de «plan de límites» donde ves cuánto
  te falta para cada salto.
- **Riesgo de aburrimiento**: se vuelve una lista. Solución: mostrar el impacto real en el once («con este ascenso tu
  media sube 1,2»).

### Expedición: **Construir sobre la marcha** (roguelike de draft)
- **Verbo principal**: elegir 1 de 3 recompensas tras cada victoria. Verbo secundario: decidir qué rival es más
  rentable cuando haya dos caminos (ver abajo).
- **Decisión que importa**: refuerzo fuerte ahora o jugador que cambia el once. Cada elección cambia el resto de la
  expedición.
- **Ritmo**: medio. Un partido corto (el de Fatal) y una pausa de elección.
- **Mini-juego**: **camino de nodos**. Antes de cada partido eliges entre dos rivales visibles: uno más difícil con mejor
  premio, uno más fácil con premio normal. Así cada expedición tiene una pequeña decisión de riesgo antes de jugar.
- **Riesgo**: que siempre gane el refuerzo de +5. Solución: los refuerzos caducan o valen menos según el paso.

### Campaña por capítulos: **Resolver con restricciones** (puzzle)
- **Verbo principal**: cumplir una regla dada (sin técnicas, solo afinidad X, media máxima). Verbo secundario: calibrar
  el momento de la estrella 3.
- **Decisión que importa**: qué once encaja con la regla y cuál es el mejor partido para las estrellas.
- **Ritmo**: medio. Se piensa antes de entrar, y luego se juega normal.
- **Mini-juego de estrella 3: «Tiro calibrado»**. Una barra oscila de lado a lado (ancho de la zona verde según la
  técnica o la carta). Al pulsar, el tiro sale con la potencia de esa posición: en el centro, máximo; en el borde, sin
  gol. Se usa una vez por capítulo, en una ocasión elegida.
- **Riesgo**: que la regla sea siempre la misma forma de jugar. Solución: cada mapa cambia la forma de ganar (defender
  más, controlar más, o tiros largos).

### Fusión Mixi Max: **Construir y encajar** (puzzle de combinación)
- **Verbo principal**: elegir qué dos cartas combinar. Verbo secundario: leer la pista de la fusión (nombre, técnicas
  que hereda) para saber si merece la pena.
- **Decisión que importa**: fusionar ahora (quema dos cartas que quizá vuelvan a servir) o guardar.
- **Ritmo**: pausado, sin prisa. Es el modo más tranquilo.
- **Mini-juego**: **tablero de fusiones**. Una cuadrícula de cartas por juego; arrastrar dos iguales a una casilla
  libre crea la Mixi Max; las combinaciones posibles se iluminan al tocar una carta. Así el modo es un puzzle y no una
  lista.
- **Riesgo**: fusiones obvias y ya resueltas. Solución: algunas fusiones piden tres cartas de juegos distintos.

### Liga de temporada: **Gestionar a largo plazo** (plantilla y calendario)
- **Verbo principal**: gestionar el calendario, sobre todo la plantilla a lo largo de las jornadas (rotar, descansar, no
  quemar la carta buena). Verbo secundario: pronosticar la posición final.
- **Decisión que importa**: jugar siempre con el mejor once (gana hoy, pierde mañana) o dar minutos a los suplentes (más
  equipo, menos puntos).
- **Ritmo**: lento, con una jornada cada día o cada semana.
- **Mini-juego**: **pronóstico de jornada**. Antes de jugar cada jornada, dices si ganas, empatas o pierdes. Acertar da
  puntos extra sin tocar el resultado. No es apuesta: no se pierden monedas.
- **Riesgo**: que sea solo esperar. Solución: el calendario muestra qué rivales son fáciles y cuáles pesan en el ascenso.

### Ruleta de equipo: **Calibrar con azar** (timing sobre gacha)
- **Verbo principal**: parar la ruleta en el momento. Verbo secundario: decidir si gastar la tirada extra.
- **Decisión que importa**: parar pronto (zona de afinidad concreta) o esperar a la zona de juego que te interesa.
- **Ritmo**: rápido, un segundo.
- **Mini-juego**: **ruleta con parada**. Dos ruedas (afinidad y juego) giran; pulsas para parar cada una. Si paras dentro
  de la zona marcada, la carta sale de esa mezcla con más probabilidad de Top o Leyenda. Fuera de zona, sale normal. La
  tirada diaria gratis se hace igual; la pity sigue siendo la garantía.
- **Riesgo**: que el azar lo arregle todo. Solución: la zona marcada es lo único que se decide; el resto es suerte real,
  para que no sea un juego de habilidad puro.

### Torneo de técnicas: **Gestionar energía y apostar** (juego de cartas)
- **Verbo principal**: gastar energía (TP) en el momento justo: ahora o guardar para un tiro mejor. Verbo secundario:
  apostar a una técnica de alto riesgo cuando la vida del rival es baja.
- **Decisión que importa**: el turno. Gastar toda la energía o guardar una técnica para el siguiente.
- **Ritmo**: medio. Cada turno, pocas decisiones pero pesadas.
- **Mini-juego**: **farol**. Una técnica boca abajo: al jugarla, el rival solo sabe el tipo, no el número. Si el rival
  bloquea el tipo que crees, la técnica se pierde; si no, pasa. Es un juego de lectura y de riesgo.
- **Riesgo**: mazos que siempre ganan con la técnica más cara. Solución: el coste sube con cada uso del mismo tipo en el
  turno.

### Evento semanal: **Adaptar con reglas cambiantes** (modificadores)
- **Verbo principal**: adaptar tu estrategia a la regla de la semana («solo fuego», «sin química», «media máxima 80»).
  Verbo secundario: elegir qué jugadores encajan con la regla.
- **Decisión que importa**: aceptar la regla (ventaja) o cambiar de once para otra regla (sacrificio).
- **Ritmo**: medio. Cada semana es nueva, así que se aprende algo distinto.
- **Mini-juego**: **cartas de regla**. Antes del evento se revelan 3 reglas; eliges una (o te toca otra). Cada regla tiene
  un bonus y un castigo, así la semana tiene una decisión.
- **Riesgo**: la misma regla de siempre con otro nombre. Solución: cada regla cambia un número o una mecánica del partido,
  no solo el filtro de cartas.

### Jefe mundial: **Cooperar en carrera** (raid)
- **Verbo principal**: contribuir partidos a un objetivo común. Verbo secundario: elegir cuándo jugar (partidos buenos,
  no los de trámite).
- **Decisión que importa**: gastar tus partidos del día en el jefe o en otro modo.
- **Ritmo**: lento y colectivo. Ves la barra bajar con los demás.
- **Mini-juego**: **fases del jefe**. El jefe cambia de fase al bajar de 66 % y 33 %: en cada fase cambia la regla
  (solo defensa, solo tiros largos…). Así no es solo acumular daño: hay que adaptarse cada semana.
- **Riesgo**: que sea un contador sin sentir nada. Solución: la fase y el nombre de quien dio el golpe final se muestran
  en el partido.

## 3. Mini-juegos transversales (para reutilizar)

Estos cuatro bloques sirven en varios modos, así no hay que hacerlos una vez por modo.

1. **Calibrar** (barra de tiempo): el tiro de la Campaña, la ruleta de la Ruleta de equipo, el penalti con timing en el
   Sim (para más adelante).
2. **Farol** (técnica boca abajo): el Torneo de técnicas, y como opción de apuesta en el duelo clásico.
3. **Pronóstico** (predecir antes de jugar): la Liga, y el evento semanal si se quiere.
4. **Tablero de combinación** (cuadrícula): la Fusión, y como vista de construcción de la plantilla.

## 4. Cómo medir que la variedad funciona

- **Mezcla de verbos**: cada modo tiene un verbo principal distinto (tabla de §2). Si dos modos comparten verbo, uno
  debe cambiar.
- **Tiempo por decisión**: el ritmo de cada modo debe ser distinto (rápido, medio, lento). Medir segundos por decisión en
  pruebas con el navegador.
- **Qué se mide**: cada modo mide una cosa propia (en la lista de victorias, un tiempo, un acierto de pronóstico, un
  número de fases superadas). No todo son victorias.
- **Prueba de aburrimiento**: jugar 10 partidas seguidas de un modo y anotar cuántas decisiones son reales. Si más de la
  mitad son «elegir la mejor carta», el modo necesita un verbo nuevo.

## 5. Orden de construcción (mezclando verbos)

Para no tener todo el juego basado en el mismo verbo, este orden alterna:

1. **Dojo** (construir a largo plazo, sin mini-juego): el más simple y el que da tiempo a probar la gestión.
2. **Fusión** (tablero de combinación): ritmo tranquilo, sin partida.
3. **Expedición** (elegir, con camino de nodos): primer modo con riesgo.
4. **Ruleta** (calibrar): el primer mini-juego de tiempo, aislado y corto.
5. **Campaña** (restricciones + tiro calibrado): reutiliza el calibrado.
6. **Liga** (pronóstico): primer modo lento de verdad.
7. **Evento semanal** (cartas de regla): adaptar.
8. **Torneo de técnicas** (farol): el más grande, con su verbo propio.
9. **Jefe mundial** (fases): al final, con comunidad.

## 6. Decisiones que necesito de ti

1. ¿Te gusta el mini-juego de **tiro calibrado** para la Campaña, o prefieres que el tiro siga siendo elegir?
2. ¿El **pronóstico** de la Liga debe dar puntos extra solo en monedas (sin tocar el resultado), o también en cartas?
3. ¿El **farol** del Torneo de técnicas está bien, o es demasiado azar?
4. ¿Quieres que el **penalti del Sim** pase a calibrar (barra de tiempo) en vez de elegir dirección? Es el primer test del verbo nuevo en un modo que ya existe.

## 7. Estado de implementación

Análisis con cifras y recomendaciones: [gameplay-analisis.md](gameplay-analisis.md).

Lógica con pruebas (`npm run test:minigames`, 9 pruebas) y una pantalla para probarlos: **`#/minijuegos`**
(sin premio, para sentir el juego).

| Mecánica | Lógica | Pantalla de prueba | Conectada a un modo |
|---|---|---|---|
| Calibrar (barra) | `src/lib/minigames/calibrate.ts` (`barPos`, `calibrate`) | sí | no (pendiente: Ruleta y tiro de la Campaña) |
| Farol (técnica boca abajo) | `src/lib/minigames/bluff.ts` (`bluffOutcome`, `aiBluffGuess`) | sí | no (pendiente: Torneo de técnicas) |
| Pronóstico de jornada | `src/lib/minigames/forecast.ts` (`forecastScore`) | sí | no (pendiente: Liga) |
| Tablero de fusiones | `src/lib/minigames/board.ts` (`matchRecipe`, `readyRecipes`, `merge`) | no | no (pendiente: Fusión) |

**Lo que no está hecho** y conviene decidir antes:
- Conectar la calibración a un modo. La opción más barata es el penalti del Sim (pregunta 4 de este documento): pasar
  de elegir dirección a calibrar.
- La pantalla del tablero de fusiones. La lógica ya sirve; falta dibujarla con arrastrar y soltar.
- Las recetas reales (`fusions.json`) y las reglas de farol contra la máquina en el torneo.

**Cómo se mide que la variedad funciona** (§4): cuando un modo use su mecánica, se mide su tiempo por decisión en el
navegador y se cuentan las decisiones reales de diez partidas.
