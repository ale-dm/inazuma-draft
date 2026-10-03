# Fatal Sim (MADFUT)

Modo pasivo del Fatal Draft: miras un partido de 6 ocasiones; no eliges nada. Se juega con el último draft
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

## Implementado (`src/lib/fatal.ts` → `simulate`, `src/components/modes/SimMatch.tsx`)
Marcador con escudos, reloj, línea de ocasiones, panel de control (las 3 cartas de cada lado, la elegida resaltada),
panel de ataque/defensa con el veredicto y botón «Saltar».

## Suposiciones (sin confirmar)
- Minutos fijos de las ocasiones (`SIM_MINUTES`): 3, 7, 10, 14, 17, 20.
- No hay asistente; el gol lo marca la carta atacante elegida.
- Recompensas y puntos: las del Fatal Draft clásico; en MADFUT se ha visto 3/1/1 contra la IA.
