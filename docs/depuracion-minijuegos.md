# Depuración: lógica de los minijuegos y la IA del Fatal

Revisión de producción sobre `src/lib/minigames/*`, `src/lib/ai.ts`, `src/lib/fatal.ts` (rivales) y los componentes
`Duel.tsx`, `SimMatch.tsx` y `Minigames.tsx`. Cada hallazgo tiene: síntoma, causa raíz, evidencia (una prueba
reproducible), solución propuesta y severidad. Lo que se revisó y está bien también va al final, para no repetir el trabajo.

Severidad: **alta** = cambia lo que el jugador experimenta de forma visible; **media** = puede romper una partida con
una entrada rara; **baja** = imprecisión o deuda técnica sin efecto observado.

---

## H1 · El farol castiga la rotación (alta)

**Síntoma.** Un jugador que rota los cuatro tipos de técnica en orden ve bloqueado el **62 %** de sus técnicas, igual
que si repitiera siempre el mismo tipo. Quien varía al azar: 25 %.

**Causa raíz.** Dos decisiones que, juntas, crean un patrón predecible:
1. La ventana de historial son **12** técnicas, múltiplo de 4 (el número de tipos). Con rotación, los cuatro tipos
   quedan siempre **empatados** en la ventana.
2. El desempate de `aiBluffGuess` elige el primer tipo en el orden de aparición del `Map`. Con rotación, ese primer tipo
   es el que se jugó hace 12 pasos, es decir, **el mismo que toca ahora**. La máquina acierta la siguiente técnica
   siempre que no lanza su 50 % al azar.

**Evidencia** (función real `aiBluffGuess`, 40 000 técnicas por caso):

| Historial | Estrategia | Actual | Desempate al azar | Ponderación por recencia (λ 0,8) |
|---|---|---|---|---|
| ventana 12 | rotar | **62,5 %** | 24,9 % | 12,6 % |
| ventana 12 | repetir | 62,4 % | 62,3 % | 62,6 % |
| ventana 12 | al azar | 25,0 % | 24,9 % | 25,5 % |

**Reproducir.** `npm run test:minigames` no lo cubre todavía: falta el caso «rotar no se bloquea más que al azar».

**Solución propuesta (recomendada).** Desempate **al azar** entre los tipos empatados (en `aiBluffGuess`, con el `rnd`
inyectable). Cambio de cuatro líneas. Efecto: repetir sigue costando el 62 %, rotar y azar quedan en 25 %, que es el
rango de diseño (20–35 %).
- *Descartado*: la ponderación por recencia. Hace que rotar sea la estrategia dominante (12,6 %), y eso es un defecto de
  diseño: un jugador la memoriza y el farol deja de ser decisión.

**Prueba a añadir.** Para 40 000 rondas con rotación, `blocked/N` entre 0,20 y 0,35. Para repetir, mayor que 0,55.

---

## H2 · El tablero pierde cartas y niega recetas válidas (alta cuando exista la pantalla; hoy sin efecto para el usuario)

**Síntoma reproducido.**
- Con dos cartas `Shaxel` en el tablero, la receta «Shaxel + Shaxel» **no se cumple** (debería).
- Al fusionar «Shaxel + Axel» con dos `Shaxel`, **se pierden las dos Shaxel** y la Axel: queda solo el resultado. Se
  consumen dos cartas por una.

**Causa raíz.** El identificador de cada pieza se genera como `${resultado}-${receta}`
(`board.ts`, `merge`). Dos fusiones iguales producen **ids idénticos**, y todo el módulo asume que el id identifica una
pieza: `matchRecipe` lo usa en su conjunto `used` y `merge` filtra por él, así que una fusión borra todas las piezas con
ese id.

**Solución propuesta.** Identidad por **posición**, no por id:
- `matchRecipe` marca usadas por índice del array (`Set<number>`).
- `merge` quita por índice.
- El id nuevo es único: un contador en el estado del tablero, o `crypto.randomUUID()` (y en pruebas, un generador
  inyectable).

**Prueba a añadir.** Los dos casos de arriba, más: fusionar dos veces la misma receta da dos piezas distintas.

---

## H3 · La IA responde con `undefined` y la partida puede romperse con una mano vacía (media, latente)

**Síntoma reproducido.** `aiRespond([], …)` devuelve `undefined`; `aiLead([], …)` **lanza excepción** (`Cannot read
properties of null (reading 'card')`).

**Causa raíz.** Las funciones de `ai.ts` no validan la mano. El camino real es `generatedRival` (`fatal.ts`): si para
algún puesto no hay ningún jugador libre, hace `continue` y el once queda con menos de 11 cartas. Entonces la mano se
vacía antes de la ronda 10 y el duelo llama a la IA con mano vacía.

**Evidencia.** 6 000 rivales generados (3 000 generados y 3 000 reales, con 60–90 de media): **ninguno** con menos de
11 cartas. El fallo es latente: el código lo permite, pero no lo he visto ocurrir.

**Solución propuesta.**
1. En `ai.ts`: si la mano está vacía, devolver `null` y que el llamador lo trate (no `undefined`).
2. En `generatedRival`: si el once tiene menos de 11 cartas, reintentar con otra afinidad o juego. Nunca devolver un
   equipo incompleto.
