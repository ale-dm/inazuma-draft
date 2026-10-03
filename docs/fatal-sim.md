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
(`TENSION_START`).
- **Se gana**: balón ganado +50, balón perdido o fuera +25, gol marcado +50, ataque rival parado +25 (`TENSION_GAIN`).
- **Se gasta** en dos cosas, en las fases de control, de tu ataque y de tu defensa (tienes 5 s o pulsas «Seguir»):
  1. **Elegir carta**: tocas otra de las 3 que salen y juega esa (`PICK_COST` = 100).
  2. **Supertécnica** de la carta que juega, del tipo del número de la fase (Regate→control, Tiro→ataque,
     Bloqueo→defensa, Parada→defensa solo en porteros). Coste = **TP × 2** (`techCost`); bonus = **TP/17** redondeado,
     mínimo 2 (30 TP → +2, 100 → +6, 200 → +12), **+2 si es de la afinidad de la carta** (`techBonus`).
- **Táctica del descanso** (gratis): Ofensiva (+3 ataque, −3 defensa), Equilibrada o Defensiva (al revés) hasta el
  final (`TACTIC_MOD`).
- **IA**: usa su mejor técnica asequible con probabilidad `AI_TECH_PROB` (0,35) en cada fase; mismas reglas de tensión.
- El resultado se calcula al revelar la fase con lo elegido: `controlWinner` y `shotResult` (`fatal.ts`); la probabilidad
  de gol usa `goalChance(ataque + bonus, defensa + bonus)`. Los goles muestran goleador y asistente.
- «Saltar» resuelve lo que quede sin usar tensión (`autoResults`).

### Más ideas de interacción (sin hacer)
- **Grito del portero**: con ≥ 30 % de tensión (120), una vez por parte, parar seguro un ataque rival (como el «Shout»).
- **Presión alta**: gastar tensión antes del control para restar control al rival esa ocasión.
- **Hiperenergía**: una vez por partido, subir los 3 números de una carta en una ocasión (+5, armadura +7), con el
  espíritu guerrero / Mixi Max / tótem de la carta (`specials`).
- **Contraataque**: tras parar un ataque, si ganas el siguiente control, bonus +3 al ataque.
- **Cambios**: sustituir un titular por un suplente en el descanso (el draft tiene 7 suplentes).
- **Penalti**: en una ocasión con probabilidad > 70 %, elegir el lado del tiro (minijuego de 1 toque).
- **Comentarios** de texto y animación de gol más vistosa.

## Suposiciones (sin confirmar)
- Número y minutos de las ocasiones, y la curva de probabilidad de gol (en MADFUT solo se ve «probabilidad de ataque»).
- El asistente se elige al azar entre los otros atacantes del grupo; no cuenta para nada más.
- Recompensas y puntos: las del Fatal Draft clásico; en MADFUT se ha visto 3/1/1 contra la IA.
