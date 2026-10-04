# Fatal Sim (MADFUT)

Modo pasivo del Fatal Draft: miras un partido de 90 minutos (2 partes de 45) con 12 ocasiones, 6 por parte; no eliges nada. Se juega con el último draft
(`#/duelo/draftsim`, botón «Fatal Sim» de `#/fatal-draft`) y da los mismos puntos de división que el Fatal clásico
(victoria 3, empate 1, derrota 0 en nuestra versión).

## Lo que se ha encontrado (hilos de Reddit r/MADFUT, p. ej. «Madfut 26 Fatal Guide!» comments/1o1dcmh)
- Cada ocasión empieza con una **batalla de control**: el juego sortea 3 cartas de control de cada equipo y juega una
  al azar de las 3; gana el balón la de más control (empate = balón fuera).
- Quien gana el balón **ataca**: 3 atacantes al azar contra 3 defensas al azar, una carta de cada lado; si el ataque
  supera a la defensa, gol.
- Puestos: ataque ST/RW/RM/LM/LW/CAM (+CM si faltan), control CAM/CM/CDM/LB/RB/LM/LW/RM/RW, defensa CDM/CB/LB/RB/GK.
  Las formaciones con 5 cartas de control (3412, 3142, 5212, 532) rinden mejor.
- La IA adapta su nivel al tuyo; el marcador enseña la media de ataque/control/defensa de cada equipo.

## Implementado (`src/lib/fatal.ts` → `simulate`, `adaptRival`, `goalChance`; `src/components/modes/SimMatch.tsx`)
- **90 minutos**: 12 ocasiones (6 por parte) en minutos al azar (1–44 y 46–89). El reloj corre entre ocasiones, hay
  descanso con estadísticas (posesión, ocasiones, goles) y un resumen final.
- Marcador con los escudos de ataque/control/defensa, barra de reloj con los goles marcados, paneles de control
  (las 3 cartas de cada lado, la elegida resaltada) y de ataque/defensa con la **probabilidad de gol** y el veredicto.
  «Saltar» salta al final.
- **Equilibrio**: la IA iguala sus tres números a los tuyos (`adaptRival`) y el gol sale de una probabilidad
  (`goalChance`: ~35 % a igualdad, +10 de ataque → ~65 %, −10 → ~12 %) en vez de ataque > defensa a secas, que daba
  0–0 o 1–7 según la media de cada equipo. En 25 partidos de prueba: ~3,4 goles por partido y reparto parejo.

## Interacción (tensión)
Código: `src/lib/tension.ts` (reglas) y `SimMatch.tsx`. La **tensión** es una barra por equipo de 0 a **400** (`TENSION_MAX`;
en Victory Road es 300 con la técnica más cara en 100: aquí las técnicas llegan a 200 TP). Empiezas con 80
(`TENSION_START`). Se gana: balón ganado +50, perdido o fuera +25, gol marcado +50, ataque rival parado +25
(`TENSION_GAIN`).

### Cómo se ve (claridad)
- Cada ocasión tiene **3 pasos** con pastillas arriba: *Medio campo → Ataque → Resultado*, y una **frase** grande que
  dice qué pasa («Medio campo: ¿quién se queda el balón?», «¡Tu ataque! X va a rematar»…).
- **Cara a cara**: tu carta (azul, a la izquierda) contra la del rival (rojo, a la derecha) y los dos números grandes en
  el centro; lo que vas eligiendo se suma al instante en tu número (amarillo).
- **El partido espera** cuando tienes algo que decidir («Tu decisión»). Si no te llega la tensión, se ve el cara a cara
  1,6 s y sigue. Los resultados se quedan 3,6 s o hasta que pulsas «Siguiente».
- La barra de tensión enseña lo que vas a gastar (blanco) y la del rival (marca azul). Debajo, una **crónica** con las
  últimas jugadas (borde azul = tuyas, rojo = del rival).

### Qué puedes hacer en tu turno (se pueden combinar)
- **Cambiar de carta** entre las 3 que salen (`PICK_COST` 100); salen el nombre y el número, con ▲/▼ si es mejor/peor.
- **Supertécnica** de la carta que juega, del tipo del número (Regate→control, Tiro→ataque, Bloqueo→defensa,
  Parada→defensa solo en porteros). Coste **TP × 2** (`techCost`); bonus **TP/40**, mínimo 1, **+1 si es de la afinidad
  de la carta** (30 TP → +1, 100 → +3, 200 → +5) (`techBonus`).
- **Presión alta** (solo en el medio campo): coste 80, +3 al control de esa ocasión (`PRESS`).
- **Hiperenergía** (una vez por partido, si la carta tiene espíritu guerrero / Mixi Max / tótem): coste 200, +4 al
  número de la fase (`HYPER`).
- **Grito del portero** (solo defendiendo, una vez por parte): coste 120, el ataque rival no entra (`SHOUT_COST`).
- **Contraataque** (automático): tras parar un ataque rival, +2 al control de tu siguiente ocasión (`COUNTER_BONUS`).
- **Táctica del descanso** (gratis): Ofensiva (+2 ataque, −2 defensa), Equilibrada o Defensiva (al revés) hasta el
  final (`TACTIC_MOD`).
- **IA competitiva** (`ai.ts` + `aiPlan` en `SimMatch.tsx`): cambia de carta pagando tensión si le compensa, usa supertécnica,
  presión, hiperenergía y grito solo cuando cambian el resultado, y elige táctica en el descanso según el marcador. Mismas
  reglas de tensión que tú; ve tus números con error de ±2 y no sabe qué vas a usar.
- El resultado se calcula al revelar la fase con lo elegido: `controlWinner` y `shotResult` (`fatal.ts`); la probabilidad
  de gol usa `goalChance(ataque + bonus, defensa + bonus)`. Los goles muestran goleador y asistente.
- «Saltar» resuelve lo que quede sin usar tensión (`autoResults`).

### Ideas que faltan
- **Cambios** de jugador en el descanso (el draft tiene 7 suplentes).
- **Penalti**: en una ocasión con probabilidad > 70 %, elegir el lado del tiro.
- Animación de gol más vistosa y sonidos propios.

## Suposiciones (sin confirmar)
- Número y minutos de las ocasiones, y la curva de probabilidad de gol (en MADFUT solo se ve «probabilidad de ataque»).
- El asistente se elige al azar entre los otros atacantes del grupo; no cuenta para nada más.
- Recompensas y puntos: las del Fatal Draft clásico; en MADFUT se ha visto 3/1/1 contra la IA.
