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

## Suposiciones (sin confirmar)
- Número y minutos de las ocasiones, y la curva de probabilidad de gol (en MADFUT solo se ve «probabilidad de ataque»).
- No hay asistente; el gol lo marca la carta atacante elegida.
- Recompensas y puntos: las del Fatal Draft clásico; en MADFUT se ha visto 3/1/1 contra la IA.