3. En `Duel.tsx` y `SimMatch.tsx`: al empezar, comprobar que el equipo tiene 11 cartas; si no, regenerar el rival.

**Prueba a añadir.** `aiLead([])` y `aiRespond([], …)` no lanzan y devuelven `null`. `generatedRival` siempre devuelve 11.

---

## H4 · La calibración juzga con el último frame pintado, no con el reloj (baja)

**Causa raíz.** En `Minigames.tsx`, `stop()` calcula `calibrate(pos)`, donde `pos` es el estado de React. Ese estado se
actualiza en cada frame, así que la pulsación se juzga con la posición del último render, no con la del instante del
toque. Con el móvil a bajos fotogramas, el desfase puede ser de varios frames.

**Solución propuesta.** Juzgar con el reloj en el momento del toque: `calibrate(barPos(performance.now() - start.current))`.
La latencia que queda se compensa con el test de latencia del análisis (`docs/gameplay-analisis.md` §1.3).

**Impacto medido.** A 1800 ms de periodo, un frame de 16 ms mueve la aguja 0,018: menos que el ancho de la zona (0,2). Es
baja, pero entra en la misma banda de error que la latencia táctil, así que conviene corregirla antes del playtest.

---

## H5 · Temporizador del rival sin limpieza en el duelo (baja)

**Causa raíz.** `Duel.tsx` (línea ~219): en `play()`, cuando el rival responde, `setTimeout(() => beginReveal(...), DUEL_THINK_MS)`
no se guarda ni se cancela. Si el componente se desmonta (salir del modo) o se pide «Otra vez» antes de que acabe, la
revelación corre después sobre un partido que ya no existe.

**Efecto observado.** Ninguno en la prueba. Riesgo: `setState` sobre un componente ya retirado y, en el peor caso, una
ronda aplicada al partido nuevo si `key` no cambia.

**Solución propuesta.** Guardar el id en un `ref` y limpiarlo en un efecto de desmontaje y al empezar una partida nueva.

---

## H6 · El pago del partido depende de un `useState` (baja)

**Causa raíz.** `payout` se llama desde efectos que comprueban `!paid` y después `setPaid`. Es correcto en producción,
pero la guarda vive en el estado, no en una referencia: si un efecto se vuelve a ejecutar antes de que `setPaid`
aplique, el partido se paga dos veces (monedas, historial y retos).

**Qué se ha comprobado.** `StrictMode` (`src/main.tsx`) duplica los efectos solo al montar; el de pago se dispara al cambiar
`result` o `done`, y ahí no se duplica. No se ha observado doble pago.

**Solución propuesta.** Guarda con `paidRef.current` (síncrona) además de `paid`. Es barato y evita la clase de error.

---

## H7 · Olor: `aiLead` dentro de un actualizador de estado (baja)

`Duel.tsx`: `setM(x => ({ ...x, pending: aiLead(x.oppHand, x.myHand) }))`. El actualizador debe ser puro, pero llama a
`Math.random`. En `StrictMode` puede ejecutarse dos veces y sortear dos cartas distintas (React usa una). No produce un
error visible, pero el resultado no es reproducible.

**Solución propuesta.** Calcular `aiLead` fuera del actualizador, a partir de `m` del render, y guardarlo con `setM`.

---

## Revisado y correcto (para no repetir la revisión)

- **`barPos`**: el módulo con números negativos (el `requestAnimationFrame` puede dar un tiempo anterior a `performance.now()`
  al empezar) da la posición correcta.
- **`calibrate`**: los tiers son monótonos (la potencia baja al alejarse del centro); verificado en las pruebas.
- **Pronóstico** (`forecastScore`, `pickOf`): correcto para los tres resultados.
- **Historial** (`historyStats`): la racha actual cuenta desde el más reciente; la mejor racha recorre al revés.
- **Retos** (`weekChallenges`): los índices `[0, 2, 4]` son distintos y dentro de la lista.
- **Dificultad**: el signo de `pull` (por encima de 1, el rival queda por debajo) está bien tras la corrección de la sesión
  anterior, y medido.
- **Sim, saltar**: el invariante `results.length === idx` (cada ocasión deja exactamente un resultado) se cumple en
  todas las ramas (fuera de juego, tiro normal, penalti, saltar en el descanso).
- **Sim, penaltis**: el temporizador se cancela al elegir dirección (la fase cambia y el efecto limpia).
- **Sim, cambio de la IA**: el índice elegido se aplica a la carta correcta según quién ataque (atacante en `pools[0]`,
  defensor en `pools[1]`), verificado a mano.

---

## Orden de corrección

1. **H1** (farol): cambio pequeño, afecta a la jugabilidad ya visible si el farol llega a usuarios. Con prueba.
2. **H2** (tablero): antes de construir la pantalla del tablero.
3. **H3** (manos vacías): guarda defensiva, barata.
4. **H4** y **H5**: antes del playtest, porque ensucian la medida de la calibración y la sensación de respuesta.
5. **H6** y **H7**: deuda, cuando se toque el archivo.

Ninguno de estos cambios se ha aplicado todavía en el código: este documento es la propuesta.
